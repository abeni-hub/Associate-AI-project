<?php

declare(strict_types=1);

namespace Tests\Feature\Api\V1\Authorization;

use App\Domains\Authorization\Models\Permission;
use App\Domains\Authorization\Models\Role;
use App\Domains\Users\Models\User;
use Database\Seeders\OrganizationTypeSeeder;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RolePermissionApiTest extends TestCase
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
    }

    public function test_roles_listing_requires_authentication(): void
    {
        $response = $this->getJson('/api/v1/roles');

        $response->assertStatus(401);
    }

    public function test_roles_listing_forbidden_without_roles_view_permission(): void
    {
        // Staff role does not have roles.view permission
        $response = $this->actingAs($this->staff)
            ->getJson('/api/v1/roles');

        $response->assertStatus(403);
    }

    public function test_super_admin_can_list_roles(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->getJson('/api/v1/roles');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Roles retrieved successfully.',
            ])
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'name',
                        'slug',
                        'description',
                        'is_system',
                        'is_active',
                        'permissions_count',
                    ],
                ],
            ]);
    }

    public function test_can_view_single_role_with_permissions(): void
    {
        $subCityRole = Role::where('slug', 'sub_city_admin')->firstOrFail();

        $response = $this->actingAs($this->superAdmin)
            ->getJson("/api/v1/roles/{$subCityRole->id}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'id' => $subCityRole->id,
                    'slug' => 'sub_city_admin',
                ],
            ])
            ->assertJsonStructure([
                'data' => [
                    'permissions' => [
                        '*' => [
                            'id',
                            'key',
                            'name',
                            'group',
                        ],
                    ],
                ],
            ]);
    }

    public function test_super_admin_can_list_permissions(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->getJson('/api/v1/permissions');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Permissions retrieved successfully.',
            ])
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'key',
                        'name',
                        'group',
                        'description',
                    ],
                ],
            ]);
    }

    public function test_super_admin_can_update_role_permissions(): void
    {
        $role = Role::where('slug', 'staff')->firstOrFail();
        $permissions = Permission::whereIn('key', ['services.view', 'news.view'])->pluck('id')->toArray();

        $response = $this->actingAs($this->superAdmin)
            ->putJson("/api/v1/roles/{$role->id}/permissions", [
                'permission_ids' => $permissions,
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Role permissions updated successfully.',
            ]);

        $role->refresh();
        $this->assertTrue($role->hasPermission('services.view'));
        $this->assertTrue($role->hasPermission('news.view'));
        $this->assertFalse($role->hasPermission('feedback.view_own'));
    }

    public function test_cannot_modify_super_admin_role_permissions(): void
    {
        $superAdminRole = Role::where('slug', 'super_admin')->firstOrFail();

        $response = $this->actingAs($this->superAdmin)
            ->putJson("/api/v1/roles/{$superAdminRole->id}/permissions", [
                'permission_ids' => [],
            ]);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'Super Admin permissions cannot be modified.',
            ]);
    }

    public function test_roles_index_supports_pagination_with_metadata(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->getJson('/api/v1/roles?per_page=2&page=1');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Roles retrieved successfully.',
            ])
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'name', 'slug'],
                ],
                'meta' => [
                    'current_page',
                    'last_page',
                    'per_page',
                    'total',
                    'from',
                    'to',
                ],
            ]);

        $this->assertCount(2, $response->json('data'));
        $this->assertSame(2, $response->json('meta.per_page'));
        $this->assertGreaterThanOrEqual(4, $response->json('meta.total'));
    }

    public function test_roles_index_enforces_maximum_page_size(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->getJson('/api/v1/roles?per_page=300');

        $response->assertStatus(200);
        $this->assertSame(100, $response->json('meta.per_page'));
    }

    public function test_roles_index_filters_by_search_query(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->getJson('/api/v1/roles?search=super_admin');

        $response->assertStatus(200);
        $slugs = collect($response->json('data'))->pluck('slug')->all();

        $this->assertContains('super_admin', $slugs);
        $this->assertNotContains('staff', $slugs);
    }
}
