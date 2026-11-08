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
        $superAdminRole = Role::firstOrCreate(
            ['slug' => 'super_admin'],
            [
                'name' => 'Super Administrator',
                'description' => 'Global system administrator with unrestricted platform access.',
                'is_system' => true,
                'is_active' => true,
                'scope_level' => 'global',
            ]
        );

        $initialAdminPassword = 'Admin123!Secure';
        $requireChange = false;

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
    }
}
