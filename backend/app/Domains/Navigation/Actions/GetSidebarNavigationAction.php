<?php

declare(strict_types=1);

namespace App\Domains\Navigation\Actions;

use App\Domains\Navigation\Models\NavigationItem;
use App\Domains\Users\Models\User;

class GetSidebarNavigationAction
{
    /**
     * Fetch authorized sidebar navigation items for the given user, ordered by display_order.
     *
     * @return array<int, array{id: int, label: string, route: string, icon: ?string, display_order: int, required_permission: ?string}>
     */
    public function execute(User $user): array
    {
        $role = $user->role;
        if (! $role) {
            return [];
        }

        if ($user->isSuperAdmin()) {
            $items = NavigationItem::query()
                ->active()
                ->ordered()
                ->get();
        } else {
            $permissionKeys = $role->relationLoaded('permissions')
                ? $role->permissions->pluck('key')->all()
                : $role->permissions()->pluck('key')->all();

            $query = NavigationItem::query()
                ->active()
                ->ordered();

            if ($role->navigationItems()->exists()) {
                // Must be explicitly assigned to this role in role_navigation_items
                $query->whereHas('roles', function ($q) use ($role) {
                    $q->where('roles.id', $role->id);
                });

                // AND must satisfy required_permission if one is defined on the item
                if (! empty($permissionKeys)) {
                    $query->where(function ($q) use ($permissionKeys) {
                        $q->whereNull('required_permission')
                            ->orWhereIn('required_permission', $permissionKeys);
                    });
                } else {
                    $query->whereNull('required_permission');
                }
            } else {
                // Fallback for custom roles without explicit navigation items configured
                if (! empty($permissionKeys)) {
                    $query->whereIn('required_permission', $permissionKeys);
                } else {
                    return [];
                }
            }

            $items = $query->get();
        }

        return $items->map(fn (NavigationItem $item) => [
            'id' => $item->id,
            'label' => $item->label,
            'route' => $item->route,
            'icon' => $item->icon,
            'display_order' => $item->display_order,
            'required_permission' => $item->required_permission,
        ])->values()->all();
    }
}
