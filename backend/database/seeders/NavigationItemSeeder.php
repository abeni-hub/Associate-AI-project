<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Domains\Authorization\Models\Role;
use App\Domains\Navigation\Models\NavigationItem;
use Illuminate\Database\Seeder;

class NavigationItemSeeder extends Seeder
{
    /**
     * Seed dynamic sidebar navigation items and map them to authorized roles.
     */
    public function run(): void
    {
        $superAdmin = Role::where('slug', 'super_admin')->first();
        $subCityAdmin = Role::where('slug', 'sub_city_admin')->first();
        $woredaAdmin = Role::where('slug', 'woreda_admin')->first();
        $bureauAdmin = Role::where('slug', 'bureau_admin')->first();
        $staff = Role::where('slug', 'staff')->first();

        $items = [
            [
                'label' => 'Overview',
                'route' => '/admin/overview',
                'icon' => 'LayoutDashboard',
                'display_order' => 1,
                'required_permission' => 'dashboard.view',
                'roles' => array_filter([$superAdmin, $subCityAdmin, $woredaAdmin, $bureauAdmin, $staff]),
            ],
            [
                'label' => 'Sub-cities',
                'route' => '/admin/subcities',
                'icon' => 'Building2',
                'display_order' => 2,
                'required_permission' => 'organizations.view',
                'roles' => array_filter([$superAdmin, $subCityAdmin]),
            ],
            [
                'label' => 'Accounts',
                'route' => '/admin/accounts',
                'icon' => 'Users',
                'display_order' => 3,
                'required_permission' => 'users.view',
                'roles' => array_filter([$superAdmin, $subCityAdmin, $woredaAdmin, $bureauAdmin]),
            ],
            [
                'label' => 'Feedback',
                'route' => '/admin/feedback',
                'icon' => 'MessageSquareQuote',
                'display_order' => 4,
                'required_permission' => 'feedback.view_own',
                'roles' => array_filter([$superAdmin, $subCityAdmin, $woredaAdmin, $bureauAdmin, $staff]),
            ],
            [
                'label' => 'Services',
                'route' => '/admin/services',
                'icon' => 'Briefcase',
                'display_order' => 5,
                'required_permission' => 'services.view',
                'roles' => array_filter([$superAdmin, $subCityAdmin, $woredaAdmin, $bureauAdmin, $staff]),
            ],
            [
                'label' => 'Routes',
                'route' => '/admin/routes',
                'icon' => 'MapPin',
                'display_order' => 6,
                'required_permission' => 'service_steps.view',
                'roles' => array_filter([$superAdmin, $subCityAdmin, $woredaAdmin, $bureauAdmin, $staff]),
            ],
            [
                'label' => 'QR Poster',
                'route' => '/admin/qr',
                'icon' => 'QrCode',
                'display_order' => 7,
                'required_permission' => 'qr_codes.view',
                'roles' => array_filter([$superAdmin, $subCityAdmin, $woredaAdmin, $bureauAdmin]),
            ],
            [
                'label' => 'CMS',
                'route' => '/admin/cms',
                'icon' => 'FileText',
                'display_order' => 8,
                'required_permission' => 'cms.manage',
                'roles' => array_filter([$superAdmin]),
            ],
        ];

        foreach ($items as $itemData) {
            $roles = $itemData['roles'];
            unset($itemData['roles']);

            $navItem = NavigationItem::updateOrCreate(
                ['route' => $itemData['route']],
                $itemData
            );

            $roleIds = array_map(fn ($r) => $r->id, $roles);
            $navItem->roles()->sync($roleIds);
        }
    }
}
