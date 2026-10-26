<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\Auth\AuthController;
use App\Http\Controllers\Api\V1\Auth\PasswordResetController;
use App\Http\Controllers\Api\V1\Authorization\PermissionController;
use App\Http\Controllers\Api\V1\Authorization\RoleController;
use App\Http\Controllers\Api\V1\Documents\DocumentController;
use App\Http\Controllers\Api\V1\Feedback\FeedbackController;
use App\Http\Controllers\Api\V1\HealthController;
use App\Http\Controllers\Api\V1\News\NewsController;
use App\Http\Controllers\Api\V1\Organizations\OrganizationController;
use App\Http\Controllers\Api\V1\Organizations\OrganizationTypeController;
use App\Http\Controllers\Api\V1\Services\ServiceController;
use App\Http\Controllers\Api\V1\Services\ServiceStepController;
use App\Http\Controllers\Api\V1\Users\UserController;
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

    // Public Citizen Service Discovery Endpoints
    Route::get('/services', [ServiceController::class, 'index'])->name('services.index');
    Route::get('/services/{service}', [ServiceController::class, 'show'])->name('services.show');
    Route::get('/services/{service}/steps', [ServiceStepController::class, 'index'])->name('services.steps.index');
    Route::get('/services/{service}/steps/{step}', [ServiceStepController::class, 'show'])->name('services.steps.show');
    Route::get('/documents', [DocumentController::class, 'index'])->name('documents.index');
    Route::get('/documents/{document}', [DocumentController::class, 'show'])->name('documents.show');

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

    // Authenticated Administration Endpoints
    Route::middleware(['auth:sanctum', 'account.active'])->group(function () {
        // Authorization & Role Management
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

                // Organization Management
        Route::get('/organization-types', [OrganizationTypeController::class, 'index'])
            ->middleware('permission:organizations.view')
            ->name('organization-types.index');

        Route::get('/organization', [OrganizationController::class, 'index'])
            ->middleware('permission:organizations.view');

        Route::prefix('organizations')->name('organizations.')->group(function () {
            Route::get('/', [OrganizationController::class, 'index'])
                ->middleware('permission:organizations.view')
                ->name('index');
            Route::get('/tree', [OrganizationController::class, 'tree'])
                ->middleware('permission:organizations.view')
                ->name('tree');
            Route::post('/', [OrganizationController::class, 'store'])
                ->middleware('permission:organizations.create')
                ->name('store');
            Route::get('/{organization}', [OrganizationController::class, 'show'])
                ->middleware('permission:organizations.view')
                ->name('show');
            Route::put('/{organization}', [OrganizationController::class, 'update'])
                ->middleware('permission:organizations.update')
                ->name('update');
            Route::delete('/{organization}', [OrganizationController::class, 'destroy'])
                ->middleware('permission:organizations.delete')
                ->name('destroy');
        });

        // User Management
        Route::prefix('users')->name('users.')->group(function () {
            Route::get('/', [UserController::class, 'index'])
                ->middleware('permission:users.view')
                ->name('index');
            Route::post('/', [UserController::class, 'store'])
                ->middleware('permission:users.create')
                ->name('store');
            Route::get('/{user}', [UserController::class, 'show'])
                ->middleware('permission:users.view')
                ->name('show');
            Route::put('/{user}', [UserController::class, 'update'])
                ->middleware('permission:users.update')
                ->name('update');
            Route::delete('/{user}', [UserController::class, 'destroy'])
                ->middleware('permission:users.delete')
                ->name('destroy');
            Route::post('/{user}/reset-password', [UserController::class, 'resetPassword'])
                ->middleware('permission:users.reset_password')
                ->name('reset-password');
        });

        // Service Administrative Management
        Route::prefix('services')->name('services.')->group(function () {
            Route::post('/', [ServiceController::class, 'store'])
                ->middleware('permission:services.create')
                ->name('store');
            Route::put('/{service}', [ServiceController::class, 'update'])
                ->middleware('permission:services.update')
                ->name('update');
            Route::delete('/{service}', [ServiceController::class, 'destroy'])
                ->middleware('permission:services.delete')
                ->name('destroy');
            Route::post('/{service}/documents', [ServiceController::class, 'syncDocuments'])
                ->middleware('permission:documents.manage')
                ->name('sync-documents');
            Route::post('/{service}/organizations', [ServiceController::class, 'syncOrganizations'])
                ->middleware('permission:services.manage')
                ->name('sync-organizations');
        });

        // Document Administrative Management
        Route::prefix('documents')->name('documents.')->group(function () {
            Route::post('/', [DocumentController::class, 'store'])
                ->middleware('permission:documents.manage')
                ->name('store');
            Route::put('/{document}', [DocumentController::class, 'update'])
                ->middleware('permission:documents.manage')
                ->name('update');
            Route::delete('/{document}', [DocumentController::class, 'destroy'])
                ->middleware('permission:documents.manage')
                ->name('destroy');
        });

        // Room-by-Room Service Steps Management
        Route::prefix('services/{service}/steps')->name('services.steps.')->group(function () {
            Route::post('/', [ServiceStepController::class, 'store'])
                ->middleware('permission:service_steps.manage')
                ->name('store');
            Route::post('/reorder', [ServiceStepController::class, 'reorder'])
                ->middleware('permission:service_steps.manage')
                ->name('reorder');
            Route::put('/{step}', [ServiceStepController::class, 'update'])
                ->middleware('permission:service_steps.manage')
                ->name('update');
            Route::delete('/{step}', [ServiceStepController::class, 'destroy'])
                ->middleware('permission:service_steps.manage')
                ->name('destroy');
        });

        // Feedback Retrieval
        Route::get('/feedbacks', [FeedbackController::class, 'index'])
            ->middleware('permission:feedback.view_own,feedback.view_descendants')
            ->name('feedbacks.index');

        // News Management
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

    // Public Feedback Submission (no authentication required)
    Route::post('/feedbacks', [FeedbackController::class, 'store'])
        ->middleware('throttle:10,1')
        ->name('feedbacks.store');
});
