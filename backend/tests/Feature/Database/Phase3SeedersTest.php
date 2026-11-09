<?php

declare(strict_types=1);

namespace Tests\Feature\Database;

use App\Domains\Authorization\Models\Role;
use App\Domains\Events\Models\Event;
use App\Domains\Navigation\Models\NavigationItem;
use App\Domains\QrCodes\Models\QrCode;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class Phase3SeedersTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_navigation_items_are_fully_seeded_with_correct_routes(): void
    {
        $expectedRoutes = [
            '/admin/overview',
            '/admin/subcities',
            '/admin/levels',
            '/admin/accounts',
            '/admin/roles',
            '/admin/services',
            '/admin/documents',
            '/admin/routes',
            '/admin/feedback',
            '/admin/qr',
            '/admin/news',
            '/admin/cms',
            '/admin/activity',
        ];

        foreach ($expectedRoutes as $route) {
            $this->assertDatabaseHas('navigation_items', [
                'route' => $route,
                'is_active' => true,
            ]);
        }

        $this->assertSame(13, NavigationItem::count());
    }

    public function test_role_navigation_items_mapping_and_role_differentiation(): void
    {
        $superAdmin = Role::where('slug', 'super_admin')->firstOrFail();
        $subCityAdmin = Role::where('slug', 'sub_city_admin')->firstOrFail();
        $staff = Role::where('slug', 'staff')->firstOrFail();

        // Super Admin has all 13 navigation items
        $this->assertCount(13, $superAdmin->navigationItems);

        // Sub-City Admin has 9 items
        $subCityRoutes = $subCityAdmin->navigationItems->pluck('route')->toArray();
        $this->assertCount(9, $subCityRoutes);
        $this->assertContains('/admin/subcities', $subCityRoutes);
        $this->assertContains('/admin/accounts', $subCityRoutes);
        $this->assertContains('/admin/documents', $subCityRoutes);
        $this->assertNotContains('/admin/cms', $subCityRoutes);

        // Staff has 5 items (Overview, Feedback, Services, Documents, Routes)
        $staffRoutes = $staff->navigationItems->pluck('route')->toArray();
        $this->assertCount(5, $staffRoutes);
        $this->assertContains('/admin/overview', $staffRoutes);
        $this->assertContains('/admin/services', $staffRoutes);
        $this->assertContains('/admin/documents', $staffRoutes);
        $this->assertNotContains('/admin/subcities', $staffRoutes);
        $this->assertNotContains('/admin/accounts', $staffRoutes);
        $this->assertNotContains('/admin/cms', $staffRoutes);
    }

    public function test_roles_have_correct_scope_levels(): void
    {
        $superAdmin = Role::where('slug', 'super_admin')->firstOrFail();
        $subCityAdmin = Role::where('slug', 'sub_city_admin')->firstOrFail();
        $woredaAdmin = Role::where('slug', 'woreda_admin')->firstOrFail();
        $bureauAdmin = Role::where('slug', 'bureau_admin')->firstOrFail();
        $staff = Role::where('slug', 'staff')->firstOrFail();

        $this->assertSame(Role::SCOPE_GLOBAL, $superAdmin->scope_level);
        $this->assertSame(Role::SCOPE_SUB_CITY, $subCityAdmin->scope_level);
        $this->assertSame(Role::SCOPE_WOREDA, $woredaAdmin->scope_level);
        $this->assertSame(Role::SCOPE_BUREAU, $bureauAdmin->scope_level);
        $this->assertSame(Role::SCOPE_BUREAU, $staff->scope_level);
    }

    public function test_qr_codes_and_events_seeded_properly(): void
    {
        // QR Codes
        $this->assertTrue(QrCode::where('code', 'QR-BOLE-MAIN-001')->exists());
        $qr = QrCode::where('code', 'QR-BOLE-MAIN-001')->firstOrFail();
        $this->assertNotNull($qr->organization_id);
        $this->assertSame('active', $qr->status);

        // Events & Multi-Image Gallery
        $event = Event::where('title', 'Annual Taxpayer Consultative Forum 2026')->firstOrFail();
        $this->assertNotNull($event->organization_id);
        $this->assertGreaterThanOrEqual(2, $event->images()->count());
    }
}
