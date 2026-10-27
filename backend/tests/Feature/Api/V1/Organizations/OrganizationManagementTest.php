<?php

declare(strict_types=1);

namespace Tests\Feature\Api\V1\Organizations;

use App\Domains\Authorization\Models\Role;
use App\Domains\Organizations\Models\Organization;
use App\Domains\Organizations\Models\OrganizationType;
use App\Domains\Users\Models\User;
use Database\Seeders\OrganizationTypeSeeder;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrganizationManagementTest extends TestCase
{
    use RefreshDatabase;

    private User $superAdmin;

    private User $subCityAdmin;

    private User $staff;

    private Organization $boleSubCity;

    private Organization $woreda01;

    private OrganizationType $subCityType;

    private OrganizationType $woredaType;

    private OrganizationType $bureauType;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(OrganizationTypeSeeder::class);
        $this->seed(PermissionSeeder::class);
        $this->seed(RoleSeeder::class);

        $this->subCityType = OrganizationType::where('code', 'sub_city')->firstOrFail();
        $this->woredaType = OrganizationType::where('code', 'woreda')->firstOrFail();
        $this->bureauType = OrganizationType::where('code', 'bureau')->firstOrFail();

        $this->boleSubCity = Organization::create([
            'organization_type_id' => $this->subCityType->id,
            'name' => 'Bole Sub-City',
            'code' => 'subcity-bole',
            'status' => 'active',
        ]);

        $this->woreda01 = Organization::create([
            'organization_type_id' => $this->woredaType->id,
            'parent_organization_id' => $this->boleSubCity->id,
            'name' => 'Woreda 01',
            'code' => 'woreda-01-bole',
            'status' => 'active',
        ]);

        $superAdminRole = Role::where('slug', 'super_admin')->firstOrFail();
        $subCityAdminRole = Role::where('slug', 'sub_city_admin')->firstOrFail();
        $staffRole = Role::where('slug', 'staff')->firstOrFail();

        $this->superAdmin = User::create([
            'name' => 'Super Admin',
            'username' => 'super.admin',
            'email' => 'super@platform.gov.et',
            'password' => 'Password123!',
            'role_id' => $superAdminRole->id,
            'status' => 'active',
        ]);

        $this->subCityAdmin = User::create([
            'name' => 'Bole Admin',
            'username' => 'bole.admin',
            'email' => 'admin@bole.gov.et',
            'password' => 'Password123!',
            'role_id' => $subCityAdminRole->id,
            'organization_id' => $this->boleSubCity->id,
            'status' => 'active',
        ]);

        $this->staff = User::create([
            'name' => 'Staff Member',
            'username' => 'staff.member',
            'email' => 'staff@bole.gov.et',
            'password' => 'Password123!',
            'role_id' => $staffRole->id,
            'organization_id' => $this->boleSubCity->id,
            'status' => 'active',
        ]);
    }

    public function test_can_list_organization_types(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->getJson('/api/v1/organization-types');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Organization types retrieved successfully.',
            ])
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'name', 'code', 'level', 'can_be_root', 'allowed_parent_types'],
                ],
            ]);
    }

    public function test_sub_city_admin_can_only_see_organizations_in_own_hierarchy(): void
    {
        // Create an organization in a different hierarchy (Kirkos Sub-City)
        $kirkos = Organization::create([
            'organization_type_id' => $this->subCityType->id,
            'name' => 'Kirkos Sub-City',
            'code' => 'subcity-kirkos',
        ]);

        $response = $this->actingAs($this->subCityAdmin)
            ->getJson('/api/v1/organizations');

        $response->assertStatus(200);
        $ids = collect($response->json('data'))->pluck('id')->all();

        $this->assertContains($this->boleSubCity->id, $ids);
        $this->assertContains($this->woreda01->id, $ids);
        $this->assertNotContains($kirkos->id, $ids);
    }

    public function test_super_admin_can_create_root_organization(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->postJson('/api/v1/organizations', [
                'name' => 'Yeka Sub-City',
                'code' => 'subcity-yeka',
                'organization_type_id' => $this->subCityType->id,
                'status' => 'active',
            ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'data' => [
                    'name' => 'Yeka Sub-City',
                    'code' => 'subcity-yeka',
                    'is_root' => true,
                ],
            ]);

        $this->assertDatabaseHas('organizations', ['code' => 'subcity-yeka']);
        $this->assertDatabaseHas('audit_logs', [
            'action' => 'created',
            'entity_type' => 'Organization',
        ]);
    }

    public function test_sub_city_admin_cannot_create_root_organization(): void
    {
        $response = $this->actingAs($this->subCityAdmin)
            ->postJson('/api/v1/organizations', [
                'name' => 'Invalid Root',
                'code' => 'subcity-invalid',
                'organization_type_id' => $this->subCityType->id,
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['parent_organization_id']);
    }

    public function test_sub_city_admin_can_create_bureau_under_own_hierarchy(): void
    {
        $response = $this->actingAs($this->subCityAdmin)
            ->postJson('/api/v1/organizations', [
                'name' => 'Vital Events Office',
                'code' => 'bureau-vital-events-w01',
                'organization_type_id' => $this->bureauType->id,
                'parent_organization_id' => $this->woreda01->id,
                'status' => 'active',
            ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'data' => [
                    'code' => 'bureau-vital-events-w01',
                    'parent' => [
                        'id' => $this->woreda01->id,
                    ],
                ],
            ]);
    }

    public function test_organization_tree_endpoint_returns_nested_hierarchy(): void
    {
        $response = $this->actingAs($this->subCityAdmin)
            ->getJson('/api/v1/organizations/tree');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    [
                        'id' => $this->boleSubCity->id,
                        'children' => [
                            [
                                'id' => $this->woreda01->id,
                            ],
                        ],
                    ],
                ],
            ]);
    }

    public function test_cannot_delete_organization_with_children(): void
    {
        // Bole SubCity has Woreda 01 as child
        $response = $this->actingAs($this->superAdmin)
            ->deleteJson("/api/v1/organizations/{$this->boleSubCity->id}");

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'Cannot delete organization because it has existing child units. Reassign or remove child units first.',
            ]);
    }

    public function test_cannot_delete_organization_with_assigned_users(): void
    {
        // Staff member is assigned to Bole Sub-City
        $emptyOrg = Organization::create([
            'organization_type_id' => $this->bureauType->id,
            'parent_organization_id' => $this->woreda01->id,
            'name' => 'Org With User',
            'code' => 'org-with-user',
        ]);

        $staffRole = Role::where('slug', 'staff')->firstOrFail();
        User::create([
            'name' => 'Assigned Worker',
            'username' => 'worker.test',
            'email' => 'worker@test.et',
            'password' => 'Password123!',
            'role_id' => $staffRole->id,
            'organization_id' => $emptyOrg->id,
        ]);

        $response = $this->actingAs($this->superAdmin)
            ->deleteJson("/api/v1/organizations/{$emptyOrg->id}");

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'Cannot delete organization because active users are assigned to it. Reassign users first.',
            ]);
    }

    public function test_can_delete_empty_leaf_organization(): void
    {
        $leafOrg = Organization::create([
            'organization_type_id' => $this->bureauType->id,
            'parent_organization_id' => $this->woreda01->id,
            'name' => 'Leaf Bureau',
            'code' => 'bureau-leaf-test',
        ]);

        $response = $this->actingAs($this->superAdmin)
            ->deleteJson("/api/v1/organizations/{$leafOrg->id}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Organization deleted successfully.',
            ]);

        $this->assertSoftDeleted('organizations', ['id' => $leafOrg->id]);
        $this->assertDatabaseHas('audit_logs', [
            'action' => 'deleted',
            'entity_type' => 'Organization',
            'entity_id' => (string) $leafOrg->id,
        ]);
    }

    public function test_organizations_index_supports_pagination_with_metadata(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->getJson('/api/v1/organizations?per_page=1&page=1');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Organizations retrieved successfully.',
            ])
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'name', 'code', 'status'],
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

        $this->assertCount(1, $response->json('data'));
        $this->assertSame(1, $response->json('meta.per_page'));
        $this->assertGreaterThanOrEqual(2, $response->json('meta.total'));
    }

    public function test_organizations_index_enforces_maximum_page_size(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->getJson('/api/v1/organizations?per_page=250');

        $response->assertStatus(200);
        $this->assertSame(100, $response->json('meta.per_page'));
    }

    public function test_organizations_index_filters_by_search_query(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->getJson('/api/v1/organizations?search=Bole');

        $response->assertStatus(200);
        $names = collect($response->json('data'))->pluck('name')->all();

        $this->assertContains('Bole Sub-City', $names);
    }

    public function test_organizations_index_filters_by_status(): void
    {
        $inactiveOrg = Organization::create([
            'organization_type_id' => $this->subCityType->id,
            'name' => 'Inactive Sub-City',
            'code' => 'subcity-inactive',
            'status' => 'inactive',
        ]);

        $responseActive = $this->actingAs($this->superAdmin)
            ->getJson('/api/v1/organizations?status=active');

        $responseActive->assertStatus(200);
        $activeIds = collect($responseActive->json('data'))->pluck('id')->all();
        $this->assertNotContains($inactiveOrg->id, $activeIds);

        $responseInactive = $this->actingAs($this->superAdmin)
            ->getJson('/api/v1/organizations?status=inactive');

        $responseInactive->assertStatus(200);
        $inactiveIds = collect($responseInactive->json('data'))->pluck('id')->all();
        $this->assertContains($inactiveOrg->id, $inactiveIds);
    }
}
