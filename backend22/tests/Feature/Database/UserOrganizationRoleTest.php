<?php

declare(strict_types=1);

namespace Tests\Feature\Database;

use App\Domains\Authorization\Models\Role;
use App\Domains\Organizations\Models\Organization;
use App\Domains\Organizations\Models\OrganizationType;
use App\Domains\Users\Models\User;
use Database\Seeders\OrganizationTypeSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserOrganizationRoleTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(OrganizationTypeSeeder::class);
        $this->seed(RoleSeeder::class);
    }

    public function test_user_belongs_to_exactly_one_organization(): void
    {
        $orgType = OrganizationType::where('code', 'sub_city')->firstOrFail();
        $role = Role::where('slug', 'sub_city_admin')->firstOrFail();

        $org = Organization::create([
            'organization_type_id' => $orgType->id,
            'name' => 'Kirkos Sub-City',
            'code' => 'subcity-kirkos',
        ]);

        $user = User::create([
            'name' => 'Abebe Kebede',
            'username' => 'abebe.k',
            'email' => 'abebe@kirkos.gov.et',
            'password' => 'SecurePass123!',
            'organization_id' => $org->id,
            'role_id' => $role->id,
            'status' => 'active',
        ]);

        $this->assertEquals($org->id, $user->organization->id);
        $this->assertEquals('Kirkos Sub-City', $user->organization->name);
        $this->assertTrue($org->users->contains($user));
    }

    public function test_super_admin_can_have_nullable_organization(): void
    {
        $role = Role::where('slug', 'super_admin')->firstOrFail();

        $superAdmin = User::create([
            'name' => 'System Administrator',
            'username' => 'sysadmin',
            'email' => 'admin@platform.gov.et',
            'password' => 'RootAdminSecret123!',
            'organization_id' => null,
            'role_id' => $role->id,
            'status' => 'active',
        ]);

        $this->assertNull($superAdmin->organization_id);
        $this->assertNull($superAdmin->organization);
        $this->assertTrue($superAdmin->isSuperAdmin());
    }

    public function test_username_and_email_must_be_unique(): void
    {
        $role = Role::where('slug', 'staff')->firstOrFail();

        User::create([
            'name' => 'User One',
            'username' => 'testuser',
            'email' => 'unique@gov.et',
            'password' => 'Pass123!',
            'role_id' => $role->id,
        ]);

        $this->expectException(QueryException::class);

        // Attempt duplicate username
        User::create([
            'name' => 'User Two',
            'username' => 'testuser',
            'email' => 'another@gov.et',
            'password' => 'Pass123!',
            'role_id' => $role->id,
        ]);
    }

    public function test_foreign_key_constraint_prevents_invalid_organization_or_role(): void
    {
        $this->expectException(QueryException::class);

        User::create([
            'name' => 'Invalid Foreign Key User',
            'username' => 'invalid.user',
            'email' => 'invalid@gov.et',
            'password' => 'Pass123!',
            'organization_id' => 999999, // Non-existent organization
            'role_id' => 999999,         // Non-existent role
        ]);
    }

    public function test_organization_deletion_is_restricted_when_users_exist(): void
    {
        $orgType = OrganizationType::where('code', 'sub_city')->firstOrFail();
        $role = Role::where('slug', 'staff')->firstOrFail();

        $org = Organization::create([
            'organization_type_id' => $orgType->id,
            'name' => 'Yeka Sub-City',
            'code' => 'subcity-yeka',
        ]);

        User::create([
            'name' => 'Yeka Staff',
            'username' => 'yeka.staff',
            'email' => 'staff@yeka.gov.et',
            'password' => 'Pass123!',
            'organization_id' => $org->id,
            'role_id' => $role->id,
        ]);

        // Force deleting should fail due to restrictOnDelete foreign key constraint
        $this->expectException(QueryException::class);
        $org->forceDelete();
    }
}
