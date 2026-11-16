<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Domains\AuditLogs\Actions\RecordAuditLogAction;
use App\Domains\Users\Models\User;
use App\Support\ApiResponse;
use Carbon\Carbon;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Sanctum\PersonalAccessToken;
use Laravel\Sanctum\TransientToken;
use Symfony\Component\HttpFoundation\Response;

class EnforceSessionTimeout
{
    public function __construct(private readonly RecordAuditLogAction $auditLogAction) {}

    /**
     * @param  Closure(Request): Response  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        app()->setLocale($request->getPreferredLanguage(['en', 'am']) ?? config('app.locale'));

        /** @var User|null $user */
        $user = $request->user();
        if (! $user) {
            return $next($request);
        }

        $now = now();
        $idleMinutes = $user->effectiveSessionTimeout();
        $absoluteMinutes = (int) config('session-timeout.absolute_lifetime');
        $token = $user->currentAccessToken();

        if ($token instanceof PersonalAccessToken) {
            $startedAt = $token->created_at;
            $lastActivityAt = $token->getAttribute('last_activity_at')
                ? Carbon::parse($token->getAttribute('last_activity_at'))
                : $startedAt;
        } else {
            if ($request->hasSession()) {
                $startedAt = Carbon::parse($request->session()->get('session_started_at', $now));
                $lastActivityAt = Carbon::parse($request->session()->get('session_last_activity_at', $startedAt));
            } else {
                $startedAt = $now;
                $lastActivityAt = $now;
            }
        }

        $reason = $now->greaterThanOrEqualTo($startedAt->copy()->addMinutes($absoluteMinutes))
            ? 'absolute'
            : ($now->greaterThanOrEqualTo($lastActivityAt->copy()->addMinutes($idleMinutes)) ? 'idle' : null);

        if ($reason !== null) {
            return $this->expire($request, $user, $token, $reason, $idleMinutes, $absoluteMinutes);
        }

        if ($token instanceof PersonalAccessToken) {
            $token->forceFill(['last_activity_at' => $now])->save();
        } elseif ($request->hasSession()) {
            $request->session()->put('session_last_activity_at', $now->toIso8601String());
        }

        $request->attributes->set('session_timeout_minutes', $idleMinutes);
        $request->attributes->set(
            'session_expires_at',
            $startedAt->copy()->addMinutes($absoluteMinutes)->toIso8601String()
        );

        return $next($request);
    }

    private function expire(
        Request $request,
        User $user,
        mixed $token,
        string $reason,
        int $idleMinutes,
        int $absoluteMinutes
    ): Response {
        $this->auditLogAction->execute(
            action: 'session_timeout',
            entity: $user,
            actor: $user,
            newValues: [
                'reason' => $reason,
                'idle_timeout_minutes' => $idleMinutes,
                'absolute_lifetime_minutes' => $absoluteMinutes,
            ],
            request: $request,
            status: 'expired',
            statusCode: 401
        );

        if ($token instanceof PersonalAccessToken) {
            $token->delete();
        } elseif ($token instanceof TransientToken && $request->hasSession()) {
            Auth::guard('web')->logout();
        }

        if ($request->hasSession()) {
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        $locale = $request->getPreferredLanguage(['en', 'am']) ?? config('app.locale');

        return ApiResponse::error(
            message: trans('session.expired', [], $locale),
            statusCode: 401,
            errors: ['reason' => 'session_timeout']
        );
    }
}
