<?php

declare(strict_types=1);

namespace App\Domains\Authorization\Models;

use App\Domains\Navigation\Models\NavigationItem;
use App\Domains\Users\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Role extends Model
{
    use HasFactory;

    public const SCOPE_GLOBAL = 'global';

    public const SCOPE_SUB_CITY = 'sub_city';

    public const SCOPE_WOREDA = 'woreda';

    public const SCOPE_BUREAU = 'bureau';

    protected $table = 'roles';

    protected $fillable = [
        'name',
        'slug',
        'scope_level',
        'description',
        'is_system',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_system' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Permissions assigned to this role, including granular CRUD capability flags.
     */
    public function permissions(): BelongsToMany
    {
        return $this->belongsToMany(
            Permission::class,
            'role_permissions',
            'role_id',
            'permission_id'
        )
            ->withPivot(['can_create', 'can_read', 'can_update', 'can_delete'])
            ->withTimestamps();
    }

    /**
     * Navigation menu items dynamically authorized for this role.
     */
    public function navigationItems(): BelongsToMany
    {
        return $this->belongsToMany(
            NavigationItem::class,
            'role_navigation_items',
            'role_id',
            'navigation_item_id'
        )->withTimestamps();
    }

    /**
     * Users assigned this role.
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'role_id');
    }

    /**
     * Check if the role has a given permission by key.
     */
    public function hasPermission(string $permissionKey): bool
    {
        return $this->permissions()->where('key', $permissionKey)->exists();
    }

    /**
     * Check if this role operates with global platform scope (Super Admin).
     */
    public function isGlobalScope(): bool
    {
        return $this->scope_level === self::SCOPE_GLOBAL || $this->slug === 'super_admin';
    }

    /**
     * Verify whether this role's administrative level allows assigning/managing a target role scope.
     */
    public function canManageScope(string $targetScope): bool
    {
        if ($this->isGlobalScope()) {
            return true;
        }

        $hierarchy = [
            self::SCOPE_GLOBAL => 4,
            self::SCOPE_SUB_CITY => 3,
            self::SCOPE_WOREDA => 2,
            self::SCOPE_BUREAU => 1,
        ];

        $myRank = $hierarchy[$this->scope_level] ?? 0;
        $targetRank = $hierarchy[$targetScope] ?? 0;

        // An administrator cannot manage roles with a higher rank than their own
        return $myRank >= $targetRank && $targetRank < 4;
    }
}
