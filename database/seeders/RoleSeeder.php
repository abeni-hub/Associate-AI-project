<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Domains\Authorization\Models\Permission;
use App\Domains\Authorization\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    /**
     * Seed predefined system roles and their permission assignments.
     */
    public function run(): void
    {
        // 1. Super Admin (Platform-wide authority)
        $superAdmin = Role::updateOrCreate(
            ['slug' => 'super_admin'],
            [
                'name' => 'Super Admin',
                'description' => 'Platform-wide administrator with full authority across all modules.',
                'is_system' => true,
                'is_active' => true,
            ]
        );
        // Super admin receives all permissions
        $allPermissionIds = Permission::pluck('id')->toArray();
        $superAdmin->permissions()->sync($allPermissionIds);

        // 2. Sub-City Admin
        $subCityAdmin = Role::updateOrCreate(
            ['slug' => 'sub_city_admin'],
            [
                'name' => 'Sub-City Admin',
                'description' => 'Sub-City level administrator managing own organization and descendant Woredas/Bureaus.',
                'is_system' => true,
                'is_active' => true,
            ]
        );
        $subCityPermissions = Permission::whereIn('key', [
            'organizations.view', 'organizations.update',
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
        ])->pluck('id')->toArray();
        $subCityAdmin->permissions()->sync($subCityPermissions);

        // 3. Woreda Admin
        $woredaAdmin = Role::updateOrCreate(
            ['slug' => 'woreda_admin'],
            [
                'name' => 'Woreda Admin',
                'description' => 'Woreda level administrator managing Woreda operations and descendant Bureaus.',
                'is_system' => true,
                'is_active' => true,
            ]
        );
        $woredaPermissions = Permission::whereIn('key', [
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
        ])->pluck('id')->toArray();
        $woredaAdmin->permissions()->sync($woredaPermissions);

        // 4. Bureau Admin
        $bureauAdmin = Role::updateOrCreate(
            ['slug' => 'bureau_admin'],
            [
                'name' => 'Bureau Admin',
                'description' => 'Bureau level administrator managing Bureau staff, service steps, and own feedback.',
                'is_system' => true,
                'is_active' => true,
            ]
        );
        $bureauPermissions = Permission::whereIn('key', [
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
        ])->pluck('id')->toArray();
        $bureauAdmin->permissions()->sync($bureauPermissions);

        // 5. Staff
        $staff = Role::updateOrCreate(
            ['slug' => 'staff'],
            [
                'name' => 'Staff',
                'description' => 'Operational government staff member with service navigation and feedback viewing rights.',
                'is_system' => true,
                'is_active' => true,
            ]
        );
        $staffPermissions = Permission::whereIn('key', [
            'services.view',
            'documents.view',
            'service_steps.view',
            'feedback.view_own',
            'dashboard.view',
        ])->pluck('id')->toArray();
        $staff->permissions()->sync($staffPermissions);
    }
}
