<?php

declare(strict_types=1);

namespace App\Providers;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Model::preventLazyLoading(! $this->app->isProduction());

        // Implicitly grant "Super Admin" role all permissions
        Gate::before(function ($user, string $ability) {
            if (method_exists($user, 'isSuperAdmin') && $user->isSuperAdmin()) {
                return true;
            }

            return null;
        });

        // Dynamic Gate resolution matching permission keys
        Gate::after(function ($user, string $ability, ?bool $result, array $arguments) {
            if ($result !== null) {
                return $result;
            }

            if (method_exists($user, 'hasPermission')) {
                return $user->hasPermission($ability);
            }

            return false;
        });
        ResetPassword::createUrlUsing(function (object $notifiable, string $token) {
            $frontendUrl = (string) env('FRONTEND_URL', 'http://localhost:3000');

            return rtrim($frontendUrl, '/').'/reset-password?token='.$token.'&email='.urlencode($notifiable->getEmailForPasswordReset());
        });
        RateLimiter::for('login', function (Request $request) {
            $identifier = (string) $request->input('login', $request->input('username', ''));
            $key = Str::transliterate(Str::lower($identifier).'|'.$request->ip());

            return Limit::perMinute(5)->by($key)->response(function (Request $request, array $headers) {
                return response()->json([
                    'success' => false,
                    'message' => 'Too many login attempts. Please try again later.',
                    'data' => null,
                    'errors' => null,
                ], 429, $headers);
            });
        });

        RateLimiter::for('password-reset', function (Request $request) {
            $email = (string) $request->input('email', '');
            $key = Str::transliterate(Str::lower($email).'|'.$request->ip());

            return Limit::perMinute(5)->by($key)->response(function (Request $request, array $headers) {
                return response()->json([
                    'success' => false,
                    'message' => 'Too many password reset requests. Please try again later.',
                    'data' => null,
                    'errors' => null,
                ], 429, $headers);
            });
        });

        RateLimiter::for('feedback-submit', function (Request $request) {
            $ip = $request->ip() ?? '127.0.0.1';
            $email = (string) $request->input('email', '');
            $phone = (string) $request->input('phone_number', '');

            $responseCallback = function (Request $request, array $headers) {
                return response()->json([
                    'success' => false,
                    'message' => 'Too many feedback submissions. Please try again later.',
                    'data' => null,
                    'errors' => null,
                ], 429, $headers);
            };

            $limits = [
                Limit::perMinute(5)->by('ip:'.$ip)->response($responseCallback),
            ];

            if (! empty($email)) {
                $limits[] = Limit::perMinute(5)->by('email:'.Str::lower($email))->response($responseCallback);
            }

            if (! empty($phone)) {
                $limits[] = Limit::perMinute(5)->by('phone:'.preg_replace('/\D/', '', $phone))->response($responseCallback);
            }

            return $limits;
        });
    }
}
