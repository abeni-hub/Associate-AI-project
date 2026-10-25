<?php

declare(strict_types=1);

namespace Tests\Feature\Api\V1\Authorization;

use App\Domains\Authorization\Models\Role;
use App\Domains\Organizations\Models\Organization;
use App\Domains\Organizations\Models\OrganizationType;
use App\Domains\Organizations\Services\OrganizationScopeService;
use App\Domains\Users\Models\User;
use Database\Seeders\OrganizationTypeSeeder;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrganizationScopeServiceTest extends TestCase
{
    use RefreshDatabase;

    private OrganizationScopeService $scopeService;

    private Organization $boleSubCity;

    private Organization $woreda01;

    private Organization $bureau01;

    private Organization $kirkosSubCity;

    private User $superAdmin;

    private User $subCityAdmin;

    private User $woredaAdmin;

    private User $bureauStaff;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(OrganizationTypeSeeder::class);
        $this->seed(PermissionSeeder::class);
        $this->seed(RoleSeeder::class);

        $this->scopeService = app(OrganizationScopeService::class);

        $subCityType = OrganizationType::where('code', 'sub_city')->firstOrFail();
        $woredaType = OrganizationType::where('code', 'woreda')->firstOrFail();
        $bureauType = OrganizationType::where('code', 'bureau')->firstOrFail();

        // Bole Hierarchy Tree
        $this->boleSubCity = Organization::create([
            'organization_type_id' => $subCityType->id,
            'name' => 'Bole Sub-City',
            'code' => 'subcity-bole',
        ]);

        $this->woreda01 = Organization::create([
            'organization_type_id' => $woredaType->id,
            'parent_organization_id' => $this->boleSubCity->id,
            'name' => 'Bole Woreda 01',
            'code' => 'woreda-01-bole',
        ]);

        $this->bureau01 = Organization::create([
            'organization_type_id' => $bureauType->id,
            'parent_organization_id' => $this->woreda01->id,
            'name' => 'Bole Woreda 01 Health Bureau',
            'code' => 'bureau-health-w01',
        ]);

        // Sibling Hierarchy Tree (Kirkos)
        $this->kirkosSubCity = Organization::create([
            'organization_type_id' => $subCityType->id,
            'name' => 'Kirkos Sub-City',
            'code' => 'subcity-kirkos',
        ]);

        // Users
        $superAdminRole = Role::where('slug', 'super_admin')->firstOrFail();
        $subCityAdminRole = Role::where('slug', 'sub_city_admin')->firstOrFail();
        $woredaAdminRole = Role::where('slug', 'woreda_admin')->firstOrFail();
        $staffRole = Role::where('slug', 'staff')->firstOrFail();

        $this->superAdmin = User::create([
            'name' => 'Platform Super Admin',
            'username' => 'super.admin',
            'email' => 'super@platform.gov.et',
            'password' => 'Password123!',
            'role_id' => $superAdminRole->id,
            'organization_id' => null,
            'status' => 'active',
        ]);

        $this->subCityAdmin = User::create([
            'name' => 'Bole Sub-City Admin',
            'username' => 'bole.admin',
            'email' => 'admin@bole.gov.et',
            'password' => 'Password123!',
            'role_id' => $subCityAdminRole->id,
            'organization_id' => $this->boleSubCity->id,
            'status' => 'active',
        ]);

        $this->woredaAdmin = User::create([
            'name' => 'Woreda 01 Admin',
            'username' => 'woreda.admin',
            'email' => 'admin@woreda01.gov.et',
            'password' => 'Password123!',
            'role_id' => $woredaAdminRole->id,
            'organization_id' => $this->woreda01->id,
            'status' => 'active',
        ]);

        $this->bureauStaff = User::create([
            'name' => 'Health Staff',
            'username' => 'health.staff',
            'email' => 'staff@health01.gov.et',
            'password' => 'Password123!',
            'role_id' => $staffRole->id,
            'organization_id' => $this->bureau01->id,
            'status' => 'active',
        ]);
    }

    public function test_super_admin_has_unrestricted_global_scope(): void
    {
        $allowedIds = $this->scopeService->getAllowedOrganizationIds($this->superAdmin);
        $this->assertNull($allowedIds);

        $this->assertTrue($this->scopeService->canAccessOrganization($this->superAdmin, $this->boleSubCity));
        $this->assertTrue($this->scopeService->canAccessOrganization($this->superAdmin, $this->kirkosSubCity));
        $this->assertTrue($this->scopeService->canManageOrganization($this->superAdmin, $this->bureau01));
    }

    public function test_sub_city_admin_has_scope_over_own_and_descendant_units(): void
    {
        // Scope without descendants includes only own ID
        $ownOnly = $this->scopeService->getAllowedOrganizationIds($this->subCityAdmin, includeDescendants: false);
        $this->assertEquals([$this->boleSubCity->id], $ownOnly);

        // Scope with descendants includes Sub-City, Woreda, and Bureau
        $withDescendants = $this->scopeService->getAllowedOrganizationIds($this->subCityAdmin, includeDescendants: true);
        $this->assertCount(3, $withDescendants);
        $this->assertContains($this->boleSubCity->id, $withDescendants);
        $this->assertContains($this->woreda01->id, $withDescendants);
        $this->assertContains($this->bureau01->id, $withDescendants);
        $this->assertNotContains($this->kirkosSubCity->id, $withDescendants);

        // Can access own and descendants
        $this->assertTrue($this->scopeService->canAccessOrganization($this->subCityAdmin, $this->boleSubCity));
        $this->assertTrue($this->scopeService->canAccessOrganization($this->subCityAdmin, $this->woreda01, allowDescendants: true));
        $this->assertTrue($this->scopeService->canAccessOrganization($this->subCityAdmin, $this->bureau01, allowDescendants: true));

        // Cannot access foreign sub-city
        $this->assertFalse($this->scopeService->canAccessOrganization($this->subCityAdmin, $this->kirkosSubCity, allowDescendants: true));
    }

    public function test_woreda_admin_cannot_access_parent_sub_city_or_sibling_trees(): void
    {
        $allowedIds = $this->scopeService->getAllowedOrganizationIds($this->woredaAdmin, includeDescendants: true);
        $this->assertCount(2, $allowedIds);
        $this->assertContains($this->woreda01->id, $allowedIds);
        $this->assertContains($this->bureau01->id, $allowedIds);
        $this->assertNotContains($this->boleSubCity->id, $allowedIds);
        $this->assertNotContains($this->kirkosSubCity->id, $allowedIds);

        $this->assertTrue($this->scopeService->canAccessOrganization($this->woredaAdmin, $this->woreda01));
        $this->assertTrue($this->scopeService->canAccessOrganization($this->woredaAdmin, $this->bureau01, allowDescendants: true));
        $this->assertFalse($this->scopeService->canAccessOrganization($this->woredaAdmin, $this->boleSubCity, allowDescendants: true));
    }

    public function test_staff_is_strictly_isolated_to_own_organization(): void
    {
        $allowed = $this->scopeService->getAllowedOrganizationIds($this->bureauStaff, includeDescendants: true);
        $this->assertEquals([$this->bureau01->id], $allowed);

        $this->assertTrue($this->scopeService->canAccessOrganization($this->bureauStaff, $this->bureau01));
        $this->assertFalse($this->scopeService->canAccessOrganization($this->bureauStaff, $this->woreda01, allowDescendants: true));
        $this->assertFalse($this->scopeService->canAccessOrganization($this->bureauStaff, $this->boleSubCity, allowDescendants: true));
    }

    public function test_apply_scope_filters_eloquent_builder(): void
    {
        $scopedQuery = $this->scopeService->applyScope(
            Organization::query(),
            $this->subCityAdmin,
            'id',
            includeDescendants: true
        );

        $results = $scopedQuery->pluck('id')->all();

        $this->assertCount(3, $results);
        $this->assertContains($this->boleSubCity->id, $results);
        $this->assertContains($this->woreda01->id, $results);
        $this->assertContains($this->bureau01->id, $results);
        $this->assertNotContains($this->kirkosSubCity->id, $results);
    }
}
