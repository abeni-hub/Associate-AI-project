<?php

declare(strict_types=1);

use App\Http\Middleware\EnforceRequiredTwoFactor;
use App\Http\Middleware\EnforceSessionTimeout;
use App\Http\Middleware\EnsureAccountIsActive;
use App\Http\Middleware\EnsureHasPermission;
use App\Support\ApiResponse;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\Exceptions\ThrottleRequestsException;
use Illuminate\Http\Request;
use Illuminate\Session\TokenMismatchException;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->statefulApi();
        $middleware->validateCsrfTokens(except: [
            'api/*',
            'sanctum/csrf-cookie',
        ]);
        $middleware->redirectGuestsTo(fn () => null);
        $middleware->alias([
            'account.active' => EnsureAccountIsActive::class,
            'permission' => EnsureHasPermission::class,
            'session.timeout' => EnforceSessionTimeout::class,
            'two-factor.required' => EnforceRequiredTwoFactor::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );

        $exceptions->render(function (ValidationException $e, Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return ApiResponse::error(
                    message: 'Validation failed.',
                    statusCode: 422,
                    errors: $e->errors(),
                );
            }
        });

        $exceptions->render(function (NotFoundHttpException|ModelNotFoundException $e, Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return ApiResponse::error(
                    message: $e->getMessage() ?: 'Resource or endpoint not found.',
                    statusCode: 404,
                );
            }
        });

        $exceptions->render(function (AuthenticationException $e, Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return ApiResponse::error(
                    message: 'Unauthenticated.',
                    statusCode: 401,
                );
            }
        });

        $exceptions->render(function (AccessDeniedHttpException|AuthorizationException $e, Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return ApiResponse::error(
                    message: $e->getMessage() ?: 'Forbidden. You do not have permission to access this resource.',
                    statusCode: 403,
                );
            }
        });

        $exceptions->render(function (MethodNotAllowedHttpException $e, Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return ApiResponse::error(
                    message: 'HTTP method not allowed for this endpoint.',
                    statusCode: 405,
                );
            }
        });

        $exceptions->render(function (HttpResponseException $e) {
            return $e->getResponse();
        });

        $exceptions->render(function (ThrottleRequestsException $e, Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                $headers = $e->getHeaders();
                $retryAfter = (int) ($headers['Retry-After'] ?? 60);

                return response()->json([
                    'success' => false,
                    'message' => $request->routeIs('api.v1.auth.two-factor.challenge')
                        ? __('two_factor.rate_limited')
                        : 'Too many login attempts. Please try again later.',
                    'data' => [
                        'retry_after' => $retryAfter,
                    ],
                    'errors' => null,
                ], 429, $headers);
            }
        });

        $exceptions->render(function (TokenMismatchException $e, Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return ApiResponse::error(
                    message: 'Your session or CSRF token has expired. Please refresh the page and try again.',
                    statusCode: 419,
                );
            }
        });

        $exceptions->render(function (Throwable $e, Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                $statusCode = $e instanceof HttpExceptionInterface ? $e->getStatusCode() : 500;
                $message = config('app.debug')
                    ? ($e->getMessage() ?: 'Internal server error.')
                    : ($statusCode === 500 ? 'Internal server error.' : $e->getMessage());

                return ApiResponse::error(
                    message: $message,
                    statusCode: $statusCode,
                    errors: config('app.debug') ? [
                        'exception' => get_class($e),
                        'file' => $e->getFile(),
                        'line' => $e->getLine(),
                    ] : null,
                );
            }
        });
    })->create();
