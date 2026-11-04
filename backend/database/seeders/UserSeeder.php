<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Domains\Authorization\Models\Role;
use App\Domains\Organizations\Models\Organization;
use App\Domains\Users\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Seed initial administrative and test users.
     */
    public function run(): void
    {
        $superAdminRole = Role::where('slug', 'super_admin')->firstOrFail();
        $subCityAdminRole = Role::where('slug', 'sub_city_admin')->first() ?? $superAdminRole;
        $woredaAdminRole = Role::where('slug', 'woreda_admin')->first() ?? $subCityAdminRole;
        $bureauAdminRole = Role::where('slug', 'bureau_admin')->first() ?? $subCityAdminRole;
        $staffRole = Role::where('slug', 'staff')->first() ?? $bureauAdminRole;

        $initialAdminPassword = env('INITIAL_SUPER_ADMIN_PASSWORD', 'Admin123!Secure');
        $requireChange = empty(env('INITIAL_SUPER_ADMIN_PASSWORD')) || app()->isProduction();

        // Resolve organizations if seeded, or fallback
        $subCityOrg = Organization::where('code', 'subcity-bole')->first() ?? Organization::first();
        $bureauOrg = Organization::where('organization_type_id', 3)->first() ?? $subCityOrg;

        // 1. Super Admin Account
        User::updateOrCreate(
            ['username' => 'admin'],
            [
                'name' => 'System Administrator',
                'email' => 'admin@government.et',
                'password' => Hash::make($initialAdminPassword),
                'role_id' => $superAdminRole->id,
                'status' => 'active',
                'phone' => '+251911000000',
                'must_change_password' => $requireChange,
            ]
        );

        // 2. Documented API Test User (matches docs/api.md)
        User::updateOrCreate(
            ['username' => 'abebe.k'],
            [
                'name' => 'Abebe Kebede',
                'email' => 'abebe@bole.gov.et',
                'password' => Hash::make('CorrectPassword123!'),
                'role_id' => $subCityAdminRole->id,
                'organization_id' => $subCityOrg?->id ?? 1,
                'status' => 'active',
                'phone' => '+251911234567',
                'must_change_password' => false,
            ]
        );

        // 3. Woreda Administrator
        User::updateOrCreate(
            ['username' => 'woreda.admin'],
            [
                'name' => 'Woreda Administrator',
                'email' => 'woreda.admin@bole.gov.et',
                'password' => Hash::make('CorrectPassword123!'),
                'role_id' => $woredaAdminRole->id,
                'organization_id' => $subCityOrg?->id ?? 1,
                'status' => 'active',
                'phone' => '+251911234568',
                'must_change_password' => false,
            ]
        );

        // 4. Bureau Administrator
        User::updateOrCreate(
            ['username' => 'bureau.admin'],
            [
                'name' => 'Bureau Administrator',
                'email' => 'bureau.admin@crrsa.gov.et',
                'password' => Hash::make('CorrectPassword123!'),
                'role_id' => $bureauAdminRole->id,
                'organization_id' => $bureauOrg?->id ?? 1,
                'status' => 'active',
                'phone' => '+251911234569',
                'must_change_password' => false,
            ]
        );

        // 5. Bureau Operational Staff
        User::updateOrCreate(
            ['username' => 'staff.user'],
            [
                'name' => 'Service Desk Staff',
                'email' => 'staff@crrsa.gov.et',
                'password' => Hash::make('CorrectPassword123!'),
                'role_id' => $staffRole->id,
                'organization_id' => $bureauOrg?->id ?? 1,
                'status' => 'active',
                'phone' => '+251911234570',
                'must_change_password' => false,
            ]
        );
    }
}
