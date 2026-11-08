<?php

declare(strict_types=1);

namespace Tests\Feature\Api\V1\Dashboard;

use App\Domains\AuditLogs\Models\AuditLog;
use App\Domains\Authorization\Models\Role;
use App\Domains\Documents\Models\Document;
use App\Domains\Feedback\Models\Feedback;
use App\Domains\Organizations\Models\Organization;
use App\Domains\Organizations\Models\OrganizationType;
use App\Domains\Services\Models\Service;
use App\Domains\Services\Models\ServiceStep;
use App\Domains\Users\Models\User;
use Database\Seeders\OrganizationTypeSeeder;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardApiTest extends TestCase
{
    use RefreshDatabase;

    private User $superAdmin;

    private User $subCityAdmin;

    private User $woredaAdmin;

    private User $staff;

    private Organization $boleSubCity;

    private Organization $woreda01;

    private Organization $bureau01;

    private Organization $kirkosSubCity;

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

        // 1. Bole Hierarchy: Bole -> Woreda 01 -> Bureau 01
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

        $this->bureau01 = Organization::create([
            'organization_type_id' => $this->bureauType->id,
            'parent_organization_id' => $this->woreda01->id,
            'name' => 'Bole Vital Events Bureau',
            'code' => 'bureau-vital-events-bole',
            'status' => 'active',
        ]);

        // 2. Foreign Hierarchy: Kirkos
        $this->kirkosSubCity = Organization::create([
            'organization_type_id' => $this->subCityType->id,
            'name' => 'Kirkos Sub-City',
            'code' => 'subcity-kirkos',
            'status' => 'active',
        ]);

        // Roles
        $superAdminRole = Role::where('slug', 'super_admin')->firstOrFail();
        $subCityAdminRole = Role::where('slug', 'sub_city_admin')->firstOrFail();
        $woredaAdminRole = Role::where('slug', 'woreda_admin')->firstOrFail();
        $staffRole = Role::where('slug', 'staff')->firstOrFail();

        // Users
        $this->superAdmin = User::create([
            'name' => 'Super Admin',
            'username' => 'super.admin',
            'email' => 'super@gov.et',
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

        $this->woredaAdmin = User::create([
            'name' => 'Woreda Admin',
            'username' => 'woreda.admin',
            'email' => 'admin@woreda01.gov.et',
            'password' => 'Password123!',
            'role_id' => $woredaAdminRole->id,
            'organization_id' => $this->woreda01->id,
            'status' => 'active',
        ]);

        $this->staff = User::create([
            'name' => 'Bureau Staff',
            'username' => 'bureau.staff',
            'email' => 'staff@bureau01.gov.et',
            'password' => 'Password123!',
            'role_id' => $staffRole->id,
            'organization_id' => $this->bureau01->id,
            'status' => 'active',
        ]);
    }

    public function test_unauthenticated_request_is_rejected(): void
    {
        $response = $this->getJson('/api/v1/dashboard/overview');

        $response->assertStatus(401);
    }

    public function test_deactivated_user_cannot_access_dashboard(): void
    {
        $deactivatedUser = User::create([
            'name' => 'Deactivated User',
            'username' => 'deactivated.user',
            'email' => 'deactivated@gov.et',
            'password' => 'Password123!',
            'role_id' => $this->staff->role_id,
            'organization_id' => $this->bureau01->id,
            'status' => 'inactive',
        ]);

        $response = $this->actingAs($deactivatedUser)
            ->getJson('/api/v1/dashboard/overview');

        $response->assertStatus(403);
    }

    public function test_super_admin_retrieves_global_dashboard_overview(): void
    {
        // Seed some services and documents
        $master = Service::create([
            'name' => 'Civil Registration',
            'code' => 'service-civil-reg',
            'is_active' => true,
        ]);

        Service::create([
            'name' => 'Birth Certificate',
            'code' => 'service-birth-cert',
            'parent_id' => $master->id,
            'is_active' => true,
        ]);

        Document::create([
            'name' => 'National ID',
            'code' => 'doc-national-id',
            'is_active' => true,
        ]);

        // Seed feedback across organizations
        Feedback::create([
            'feedback_for_organization' => $this->boleSubCity->id,
            'feedback_content' => 'Great service at Bole.',
            'feedback_type' => 'satisfaction',
        ]);

        Feedback::create([
            'feedback_for_organization' => $this->kirkosSubCity->id,
            'feedback_content' => 'Long queue at Kirkos.',
            'feedback_type' => 'complaint',
            'tracking_number' => '1234567890',
        ]);

        $response = $this->actingAs($this->superAdmin)
            ->getJson('/api/v1/dashboard/overview');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Dashboard overview retrieved successfully.',
                'data' => [
                    'scope' => [
                        'role' => 'super_admin',
                        'is_global' => true,
                        'accessible_organizations_count' => 4,
                    ],
                    'organizations' => [
                        'total' => 4,
                        'active' => 4,
                    ],
                    'services' => [
                        'total_catalog' => 2,
                        'master_services' => 1,
                        'subservices' => 1,
                    ],
                    'documents' => [
                        'total' => 1,
                        'active' => 1,
                    ],
                    'feedback' => [
                        'total' => 2,
                        'by_type' => [
                            'satisfaction' => 1,
                            'complaint' => 1,
                        ],
                    ],
                ],
            ]);
    }

    public function test_sub_city_admin_retrieves_hierarchy_scoped_overview(): void
    {
        // Feedback in Bole hierarchy
        Feedback::create([
            'feedback_for_organization' => $this->woreda01->id,
            'feedback_content' => 'Feedback for Woreda 01.',
            'feedback_type' => 'feedback',
        ]);

        // Feedback in Kirkos (outside Bole hierarchy)
        Feedback::create([
            'feedback_for_organization' => $this->kirkosSubCity->id,
            'feedback_content' => 'Kirkos feedback.',
            'feedback_type' => 'complaint',
            'tracking_number' => '9876543210',
        ]);

        $response = $this->actingAs($this->subCityAdmin)
            ->getJson('/api/v1/dashboard/overview');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'scope' => [
                        'role' => 'sub_city_admin',
                        'is_global' => false,
                        'accessible_organizations_count' => 3, // Bole, Woreda01, Bureau01
                    ],
                    'organizations' => [
                        'total' => 3, // Scoped to Bole hierarchy, excludes Kirkos
                    ],
                    'feedback' => [
                        'total' => 1, // Only Woreda 01 feedback, Kirkos excluded
                        'by_type' => [
                            'feedback' => 1,
                            'complaint' => 0,
                        ],
                    ],
                ],
            ]);
    }

    public function test_woreda_admin_retrieves_woreda_scoped_overview(): void
    {
        // Feedback for Bole Sub-City (parent)
        Feedback::create([
            'feedback_for_organization' => $this->boleSubCity->id,
            'feedback_content' => 'Bole Sub-City parent feedback.',
            'feedback_type' => 'feedback',
        ]);

        // Feedback for Woreda 01 (own)
        Feedback::create([
            'feedback_for_organization' => $this->woreda01->id,
            'feedback_content' => 'Woreda 01 feedback.',
            'feedback_type' => 'complaint',
            'tracking_number' => '1122334455',
        ]);

        // Feedback for Bureau 01 (descendant)
        Feedback::create([
            'feedback_for_organization' => $this->bureau01->id,
            'feedback_content' => 'Bureau 01 feedback.',
            'feedback_type' => 'satisfaction',
        ]);

        $response = $this->actingAs($this->woredaAdmin)
            ->getJson('/api/v1/dashboard/overview');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'scope' => [
                        'role' => 'woreda_admin',
                        'is_global' => false,
                        'accessible_organizations_count' => 2, // Woreda 01 and Bureau 01
                    ],
                    'organizations' => [
                        'total' => 2, // Woreda01 and Bureau01
                    ],
                    'feedback' => [
                        'total' => 2, // Woreda01 and Bureau01, parent Bole excluded
                        'by_type' => [
                            'complaint' => 1,
                            'satisfaction' => 1,
                            'feedback' => 0,
                        ],
                    ],
                ],
            ]);
    }

    public function test_dashboard_stats_endpoint_is_functional_alias(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->getJson('/api/v1/dashboard/stats');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'scope',
                    'organizations',
                    'users',
                    'services',
                    'documents',
                    'feedback',
                    'news',
                ],
            ]);
    }

    public function test_feedback_report_endpoint_with_filters(): void
    {
        Feedback::create([
            'feedback_for_organization' => $this->boleSubCity->id,
            'feedback_content' => 'Good desk work.',
            'feedback_type' => 'satisfaction',
            'created_at' => now()->subDays(5),
        ]);

        Feedback::create([
            'feedback_for_organization' => $this->woreda01->id,
            'feedback_content' => 'Payment kiosk issue.',
            'feedback_type' => 'complaint',
            'tracking_number' => '5566778899',
            'created_at' => now()->subDays(2),
        ]);

        $response = $this->actingAs($this->subCityAdmin)
            ->getJson('/api/v1/dashboard/reports/feedback?start_date='.now()->subDays(10)->toDateString());

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Feedback report retrieved successfully.',
            ])
            ->assertJsonStructure([
                'data' => [
                    'summary' => [
                        'total_feedback',
                        'complaints_count',
                        'general_feedback_count',
                        'satisfaction_count',
                        'complaints_percentage',
                    ],
                    'type_breakdown',
                    'top_organizations',
                    'recent_feedback',
                ],
            ]);
    }

    public function test_feedback_report_rejects_foreign_organization_filter(): void
    {
        // Sub-City Admin attempts to filter by Kirkos Sub-City
        $response = $this->actingAs($this->subCityAdmin)
            ->getJson("/api/v1/dashboard/reports/feedback?organization_id={$this->kirkosSubCity->id}");

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['organization_id']);
    }

    public function test_services_report_endpoint(): void
    {
        $service = Service::create([
            'name' => 'Business License Renewal',
            'code' => 'service-business-license',
            'fee_amount' => 150.00,
            'fee_currency' => 'ETB',
            'estimated_duration_minutes' => 45,
            'is_active' => true,
        ]);

        ServiceStep::create([
            'service_id' => $service->id,
            'step_number' => 1,
            'title' => 'Document Inspection',
            'instruction' => 'Submit trade license',
        ]);

        $response = $this->actingAs($this->superAdmin)
            ->getJson('/api/v1/dashboard/reports/services');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'summary' => [
                        'total_services' => 1,
                        'total_steps' => 1,
                    ],
                    'fees_analysis' => [
                        'paid_services_count' => 1,
                        'average_fee' => 150.00,
                    ],
                    'duration_analysis' => [
                        'average_duration_minutes' => 45.0,
                    ],
                ],
            ]);
    }

    public function test_organizations_report_endpoint(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->getJson('/api/v1/dashboard/reports/organizations');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'summary' => [
                        'total_organizations' => 4,
                        'root_units' => 2, // Bole and Kirkos
                        'child_units' => 2, // Woreda01 and Bureau01
                    ],
                ],
            ])
            ->assertJsonStructure([
                'data' => [
                    'summary',
                    'type_distribution',
                    'top_by_users',
                ],
            ]);
    }

    public function test_recent_activity_endpoint(): void
    {
        // Record audit logs
        AuditLog::create([
            'user_id' => $this->subCityAdmin->id,
            'organization_id' => $this->boleSubCity->id,
            'action' => 'created',
            'entity_type' => 'Organization',
            'entity_id' => (string) $this->bureau01->id,
            'created_at' => now()->subMinute(),
        ]);

        AuditLog::create([
            'user_id' => $this->superAdmin->id,
            'organization_id' => $this->kirkosSubCity->id,
            'action' => 'updated',
            'entity_type' => 'Organization',
            'entity_id' => (string) $this->kirkosSubCity->id,
            'created_at' => now(),
        ]);

        // 1. Super Admin sees both logs
        $superResponse = $this->actingAs($this->superAdmin)
            ->getJson('/api/v1/dashboard/recent-activity?limit=10');

        $superResponse->assertStatus(200);
        $this->assertCount(2, $superResponse->json('data'));

        // 2. Sub-City Admin only sees Bole hierarchy logs
        $subCityResponse = $this->actingAs($this->subCityAdmin)
            ->getJson('/api/v1/dashboard/recent-activity?limit=10');

        $subCityResponse->assertStatus(200);
        $this->assertCount(1, $subCityResponse->json('data'));
        $this->assertEquals($this->boleSubCity->id, $subCityResponse->json('data.0.organization.id'));
    }
}
