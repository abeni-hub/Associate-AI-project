<?php

declare(strict_types=1);

namespace App\Domains\Organizations\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class OrganizationType extends Model
{
    use HasFactory;

    protected $table = 'organization_types';

    protected $fillable = [
        'name',
        'code',
        'description',
        'level',
        'can_be_root',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'level' => 'integer',
            'can_be_root' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Organizations belonging to this organization type.
     */
    public function organizations(): HasMany
    {
        return $this->hasMany(Organization::class, 'organization_type_id');
    }

    /**
     * Organization types allowed to be parents of this type.
     */
    public function allowedParents(): BelongsToMany
    {
        return $this->belongsToMany(
            self::class,
            'organization_type_allowed_parents',
            'organization_type_id',
            'allowed_parent_type_id'
        )->withTimestamps();
    }

    /**
     * Organization types that this type is allowed to have as children.
     */
    public function allowedChildren(): BelongsToMany
    {
        return $this->belongsToMany(
            self::class,
            'organization_type_allowed_parents',
            'allowed_parent_type_id',
            'organization_type_id'
        )->withTimestamps();
    }

    /**
     * Check if a given organization type is an allowed parent.
     */
    public function isAllowedParentType(self $parentType): bool
    {
        return $this->allowedParents()->where('allowed_parent_type_id', $parentType->id)->exists();
    }
}
