<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Auth;

use App\Domains\Authentication\Actions\ResetPasswordAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Auth\ForgotPasswordRequest;
use App\Http\Requests\Api\V1\Auth\ResetPasswordRequest;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;

class PasswordResetController extends Controller
{
    /**
     * Send password reset link to user email.
     */
    public function forgotPassword(ForgotPasswordRequest $request, ResetPasswordAction $resetPasswordAction): JsonResponse
    {
        $message = $resetPasswordAction->sendResetLink(
            email: (string) $request->input('email')
        );

        return ApiResponse::success(
            data: null,
            message: $message
        );
    }

    /**
     * Reset user password using token.
     */
    public function resetPassword(ResetPasswordRequest $request, ResetPasswordAction $resetPasswordAction): JsonResponse
    {
        $resetPasswordAction->reset(
            email: (string) $request->input('email'),
            password: (string) $request->input('password'),
            token: (string) $request->input('token')
        );

        return ApiResponse::success(
            data: null,
            message: 'Password has been reset successfully.'
        );
    }
}
