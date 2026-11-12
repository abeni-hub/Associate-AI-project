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
                    'name' => [
                        'eng' => 'Official Marriage Certificate',
                    ],
                ],
            ]);

        $this->assertDatabaseHas('documents', ['name' => 'Official Marriage Certificate']);
    }

    public function test_super_admin_can_create_and_update_document_with_localization(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->postJson('/api/v1/documents', [
                'name' => 'Kebele Resident ID Card',
                'name_amh' => 'የቀበሌ ነዋሪነት መታወቂያ ካርድ',
                'name_oro' => 'Waraqaa Eenyummaa Jiraattummaa Gandaa',
                'code' => 'kebele-resident-id',
                'description' => 'Official municipal residency identification.',
                'description_amh' => 'ህጋዊ የማዘጋጃ ቤት የቀበሌ ነዋሪነት መታወቂያ።',
                'description_oro' => 'Waraqaa eenyummaa jiraattummaa gandaa seera qabeessa.',
                'sample_file_url' => 'https://government.et/samples/kebele-id.pdf',
            ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'data' => [
                    'name' => [
                        'eng' => 'Kebele Resident ID Card',
                        'amh' => 'የቀበሌ ነዋሪነት መታወቂያ ካርድ',
                        'oro' => 'Waraqaa Eenyummaa Jiraattummaa Gandaa',
                    ],
                    'code' => 'kebele-resident-id',
                    'description' => [
                        'eng' => 'Official municipal residency identification.',
                        'amh' => 'ህጋዊ የማዘጋጃ ቤት የቀበሌ ነዋሪነት መታወቂያ።',
                        'oro' => 'Waraqaa eenyummaa jiraattummaa gandaa seera qabeessa.',
                    ],
                ],
            ]);

        $docId = $response->json('data.id');

        $this->assertDatabaseHas('documents', [
            'id' => $docId,
            'name' => 'Kebele Resident ID Card',
            'name_amh' => 'የቀበሌ ነዋሪነት መታወቂያ ካርድ',
            'name_oro' => 'Waraqaa Eenyummaa Jiraattummaa Gandaa',
        ]);

        $updateResponse = $this->actingAs($this->superAdmin)
            ->putJson("/api/v1/documents/{$docId}", [
                'name_amh' => 'የዘመነ የቀበሌ ነዋሪነት መታወቂያ ካርድ',
                'description_oro' => 'Waraqaa eenyummaa jiraattummaa haaraa.',
            ]);

        $updateResponse->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'name' => [
                        'eng' => 'Kebele Resident ID Card',
                        'amh' => 'የዘመነ የቀበሌ ነዋሪነት መታወቂያ ካርድ',
                        'oro' => 'Waraqaa Eenyummaa Jiraattummaa Gandaa',
                    ],
                    'description' => [
                        'oro' => 'Waraqaa eenyummaa jiraattummaa haaraa.',
                    ],
                ],
            ]);

        $this->assertDatabaseHas('documents', [
            'id' => $docId,
            'name_amh' => 'የዘመነ የቀበሌ ነዋሪነት መታወቂያ ካርድ',
            'description_oro' => 'Waraqaa eenyummaa jiraattummaa haaraa.',
        ]);
    }

    public function test_can_search_documents_by_amharic_and_oromoo_terms(): void
    {
        Document::create([
            'name' => 'Trade License',
            'name_amh' => 'የንግድ ስራ ፈቃድ',
            'name_oro' => 'Eeyyama Hojii Daldalaa',
            'code' => 'trade-license',
            'description' => 'Renewed commercial trade certificate.',
            'description_amh' => 'የታደሰ የንግድ ስራ ፈቃድ ምስክር ወረቀት።',
            'description_oro' => 'Waraqaa ragaa eeyyama hojii daldalaa haarome.',
        ]);

        $amhSearch = $this->getJson('/api/v1/documents?search=ንግድ');
        $amhSearch->assertStatus(200)
            ->assertJsonPath('data.0.code', 'trade-license')
            ->assertJsonPath('data.0.name.amh', 'የንግድ ስራ ፈቃድ');

        $oroSearch = $this->getJson('/api/v1/documents?search=Daldalaa');
        $oroSearch->assertStatus(200)
            ->assertJsonPath('data.0.code', 'trade-license')
            ->assertJsonPath('data.0.name.oro', 'Eeyyama Hojii Daldalaa');
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
