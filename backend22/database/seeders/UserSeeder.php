<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Domains\Authorization\Models\Role;
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

        $initialAdminPassword = env('INITIAL_SUPER_ADMIN_PASSWORD', 'Admin123!Secure');
        $requireChange = empty(env('INITIAL_SUPER_ADMIN_PASSWORD')) || app()->isProduction();

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
                'status' => 'active',
                'phone' => '+251911234567',
                'must_change_password' => false,
            ]
        );
    }
}
