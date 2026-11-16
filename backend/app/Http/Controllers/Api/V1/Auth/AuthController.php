<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Auth;

use App\Domains\AuditLogs\Actions\RecordAuditLogAction;
use App\Domains\Authentication\Actions\ChangePasswordAction;
use App\Domains\Authentication\Services\AuthenticationService;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Auth\ChangePasswordRequest;
use App\Http\Requests\Api\V1\Auth\LoginRequest;
use App\Http\Resources\Api\V1\UserResource;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    /**
     * Authenticate user credentials and establish session.
     */
    public function login(
        LoginRequest $request,
        AuthenticationService $authService,
        RecordAuditLogAction $auditLogger
    ): JsonResponse {
        $user = $authService->authenticate(
            identifier: $request->getIdentifier(),
            password: (string) $request->input('password'),
            request: $request
        );

        $issuedToken = $user->createToken('auth-token');
        $token = $issuedToken->plainTextToken;

        $auditLogger->execute(
            action: 'login',
            entity: $user,
            actor: $user,
            newValues: [
                'username' => $user->username,
                'email' => $user->email,
                'role' => $user->role?->name ?? 'User',
            ],
            request: $request,
            status: 'success',
            statusCode: 200
        );

        $userData = (new UserResource($user))->toArray($request);
        $userData['token'] = $token;
        $userData['token_type'] = 'Bearer';
        $userData['effective_session_timeout'] = $user->effectiveSessionTimeout();
        $userData['absolute_session_lifetime'] = (int) config('session-timeout.absolute_lifetime');
        $userData['session_expires_at'] = $issuedToken->accessToken->created_at
            ->copy()
            ->addMinutes((int) config('session-timeout.absolute_lifetime'))
            ->toIso8601String();

        return ApiResponse::success(
            data: $userData,
            message: 'Logged in successfully.',
            meta: [
                'token' => $token,
                'token_type' => 'Bearer',
                'must_change_password' => (bool) $user->must_change_password,
            ]
        );
    }

    /**
     * Get the authenticated user.
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->loadMissing(['organization.type', 'role']);

        return ApiResponse::success(
            data: new UserResource($user),
            message: 'Authenticated user profile retrieved successfully.'
        );
    }

    /**
     * Keep an active browser session alive.
     */
    public function activity(): JsonResponse
    {
        return ApiResponse::success(
            data: ['active' => true],
            message: __('session.active')
        );
    }

    /**
     * Terminate the session and logout.
     */
    public function logout(
        Request $request,
        AuthenticationService $authService,
        RecordAuditLogAction $auditLogger
    ): JsonResponse {
        $user = $request->user();

        if ($user) {
            $auditLogger->execute(
                action: 'logout',
                entity: $user,
                actor: $user,
                newValues: [
                    'username' => $user->username,
                    'email' => $user->email,
                ],
                request: $request,
                status: 'success',
                statusCode: 200
            );
        }

        $authService->logout($request);

        return ApiResponse::success(
            data: null,
            message: __('session.logged_out')
        );
    }

    /**
     * Change user password.
     */
    public function changePassword(ChangePasswordRequest $request, ChangePasswordAction $changePasswordAction): JsonResponse
    {
        $changePasswordAction->execute(
            user: $request->user(),
            currentPassword: (string) $request->input('current_password'),
            newPassword: (string) $request->input('new_password')
        );

        return ApiResponse::success(
            data: null,
            message: 'Password changed successfully.'
        );
    }
}
