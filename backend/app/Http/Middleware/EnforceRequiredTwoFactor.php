<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Domains\Users\Models\User;
use App\Support\ApiResponse;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnforceRequiredTwoFactor
{
    /**
     * @param  Closure(Request): Response  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        /** @var User|null $user */
        $user = $request->user();
        if (
            $user
            && $user->requiresTwoFactor()
            && ! $user->two_factor_confirmed_at
        ) {
            return ApiResponse::error(
                message: __('two_factor.setup_required'),
                statusCode: 403,
                errors: ['reason' => 'two_factor_setup_required']
            );
        }

        return $next($request);
    }
}
