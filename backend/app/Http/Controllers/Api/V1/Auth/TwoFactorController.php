<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Auth;

use App\Domains\AuditLogs\Actions\RecordAuditLogAction;
use App\Domains\Authentication\Services\AuthenticationService;
use App\Domains\Organizations\Services\OrganizationScopeService;
use App\Domains\Users\Models\User;
use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\UserResource;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use PragmaRX\Google2FA\Google2FA;

class TwoFactorController extends Controller
{
    public function status(Request $request): JsonResponse
    {
        $user = $request->user();

        return ApiResponse::success([
            'enabled' => (bool) $user->two_factor_confirmed_at,
            'required' => $user->requiresTwoFactor(),
        ]);
    }

    public function beginSetup(Request $request, Google2FA $google2fa): JsonResponse
    {
        $user = $request->user();
        if ($user->two_factor_confirmed_at) {
            return ApiResponse::error(__('two_factor.already_enabled'), statusCode: 409);
        }

        $secret = $google2fa->generateSecretKey();
        $user->forceFill(['two_factor_secret' => $secret])->save();

        return ApiResponse::success([
            'secret' => $secret,
            'otpauth_url' => $google2fa->getQRCodeUrl(
                (string) config('two-factor.issuer'),
                $user->email,
                $secret
            ),
        ]);
    }

    public function confirmSetup(
        Request $request,
        Google2FA $google2fa,
        RecordAuditLogAction $auditLogger
    ): JsonResponse {
        $validated = $request->validate(['code' => ['required', 'digits:6']]);
        $user = $request->user();
        if (! $user->two_factor_secret) {
            return ApiResponse::error(__('two_factor.not_configured'), statusCode: 422);
        }

        if (! $google2fa->verifyKey(
            $user->two_factor_secret,
            $validated['code'],
            (int) config('two-factor.code_window', 1)
        )) {
            throw ValidationException::withMessages(['code' => [__('two_factor.invalid_code')]]);
        }

        $codes = $this->newRecoveryCodes();
        $user->forceFill([
            'two_factor_confirmed_at' => now(),
            'two_factor_recovery_codes' => $codes,
        ])->save();

        $auditLogger->execute(
            action: 'two_factor_enabled',
            entity: $user,
            actor: $user,
            request: $request,
            statusCode: 200,
            requestPayload: []
        );

        return ApiResponse::success(
            ['recovery_codes' => $codes],
            __('two_factor.enabled')
        );
    }

    public function regenerateRecoveryCodes(Request $request, RecordAuditLogAction $auditLogger): JsonResponse
    {
        $validated = $request->validate(['password' => ['required', 'string']]);
        $user = $request->user();
        $this->ensurePassword($user, $validated['password']);

        $codes = $this->newRecoveryCodes();
        $user->forceFill(['two_factor_recovery_codes' => $codes])->save();
        $auditLogger->execute(
            action: 'two_factor_recovery_codes_regenerated',
            entity: $user,
            actor: $user,
            request: $request,
            requestPayload: []
        );

        return ApiResponse::success(['recovery_codes' => $codes], __('two_factor.recovery_codes_regenerated'));
    }

    public function disable(Request $request, RecordAuditLogAction $auditLogger): JsonResponse
    {
        $validated = $request->validate(['password' => ['required', 'string']]);
        $user = $request->user();
        $this->ensurePassword($user, $validated['password']);

        $user->forceFill([
            'two_factor_secret' => null,
            'two_factor_recovery_codes' => null,
            'two_factor_confirmed_at' => null,
        ])->save();
        $auditLogger->execute(
            action: 'two_factor_disabled',
            entity: $user,
            actor: $user,
            request: $request,
            requestPayload: []
        );

        return ApiResponse::success(null, __('two_factor.disabled'));
    }

