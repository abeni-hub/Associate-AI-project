<?php

declare(strict_types=1);

namespace Tests\Feature\Database;

use App\Domains\Authorization\Models\Permission;
use App\Domains\Authorization\Models\Role;
use App\Domains\Users\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RolePermissionTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(PermissionSeeder::class);
        $this->seed(RoleSeeder::class);
    }

    public function test_roles_and_permissions_are_properly_associated(): void
    {
        $subCityAdminRole = Role::where('slug', 'sub_city_admin')->firstOrFail();

        $this->assertTrue($subCityAdminRole->hasPermission('users.create'));
        $this->assertTrue($subCityAdminRole->hasPermission('feedback.view_descendants'));
        $this->assertFalse($subCityAdminRole->hasPermission('roles.manage'));
    }

    public function test_user_inherits_permissions_from_assigned_role(): void
    {
        $role = Role::where('slug', 'sub_city_admin')->firstOrFail();

        $user = User::create([
            'name' => 'Sara Mohammed',
            'username' => 'sara.m',
            'email' => 'sara@subcity.gov.et',
            'password' => 'Password123!',
            'role_id' => $role->id,
        ]);

        $this->assertTrue($user->hasPermission('users.create'));
        $this->assertTrue($user->hasPermission('feedback.view_descendants'));
        $this->assertFalse($user->hasPermission('roles.manage'));
    }

    public function test_super_admin_has_all_permissions_implicitly(): void
    {
        $superAdminRole = Role::where('slug', 'super_admin')->firstOrFail();

        $superAdmin = User::create([
            'name' => 'Root Admin',
            'username' => 'root.admin',
            'email' => 'root@platform.gov.et',
            'password' => 'Password123!',
            'role_id' => $superAdminRole->id,
        ]);

        $this->assertTrue($superAdmin->hasPermission('roles.manage'));
        $this->assertTrue($superAdmin->hasPermission('users.delete'));
        $this->assertTrue($superAdmin->hasPermission('any.arbitrary.permission.key'));
    }

    public function test_cannot_assign_duplicate_permission_to_same_role(): void
    {
        $role = Role::where('slug', 'staff')->firstOrFail();
        $permission = Permission::where('key', 'dashboard.view')->firstOrFail();

        $this->expectException(QueryException::class);

        // Attempt direct insertion of duplicate pair
        \DB::table('role_permissions')->insert([
            'role_id' => $role->id,
            'permission_id' => $permission->id,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
