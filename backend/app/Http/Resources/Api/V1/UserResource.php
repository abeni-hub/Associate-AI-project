<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Carbon;
use Laravel\Sanctum\PersonalAccessToken;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'username' => $this->username,
            'email' => $this->email,
            'phone' => $this->phone,
            'status' => $this->status,
            'must_change_password' => (bool) $this->must_change_password,
            'last_login_at' => $this->last_login_at?->toIso8601String(),
            'session_timeout' => $this->session_timeout,
            'effective_session_timeout' => $this->effectiveSessionTimeout(),
            'two_factor_enabled' => (bool) $this->two_factor_confirmed_at,
            'two_factor_required' => $this->requiresTwoFactor(),
            'absolute_session_lifetime' => (int) config('session-timeout.absolute_lifetime'),
            'session_expires_at' => $request->user()?->is($this->resource)
                ? $this->sessionExpiresAt($request)
                : null,
            'organization' => $this->organization ? [
                'id' => $this->organization->id,
                'name' => $this->organization->name,
                'code' => $this->organization->code,
                'type' => $this->organization->type ? [
                    'id' => $this->organization->type->id,
                    'name' => ['eng' => $this->organization->type->name, 'amh' => $this->organization->type->name_amh, 'oro' => $this->organization->type->name_oro],
                    'code' => $this->organization->type->code,
                ] : null,
            ] : null,
            'role' => $this->role ? [
                'id' => $this->role->id,
                'name' => $this->role->name,
                'slug' => $this->role->slug,
                'scope_level' => $this->role->scope_level ?? 'global',
                'session_timeout' => $this->role->session_timeout,
            ] : null,
            'permissions' => $this->isSuperAdmin()
                ? ['*']
                : ($this->role ? $this->role->permissions()->pluck('key')->all() : []),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }

    private function sessionExpiresAt(Request $request): ?string
    {
        $middlewareExpiry = $request->attributes->get('session_expires_at');
        if ($middlewareExpiry) {
            return $middlewareExpiry;
        }

        $token = $this->currentAccessToken();
        $startedAt = $token instanceof PersonalAccessToken
            ? $token->created_at
            : ($request->hasSession() ? $request->session()->get('session_started_at') : null);

        return $startedAt
            ? Carbon::parse($startedAt)
                ->addMinutes((int) config('session-timeout.absolute_lifetime'))
                ->toIso8601String()
            : null;
    }
}
