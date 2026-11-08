<?php declare(strict_types=1);

namespace Tests\Feature\Api\V1\Navigation;

use App\Domains\Authorization\Models\Role;
use App\Domains\Organizations\Models\Organization;
use App\Domains\Organizations\Models\OrganizationType;
use App\Domains\Users\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class NavigationSidebarApiTest extends TestCase
{
    use RefreshDatabase;

    private User $superAdmin;

    private User $subCityAdmin;

    private User $woredaAdmin;

    private User $staff;

    private Organization $subCity;

    private Organization $woreda;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);

        $superAdminRole = Role::where('slug', 'super_admin')->firstOrFail();
        $subCityRole = Role::where('slug', 'sub_city_admin')->firstOrFail();
        $woredaRole = Role::where('slug', 'woreda_admin')->firstOrFail();
        $staffRole = Role::where('slug', 'staff')->firstOrFail();

        $subCityType = OrganizationType::where('code', 'sub_city')->firstOrFail();
        $woredaType = OrganizationType::where('code', 'woreda')->firstOrFail();

        $this->subCity = Organization::create([
            'name' => 'Bole Sub-City Administration',
            'code' => 'subcity-bole-nav-test',
            'organization_type_id' => $subCityType->id,
            'status' => 'active',
        ]);

        $this->woreda = Organization::create([
            'name' => 'Bole Woreda 03',
            'code' => 'woreda-bole-03-nav-test',
            'organization_type_id' => $woredaType->id,
            'parent_organization_id' => $this->subCity->id,
            'status' => 'active',
        ]);

        $this->superAdmin = User::create([
            'name' => 'Super Administrator',
            'username' => 'superadmin.nav',
            'email' => 'superadmin.nav@civiclink.et',
            'password' => 'SecurePass123!',
            'role_id' => $superAdminRole->id,
            'status' => 'active',
        ]);

        $this->subCityAdmin = User::create([
            'name' => 'Sub City Admin',
            'username' => 'subcity.admin.nav',
            'email' => 'subcity.admin.nav@civiclink.et',
            'password' => 'SecurePass123!',
            'role_id' => $subCityRole->id,
            'organization_id' => $this->subCity->id,
            'status' => 'active',
        ]);

        $this->woredaAdmin = User::create([
            'name' => 'Woreda Admin',
            'username' => 'woreda.admin.nav',
            'email' => 'woreda.admin.nav@civiclink.et',
            'password' => 'SecurePass123!',
            'role_id' => $woredaRole->id,
            'organization_id' => $this->woreda->id,
            'status' => 'active',
        ]);

        $this->staff = User::create([
            'name' => 'Operational Staff',
            'username' => 'staff.nav',
            'email' => 'staff.nav@civiclink.et',
            'password' => 'SecurePass123!',
            'role_id' => $staffRole->id,
            'organization_id' => $this->woreda->id,
            'status' => 'active',
        ]);
    }

    public function test_unauthenticated_request_returns_401(): void
    {
        $response = $this->getJson('/api/v1/navigation/sidebar');

        $response->assertStatus(401);
    }

    public function test_super_admin_receives_all_13_sidebar_navigation_items(): void
    {
        Sanctum::actingAs($this->superAdmin);

        $response = $this->getJson('/api/v1/navigation/sidebar');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Sidebar navigation items retrieved successfully.',
            ]);

        $data = $response->json('data');
        $this->assertCount(13, $data);

        $routes = array_column($data, 'route');

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
            $this->assertContains($route, $routes);
        }

        // Assert strictly ordered by display_order.
        $orders = array_column($data, 'display_order');
        $sortedOrders = $orders;
        sort($sortedOrders);
        $this->assertSame($sortedOrders, $orders);
    }

    public function test_sub_city_admin_receives_9_items_excluding_super_admin_only_items(): void
    {
        Sanctum::actingAs($this->subCityAdmin);

        $response = $this->getJson('/api/v1/navigation/sidebar');

        $response->assertStatus(200);
        $data = $response->json('data');
        $this->assertCount(9, $data);

        $routes = array_column($data, 'route');

        $this->assertContains('/admin/subcities', $routes);
        $this->assertContains('/admin/accounts', $routes);
        $this->assertContains('/admin/documents', $routes);
        $this->assertContains('/admin/news', $routes);

        $this->assertNotContains('/admin/levels', $routes);
        $this->assertNotContains('/admin/roles', $routes);
        $this->assertNotContains('/admin/cms', $routes);
        $this->assertNotContains('/admin/activity', $routes);
    }

    public function test_staff_receives_4_operational_items_only(): void
    {
        Sanctum::actingAs($this->staff);

        $response = $this->getJson('/api/v1/navigation/sidebar');

        $response->assertStatus(200);
        $data = $response->json('data');
        $this->assertCount(4, $data);

        $routes = array_column($data, 'route');
        $this->assertContains('/admin/overview', $routes);
        $this->assertContains('/admin/feedback', $routes);
        $this->assertContains('/admin/services', $routes);
        $this->assertContains('/admin/routes', $routes);
        $this->assertNotContains('/admin/subcities', $routes);
        $this->assertNotContains('/admin/accounts', $routes);
        $this->assertNotContains('/admin/qr', $routes);
        $this->assertNotContains('/admin/cms', $routes);
    }

    public function test_scoped_privilege_escalation_is_blocked_at_user_creation(): void
    {
        $superAdminRole = Role::where('slug', 'super_admin')->firstOrFail();
        $subCityRole = Role::where('slug', 'sub_city_admin')->firstOrFail();

        Sanctum::actingAs($this->subCityAdmin);
        $response = $this->postJson('/api/v1/users', [
            'name' => 'Escalated User',
            'username' => 'escalated.user',
            'email' => 'escalated@test.gov.et',
            'password' => 'Password123!',
            'role_id' => $superAdminRole->id,
            'organization_id' => $this->subCity->id,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['role_id']);

        Sanctum::actingAs($this->woredaAdmin);
        $response = $this->postJson('/api/v1/users', [
            'name' => 'Escalated SubCity Admin',
            'username' => 'escalated.subcity',
            'email' => 'escalated.subcity@test.gov.et',
            'password' => 'Password123!',
            'role_id' => $subCityRole->id,
            'organization_id' => $this->woreda->id,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['role_id']);
    }
}
