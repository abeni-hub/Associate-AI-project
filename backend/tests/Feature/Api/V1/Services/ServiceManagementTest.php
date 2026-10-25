<?php

declare(strict_types=1);

namespace Tests\Feature\Api\V1\Services;

use App\Domains\Authorization\Models\Role;
use App\Domains\Documents\Models\Document;
use App\Domains\Organizations\Models\Organization;
use App\Domains\Organizations\Models\OrganizationType;
use App\Domains\Services\Models\Service;
use App\Domains\Users\Models\User;
use Database\Seeders\OrganizationTypeSeeder;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ServiceManagementTest extends TestCase
{
    use RefreshDatabase;

    private User $superAdmin;

    private User $staff;

    private Organization $boleSubCity;

    private Document $passportPhoto;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(OrganizationTypeSeeder::class);
        $this->seed(PermissionSeeder::class);
        $this->seed(RoleSeeder::class);

        $subCityType = OrganizationType::where('code', 'sub_city')->firstOrFail();
        $this->boleSubCity = Organization::create([
            'organization_type_id' => $subCityType->id,
            'name' => 'Bole Sub-City',
            'code' => 'subcity-bole',
        ]);

        $superAdminRole = Role::where('slug', 'super_admin')->firstOrFail();
        $staffRole = Role::where('slug', 'staff')->firstOrFail();

        $this->superAdmin = User::create([
            'name' => 'Super Admin',
            'username' => 'super.admin',
            'email' => 'super@platform.gov.et',
            'password' => 'Password123!',
            'role_id' => $superAdminRole->id,
            'status' => 'active',
        ]);

        $this->staff = User::create([
            'name' => 'Staff User',
            'username' => 'staff.user',
            'email' => 'staff@bole.gov.et',
            'password' => 'Password123!',
            'role_id' => $staffRole->id,
            'organization_id' => $this->boleSubCity->id,
            'status' => 'active',
        ]);

        $this->passportPhoto = Document::create([
            'name' => 'Passport Photograph (3x4)',
            'code' => 'passport-photo',
            'description' => 'Two recent passport-sized color photographs.',
        ]);
    }

    public function test_super_admin_can_create_master_service_and_subservice(): void
    {
        // 1. Create master service
        $masterResponse = $this->actingAs($this->superAdmin)
            ->postJson('/api/v1/services', [
                'name' => 'Trade and Investment Licensing',
                'code' => 'trade-investment',
                'description' => 'Commercial registry and licensing.',
            ]);

        $masterResponse->assertStatus(201)
            ->assertJson([
                'success' => true,
                'data' => [
                    'code' => 'trade-investment',
                    'is_master' => true,
                ],
            ]);

        $masterId = $masterResponse->json('data.id');

        // 2. Create subservice under master service
        $subResponse = $this->actingAs($this->superAdmin)
            ->postJson('/api/v1/services', [
                'parent_id' => $masterId,
                'name' => 'New Commercial Registration',
                'code' => 'new-commercial-reg',
                'fee_amount' => 120.00,
                'estimated_duration_minutes' => 60,
            ]);

        $subResponse->assertStatus(201)
            ->assertJson([
                'success' => true,
                'data' => [
                    'code' => 'new-commercial-reg',
                    'is_master' => false,
                    'parent' => [
                        'id' => $masterId,
                    ],
                ],
            ]);

        $this->assertDatabaseHas('services', ['code' => 'new-commercial-reg']);
        $this->assertDatabaseHas('audit_logs', [
            'action' => 'created',
            'entity_type' => 'Service',
        ]);
    }

    public function test_cannot_nest_subservice_more_than_one_level_deep(): void
    {
        $master = Service::create([
            'name' => 'Level 1 Service',
            'code' => 'level-1',
        ]);

        $subservice = Service::create([
            'parent_id' => $master->id,
            'name' => 'Level 2 Service',
            'code' => 'level-2',
        ]);

        // Attempting to create level 3
        $response = $this->actingAs($this->superAdmin)
            ->postJson('/api/v1/services', [
                'parent_id' => $subservice->id,
                'name' => 'Level 3 Service',
                'code' => 'level-3',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['parent_id']);
    }

    public function test_can_sync_required_documents_to_service(): void
    {
        $service = Service::create([
            'name' => 'Business License Renewal',
            'code' => 'business-renewal',
        ]);

        $response = $this->actingAs($this->superAdmin)
            ->postJson("/api/v1/services/{$service->id}/documents", [
                'documents' => [
                    [
                        'document_id' => $this->passportPhoto->id,
                        'is_mandatory' => true,
                        'order_column' => 1,
                        'notes' => 'Recent photograph on white background.',
                    ],
                ],
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Required documents updated successfully.',
                'data' => [
                    'required_documents' => [
                        [
                            'code' => 'passport-photo',
                            'is_mandatory' => true,
                        ],
                    ],
                ],
            ]);

        $this->assertDatabaseHas('service_documents', [
            'service_id' => $service->id,
            'document_id' => $this->passportPhoto->id,
            'is_mandatory' => true,
        ]);
    }

    public function test_cannot_delete_master_service_with_active_subservices(): void
    {
        $master = Service::create(['name' => 'Parent', 'code' => 'parent-service']);
        Service::create(['parent_id' => $master->id, 'name' => 'Child', 'code' => 'child-service']);

        $response = $this->actingAs($this->superAdmin)
            ->deleteJson("/api/v1/services/{$master->id}");

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'Cannot delete service with active subservices. Delete or reassign subservices first.',
            ]);
    }
}
