<?php

declare(strict_types=1);

namespace Tests\Feature\Database;

use App\Domains\Organizations\Models\Organization;
use App\Domains\Organizations\Models\OrganizationType;
use Database\Seeders\OrganizationTypeSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrganizationHierarchyTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(OrganizationTypeSeeder::class);
    }

    public function test_sub_city_can_be_root_organization(): void
    {
        $subCityType = OrganizationType::where('code', 'sub_city')->firstOrFail();

        $subCity = Organization::create([
            'organization_type_id' => $subCityType->id,
            'parent_organization_id' => null,
            'name' => 'Bole Sub-City',
            'code' => 'subcity-bole',
            'status' => 'active',
        ]);

        $this->assertTrue($subCity->isRoot());
        $this->assertNull($subCity->parent);
        $this->assertCount(0, $subCity->children);
    }

    public function test_woreda_can_have_sub_city_as_parent(): void
    {
        $subCityType = OrganizationType::where('code', 'sub_city')->firstOrFail();
        $woredaType = OrganizationType::where('code', 'woreda')->firstOrFail();

        $subCity = Organization::create([
            'organization_type_id' => $subCityType->id,
            'name' => 'Bole Sub-City',
            'code' => 'subcity-bole',
        ]);

        $woreda = Organization::create([
            'organization_type_id' => $woredaType->id,
            'parent_organization_id' => $subCity->id,
            'name' => 'Woreda 01',
            'code' => 'woreda-01-bole',
        ]);

        $this->assertTrue($woreda->canHaveParent($subCity));
        $this->assertFalse($woreda->isRoot());
        $this->assertEquals($subCity->id, $woreda->parent->id);
        $this->assertTrue($subCity->children->contains($woreda));
    }

    public function test_bureau_can_have_woreda_or_sub_city_as_parent(): void
    {
        $subCityType = OrganizationType::where('code', 'sub_city')->firstOrFail();
        $woredaType = OrganizationType::where('code', 'woreda')->firstOrFail();
        $bureauType = OrganizationType::where('code', 'bureau')->firstOrFail();

        $subCity = Organization::create([
            'organization_type_id' => $subCityType->id,
            'name' => 'Bole Sub-City',
            'code' => 'subcity-bole',
        ]);

        $woreda = Organization::create([
            'organization_type_id' => $woredaType->id,
            'parent_organization_id' => $subCity->id,
            'name' => 'Woreda 01',
            'code' => 'woreda-01-bole',
        ]);

        $bureauUnderWoreda = Organization::create([
            'organization_type_id' => $bureauType->id,
            'parent_organization_id' => $woreda->id,
            'name' => 'Vital Events Bureau',
            'code' => 'bureau-vital-events-w01',
        ]);

        $bureauUnderSubCity = Organization::create([
            'organization_type_id' => $bureauType->id,
            'parent_organization_id' => $subCity->id,
            'name' => 'Sub-City Trade Bureau',
            'code' => 'bureau-trade-bole',
        ]);

        $this->assertTrue($bureauUnderWoreda->canHaveParent($woreda));
        $this->assertTrue($bureauUnderSubCity->canHaveParent($subCity));
    }

    public function test_hierarchy_validation_rejects_disallowed_parent_type(): void
    {
        $subCityType = OrganizationType::where('code', 'sub_city')->firstOrFail();
        $woredaType = OrganizationType::where('code', 'woreda')->firstOrFail();

        $subCity = Organization::create([
            'organization_type_id' => $subCityType->id,
            'name' => 'Bole Sub-City',
            'code' => 'subcity-bole',
        ]);

        $woreda = Organization::create([
            'organization_type_id' => $woredaType->id,
            'parent_organization_id' => $subCity->id,
            'name' => 'Woreda 01',
            'code' => 'woreda-01-bole',
        ]);

        // A Sub-City cannot have a Woreda as its parent
        $this->assertFalse($subCity->canHaveParent($woreda));
    }

    public function test_recursive_descendants_and_ancestors_traversal(): void
    {
        $subCityType = OrganizationType::where('code', 'sub_city')->firstOrFail();
        $woredaType = OrganizationType::where('code', 'woreda')->firstOrFail();
        $bureauType = OrganizationType::where('code', 'bureau')->firstOrFail();

        $subCity = Organization::create([
            'organization_type_id' => $subCityType->id,
            'name' => 'Bole Sub-City',
            'code' => 'subcity-bole',
        ]);

        $woreda = Organization::create([
            'organization_type_id' => $woredaType->id,
            'parent_organization_id' => $subCity->id,
            'name' => 'Woreda 01',
            'code' => 'woreda-01-bole',
        ]);

        $bureau = Organization::create([
            'organization_type_id' => $bureauType->id,
            'parent_organization_id' => $woreda->id,
            'name' => 'Vital Events Bureau',
            'code' => 'bureau-vital-events-w01',
        ]);

        // SubCity descendants include Woreda and Bureau
        $descendants = $subCity->allDescendants();
        $this->assertCount(2, $descendants);
        $this->assertTrue($descendants->contains($woreda));
        $this->assertTrue($descendants->contains($bureau));

        // Bureau ancestors include Woreda and SubCity
        $ancestors = $bureau->allAncestors();
        $this->assertCount(2, $ancestors);
        $this->assertTrue($ancestors->contains($woreda));
        $this->assertTrue($ancestors->contains($subCity));
    }
}
