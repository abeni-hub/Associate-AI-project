<?php

declare(strict_types=1);

namespace App\Domains\Organizations\Services;

use App\Domains\Organizations\Models\Organization;
use App\Domains\Users\Models\User;
use Illuminate\Database\Eloquent\Builder;

class OrganizationScopeService
{
    /**
     * Get the array of organization IDs accessible to the user.
     * Returns null for Super Admins (indicating global, unrestricted scope).
     *
     * @return array<int>|null
     */
    public function getAllowedOrganizationIds(User $user, bool $includeDescendants = false): ?array
    {
        if ($user->isSuperAdmin()) {
            return null; // Global access
        }

        if (! $user->organization_id) {
            return [];
        }

        if (! $includeDescendants) {
            return [$user->organization_id];
        }

        $userOrg = $user->organization;

        if (! $userOrg) {
            $userOrg = Organization::find($user->organization_id);
        }

        if (! $userOrg) {
            return [$user->organization_id];
        }

        $descendantIds = $userOrg->allDescendants()->pluck('id')->all();

        return array_values(array_unique(array_merge([$userOrg->id], $descendantIds)));
    }

    /**
     * Check if a user has access to a target organization.
     */
    public function canAccessOrganization(User $user, Organization|int $organization, bool $allowDescendants = false): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        if (! $user->organization_id) {
            return false;
        }

        $targetId = $organization instanceof Organization ? $organization->id : (int) $organization;

        if ($user->organization_id === $targetId) {
            return true;
        }

        if ($allowDescendants) {
            $allowedIds = $this->getAllowedOrganizationIds($user, includeDescendants: true);

            return in_array($targetId, $allowedIds ?? [], true);
        }

        return false;
    }

    /**
     * Check if a user can manage (update/administer) a target organization.
     */
    public function canManageOrganization(User $user, Organization|int $organization): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        // Must have organization update permission
        if (! $user->hasPermission('organizations.update')) {
            return false;
        }

        return $this->canAccessOrganization($user, $organization, allowDescendants: true);
    }

    /**
     * Apply organization scoping constraints to an Eloquent query builder.
     */
    public function applyScope(
        Builder $query,
        User $user,
        string $organizationColumn = 'organization_id',
        bool $includeDescendants = false
    ): Builder {
        if ($user->isSuperAdmin()) {
            return $query;
        }

        $allowedIds = $this->getAllowedOrganizationIds($user, $includeDescendants);

        return $query->whereIn($organizationColumn, $allowedIds ?? []);
    }
}
