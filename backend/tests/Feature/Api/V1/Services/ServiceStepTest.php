<?php

declare(strict_types=1);

namespace Tests\Feature\Api\V1\Services;

use App\Domains\Authorization\Models\Role;
use App\Domains\Organizations\Models\Organization;
use App\Domains\Organizations\Models\OrganizationType;
use App\Domains\Services\Models\Service;
use App\Domains\Services\Models\ServiceStep;
use App\Domains\Users\Models\User;
use Database\Seeders\OrganizationTypeSeeder;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Database\Seeders\UserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ServiceStepTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private User $unprivilegedUser;

    private Service $service;

    private Organization $organization;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(OrganizationTypeSeeder::class);
        $this->seed(PermissionSeeder::class);
        $this->seed(RoleSeeder::class);
        $this->seed(UserSeeder::class);

        $this->admin = User::where('username', 'admin')->firstOrFail();

        $staffRole = Role::where('slug', 'staff')->firstOrFail();
        $subCityType = OrganizationType::where('code', 'sub_city')->firstOrFail();
        $this->organization = Organization::create([
            'organization_type_id' => $subCityType->id,
            'name' => 'Bole Sub-City Administration',
            'code' => 'subcity-bole',
            'status' => 'active',
        ]);

        $this->unprivilegedUser = User::create([
            'name' => 'Test Staff',
            'username' => 'staff.test',
            'email' => 'staff.test@bole.gov.et',
            'password' => 'StaffSecret123!',
            'role_id' => $staffRole->id,
            'organization_id' => $this->organization->id,
            'status' => 'active',
            'must_change_password' => false,
        ]);

        $this->service = Service::create([
            'name' => 'Birth Certificate Issuance',
            'code' => 'birth-certificate-issuance',
            'description' => 'Issuance of official vital event birth certificates.',
            'fee_amount' => 50.00,
            'fee_currency' => 'ETB',
            'is_active' => true,
        ]);
    }

    public function test_public_citizen_can_list_active_steps_for_a_service(): void
    {
        ServiceStep::create([
            'service_id' => $this->service->id,
            'step_number' => 1,
            'title' => 'Intake & Document Verification',
            'instruction' => 'Submit Kebele ID and hospital birth notification.',
            'room_number' => 'Room 102',
            'floor' => 'Ground Floor',
            'building' => 'Main Building',
            'department_name' => 'Civil Registration Desk',
            'responsible_title' => 'Intake Officer',
            'estimated_duration_minutes' => 15,
            'is_active' => true,
        ]);

        ServiceStep::create([
            'service_id' => $this->service->id,
            'step_number' => 2,
            'title' => 'Service Fee Payment',
            'instruction' => 'Pay 50 ETB fee and collect official receipt.',
            'room_number' => 'Room 105',
            'floor' => 'Ground Floor',
            'building' => 'Main Building',
            'department_name' => 'Revenue & Finance Counter',
            'responsible_title' => 'Cashier',
            'estimated_duration_minutes' => 10,
            'is_active' => true,
        ]);

        // Inactive step should be hidden from public
        ServiceStep::create([
            'service_id' => $this->service->id,
            'step_number' => 3,
            'title' => 'Draft Archiving Step',
            'instruction' => 'Internal procedure step.',
            'room_number' => 'Room 201',
            'is_active' => false,
        ]);

        $response = $this->getJson("/api/v1/services/{$this->service->code}/steps");

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.title', 'Intake & Document Verification')
            ->assertJsonPath('data.0.room_number', 'Room 102')
            ->assertJsonPath('data.1.title', 'Service Fee Payment')
            ->assertJsonPath('data.1.room_number', 'Room 105');
    }

    public function test_public_citizen_can_view_single_service_step(): void
    {
        $step = ServiceStep::create([
            'service_id' => $this->service->id,
            'step_number' => 1,
            'title' => 'Biometric Verification',
            'instruction' => 'Provide fingerprint scans and digital photograph.',
            'room_number' => 'Room 204',
            'floor' => '2nd Floor',
            'building' => 'Wing B',
            'department_name' => 'Biometrics Unit',
            'responsible_title' => 'Biometric Specialist',
            'estimated_duration_minutes' => 20,
            'is_active' => true,
        ]);

        $response = $this->getJson("/api/v1/services/{$this->service->id}/steps/{$step->id}");

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.title', 'Biometric Verification')
            ->assertJsonPath('data.room_number', 'Room 204')
            ->assertJsonPath('data.floor', '2nd Floor');
    }

    public function test_admin_with_permission_can_create_service_step(): void
    {
        $response = $this->actingAs($this->admin)->postJson("/api/v1/services/{$this->service->code}/steps", [
            'step_number' => 1,
            'title' => 'Application Review',
            'instruction' => 'Clerk verifies all paperwork and signs off.',
            'room_number' => 'Room 101',
            'floor' => 'Ground Floor',
            'building' => 'Block A',
            'department_name' => 'Verification Desk',
            'responsible_title' => 'Senior Officer',
            'estimated_duration_minutes' => 15,
            'is_active' => true,
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.title', 'Application Review')
            ->assertJsonPath('data.room_number', 'Room 101');

        $this->assertDatabaseHas('service_steps', [
            'service_id' => $this->service->id,
            'title' => 'Application Review',
            'room_number' => 'Room 101',
        ]);
    }

    public function test_admin_can_update_service_step(): void
    {
        $step = ServiceStep::create([
            'service_id' => $this->service->id,
            'step_number' => 1,
            'title' => 'Old Title',
            'instruction' => 'Old instruction.',
            'room_number' => 'Room 101',
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->admin)->putJson("/api/v1/services/{$this->service->id}/steps/{$step->id}", [
            'title' => 'Updated Stamping & Seal Room',
            'room_number' => 'Room 108',
            'instruction' => 'Collect certified copy with official dry stamp seal.',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.title', 'Updated Stamping & Seal Room')
            ->assertJsonPath('data.room_number', 'Room 108');

        $this->assertDatabaseHas('service_steps', [
            'id' => $step->id,
            'title' => 'Updated Stamping & Seal Room',
            'room_number' => 'Room 108',
        ]);
    }

    public function test_admin_can_delete_service_step(): void
    {
        $step = ServiceStep::create([
            'service_id' => $this->service->id,
            'step_number' => 1,
            'title' => 'Step to Delete',
            'instruction' => 'Temporary step.',
            'room_number' => 'Room 999',
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->admin)->deleteJson("/api/v1/services/{$this->service->id}/steps/{$step->id}");

        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertDatabaseMissing('service_steps', [
            'id' => $step->id,
        ]);
    }

    public function test_admin_can_reorder_service_steps(): void
    {
        $step1 = ServiceStep::create([
            'service_id' => $this->service->id,
            'step_number' => 1,
            'title' => 'Step A',
            'instruction' => 'First step.',
            'is_active' => true,
        ]);

        $step2 = ServiceStep::create([
            'service_id' => $this->service->id,
            'step_number' => 2,
            'title' => 'Step B',
            'instruction' => 'Second step.',
            'is_active' => true,
        ]);

        // Swap order: Step B becomes 1, Step A becomes 2
        $response = $this->actingAs($this->admin)->postJson("/api/v1/services/{$this->service->id}/steps/reorder", [
            'steps' => [
                ['id' => $step2->id, 'step_number' => 1],
                ['id' => $step1->id, 'step_number' => 2],
            ],
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.0.id', $step2->id)
            ->assertJsonPath('data.0.step_number', 1)
            ->assertJsonPath('data.1.id', $step1->id)
            ->assertJsonPath('data.1.step_number', 2);
    }

    public function test_unauthenticated_user_cannot_create_step(): void
    {
        $response = $this->postJson("/api/v1/services/{$this->service->id}/steps", [
            'title' => 'Unauthorized Step',
            'instruction' => 'Should fail.',
        ]);

        $response->assertStatus(401);
    }

    public function test_user_without_manage_permission_cannot_create_step(): void
    {
        $response = $this->actingAs($this->unprivilegedUser)->postJson("/api/v1/services/{$this->service->id}/steps", [
            'title' => 'Staff Forbidden Step',
            'instruction' => 'Should fail with 403.',
        ]);

        $response->assertStatus(403);
    }

    public function test_service_detail_endpoint_includes_room_steps(): void
    {
        ServiceStep::create([
            'service_id' => $this->service->id,
            'step_number' => 1,
            'title' => 'Intake Desk',
            'instruction' => 'Show notification.',
            'room_number' => 'Room 101',
            'is_active' => true,
        ]);

        $response = $this->getJson("/api/v1/services/{$this->service->code}");

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonCount(1, 'data.steps')
            ->assertJsonPath('data.steps.0.title', 'Intake Desk')
            ->assertJsonPath('data.steps.0.room_number', 'Room 101');
    }
}