    public function challenge(
        Request $request,
        Google2FA $google2fa,
        AuthenticationService $authService,
        RecordAuditLogAction $auditLogger
    ): JsonResponse {
        $validated = $request->validate([
            'challenge_token' => ['required', 'string', 'size:64'],
            'code' => ['required_without:recovery_code', 'nullable', 'digits:6'],
            'recovery_code' => ['required_without:code', 'nullable', 'string', 'max:32'],
        ]);
        $cacheKey = 'two-factor:challenge:'.hash('sha256', $validated['challenge_token']);
        $userId = Cache::get($cacheKey);
        if (! $userId) {
            return ApiResponse::error(__('two_factor.challenge_expired'), statusCode: 401);
        }

        $attemptKey = 'two-factor:attempts:'.$userId;
        if (RateLimiter::tooManyAttempts($attemptKey, (int) config('two-factor.challenge_attempts', 5))) {
            return ApiResponse::error(__('two_factor.rate_limited'), statusCode: 429);
        }
        RateLimiter::hit($attemptKey, (int) config('two-factor.challenge_ttl', 5) * 60);

        $user = User::with(['organization.type', 'role'])->find($userId);
        if (! $user || ! $user->two_factor_confirmed_at) {
            Cache::forget($cacheKey);

            return ApiResponse::error(__('two_factor.challenge_expired'), statusCode: 401);
        }

        $recoveryUsed = false;
        $valid = false;
        if (! empty($validated['recovery_code'])) {
            $codes = $user->two_factor_recovery_codes ?? [];
            $submitted = strtoupper(str_replace('-', '', $validated['recovery_code']));
            foreach ($codes as $index => $code) {
                if (hash_equals(str_replace('-', '', strtoupper($code)), $submitted)) {
                    unset($codes[$index]);
                    $user->forceFill(['two_factor_recovery_codes' => array_values($codes)])->save();
                    $valid = $recoveryUsed = true;
                    break;
                }
            }
        } else {
            $valid = $google2fa->verifyKey(
                $user->two_factor_secret,
                $validated['code'],
                (int) config('two-factor.code_window', 1)
            );
        }

        if (! $valid) {
            $auditLogger->execute(
                action: 'two_factor_failed_challenge',
                entity: $user,
                actor: $user,
                request: $request,
                status: 'failed',
                statusCode: 422,
                requestPayload: []
            );

            if (RateLimiter::tooManyAttempts($attemptKey, (int) config('two-factor.challenge_attempts', 5))) {
                Cache::forget($cacheKey);

                return ApiResponse::error(__('two_factor.rate_limited'), statusCode: 429);
            }

            return ApiResponse::error(__('two_factor.invalid_code'), statusCode: 422);
        }

        Cache::forget($cacheKey);
        RateLimiter::clear($attemptKey);
        if ($recoveryUsed) {
            $auditLogger->execute(
                action: 'two_factor_recovery_code_used',
                entity: $user,
                actor: $user,
                request: $request,
                requestPayload: []
            );
        }

        $authService->establishSession($user, $request);
        $issuedToken = $user->createToken('auth-token');
        $token = $issuedToken->plainTextToken;
        $auditLogger->execute(
            action: 'login',
            entity: $user,
            actor: $user,
            newValues: ['username' => $user->username, 'role' => $user->role?->name ?? 'User'],
            request: $request,
            statusCode: 200,
            requestPayload: []
        );
        $userData = (new UserResource($user))->toArray($request);
        $userData['token'] = $token;
        $userData['token_type'] = 'Bearer';
        $userData['two_factor_setup_required'] = false;
        $userData['effective_session_timeout'] = $user->effectiveSessionTimeout();
        $userData['absolute_session_lifetime'] = (int) config('session-timeout.absolute_lifetime');
        $userData['session_expires_at'] = $issuedToken->accessToken->created_at
            ->copy()->addMinutes((int) config('session-timeout.absolute_lifetime'))->toIso8601String();

        return ApiResponse::success($userData, 'Logged in successfully.');
    }

    public function adminReset(
        Request $request,
        User $user,
        OrganizationScopeService $scopeService,
        RecordAuditLogAction $auditLogger
    ): JsonResponse {
        $actor = $request->user();
        if (
            ($user->isSuperAdmin() && ! $actor?->isSuperAdmin())
            || ($actor && ! $actor->isSuperAdmin() && $user->organization_id
                && ! $scopeService->canAccessOrganization($actor, $user->organization_id, allowDescendants: true))
        ) {
            return ApiResponse::forbidden(__('two_factor.reset_forbidden'));
        }

        $user->forceFill([
            'two_factor_secret' => null,
            'two_factor_recovery_codes' => null,
            'two_factor_confirmed_at' => null,
        ])->save();
        $user->tokens()->delete();
        $auditLogger->execute(
            action: 'two_factor_admin_reset',
            entity: $user,
            actor: $actor,
            request: $request,
            requestPayload: []
        );

        return ApiResponse::success(null, __('two_factor.admin_reset'));
    }

    /**
     * @return list<string>
     */
    private function newRecoveryCodes(): array
    {
        return array_map(
            fn () => Str::upper(Str::random(4)).'-'.Str::upper(Str::random(4)).'-'.Str::upper(Str::random(4)),
            range(1, 10)
        );
    }

    private function ensurePassword(User $user, string $password): void
    {
        if (! Hash::check($password, $user->password)) {
            throw ValidationException::withMessages(['password' => [__('two_factor.password_invalid')]]);
        }
    }
}
