<?php

declare(strict_types=1);

namespace App\Domains\Authentication\Services;

use App\Domains\Users\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Laravel\Sanctum\TransientToken;

class AuthenticationService
{
    /**
     * Authenticate user credentials and establish stateful session.
     *
     * @throws ValidationException
     */
    public function authenticate(string $identifier, string $password, Request $request): User
    {
        $user = User::with(['organization.type', 'role'])
            ->where(function ($query) use ($identifier) {
                $query->where('username', $identifier)
                    ->orWhere('email', $identifier);
            })
            ->first();

        // Always check hash or perform dummy check to prevent timing attacks and username enumeration
        if (! $user || ! Hash::check($password, $user->password)) {
            throw ValidationException::withMessages([
                'login' => ['These credentials do not match our records.'],
            ]);
        }

        // Account status check
        if (! $user->isActive()) {
            throw ValidationException::withMessages([
                'login' => ['Your account is deactivated. Please contact your organization administrator.'],
            ]);
        }

        // Establish session authentication for first-party React SPA
        Auth::guard('web')->login($user);

        if ($request->hasSession()) {
            $request->session()->regenerate();
        }

        // Update last login timestamp
        $user->forceFill([
            'last_login_at' => now(),
        ])->saveQuietly();

        return $user;
    }

    /**
     * Terminate authenticated session.
     */
    public function logout(Request $request): void
    {
        $user = $request->user();

        // If a personal access token was used (not a transient session cookie), revoke it
        if ($user && method_exists($user, 'currentAccessToken')) {
            $token = $user->currentAccessToken();
            if ($token && ! ($token instanceof TransientToken)) {
                $token->delete();
            }
        }

        Auth::guard('web')->logout();
        Auth::forgetGuards();

        if ($request->hasSession()) {
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }
    }
}
