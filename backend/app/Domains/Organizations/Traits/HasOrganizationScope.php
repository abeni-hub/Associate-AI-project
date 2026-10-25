<?php

declare(strict_types=1);

namespace App\Domains\Organizations\Traits;

use App\Domains\Organizations\Services\OrganizationScopeService;
use App\Domains\Users\Models\User;
use Illuminate\Database\Eloquent\Builder;

trait HasOrganizationScope
{
    /**
     * Scope a query to only include records accessible to the given user.
     */
    public function scopeForUserOrganization(
        Builder $query,
        User $user,
        bool $includeDescendants = false,
        string $column = 'organization_id'
    ): Builder {
        return app(OrganizationScopeService::class)->applyScope(
            $query,
            $user,
            $column,
            $includeDescendants
        );
    }
}
