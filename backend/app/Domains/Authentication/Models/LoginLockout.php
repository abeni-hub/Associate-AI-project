<?php

declare(strict_types=1);

namespace App\Domains\Authentication\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class LoginLockout extends Model
{
    protected $fillable = [
        'login_identifier',
        'identifier_hash',
        'ip_address',
        'user_agent',
        'failed_attempts',
        'locked_until',
        'unlocked_at',
        'unlocked_by',
    ];

    protected function casts(): array
    {
        return [
            'failed_attempts' => 'integer',
            'locked_until' => 'datetime',
            'unlocked_at' => 'datetime',
        ];
    }

    public static function limiterKey(string $identifier, ?string $ip): string
    {
        $normalized = Str::lower(trim($identifier));

        return 'login:'.hash('sha256', $normalized.'|'.($ip ?? ''));
    }

    public static function identifierHash(string $identifier, ?string $ip): string
    {
        return hash('sha256', Str::lower(trim($identifier)).'|'.($ip ?? ''));
    }
}
