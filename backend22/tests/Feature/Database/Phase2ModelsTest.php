<?php

declare(strict_types=1);

namespace Tests\Feature\Database;

use App\Domains\Authorization\Models\Permission;
use App\Domains\Authorization\Models\Role;
use App\Domains\Events\Models\Event;
use App\Domains\Events\Models\EventImage;
use App\Domains\Navigation\Models\NavigationItem;
use App\Domains\Organizations\Models\Organization;
use App\Domains\Organizations\Models\OrganizationType;
use App\Domains\QrCodes\Models\QrCode;
use Database\Seeders\OrganizationTypeSeeder;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class Phase2ModelsTest extends TestCase
{
    use RefreshDatabase;

    private Organization $subCity;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(OrganizationTypeSeeder::class);
        $this->seed(PermissionSeeder::class);
        $this->seed(RoleSeeder::class);

        $subCityType = OrganizationType::where('code', 'sub_city')->firstOrFail();
        $this->subCity = Organization::create([
            'name' => 'Bole Sub-City Administration',
            'code' => 'subcity-bole',
            'organization_type_id' => $subCityType->id,
            'status' => 'active',
        ]);
    }

    public function test_navigation_item_creation_and_role_relationship(): void
    {
        $role = Role::where('slug', 'super_admin')->firstOrFail();

        $item = NavigationItem::create([
            'label' => 'Sub-cities',
            'route' => '/admin/subcities',
            'icon' => 'Building2',
            'display_order' => 2,
            'is_active' => true,
            'required_permission' => 'subcities.view',
        ]);

        $item->roles()->attach($role->id);

        $this->assertDatabaseHas('navigation_items', [
            'id' => $item->id,
            'label' => 'Sub-cities',
            'route' => '/admin/subcities',
        ]);

        $this->assertDatabaseHas('role_navigation_items', [
            'role_id' => $role->id,
            'navigation_item_id' => $item->id,
        ]);

        $this->assertTrue($item->roles->contains($role));
        $this->assertTrue($role->navigationItems->contains($item));
    }

    public function test_role_scope_level_and_management_hierarchy(): void
    {
        $superAdmin = Role::where('slug', 'super_admin')->firstOrFail();
        $superAdmin->update(['scope_level' => Role::SCOPE_GLOBAL]);

        $subCityRole = Role::create([
            'name' => 'Sub-City Administrator',
            'slug' => 'sub_city_admin_test',
            'scope_level' => Role::SCOPE_SUB_CITY,
            'is_system' => false,
            'is_active' => true,
        ]);

        $woredaRole = Role::create([
            'name' => 'Woreda Administrator',
            'slug' => 'woreda_admin_test',
            'scope_level' => Role::SCOPE_WOREDA,
            'is_system' => false,
            'is_active' => true,
        ]);

        // Super Admin can manage all scopes
        $this->assertTrue($superAdmin->canManageScope(Role::SCOPE_GLOBAL));
        $this->assertTrue($superAdmin->canManageScope(Role::SCOPE_SUB_CITY));
        $this->assertTrue($superAdmin->canManageScope(Role::SCOPE_WOREDA));

        // Sub-City Admin can manage Sub-City, Woreda, Bureau, but NOT Global
        $this->assertTrue($subCityRole->canManageScope(Role::SCOPE_SUB_CITY));
        $this->assertTrue($subCityRole->canManageScope(Role::SCOPE_WOREDA));
        $this->assertTrue($subCityRole->canManageScope(Role::SCOPE_BUREAU));
        $this->assertFalse($subCityRole->canManageScope(Role::SCOPE_GLOBAL));

        // Woreda Admin cannot manage Sub-City
        $this->assertFalse($woredaRole->canManageScope(Role::SCOPE_SUB_CITY));
    }

    public function test_role_permission_pivot_with_granular_crud_flags(): void
    {
        $role = Role::where('slug', 'staff')->firstOrFail();
        $permission = Permission::firstOrFail();

        $role->permissions()->syncWithoutDetaching([
            $permission->id => [
                'can_create' => true,
                'can_read' => true,
                'can_update' => false,
                'can_delete' => false,
            ],
        ]);

        $this->assertDatabaseHas('role_permissions', [
            'role_id' => $role->id,
            'permission_id' => $permission->id,
            'can_create' => true,
            'can_read' => true,
            'can_update' => false,
            'can_delete' => false,
        ]);

        $attached = $role->permissions()->where('permissions.id', $permission->id)->first();
        $this->assertTrue((bool) $attached->pivot->can_create);
        $this->assertFalse((bool) $attached->pivot->can_delete);
    }

    public function test_qr_code_lifecycle_and_scan_recording(): void
    {
        $qr = QrCode::create([
            'organization_id' => $this->subCity->id,
            'code' => 'QR-BOLE-TEST-001',
            'label' => 'Main Reception Desk',
            'target_url' => 'https://civiclink.et/guide/bole-main',
            'status' => 'active',
        ]);

        $this->assertDatabaseHas('qr_codes', [
            'id' => $qr->id,
            'code' => 'QR-BOLE-TEST-001',
            'scan_count' => 0,
        ]);

        $this->assertNull($qr->last_scanned_at);

        $qr->recordScan();

        $qr->refresh();
        $this->assertSame(1, $qr->scan_count);
        $this->assertNotNull($qr->last_scanned_at);
        $this->assertSame($this->subCity->id, $qr->organization->id);
    }

    public function test_event_and_multiple_images_relationship(): void
    {
        $event = Event::create([
            'organization_id' => $this->subCity->id,
            'title' => 'Community Town Hall',
            'description' => 'Discussion regarding urban infrastructure developments.',
            'location_name' => 'Bole Hall 1',
            'event_date' => now()->addDays(3),
            'status' => 'published',
        ]);

        $img1 = EventImage::create([
            'event_id' => $event->id,
            'image_url' => 'https://civiclink.et/storage/events/townhall-1.jpg',
            'caption' => 'Opening remarks',
            'order_column' => 1,
        ]);

        $img2 = EventImage::create([
            'event_id' => $event->id,
            'image_url' => 'https://civiclink.et/storage/events/townhall-2.jpg',
            'caption' => 'Citizen Q&A session',
            'order_column' => 2,
        ]);

        $this->assertCount(2, $event->images);
        $this->assertSame($img1->id, $event->images->first()->id);
        $this->assertSame($img2->id, $event->images->last()->id);
        $this->assertSame($event->id, $img1->event->id);
    }

    public function test_organization_statutory_hierarchy_enforcement(): void
    {
        $woredaType = OrganizationType::where('code', 'woreda')->firstOrFail();
        $woreda = Organization::create([
            'name' => 'Bole Woreda 03',
            'code' => 'woreda-bole-03',
            'organization_type_id' => $woredaType->id,
            'status' => 'active',
        ]);

        // Sub-City (Level 1) CAN be parent of Woreda (Level 2)
        $this->assertTrue($woreda->canHaveParent($this->subCity));

        // Woreda (Level 2) CANNOT be parent of Sub-City (Level 1)
        $this->assertFalse($this->subCity->canHaveParent($woreda));
    }
}
