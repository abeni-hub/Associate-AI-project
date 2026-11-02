<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Domains\Authorization\Models\Permission;
use App\Domains\Authorization\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    /**
     * Seed predefined system roles, scope levels, and granular CRUD permissions.
     */
    public function run(): void
    {
        // 1. Super Admin (Platform-wide authority)
        $superAdmin = Role::updateOrCreate(
            ['slug' => 'super_admin'],
            [
                'name' => 'Super Admin',
                'scope_level' => Role::SCOPE_GLOBAL,
                'description' => 'Platform-wide administrator with full authority across all modules.',
                'is_system' => true,
                'is_active' => true,
            ]
        );
        $allPermissions = Permission::all();
        $superAdminPivot = [];
        foreach ($allPermissions as $perm) {
            $superAdminPivot[$perm->id] = [
                'can_create' => true,
                'can_read' => true,
                'can_update' => true,
                'can_delete' => true,
            ];
        }
        $superAdmin->permissions()->sync($superAdminPivot);

        // 2. Sub-City Admin
        $subCityAdmin = Role::updateOrCreate(
            ['slug' => 'sub_city_admin'],
            [
                'name' => 'Sub-City Admin',
                'scope_level' => Role::SCOPE_SUB_CITY,
                'description' => 'Sub-City level administrator managing own organization and descendant Woredas/Bureaus.',
                'is_system' => true,
                'is_active' => true,
            ]
        );
        $subCityPermKeys = [
            'organizations.view', 'organizations.create', 'organizations.update',
            'users.view', 'users.create', 'users.update', 'users.delete', 'users.reset_password',
            'services.view', 'services.manage',
            'documents.view', 'documents.manage',
            'service_steps.view', 'service_steps.manage',
            'news.view', 'news.create', 'news.update', 'news.publish', 'news.delete',
            'events.view', 'events.create', 'events.update', 'events.publish', 'events.delete',
            'feedback.view_own', 'feedback.view_descendants', 'feedback.update_status',
            'qr_codes.view', 'qr_codes.manage',
            'dashboard.view',
            'audit_logs.view',
        ];
        $subCityPermissions = Permission::whereIn('key', $subCityPermKeys)->get();
        $subCityPivot = [];
        foreach ($subCityPermissions as $perm) {
            $subCityPivot[$perm->id] = [
                'can_create' => true,
                'can_read' => true,
                'can_update' => true,
                'can_delete' => str_contains($perm->key, 'delete'),
            ];
        }
        $subCityAdmin->permissions()->sync($subCityPivot);

        // 3. Woreda Admin
        $woredaAdmin = Role::updateOrCreate(
            ['slug' => 'woreda_admin'],
            [
                'name' => 'Woreda Admin',
                'scope_level' => Role::SCOPE_WOREDA,
                'description' => 'Woreda level administrator managing Woreda operations and descendant Bureaus.',
                'is_system' => true,
                'is_active' => true,
            ]
        );
        $woredaPermKeys = [
            'organizations.view',
            'users.view', 'users.create', 'users.update', 'users.reset_password',
            'services.view',
            'documents.view',
            'service_steps.view', 'service_steps.manage',
            'news.view', 'news.create', 'news.update', 'news.publish',
            'events.view', 'events.create', 'events.update', 'events.publish',
            'feedback.view_own', 'feedback.view_descendants', 'feedback.update_status',
            'qr_codes.view', 'qr_codes.manage',
            'dashboard.view',
        ];
        $woredaPermissions = Permission::whereIn('key', $woredaPermKeys)->get();
        $woredaPivot = [];
        foreach ($woredaPermissions as $perm) {
            $woredaPivot[$perm->id] = [
                'can_create' => ! str_contains($perm->key, '.view'),
                'can_read' => true,
                'can_update' => str_contains($perm->key, '.update') || str_contains($perm->key, '.manage'),
                'can_delete' => false,
            ];
        }
        $woredaAdmin->permissions()->sync($woredaPivot);

        // 4. Bureau Admin
        $bureauAdmin = Role::updateOrCreate(
            ['slug' => 'bureau_admin'],
            [
                'name' => 'Bureau Admin',
                'scope_level' => Role::SCOPE_BUREAU,
                'description' => 'Bureau level administrator managing Bureau staff, service steps, and own feedback.',
                'is_system' => true,
                'is_active' => true,
            ]
        );
        $bureauPermKeys = [
            'organizations.view',
            'users.view',
            'services.view',
            'documents.view',
            'service_steps.view', 'service_steps.manage',
            'news.view', 'news.create', 'news.update', 'news.publish',
            'events.view', 'events.create', 'events.update', 'events.publish',
            'feedback.view_own', 'feedback.update_status',
            'qr_codes.view',
            'dashboard.view',
        ];
        $bureauPermissions = Permission::whereIn('key', $bureauPermKeys)->get();
        $bureauPivot = [];
        foreach ($bureauPermissions as $perm) {
            $bureauPivot[$perm->id] = [
                'can_create' => str_contains($perm->key, '.create'),
                'can_read' => true,
                'can_update' => str_contains($perm->key, '.update') || str_contains($perm->key, '.manage'),
                'can_delete' => false,
            ];
        }
        $bureauAdmin->permissions()->sync($bureauPivot);

        // 5. Staff
        $staff = Role::updateOrCreate(
            ['slug' => 'staff'],
            [
                'name' => 'Staff',
                'scope_level' => Role::SCOPE_BUREAU,
                'description' => 'Operational government staff member with service navigation and feedback viewing rights.',
                'is_system' => true,
                'is_active' => true,
            ]
        );
        $staffPermKeys = [
            'services.view',
            'documents.view',
            'service_steps.view',
            'feedback.view_own',
            'dashboard.view',
        ];
        $staffPermissions = Permission::whereIn('key', $staffPermKeys)->get();
        $staffPivot = [];
        foreach ($staffPermissions as $perm) {
            $staffPivot[$perm->id] = [
                'can_create' => false,
                'can_read' => true,
                'can_update' => false,
                'can_delete' => false,
            ];
        }
        $staff->permissions()->sync($staffPivot);
    }
}
