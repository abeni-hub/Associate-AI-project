<?php

declare(strict_types=1);

namespace Tests\Feature\Api\V1\Documents;

use App\Domains\Authorization\Models\Role;
use App\Domains\Documents\Models\Document;
use App\Domains\Users\Models\User;
use Database\Seeders\OrganizationTypeSeeder;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RequiredDocumentTest extends TestCase
{
    use RefreshDatabase;

    private User $superAdmin;

    private User $staff;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(OrganizationTypeSeeder::class);
        $this->seed(PermissionSeeder::class);
        $this->seed(RoleSeeder::class);

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
            'email' => 'staff@gov.et',
            'password' => 'Password123!',
            'role_id' => $staffRole->id,
            'status' => 'active',
        ]);
    }

    public function test_can_list_documents_catalog_publicly(): void
    {
        Document::create([
            'name' => 'Tax Clearance Certificate',
            'code' => 'tax-clearance',
            'description' => 'Document confirming absence of tax arrears.',
        ]);

        $response = $this->getJson('/api/v1/documents');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Documents retrieved successfully.',
            ])
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'name', 'code', 'description', 'is_active'],
                ],
            ]);
    }

    public function test_super_admin_can_create_and_update_document(): void
    {
        // 1. Create document
        $response = $this->actingAs($this->superAdmin)
            ->postJson('/api/v1/documents', [
                'name' => 'Marriage Certificate',
                'code' => 'marriage-cert',
                'description' => 'Original municipality issued certificate.',
                'sample_file_url' => 'https://government.et/samples/marriage.pdf',
            ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'data' => [
                    'code' => 'marriage-cert',
                ],
            ]);

        $docId = $response->json('data.id');

        // 2. Update document
        $updateResponse = $this->actingAs($this->superAdmin)
            ->putJson("/api/v1/documents/{$docId}", [
                'name' => 'Official Marriage Certificate',
            ]);

        $updateResponse->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'name' => 'Official Marriage Certificate',
                ],
            ]);

        $this->assertDatabaseHas('documents', ['name' => 'Official Marriage Certificate']);
    }

    public function test_staff_cannot_create_document(): void
    {
        $response = $this->actingAs($this->staff)
            ->postJson('/api/v1/documents', [
                'name' => 'Unauthorized Document',
                'code' => 'unauth-doc',
            ]);

        $response->assertStatus(403);
    }
}
