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
        $superAdminRole = Role::where('slug', 'super_admin')->first();
        $subCityRole = Role::where('slug', 'sub_city_admin')->first();
        $bureauRole = Role::where('slug', 'bureau_admin')->first();
        $staffRole = Role::where('slug', 'staff')->first();

        $boleOrg = Organization::where('code', 'bole-subcity')->first();
        $kirkosOrg = Organization::where('code', 'kirkos-subcity')->first();
        $revenuesOrg = Organization::where('code', 'revenues-bureau')->first();
        $tradeOrg = Organization::where('code', 'trade-industry-bureau')->first();
        $civilOrg = Organization::where('code', 'civil-registration-agency')->first();

        $defaultPassword = Hash::make('Admin123!Secure');

        // 1. Super Admin Account
        User::updateOrCreate(
            ['username' => 'admin'],
            [
                'name' => 'System Administrator',
                'email' => 'admin@government.et',
                'password' => $defaultPassword,
                'role_id' => $superAdminRole?->id,
                'organization_id' => null,
                'status' => 'active',
                'phone' => '+251 91 100 0000',
                'must_change_password' => false,
            ]
        );

        // 2. Bole Sub-City Administrator
        if ($boleOrg && $subCityRole) {
            User::updateOrCreate(
                ['username' => 'bole.admin'],
                [
                    'name' => 'Tewodros Kassahun',
                    'email' => 'tewodros.k@addisababa.gov.et',
                    'password' => $defaultPassword,
                    'role_id' => $subCityRole->id,
                    'organization_id' => $boleOrg->id,
                    'status' => 'active',
                    'phone' => '+251 91 122 3344',
                    'must_change_password' => false,
                ]
            );
        }

        // 3. Kirkos Sub-City Administrator
        if ($kirkosOrg && $subCityRole) {
            User::updateOrCreate(
                ['username' => 'kirkos.admin'],
                [
                    'name' => 'Selamawit Desta',
                    'email' => 'selamawit.d@addisababa.gov.et',
                    'password' => $defaultPassword,
                    'role_id' => $subCityRole->id,
                    'organization_id' => $kirkosOrg->id,
                    'status' => 'active',
                    'phone' => '+251 91 233 4455',
                    'must_change_password' => false,
                ]
            );
        }

        // 4. Revenues Bureau Administrator
        if ($revenuesOrg && $bureauRole) {
            User::updateOrCreate(
                ['username' => 'revenues.admin'],
                [
                    'name' => 'Amanuel Hailu',
                    'email' => 'amanuel.h@revenues.gov.et',
                    'password' => $defaultPassword,
                    'role_id' => $bureauRole->id,
                    'organization_id' => $revenuesOrg->id,
                    'status' => 'active',
                    'phone' => '+251 91 344 5566',
                    'must_change_password' => false,
                ]
            );
        }

        // 5. Trade & Industry Administrator
        if ($tradeOrg && $bureauRole) {
            User::updateOrCreate(
                ['username' => 'trade.admin'],
                [
                    'name' => 'Bethlehem Abebe',
                    'email' => 'bethlehem.a@trade.gov.et',
                    'password' => $defaultPassword,
                    'role_id' => $bureauRole->id,
                    'organization_id' => $tradeOrg->id,
                    'status' => 'active',
                    'phone' => '+251 91 455 6677',
                    'must_change_password' => false,
                ]
            );
        }

        // 6. Civil Registration Agency Administrator
        if ($civilOrg && $bureauRole) {
            User::updateOrCreate(
                ['username' => 'civil.admin'],
                [
                    'name' => 'Fikadu Tadesse',
                    'email' => 'fikadu.t@civil.gov.et',
                    'password' => $defaultPassword,
                    'role_id' => $bureauRole->id,
                    'organization_id' => $civilOrg->id,
                    'status' => 'active',
                    'phone' => '+251 91 566 7788',
                    'must_change_password' => false,
                ]
            );
        }

        // 7. Desk Staff Officer
        if ($boleOrg && $staffRole) {
            User::updateOrCreate(
                ['username' => 'desk.officer'],
                [
                    'name' => 'Rahel Solomon',
                    'email' => 'rahel.s@addisababa.gov.et',
                    'password' => $defaultPassword,
                    'role_id' => $staffRole->id,
                    'organization_id' => $boleOrg->id,
                    'status' => 'active',
                    'phone' => '+251 91 677 8899',
                    'must_change_password' => false,
                ]
            );
        }
    }
}
