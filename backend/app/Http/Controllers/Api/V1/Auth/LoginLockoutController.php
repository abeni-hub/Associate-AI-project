<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Auth;

use App\Domains\AuditLogs\Actions\RecordAuditLogAction;
use App\Domains\Authentication\Models\LoginLockout;
use App\Domains\Organizations\Services\OrganizationScopeService;
use App\Domains\Users\Models\User;
use App\Http\Controllers\Controller;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;

class LoginLockoutController extends Controller
{
    public function index(Request $request, OrganizationScopeService $scopeService): JsonResponse
    {
        $lockouts = LoginLockout::query()
            ->whereNull('unlocked_at')
            ->where('locked_until', '>', now())
            ->orderBy('locked_until')
            ->get()
            ->filter(function (LoginLockout $lockout) use ($request, $scopeService): bool {
                $actor = $request->user();
                if ($actor->isSuperAdmin()) {
                    return true;
                }

                $user = $this->findAccount($lockout->login_identifier);

                return $user
                    && $user->organization_id
                    && $scopeService->canAccessOrganization(
                        $actor,
                        $user->organization_id,
                        allowDescendants: true
                    );
            })
            ->values()
            ->map(fn (LoginLockout $lockout): array => [
                'id' => $lockout->id,
                'identifier' => $lockout->login_identifier,
                'ip_address' => $lockout->ip_address,
                'locked_until' => $lockout->locked_until->toIso8601String(),
                'remaining_seconds' => max(0, now()->diffInSeconds($lockout->locked_until, false)),
            ]);

        return ApiResponse::success($lockouts, __('login_security.lockouts_retrieved'));
    }

    public function unlock(
        Request $request,
        LoginLockout $loginLockout,
        OrganizationScopeService $scopeService,
        RecordAuditLogAction $auditLogger
    ): JsonResponse {
        abort_if(
            $loginLockout->unlocked_at || $loginLockout->locked_until->isPast(),
            404,
            __('login_security.lockout_not_found')
        );

        $actor = $request->user();
        if (! $actor->isSuperAdmin()) {
            $user = $this->findAccount($loginLockout->login_identifier);
            abort_unless(
                $user
                    && $user->organization_id
                    && $scopeService->canAccessOrganization(
                        $actor,
                        $user->organization_id,
                        allowDescendants: true
                    ),
                403,
                __('login_security.unlock_forbidden')
            );
        }

        RateLimiter::clear(LoginLockout::limiterKey($loginLockout->login_identifier, $loginLockout->ip_address));
        $oldValues = [
            'identifier' => $loginLockout->login_identifier,
            'ip_address' => $loginLockout->ip_address,
            'locked_until' => $loginLockout->locked_until->toIso8601String(),
        ];
        $loginLockout->forceFill([
            'unlocked_at' => now(),
            'unlocked_by' => $actor->id,
        ])->save();
        $auditLogger->execute(
            action: 'login_lockout_unlocked',
            entity: $loginLockout,
            actor: $actor,
            oldValues: $oldValues,
            newValues: ['unlocked_at' => $loginLockout->unlocked_at->toIso8601String()],
            request: $request,
            requestPayload: []
        );

        return ApiResponse::success(null, __('login_security.unlocked'));
    }

    private function findAccount(string $identifier): ?User
    {
        return User::query()
            ->whereRaw('LOWER(email) = ?', [mb_strtolower($identifier)])
            ->orWhereRaw('LOWER(username) = ?', [mb_strtolower($identifier)])
            ->first();
    }
}
