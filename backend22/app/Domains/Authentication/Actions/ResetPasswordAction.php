<?php

declare(strict_types=1);

namespace App\Domains\Authentication\Actions;

use App\Domains\Users\Models\User;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class ResetPasswordAction
{
    /**
     * Send password reset link to user if account exists.
     * Always returns generic status to protect against username/email enumeration.
     */
    public function sendResetLink(string $email): string
    {
        // Broker sends notification if user exists
        Password::broker()->sendResetLink(['email' => $email]);

        return 'If your email address exists in our system, you will receive a password reset link.';
    }

    /**
     * Reset password using token.
     *
     * @throws ValidationException
     */
    public function reset(string $email, string $password, string $token): void
    {
        $status = Password::broker()->reset(
            ['email' => $email, 'password' => $password, 'password_confirmation' => $password, 'token' => $token],
            function (User $user, string $password) {
                $user->forceFill([
                    'password' => Hash::make($password),
                    'must_change_password' => false,
                    'remember_token' => Str::random(60),
                ])->save();

                event(new PasswordReset($user));
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            throw ValidationException::withMessages([
                'email' => [__($status)],
            ]);
        }
    }
}
