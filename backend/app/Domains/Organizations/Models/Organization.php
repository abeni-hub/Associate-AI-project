<?php

declare(strict_types=1);

namespace App\Domains\Organizations\Models;

use App\Domains\AuditLogs\Models\AuditLog;
use App\Domains\Users\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Organization extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'organizations';

    protected $fillable = [
        'organization_type_id',
        'parent_organization_id',
        'name',
        'code',
        'description',
        'address',
        'phone',
        'email',
        'status',
    ];

    /**
     * The organization type definition.
     */
    public function type(): BelongsTo
    {
        return $this->belongsTo(OrganizationType::class, 'organization_type_id');
    }

    /**
     * Parent organization in the administrative hierarchy.
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_organization_id');
    }

    /**
     * Direct child organizations in the administrative hierarchy.
     */
    public function children(): HasMany
    {
        return $this->hasMany(self::class, 'parent_organization_id');
    }

    /**
     * Users belonging to this organization.
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'organization_id');
    }

    /**
     * Audit logs scoped to this organization.
     */
    public function auditLogs(): HasMany
    {
        return $this->hasMany(AuditLog::class, 'organization_id');
    }

    /**
     * Check if this organization is a root-level organization (no parent).
     */
    public function isRoot(): bool
    {
        return $this->parent_organization_id === null;
    }

    /**
     * Check if this organization has a parent.
     */
    public function hasParent(): bool
    {
        return $this->parent_organization_id !== null;
    }

    /**
     * Check if a proposed parent organization satisfies hierarchy rules.
     */
    public function canHaveParent(self $candidateParent): bool
    {
        // Organization cannot be its own parent
        if ($this->exists && $this->id === $candidateParent->id) {
            return false;
        }

        // Prevent direct circular hierarchy
        if ($candidateParent->parent_organization_id === $this->id) {
            return false;
        }

        $thisType = $this->type ?? OrganizationType::find($this->organization_type_id);
        $candidateType = $candidateParent->type ?? OrganizationType::find($candidateParent->organization_type_id);

        if (! $thisType || ! $candidateType) {
            return false;
        }

        return $thisType->isAllowedParentType($candidateType);
    }

    /**
     * Recursively fetch all descendant organizations.
     *
     * @return Collection<int, self>
     */
    public function allDescendants(): Collection
    {
        $descendants = new Collection;

        foreach ($this->children as $child) {
            $descendants->push($child);
            $descendants = $descendants->merge($child->allDescendants());
        }

        return $descendants;
    }

    /**
     * Fetch all ancestor organizations up to the root.
     *
     * @return Collection<int, self>
     */
    public function allAncestors(): Collection
    {
        $ancestors = new Collection;
        $current = $this->parent;

        while ($current !== null) {
            $ancestors->push($current);
            $current = $current->parent;
        }

        return $ancestors;
    }
}
