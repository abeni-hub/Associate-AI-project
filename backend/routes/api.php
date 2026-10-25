<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\Auth\AuthController;
use App\Http\Controllers\Api\V1\Auth\PasswordResetController;
use App\Http\Controllers\Api\V1\Authorization\PermissionController;
use App\Http\Controllers\Api\V1\Authorization\RoleController;
use App\Http\Controllers\Api\V1\HealthController;
use App\Http\Controllers\Api\V1\News\NewsController;
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

        // Authenticated Session Endpoints (Stateful SPA / Bearer Token)
        Route::middleware(['auth:sanctum', 'account.active'])->group(function () {
            Route::get('/me', [AuthController::class, 'me'])->name('me');
            Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
            Route::put('/change-password', [AuthController::class, 'changePassword'])->name('change-password');
        });
    });

    // Authorization & Role Management
    Route::middleware(['auth:sanctum', 'account.active'])->group(function () {
        Route::prefix('roles')->name('roles.')->group(function () {
            Route::get('/', [RoleController::class, 'index'])
                ->middleware('permission:roles.view')
                ->name('index');
            Route::get('/{role}', [RoleController::class, 'show'])
                ->middleware('permission:roles.view')
                ->name('show');
            Route::put('/{role}/permissions', [RoleController::class, 'updatePermissions'])
                ->middleware('permission:roles.manage')
                ->name('update-permissions');
        });

        Route::get('/permissions', [PermissionController::class, 'index'])
            ->middleware('permission:roles.view')
            ->name('permissions.index');

        // News Management (Organization-scoped Edit/Delete)
        Route::put('/news/{news}', [NewsController::class, 'update'])
            ->middleware('permission:news.update')
            ->name('news.update');
        Route::delete('/news/{news}', [NewsController::class, 'destroy'])
            ->middleware('permission:news.delete')
            ->name('news.destroy');
    });

    // Public News (no authentication required)
    Route::get('/news', [NewsController::class, 'index'])
        ->name('news.index');
    Route::get('/news/{news}', [NewsController::class, 'show'])
        ->name('news.show');
});
