<?php

declare(strict_types=1);

namespace Tests\Feature\Api\V1\Cms;

use App\Domains\Authorization\Models\Role;
use App\Domains\Cms\Models\LandingPageConfig;
use App\Domains\Cms\Support\DefaultLandingPageContent;
use App\Domains\Users\Models\User;
use Database\Seeders\OrganizationTypeSeeder;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class LandingPageCmsTest extends TestCase
{
    use RefreshDatabase;

    private User $superAdmin;

    private User $woredaAdmin;

    private User $staffUser;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(OrganizationTypeSeeder::class);
        $this->seed(PermissionSeeder::class);
        $this->seed(RoleSeeder::class);

        $superAdminRole = Role::where('slug', 'super_admin')->firstOrFail();
        $woredaAdminRole = Role::where('slug', 'woreda_admin')->firstOrFail();
        $staffRole = Role::where('slug', 'staff')->firstOrFail();

        $this->superAdmin = User::create([
            'name' => 'Super Administrator',
            'username' => 'admin.cms',
            'email' => 'admin.cms@gov.et',
            'password' => Hash::make('CorrectPassword123!'),
            'role_id' => $superAdminRole->id,
            'status' => 'active',
            'must_change_password' => false,
        ]);

        $this->woredaAdmin = User::create([
            'name' => 'Woreda Administrator',
            'username' => 'woreda.admin',
            'email' => 'woreda.admin@gov.et',
            'password' => Hash::make('CorrectPassword123!'),
            'role_id' => $woredaAdminRole->id,
            'status' => 'active',
            'must_change_password' => false,
        ]);

        $this->staffUser = User::create([
            'name' => 'Staff Member',
            'username' => 'staff.member',
            'email' => 'staff.member@gov.et',
            'password' => Hash::make('CorrectPassword123!'),
            'role_id' => $staffRole->id,
            'status' => 'active',
            'must_change_password' => false,
        ]);
    }

    public function test_can_get_landing_page_cms_publicly_with_correct_envelope_and_all_8_sections(): void
    {
        LandingPageConfig::create([
            'version' => 'v1',
            'is_published' => true,
            'content' => DefaultLandingPageContent::payload(),
            'updated_by' => $this->superAdmin->id,
        ]);

        $response = $this->getJson('/api/v1/cms/landing-page');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Landing page CMS configuration retrieved successfully.',
                'errors' => null,
            ])
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'announcement' => ['enabled', 'tag', 'message', 'linkText', 'linkUrl'],
                    'hero' => [
                        'badge', 'titleEn', 'titleAm', 'subtitleEn', 'subtitleAm',
                        'primaryCtaText', 'primaryCtaUrl', 'secondaryCtaText', 'secondaryCtaUrl',
                        'slides',
                    ],
                    'quickSearch' => ['enabled', 'kicker', 'kickerNum', 'title', 'subtitle', 'buttonText', 'footnoteText'],
                    'serviceGuide' => ['enabled', 'kicker', 'kickerNum', 'titleLead', 'titleEmphasis', 'description'],
                    'journey' => ['enabled', 'kicker', 'kickerNum', 'title', 'steps'],
                    'newsEvents' => ['enabled', 'kicker', 'kickerNum', 'title', 'sourceLabel', 'showEvents', 'showNews'],
                    'feedback' => ['enabled', 'kicker', 'kickerNum', 'title', 'description', 'pointOne', 'pointTwo', 'quote'],
                    'footer' => ['enabled', 'brandTagline', 'description', 'copyright', 'helplinePhone'],
                ],
                'errors',
            ]);

        $this->assertCount(4, $response->json('data.hero.slides'));
    }

    public function test_get_landing_page_cms_falls_back_to_defaults_when_database_is_empty(): void
    {
        $response = $this->getJson('/api/v1/cms/landing-page');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Landing page CMS configuration retrieved successfully.',
            ])
            ->assertJsonStructure([
                'data' => [
                    'announcement',
                    'hero',
                    'quickSearch',
                    'serviceGuide',
                    'journey',
                    'newsEvents',
                    'feedback',
                    'footer',
                ],
            ]);
    }

    public function test_put_landing_page_cms_without_token_returns_401_unauthenticated(): void
    {
        $payload = DefaultLandingPageContent::payload();

        $response = $this->putJson('/api/v1/cms/landing-page', $payload);

        $response->assertStatus(401)
            ->assertJson([
                'success' => false,
                'message' => 'Unauthenticated.',
            ]);
    }

    public function test_put_landing_page_cms_with_non_super_admin_role_returns_403_forbidden(): void
    {
        $payload = DefaultLandingPageContent::payload();

        // 1. Woreda Admin
        $response = $this->actingAs($this->woredaAdmin)
            ->putJson('/api/v1/cms/landing-page', $payload);

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
            ]);

        // 2. Staff User
        $responseStaff = $this->actingAs($this->staffUser)
            ->putJson('/api/v1/cms/landing-page', $payload);

        $responseStaff->assertStatus(403)
            ->assertJson([
                'success' => false,
            ]);
    }

    public function test_put_landing_page_cms_with_invalid_data_returns_422_with_validation_errors(): void
    {
        $invalidPayload = [
            'announcement' => [
                'enabled' => true,
                'message' => '', // Required if enabled is true
            ],
            'hero' => [
                'titleEn' => '', // Required
                'slides' => [],  // Required min: 1
            ],
        ];

        $response = $this->actingAs($this->superAdmin)
            ->putJson('/api/v1/cms/landing-page', $invalidPayload);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'Validation failed.',
            ])
            ->assertJsonValidationErrors([
                'announcement.message',
                'hero.titleEn',
                'hero.slides',
            ]);
    }

    public function test_put_landing_page_cms_with_valid_super_admin_token_updates_database_audits_change_and_returns_200(): void
    {
        $token = $this->superAdmin->createToken('cms-test')->plainTextToken;

        $payload = DefaultLandingPageContent::payload();
        $payload['hero']['titleEn'] = 'Updated Super Admin Platform Title';
        $payload['announcement']['message'] = 'Special holiday service hours update.';

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->putJson('/api/v1/cms/landing-page', $payload);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Landing page CMS configuration updated successfully.',
                'data' => [
                    'hero' => [
                        'titleEn' => 'Updated Super Admin Platform Title',
                    ],
                    'announcement' => [
                        'message' => 'Special holiday service hours update.',
                    ],
                ],
            ]);

        // Verify database persistence
        $config = LandingPageConfig::where('version', 'v1')->first();
        $this->assertNotNull($config);
        $this->assertSame('Updated Super Admin Platform Title', $config->content['hero']['titleEn']);
        $this->assertSame($this->superAdmin->id, $config->updated_by);

        // Verify audit log
        $this->assertDatabaseHas('audit_logs', [
            'action' => 'cms_updated',
            'user_id' => $this->superAdmin->id,
            'entity_type' => 'LandingPageConfig',
            'entity_id' => (string) $config->id,
        ]);
    }

    public function test_upload_cms_image_stores_file_verifies_storage_and_returns_reachable_url(): void
    {
        Storage::fake('public');

        $token = $this->superAdmin->createToken('cms-upload')->plainTextToken;
        $fakeImage = $this->createFakeImage('bureau_spotlight.jpg');

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/v1/cms/upload-image', [
                'image' => $fakeImage,
            ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'CMS image uploaded successfully.',
            ])
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'url',
                    'filename',
                    'path',
                ],
            ]);

        $filename = $response->json('data.filename');
        $this->assertNotEmpty($filename);
        $this->assertStringEndsWith('.jpg', $filename);

        Storage::disk('public')->assertExists('cms/hero/'.$filename);
    }

    public function test_upload_cms_image_unauthorized_for_guests_and_non_super_admin(): void
    {
        Storage::fake('public');
        $fakeImage = $this->createFakeImage('test.jpg');

        // 1. Guest
        $responseGuest = $this->postJson('/api/v1/cms/upload-image', ['image' => $fakeImage]);
        $responseGuest->assertStatus(401);

        // 2. Non-Super Admin
        $responseNonAdmin = $this->actingAs($this->woredaAdmin)
            ->postJson('/api/v1/cms/upload-image', ['image' => $fakeImage]);
        $responseNonAdmin->assertStatus(403);
    }

    public function test_upload_cms_image_rejects_invalid_file_types_and_oversized_files(): void
    {
        Storage::fake('public');

        $fakeTextFile = UploadedFile::fake()->create('malicious.pdf', 100, 'application/pdf');

        $response = $this->actingAs($this->superAdmin)
            ->postJson('/api/v1/cms/upload-image', [
                'image' => $fakeTextFile,
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['image']);
    }

    /**
     * Helper to generate a valid image file without requiring the GD extension.
     */
    private function createFakeImage(string $filename = 'image.jpg'): UploadedFile
    {
        $jpegBytes = base64_decode('/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=');

        return UploadedFile::fake()->createWithContent($filename, $jpegBytes);
    }
}
