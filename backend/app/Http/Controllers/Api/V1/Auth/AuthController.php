<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Auth;

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
    public function login(LoginRequest $request, AuthenticationService $authService): JsonResponse
    {
        $user = $authService->authenticate(
            identifier: $request->getIdentifier(),
            password: (string) $request->input('password'),
            request: $request
        );

        $token = $user->createToken('auth-token')->plainTextToken;

        $userData = (new UserResource($user))->toArray($request);
        $userData['token'] = $token;
        $userData['token_type'] = 'Bearer';

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
     * Terminate the session and logout.
     */
    public function logout(Request $request, AuthenticationService $authService): JsonResponse
    {
        $authService->logout($request);

        return ApiResponse::success(
            data: null,
            message: 'Logged out successfully.'
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
