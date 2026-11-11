<?php

declare(strict_types=1);

namespace App\Domains\Authorization\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Permission extends Model
{
    use HasFactory;

    protected $table = 'permissions';

    protected $fillable = [
        'name',
        'key',
        'group',
        'description',
    ];

    /**
     * Roles that have been granted this permission, with CRUD capability flags.
     */
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(
            Role::class,
            'role_permissions',
            'permission_id',
            'role_id'
        )
            ->withPivot(['can_create', 'can_read', 'can_update', 'can_delete'])
            ->withTimestamps();
    }
}
