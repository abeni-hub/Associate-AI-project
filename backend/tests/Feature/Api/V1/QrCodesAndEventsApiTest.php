<?php

declare(strict_types=1);

namespace Tests\Feature\Api\V1;

use App\Domains\Authorization\Models\Role;
use App\Domains\Organizations\Models\Organization;
use App\Domains\Organizations\Models\OrganizationType;
use App\Domains\QrCodes\Models\QrCode;
use App\Domains\Users\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class QrCodesAndEventsApiTest extends TestCase
{
    use RefreshDatabase;

    private User $superAdmin;

    private User $subCityAdmin;

    private Organization $subCity;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);

        $superAdminRole = Role::where('slug', 'super_admin')->firstOrFail();
        $subCityRole = Role::where('slug', 'sub_city_admin')->firstOrFail();
        $subCityType = OrganizationType::where('code', 'sub_city')->firstOrFail();

        $this->subCity = Organization::create([
            'name' => 'Bole Sub-City Administration',
            'code' => 'subcity-bole-api-test',
            'organization_type_id' => $subCityType->id,
            'status' => 'active',
        ]);

        $this->superAdmin = User::create([
            'name' => 'Super Administrator',
            'username' => 'superadmin.api',
            'email' => 'superadmin.api@civiclink.et',
            'password' => 'SecurePass123!',
            'role_id' => $superAdminRole->id,
            'status' => 'active',
        ]);

        $this->subCityAdmin = User::create([
            'name' => 'Sub-City Admin',
            'username' => 'subcity.admin.api',
            'email' => 'subcity.admin.api@civiclink.et',
            'password' => 'SecurePass123!',
            'role_id' => $subCityRole->id,
            'organization_id' => $this->subCity->id,
            'status' => 'active',
        ]);
    }

    public function test_qr_codes_index_and_create(): void
    {
        Sanctum::actingAs($this->subCityAdmin);

        $response = $this->postJson('/api/v1/qr-codes', [
            'organization_id' => $this->subCity->id,
            'code' => 'QR-BOLE-TEST-99',
            'label' => 'Window 3 Trade Counter',
            'target_url' => 'https://civiclink.et/guide/trade-window-3',
        ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'QR code generated successfully.',
                'data' => [
                    'code' => 'QR-BOLE-TEST-99',
                    'label' => 'Window 3 Trade Counter',
                ],
            ]);

        $this->assertDatabaseHas('qr_codes', [
            'code' => 'QR-BOLE-TEST-99',
            'organization_id' => $this->subCity->id,
        ]);

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'created',
            'entity_type' => 'QrCode',
            'user_id' => $this->subCityAdmin->id,
        ]);

        // List QR codes
        $listResponse = $this->getJson('/api/v1/qr-codes');
        $listResponse->assertStatus(200);
        $this->assertTrue(collect($listResponse->json('data'))->contains('code', 'QR-BOLE-TEST-99'));
    }

    public function test_public_citizen_qr_scan_increments_counter(): void
    {
        $qr = QrCode::create([
            'organization_id' => $this->subCity->id,
            'code' => 'QR-PUBLIC-SCAN-01',
            'label' => 'Public Information Desk',
            'target_url' => 'https://civiclink.et/guide/public-info',
            'status' => 'active',
        ]);

        $response = $this->postJson("/api/v1/qr-codes/{$qr->code}/scan");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'target_url' => 'https://civiclink.et/guide/public-info',
                    'scan_count' => 1,
                    'label' => 'Public Information Desk',
                ],
            ]);

        $this->assertSame(1, $qr->fresh()->scan_count);
    }

    public function test_events_creation_with_multi_images_and_public_discovery(): void
    {
        Sanctum::actingAs($this->subCityAdmin);

        $response = $this->postJson('/api/v1/events', [
            'organization_id' => $this->subCity->id,
            'title' => 'Addis Urban Greening Day',
            'description' => 'Tree planting and community green corridor development initiative.',
            'location_name' => 'Bole Community Park',
            'event_date' => now()->addDays(7)->toDateTimeString(),
            'status' => 'published',
            'images' => [
                [
                    'image_url' => 'https://civiclink.et/storage/events/green-1.jpg',
                    'caption' => 'Planting tree seedlings along central avenue.',
                    'order_column' => 1,
                ],
                [
                    'image_url' => 'https://civiclink.et/storage/events/green-2.jpg',
                    'caption' => 'Community volunteer group assembly.',
                    'order_column' => 2,
                ],
            ],
        ]);

        $response->assertStatus(201);
        $eventId = $response->json('data.id');

        $this->assertDatabaseHas('events', [
            'id' => $eventId,
            'title' => 'Addis Urban Greening Day',
        ]);

        $this->assertDatabaseHas('event_images', [
            'event_id' => $eventId,
            'image_url' => 'https://civiclink.et/storage/events/green-1.jpg',
        ]);

        // Public discovery
        $publicResponse = $this->getJson("/api/v1/events/{$eventId}");
        $publicResponse->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'title' => 'Addis Urban Greening Day',
                ],
            ]);

        $this->assertCount(2, $publicResponse->json('data.images'));
    }
}
