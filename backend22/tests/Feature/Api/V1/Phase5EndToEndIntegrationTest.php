<?php

declare(strict_types=1);

namespace Tests\Feature\Api\V1;

use App\Domains\AuditLogs\Actions\RecordAuditLogAction;
use App\Domains\AuditLogs\Models\AuditLog;
use App\Domains\Authorization\Models\Role;
use App\Domains\Events\Models\Event;
use App\Domains\Events\Models\EventImage;
use App\Domains\Feedback\Models\Feedback;
use App\Domains\Organizations\Models\Organization;
use App\Domains\Organizations\Models\OrganizationType;
use App\Domains\QrCodes\Models\QrCode;
use App\Domains\Users\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class Phase5EndToEndIntegrationTest extends TestCase
{
    use RefreshDatabase;

    private User $superAdmin;

    private User $subCityAdmin;

    private User $woredaAdmin;

    private User $bureauAdmin;

    private User $staff;

    private Organization $boleSubCity;

    private Organization $boleWoreda03;

    private Organization $boleBureau;

    private Organization $kirkosSubCity;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);

        $superAdminRole = Role::where('slug', 'super_admin')->firstOrFail();
        $subCityRole = Role::where('slug', 'sub_city_admin')->firstOrFail();
        $woredaRole = Role::where('slug', 'woreda_admin')->firstOrFail();
        $bureauRole = Role::where('slug', 'bureau_admin')->firstOrFail();
        $staffRole = Role::where('slug', 'staff')->firstOrFail();

        $subCityType = OrganizationType::where('code', 'sub_city')->firstOrFail();
        $woredaType = OrganizationType::where('code', 'woreda')->firstOrFail();
        $bureauType = OrganizationType::where('code', 'bureau')->firstOrFail();

        // 1. Bole Sub-City Hierarchy
        $this->boleSubCity = Organization::create([
            'name' => 'Bole Sub-City Administration',
            'code' => 'subcity-bole-e2e',
            'organization_type_id' => $subCityType->id,
            'status' => 'active',
        ]);

        $this->boleWoreda03 = Organization::create([
            'name' => 'Bole Woreda 03',
            'code' => 'woreda-bole-03-e2e',
            'organization_type_id' => $woredaType->id,
            'parent_organization_id' => $this->boleSubCity->id,
            'status' => 'active',
        ]);

        $this->boleBureau = Organization::create([
            'name' => 'Bole Revenues Branch Office',
            'code' => 'bureau-bole-rev-e2e',
            'organization_type_id' => $bureauType->id,
            'parent_organization_id' => $this->boleWoreda03->id,
            'status' => 'active',
        ]);

        // 2. Kirkos Sub-City Hierarchy (Isolate)
        $this->kirkosSubCity = Organization::create([
            'name' => 'Kirkos Sub-City Administration',
            'code' => 'subcity-kirkos-e2e',
            'organization_type_id' => $subCityType->id,
            'status' => 'active',
        ]);

        // 3. User Accounts
        $this->superAdmin = User::create([
            'name' => 'Super Administrator',
            'username' => 'superadmin.e2e',
            'email' => 'superadmin.e2e@civiclink.et',
            'password' => 'SecurePass123!',
            'role_id' => $superAdminRole->id,
            'status' => 'active',
        ]);

        $this->subCityAdmin = User::create([
            'name' => 'Bole Sub-City Admin',
            'username' => 'subcity.admin.e2e',
            'email' => 'subcity.admin.e2e@civiclink.et',
            'password' => 'SecurePass123!',
            'role_id' => $subCityRole->id,
            'organization_id' => $this->boleSubCity->id,
            'status' => 'active',
        ]);

        $this->woredaAdmin = User::create([
            'name' => 'Bole Woreda 03 Admin',
            'username' => 'woreda.admin.e2e',
            'email' => 'woreda.admin.e2e@civiclink.et',
            'password' => 'SecurePass123!',
            'role_id' => $woredaRole->id,
            'organization_id' => $this->boleWoreda03->id,
            'status' => 'active',
        ]);

        $this->bureauAdmin = User::create([
            'name' => 'Bole Revenues Admin',
            'username' => 'bureau.admin.e2e',
            'email' => 'bureau.admin.e2e@civiclink.et',
            'password' => 'SecurePass123!',
            'role_id' => $bureauRole->id,
            'organization_id' => $this->boleBureau->id,
            'status' => 'active',
        ]);

        $this->staff = User::create([
            'name' => 'Bole Front Desk Staff',
            'username' => 'staff.e2e',
            'email' => 'staff.e2e@civiclink.et',
            'password' => 'SecurePass123!',
            'role_id' => $staffRole->id,
            'organization_id' => $this->boleBureau->id,
            'status' => 'active',
        ]);
    }

    /**
     * Requirement 1: Database-Driven Dynamic Navigation across all roles without parent_id recursion.
     */
    public function test_dynamic_sidebar_navigation_differentiates_all_5_roles(): void
    {
        // 1. Super Admin receives all 8 items
        Sanctum::actingAs($this->superAdmin);
        $resSuper = $this->getJson('/api/v1/navigation/sidebar');
        $resSuper->assertStatus(200);
        $this->assertCount(8, $resSuper->json('data'));
        $this->assertContains('/admin/cms', array_column($resSuper->json('data'), 'route'));

        // 2. Sub-City Admin receives 7 items (excluding CMS)
        Sanctum::actingAs($this->subCityAdmin);
        $resSubCity = $this->getJson('/api/v1/navigation/sidebar');
        $resSubCity->assertStatus(200);
        $this->assertCount(7, $resSubCity->json('data'));
        $this->assertNotContains('/admin/cms', array_column($resSubCity->json('data'), 'route'));
        $this->assertContains('/admin/subcities', array_column($resSubCity->json('data'), 'route'));

        // 3. Woreda Admin receives 6 items (no Sub-cities, no CMS)
        Sanctum::actingAs($this->woredaAdmin);
        $resWoreda = $this->getJson('/api/v1/navigation/sidebar');
        $resWoreda->assertStatus(200);
        $this->assertCount(6, $resWoreda->json('data'));
        $this->assertNotContains('/admin/subcities', array_column($resWoreda->json('data'), 'route'));
        $this->assertNotContains('/admin/cms', array_column($resWoreda->json('data'), 'route'));

        // 4. Bureau Admin receives 6 items
        Sanctum::actingAs($this->bureauAdmin);
        $resBureau = $this->getJson('/api/v1/navigation/sidebar');
        $resBureau->assertStatus(200);
        $this->assertCount(6, $resBureau->json('data'));
        $this->assertContains('/admin/qr', array_column($resBureau->json('data'), 'route'));

        // 5. Staff receives 4 operational items
        Sanctum::actingAs($this->staff);
        $resStaff = $this->getJson('/api/v1/navigation/sidebar');
        $resStaff->assertStatus(200);
        $this->assertCount(4, $resStaff->json('data'));
        $this->assertSame([
            '/admin/overview',
            '/admin/feedback',
            '/admin/services',
            '/admin/routes',
        ], array_column($resStaff->json('data'), 'route'));
    }

    /**
     * Requirement 2: Scoped Organization Filtering.
     */
    public function test_sub_city_admin_can_only_view_and_manage_own_hierarchy(): void
    {
        Sanctum::actingAs($this->subCityAdmin);

        // Sub-City Admin lists organizations: should include Bole Sub-City, Woreda, Bureau, but NOT Kirkos Sub-City
        $response = $this->getJson('/api/v1/organizations');
        $response->assertStatus(200);

        $codes = collect($response->json('data'))->pluck('code')->toArray();
        $this->assertContains('subcity-bole-e2e', $codes);
        $this->assertContains('woreda-bole-03-e2e', $codes);
        $this->assertContains('bureau-bole-rev-e2e', $codes);
        $this->assertNotContains('subcity-kirkos-e2e', $codes);
    }

    /**
     * Requirement 3: Forensic Audit Logging with JSON Payloads and Execution Outcome.
     */
    public function test_audit_logs_record_json_payloads_and_status_without_organization_id_dependency(): void
    {
        $auditLogger = app(RecordAuditLogAction::class);

        $fakeRequest = Request::create('/api/v1/services', 'POST', [
            'name' => 'Trade License Renewal',
            'fee_amount' => 150,
            'password' => 'secret_should_be_stripped',
        ]);

        $fakeService = $this->boleSubCity;

        $log = $auditLogger->execute(
            action: 'service_created',
            entity: $fakeService,
            actor: $this->superAdmin,
            oldValues: null,
            newValues: ['name' => 'Trade License Renewal', 'fee_amount' => 150],
            request: $fakeRequest,
            status: 'success',
            statusCode: 201,
            responsePayload: ['success' => true, 'id' => 45]
        );

        $this->assertDatabaseHas('audit_logs', [
            'id' => $log->id,
            'action' => 'service_created',
            'status' => 'success',
            'status_code' => 201,
        ]);

        $refreshed = AuditLog::find($log->id);
        $this->assertSame('success', $refreshed->status);
        $this->assertSame(201, $refreshed->status_code);
        $this->assertIsArray($refreshed->request_payload);
        $this->assertSame('Trade License Renewal', $refreshed->request_payload['name']);
        // Verify sensitive parameters were completely omitted
        $this->assertArrayNotHasKey('password', $refreshed->request_payload);
        $this->assertSame(150, $refreshed->new_values['fee_amount']);
        $this->assertSame(45, $refreshed->response_payload['id']);
    }

    /**
     * Requirement 4: Citizen Feedback without email, retaining phone and tracking number.
     */
    public function test_citizen_feedback_submits_without_email_and_generates_tracking_number(): void
    {
        $response = $this->postJson('/api/v1/feedbacks', [
            'feedback_for_organization' => $this->boleSubCity->id,
            'feedback_content' => 'The land permit verification was delayed by two hours at Counter 4.',
            'feedback_type' => 'complaint',
            'full_name' => 'Dawit Mengistu',
            'phone_number' => '+251911998877',
        ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Feedback submitted successfully.',
                'data' => [
                    'feedback_for_organization' => $this->boleSubCity->id,
                    'full_name' => 'Dawit Mengistu',
                    'phone_number' => '+251911998877',
                ],
            ]);

        $trackingNumber = $response->json('data.tracking_number');
        $this->assertNotNull($trackingNumber);
        $this->assertSame(10, strlen($trackingNumber));

        $feedback = Feedback::where('tracking_number', $trackingNumber)->firstOrFail();
        $this->assertSame('+251911998877', $feedback->phone_number);
    }

    /**
     * Requirement 5: QR Code Poster without service_id, linked to organization with atomic scans.
     */
    public function test_qr_code_poster_lifecycle_without_service_id(): void
    {
        Sanctum::actingAs($this->subCityAdmin);

        $createResponse = $this->postJson('/api/v1/qr-codes', [
            'organization_id' => $this->boleBureau->id,
            'code' => 'QR-BOLE-REV-COUNTER-1',
            'label' => 'Revenues Service Desk 01',
            'target_url' => 'https://civiclink.et/guide/bole-rev/desk-01',
        ]);

        $createResponse->assertStatus(201);
        $code = $createResponse->json('data.code');

        $qr = QrCode::where('code', $code)->firstOrFail();
        $this->assertSame($this->boleBureau->id, $qr->organization_id);
        $this->assertSame(0, $qr->scan_count);

        // Citizen scans QR code publicly
        $scanResponse = $this->postJson("/api/v1/qr-codes/{$code}/scan");
        $scanResponse->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'scan_count' => 1,
                    'target_url' => 'https://civiclink.et/guide/bole-rev/desk-01',
                ],
            ]);

        $this->assertSame(1, $qr->fresh()->scan_count);
        $this->assertNotNull($qr->fresh()->last_scanned_at);
    }

    /**
     * Requirement 6: Civic Events with multi-image gallery photos and cascade delete.
     */
    public function test_event_multi_image_gallery_and_cascade_delete(): void
    {
        Sanctum::actingAs($this->subCityAdmin);

        $eventResponse = $this->postJson('/api/v1/events', [
            'organization_id' => $this->boleSubCity->id,
            'title' => 'Community Clean City Campaign',
            'description' => 'Neighborhood cleanup and civic environmental protection initiative.',
            'location_name' => 'Bole Sub-City Square',
            'event_date' => now()->addDays(10)->toDateTimeString(),
            'status' => 'published',
            'images' => [
                [
                    'image_url' => 'https://civiclink.et/storage/events/clean-1.jpg',
                    'caption' => 'Opening volunteer orientation.',
                    'order_column' => 1,
                ],
                [
                    'image_url' => 'https://civiclink.et/storage/events/clean-2.jpg',
                    'caption' => 'Equipment handover ceremony.',
                    'order_column' => 2,
                ],
            ],
        ]);

        $eventResponse->assertStatus(201);
        $eventId = $eventResponse->json('data.id');

        $this->assertSame(2, EventImage::where('event_id', $eventId)->count());

        // Delete event
        $deleteResponse = $this->deleteJson("/api/v1/events/{$eventId}");
        $deleteResponse->assertStatus(200);

        // Verify cascade deletion
        $this->assertDatabaseMissing('events', ['id' => $eventId]);
        $this->assertDatabaseMissing('event_images', ['event_id' => $eventId]);
    }

    /**
     * Requirement 7: Statutory Hierarchy Business Logic without allowed_parents junction table.
     */
    public function test_statutory_hierarchy_enforcement_in_organization_management(): void
    {
        $woredaType = OrganizationType::where('code', 'woreda')->firstOrFail();

        // 1. A Woreda cannot be a root organization
        Sanctum::actingAs($this->superAdmin);
        $invalidRootRes = $this->postJson('/api/v1/organizations', [
            'name' => 'Invalid Root Woreda',
            'code' => 'woreda-invalid-root',
            'organization_type_id' => $woredaType->id,
            'parent_organization_id' => null,
        ]);

        $invalidRootRes->assertStatus(422)
            ->assertJsonValidationErrors(['parent_organization_id']);

        // 2. A Woreda cannot have another Woreda as its parent (statutory rule: parent level must be lower than child level)
        $invalidParentRes = $this->postJson('/api/v1/organizations', [
            'name' => 'Invalid Woreda Under Woreda',
            'code' => 'woreda-under-woreda',
            'organization_type_id' => $woredaType->id,
            'parent_organization_id' => $this->boleWoreda03->id,
        ]);

        $invalidParentRes->assertStatus(422)
            ->assertJsonValidationErrors(['parent_organization_id']);

        // 3. A Woreda choosing a Sub-City parent succeeds
        $validRes = $this->postJson('/api/v1/organizations', [
            'name' => 'Valid Woreda 04',
            'code' => 'woreda-valid-04',
            'organization_type_id' => $woredaType->id,
            'parent_organization_id' => $this->boleSubCity->id,
        ]);

        $validRes->assertStatus(201);
    }
}
