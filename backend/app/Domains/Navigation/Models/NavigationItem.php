<?php

declare(strict_types=1);

namespace App\Domains\Navigation\Models;

use App\Domains\Authorization\Models\Role;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class NavigationItem extends Model
{
    use HasFactory;

    protected $table = 'navigation_items';

    protected $fillable = [
        'label',
        'route',
        'icon',
        'display_order',
        'is_active',
        'required_permission',
    ];

    protected function casts(): array
    {
        return [
            'display_order' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Roles that are granted visibility of this navigation item.
     */
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(
            Role::class,
            'role_navigation_items',
            'navigation_item_id',
            'role_id'
        )->withTimestamps();
    }

    /**
     * Scope query to only active navigation items.
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope query ordered by display order.
     */
    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderBy('display_order', 'asc');
    }
}
