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

            $items = NavigationItem::query()
                ->where(function ($query) use ($role, $permissionKeys) {
                    $query->whereHas('roles', function ($q) use ($role) {
                        $q->where('roles.id', $role->id);
                    });

                    if (! empty($permissionKeys)) {
                        $query->orWhereIn('required_permission', $permissionKeys);
                    }
                })
                ->active()
                ->ordered()
                ->get();
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
