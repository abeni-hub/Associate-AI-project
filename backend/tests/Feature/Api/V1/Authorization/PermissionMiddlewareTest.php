<?php

declare(strict_types=1);

namespace Tests\Feature\Api\V1\Authorization;

use App\Domains\Authorization\Models\Role;
use App\Domains\Users\Models\User;
use Database\Seeders\OrganizationTypeSeeder;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;

class PermissionMiddlewareTest extends TestCase
{
    use RefreshDatabase;

    private User $superAdmin;

    private User $subCityAdmin;

    private User $staff;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(OrganizationTypeSeeder::class);
        $this->seed(PermissionSeeder::class);
        $this->seed(RoleSeeder::class);

        $superAdminRole = Role::where('slug', 'super_admin')->firstOrFail();
        $subCityAdminRole = Role::where('slug', 'sub_city_admin')->firstOrFail();
        $staffRole = Role::where('slug', 'staff')->firstOrFail();

        $this->superAdmin = User::create([
            'name' => 'Super Admin',
            'username' => 'super.admin',
            'email' => 'super@gov.et',
            'password' => 'Password123!',
            'role_id' => $superAdminRole->id,
            'status' => 'active',
        ]);

        $this->subCityAdmin = User::create([
            'name' => 'Sub City Admin',
            'username' => 'subcity.admin',
            'email' => 'subcity@gov.et',
            'password' => 'Password123!',
            'role_id' => $subCityAdminRole->id,
            'status' => 'active',
        ]);

        $this->staff = User::create([
            'name' => 'Staff User',
            'username' => 'staff.user',
            'email' => 'staff@gov.et',
            'password' => 'Password123!',
            'role_id' => $staffRole->id,
            'status' => 'active',
        ]);

        // Register temporary test route using permission middleware
        Route::get('/api/v1/test-protected-endpoint', function () {
            return response()->json(['success' => true, 'message' => 'Authorized access granted.']);
        })->middleware(['auth:sanctum', 'permission:users.create']);
    }

    public function test_unauthenticated_request_is_rejected(): void
    {
        $response = $this->getJson('/api/v1/test-protected-endpoint');

        $response->assertStatus(401)
            ->assertJson([
                'success' => false,
                'message' => 'Unauthenticated.',
            ]);
    }

    public function test_user_with_permission_is_granted_access(): void
    {
        // SubCity Admin has users.create permission
        $response = $this->actingAs($this->subCityAdmin)
            ->getJson('/api/v1/test-protected-endpoint');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Authorized access granted.',
            ]);
    }

    public function test_user_without_permission_receives_403_forbidden(): void
    {
        // Staff does NOT have users.create permission
        $response = $this->actingAs($this->staff)
            ->getJson('/api/v1/test-protected-endpoint');

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
                'message' => 'Forbidden. You do not have permission to perform this action.',
            ]);
    }

    public function test_super_admin_bypasses_all_permission_restrictions(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->getJson('/api/v1/test-protected-endpoint');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Authorized access granted.',
            ]);
    }
}
