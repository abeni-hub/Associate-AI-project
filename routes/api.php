<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\Auth\AuthController;
use App\Http\Controllers\Api\V1\Auth\PasswordResetController;
use App\Http\Controllers\Api\V1\HealthController;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes — Version 1
|--------------------------------------------------------------------------
|
| All endpoints are versioned under /api/v1.
|
*/

Route::prefix('v1')->name('api.v1.')->group(function () {
    // Health & Status
    Route::get('/health', HealthController::class)->name('health');

    // Validation verification endpoint for testing Phase 1 error handling
    Route::post('/test-validation', function (Request $request) {
        $validated = $request->validate([
            'test_field' => ['required', 'string', 'min:3'],
        ]);

        return ApiResponse::success(
            data: $validated,
            message: 'Validation passed successfully.'
        );
    })->name('test.validation');

    // Authentication Endpoints
    Route::prefix('auth')->name('auth.')->group(function () {
        // Public Authentication
        Route::post('/login', [AuthController::class, 'login'])
            ->middleware('throttle:login')
            ->name('login');

        Route::post('/forgot-password', [PasswordResetController::class, 'forgotPassword'])
            ->middleware('throttle:password-reset')
            ->name('forgot-password');

        Route::post('/reset-password', [PasswordResetController::class, 'resetPassword'])
            ->middleware('throttle:password-reset')
            ->name('reset-password');

        Route::get('/reset-password/{token}', [PasswordResetController::class, 'resetPassword'])
            ->name('password.reset');

        // Authenticated Session Endpoints (Stateful SPA)
        Route::middleware(['auth:sanctum', 'account.active'])->group(function () {
            Route::get('/me', [AuthController::class, 'me'])->name('me');
            Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
            Route::put('/change-password', [AuthController::class, 'changePassword'])->name('change-password');
        });
    });
});
