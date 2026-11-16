<?php

use App\Domains\Users\Models\User;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('two-factor:reset {username=admin}', function (string $username) {
    $user = User::where('username', $username)
        ->orWhere('email', $username)
        ->first();

    if (! $user) {
        $this->error("User [{$username}] not found.");
        return 1;
    }

    $user->forceFill([
        'two_factor_secret' => null,
        'two_factor_recovery_codes' => null,
        'two_factor_confirmed_at' => null,
    ])->save();

    $this->info("Two-factor authentication has been disabled for [{$user->username}]. You can now log in directly with username and password.");
    return 0;
})->purpose('Disable two-factor authentication for a user');
