<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Support\ApiResponse;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureHasPermission
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$permissions): Response
    {
        $user = $request->user();

        if (! $user) {
            return ApiResponse::error(
                message: 'Unauthenticated.',
                statusCode: 401
            );
        }

        // Platform-wide Super Admin bypasses all individual permission checks
        if ($user->isSuperAdmin()) {
            return $next($request);
        }

        // Ensure user has at least one of the required permissions
        foreach ($permissions as $permission) {
            if ($user->hasPermission($permission)) {
                return $next($request);
            }
        }

        return ApiResponse::error(
            message: 'Forbidden. You do not have permission to perform this action.',
            statusCode: 403
        );
    }
}
