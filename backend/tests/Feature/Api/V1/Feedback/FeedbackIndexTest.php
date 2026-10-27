<?php

declare(strict_types=1);

namespace Tests\Feature\Api\V1\Feedback;

use App\Domains\Authorization\Models\Role;
use App\Domains\Feedback\Models\Feedback;
use App\Domains\Organizations\Models\Organization;
use App\Domains\Organizations\Models\OrganizationType;
use App\Domains\Users\Models\User;
use Database\Seeders\OrganizationTypeSeeder;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FeedbackIndexTest extends TestCase
{
    use RefreshDatabase;

    private Organization $boleSubCity;

    private Organization $boleWoreda;

    private Organization $boleBureau;

    private Organization $kirkosSubCity;

    private Organization $kirkosBureau;

    private User $superAdmin;

    private User $subCityAdmin;

    private User $bureauStaff;

    private User $woredaAdmin;

    private User $kirkosAdmin;

    private User $permissionlessUser;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(OrganizationTypeSeeder::class);
        $this->seed(PermissionSeeder::class);
        $this->seed(RoleSeeder::class);

        $subCityType = OrganizationType::where('code', 'sub_city')->firstOrFail();
        $woredaType = OrganizationType::where('code', 'woreda')->firstOrFail();
        $bureauType = OrganizationType::where('code', 'bureau')->firstOrFail();

        $this->boleSubCity = Organization::create([
            'organization_type_id' => $subCityType->id,
            'name' => 'Bole Sub-City',
            'code' => 'subcity-bole',
        ]);

        $this->boleWoreda = Organization::create([
            'organization_type_id' => $woredaType->id,
            'parent_organization_id' => $this->boleSubCity->id,
            'name' => 'Bole Woreda 01',
            'code' => 'woreda-01-bole',
        ]);

        $this->boleBureau = Organization::create([
            'organization_type_id' => $bureauType->id,
            'parent_organization_id' => $this->boleWoreda->id,
            'name' => 'Bole Woreda 01 Health Bureau',
            'code' => 'bureau-health-w01',
        ]);

        $this->kirkosSubCity = Organization::create([
            'organization_type_id' => $subCityType->id,
            'name' => 'Kirkos Sub-City',
            'code' => 'subcity-kirkos',
        ]);

        $this->kirkosBureau = Organization::create([
            'organization_type_id' => $bureauType->id,
            'parent_organization_id' => $this->kirkosSubCity->id,
            'name' => 'Kirkos Health Bureau',
            'code' => 'bureau-health-kirkos',
        ]);

        $superAdminRole = Role::where('slug', 'super_admin')->firstOrFail();
        $subCityAdminRole = Role::where('slug', 'sub_city_admin')->firstOrFail();
        $woredaAdminRole = Role::where('slug', 'woreda_admin')->firstOrFail();
        $staffRole = Role::where('slug', 'staff')->firstOrFail();
        $permissionlessRole = Role::create([
            'name' => 'Auditor',
            'slug' => 'auditor',
            'description' => 'Role without feedback permissions.',
            'is_system' => false,
            'is_active' => true,
        ]);

        $this->superAdmin = User::create([
            'name' => 'Platform Super Admin',
            'username' => 'super.admin',
            'email' => 'super@platform.gov.et',
            'password' => 'Password123!',
            'role_id' => $superAdminRole->id,
            'organization_id' => null,
            'status' => 'active',
        ]);

        $this->subCityAdmin = User::create([
            'name' => 'Bole Sub-City Admin',
            'username' => 'bole.admin',
            'email' => 'admin@bole.gov.et',
            'password' => 'Password123!',
            'role_id' => $subCityAdminRole->id,
            'organization_id' => $this->boleSubCity->id,
            'status' => 'active',
        ]);

        $this->woredaAdmin = User::create([
            'name' => 'Bole Woreda Admin',
            'username' => 'woreda.admin',
            'email' => 'admin@woreda01.gov.et',
            'password' => 'Password123!',
            'role_id' => $woredaAdminRole->id,
            'organization_id' => $this->boleWoreda->id,
            'status' => 'active',
        ]);

        $this->bureauStaff = User::create([
            'name' => 'Health Staff',
            'username' => 'health.staff',
            'email' => 'staff@health01.gov.et',
            'password' => 'Password123!',
            'role_id' => $staffRole->id,
            'organization_id' => $this->boleBureau->id,
            'status' => 'active',
        ]);

        $this->kirkosAdmin = User::create([
            'name' => 'Kirkos Sub-City Admin',
            'username' => 'kirkos.admin',
            'email' => 'admin@kirkos.gov.et',
            'password' => 'Password123!',
            'role_id' => $subCityAdminRole->id,
            'organization_id' => $this->kirkosSubCity->id,
            'status' => 'active',
        ]);

        $this->permissionlessUser = User::create([
            'name' => 'Auditor',
            'username' => 'auditor',
            'email' => 'auditor@gov.et',
            'password' => 'Password123!',
            'role_id' => $permissionlessRole->id,
            'organization_id' => $this->boleSubCity->id,
            'status' => 'active',
        ]);
    }

    public function test_unauthenticated_request_is_rejected(): void
    {
        $this->getJson('/api/v1/feedbacks')->assertStatus(401);
    }

    public function test_user_without_feedback_permission_is_forbidden(): void
    {
        $this->actingAs($this->permissionlessUser)
            ->getJson('/api/v1/feedbacks')
            ->assertStatus(403);
    }

    public function test_super_admin_sees_all_feedback_with_organization_details(): void
    {
        $bole = $this->createFeedback($this->boleSubCity, 'complaint');
        $kirkos = $this->createFeedback($this->kirkosBureau, 'feedback');

        $response = $this->actingAs($this->superAdmin)
            ->getJson('/api/v1/feedbacks');

        $response->assertStatus(200)
            ->assertJson(['success' => true, 'message' => 'Feedback retrieved successfully.']);

        $ids = collect($response->json('data'))->pluck('id')->all();
        $this->assertEqualsCanonicalizing([$bole->id, $kirkos->id], $ids);

        $organizationIds = collect($response->json('data'))->pluck('organization.id')->all();
        $this->assertEqualsCanonicalizing(
            [$this->boleSubCity->id, $this->kirkosBureau->id],
            $organizationIds
        );
    }

    public function test_admin_sees_own_and_descendant_feedback_only(): void
    {
        $subCityFeedback = $this->createFeedback($this->boleSubCity, 'feedback');
        $woredaFeedback = $this->createFeedback($this->boleWoreda, 'complaint');
        $bureauFeedback = $this->createFeedback($this->boleBureau, 'satisfaction');
        $foreignFeedback = $this->createFeedback($this->kirkosBureau, 'feedback');

        $response = $this->actingAs($this->subCityAdmin)
            ->getJson('/api/v1/feedbacks');

        $response->assertStatus(200);

        $ids = collect($response->json('data'))->pluck('id')->all();
        $this->assertEqualsCanonicalizing(
            [$subCityFeedback->id, $woredaFeedback->id, $bureauFeedback->id],
            $ids
        );
        $this->assertNotContains($foreignFeedback->id, $ids);
    }

    public function test_staff_is_scoped_to_own_organization_only(): void
    {
        $bureauFeedback = $this->createFeedback($this->boleBureau, 'complaint');
        $this->createFeedback($this->boleWoreda, 'feedback');

        $response = $this->actingAs($this->bureauStaff)
            ->getJson('/api/v1/feedbacks');

        $response->assertStatus(200);

        $data = collect($response->json('data'));
        $this->assertEquals([$bureauFeedback->id], $data->pluck('id')->all());
        $this->assertSame($this->boleBureau->name, $data->first()['organization']['name']);
    }

    public function test_user_cannot_view_feedback_of_foreign_organization(): void
    {
        $boleFeedback = $this->createFeedback($this->boleSubCity, 'complaint');

        $response = $this->actingAs($this->kirkosAdmin)
            ->getJson("/api/v1/feedbacks/{$boleFeedback->id}");

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
                'message' => 'You do not have permission to view this feedback.',
            ]);
    }

    public function test_staff_with_only_view_own_cannot_view_parent_subcity_feedback(): void
    {
        $subCityFeedback = $this->createFeedback($this->boleSubCity, 'complaint');

        $response = $this->actingAs($this->bureauStaff)
            ->getJson("/api/v1/feedbacks/{$subCityFeedback->id}");

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
                'message' => 'You do not have permission to view this feedback.',
            ]);
    }

    public function test_user_can_view_own_feedback(): void
    {
        $bureauFeedback = $this->createFeedback($this->boleBureau, 'complaint');

        $response = $this->actingAs($this->bureauStaff)
            ->getJson("/api/v1/feedbacks/{$bureauFeedback->id}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'id' => $bureauFeedback->id,
                    'feedback_for_organization' => $this->boleBureau->id,
                ],
            ]);
    }

    public function test_sub_city_admin_can_view_descendant_feedback(): void
    {
        $bureauFeedback = $this->createFeedback($this->boleBureau, 'complaint');

        $response = $this->actingAs($this->subCityAdmin)
            ->getJson("/api/v1/feedbacks/{$bureauFeedback->id}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'id' => $bureauFeedback->id,
                    'feedback_for_organization' => $this->boleBureau->id,
                ],
            ]);
    }

    public function test_super_admin_can_view_any_feedback(): void
    {
        $kirkosFeedback = $this->createFeedback($this->kirkosBureau, 'feedback');

        $response = $this->actingAs($this->superAdmin)
            ->getJson("/api/v1/feedbacks/{$kirkosFeedback->id}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'id' => $kirkosFeedback->id,
                ],
            ]);
    }

    public function test_user_cannot_update_feedback_of_foreign_organization(): void
    {
        $boleFeedback = $this->createFeedback($this->boleSubCity, 'complaint');

        $response = $this->actingAs($this->kirkosAdmin)
            ->putJson("/api/v1/feedbacks/{$boleFeedback->id}", [
                'feedback_content' => 'Tampered content by foreign tenant.',
            ]);

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
                'message' => 'You do not have permission to update this feedback.',
            ]);
    }

    public function test_child_woreda_admin_cannot_update_parent_subcity_feedback(): void
    {
        $subCityFeedback = $this->createFeedback($this->boleSubCity, 'complaint');

        $response = $this->actingAs($this->woredaAdmin)
            ->putJson("/api/v1/feedbacks/{$subCityFeedback->id}", [
                'feedback_content' => 'Tampered content by child admin.',
            ]);

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
                'message' => 'You do not have permission to update this feedback.',
            ]);
    }

    public function test_admin_cannot_reassign_feedback_to_foreign_organization(): void
    {
        $boleFeedback = $this->createFeedback($this->boleSubCity, 'complaint');

        $response = $this->actingAs($this->subCityAdmin)
            ->putJson("/api/v1/feedbacks/{$boleFeedback->id}", [
                'feedback_for_organization' => $this->kirkosSubCity->id,
            ]);

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
                'message' => 'You do not have permission to reassign feedback to this organization.',
            ]);
    }

    public function test_sub_city_admin_can_update_descendant_feedback(): void
    {
        $woredaFeedback = $this->createFeedback($this->boleWoreda, 'complaint');

        $response = $this->actingAs($this->subCityAdmin)
            ->putJson("/api/v1/feedbacks/{$woredaFeedback->id}", [
                'feedback_content' => 'Reviewed and verified by Sub-City supervisor.',
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'id' => $woredaFeedback->id,
                    'feedback_content' => 'Reviewed and verified by Sub-City supervisor.',
                ],
            ]);

        $this->assertDatabaseHas('feedbacks', [
            'id' => $woredaFeedback->id,
            'feedback_content' => 'Reviewed and verified by Sub-City supervisor.',
        ]);
    }

    public function test_user_can_update_own_feedback(): void
    {
        $woredaFeedback = $this->createFeedback($this->boleWoreda, 'complaint');

        $response = $this->actingAs($this->woredaAdmin)
            ->putJson("/api/v1/feedbacks/{$woredaFeedback->id}", [
                'feedback_content' => 'Updated by own organization admin.',
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'id' => $woredaFeedback->id,
                    'feedback_content' => 'Updated by own organization admin.',
                ],
            ]);
    }

    public function test_super_admin_can_update_any_feedback(): void
    {
        $kirkosFeedback = $this->createFeedback($this->kirkosBureau, 'feedback');

        $response = $this->actingAs($this->superAdmin)
            ->putJson("/api/v1/feedbacks/{$kirkosFeedback->id}", [
                'feedback_content' => 'Updated by Super Admin.',
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'id' => $kirkosFeedback->id,
                    'feedback_content' => 'Updated by Super Admin.',
                ],
            ]);
    }

    public function test_user_cannot_respond_to_feedback_of_foreign_organization(): void
    {
        $boleFeedback = $this->createFeedback($this->boleSubCity, 'complaint');

        $response = $this->actingAs($this->kirkosAdmin)
            ->postJson("/api/v1/feedbacks/{$boleFeedback->id}/respond", [
                'response' => 'Unauthorized response from foreign tenant.',
            ]);

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
                'message' => 'You do not have permission to respond to this feedback.',
            ]);
    }

    public function test_child_woreda_admin_cannot_respond_to_parent_subcity_feedback(): void
    {
        $subCityFeedback = $this->createFeedback($this->boleSubCity, 'complaint');

        $response = $this->actingAs($this->woredaAdmin)
            ->postJson("/api/v1/feedbacks/{$subCityFeedback->id}/respond", [
                'response' => 'Unauthorized response from child woreda.',
            ]);

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
                'message' => 'You do not have permission to respond to this feedback.',
            ]);
    }

    public function test_sub_city_admin_can_respond_to_descendant_feedback(): void
    {
        $woredaFeedback = $this->createFeedback($this->boleWoreda, 'complaint');

        $response = $this->actingAs($this->subCityAdmin)
            ->postJson("/api/v1/feedbacks/{$woredaFeedback->id}/respond", [
                'response' => 'The matter was investigated and solved by the Sub-City directorate.',
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Feedback response recorded successfully.',
                'data' => [
                    'id' => $woredaFeedback->id,
                    'response' => 'The matter was investigated and solved by the Sub-City directorate.',
                ],
            ]);
    }

    public function test_super_admin_can_respond_to_any_feedback(): void
    {
        $kirkosFeedback = $this->createFeedback($this->kirkosBureau, 'feedback');

        $response = $this->actingAs($this->superAdmin)
            ->postJson("/api/v1/feedbacks/{$kirkosFeedback->id}/respond", [
                'response' => 'Super Admin official response.',
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Feedback response recorded successfully.',
                'data' => [
                    'id' => $kirkosFeedback->id,
                    'response' => 'Super Admin official response.',
                ],
            ]);
    }

    public function test_user_can_respond_to_own_feedback(): void
    {
        $woredaFeedback = $this->createFeedback($this->boleWoreda, 'complaint');

        $response = $this->actingAs($this->woredaAdmin)
            ->postJson("/api/v1/feedbacks/{$woredaFeedback->id}/respond", [
                'response' => 'Direct resolution from Woreda officer.',
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Feedback response recorded successfully.',
                'data' => [
                    'id' => $woredaFeedback->id,
                    'response' => 'Direct resolution from Woreda officer.',
                ],
            ]);
    }

    public function test_user_cannot_delete_feedback_of_foreign_organization(): void
    {
        $boleFeedback = $this->createFeedback($this->boleSubCity, 'complaint');

        $response = $this->actingAs($this->kirkosAdmin)
            ->deleteJson("/api/v1/feedbacks/{$boleFeedback->id}");

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
                'message' => 'You do not have permission to delete this feedback.',
            ]);

        $this->assertDatabaseHas('feedbacks', ['id' => $boleFeedback->id]);
    }

    public function test_child_woreda_admin_cannot_delete_parent_subcity_feedback(): void
    {
        $subCityFeedback = $this->createFeedback($this->boleSubCity, 'complaint');

        $response = $this->actingAs($this->woredaAdmin)
            ->deleteJson("/api/v1/feedbacks/{$subCityFeedback->id}");

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
                'message' => 'You do not have permission to delete this feedback.',
            ]);

        $this->assertDatabaseHas('feedbacks', ['id' => $subCityFeedback->id]);
    }

    public function test_sub_city_admin_can_delete_descendant_feedback(): void
    {
        $woredaFeedback = $this->createFeedback($this->boleWoreda, 'complaint');

        $response = $this->actingAs($this->subCityAdmin)
            ->deleteJson("/api/v1/feedbacks/{$woredaFeedback->id}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Feedback deleted successfully.',
            ]);

        $this->assertDatabaseMissing('feedbacks', ['id' => $woredaFeedback->id]);
    }

    public function test_user_can_delete_own_feedback(): void
    {
        $woredaFeedback = $this->createFeedback($this->boleWoreda, 'complaint');

        $response = $this->actingAs($this->woredaAdmin)
            ->deleteJson("/api/v1/feedbacks/{$woredaFeedback->id}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Feedback deleted successfully.',
            ]);

        $this->assertDatabaseMissing('feedbacks', ['id' => $woredaFeedback->id]);
    }

    public function test_super_admin_can_delete_any_feedback(): void
    {
        $kirkosFeedback = $this->createFeedback($this->kirkosBureau, 'feedback');

        $response = $this->actingAs($this->superAdmin)
            ->deleteJson("/api/v1/feedbacks/{$kirkosFeedback->id}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Feedback deleted successfully.',
            ]);

        $this->assertDatabaseMissing('feedbacks', ['id' => $kirkosFeedback->id]);
    }

    public function test_public_citizen_can_submit_general_feedback(): void
    {
        $response = $this->postJson('/api/v1/feedbacks', [
            'feedback_for_organization' => $this->boleSubCity->id,
            'feedback_content' => 'The customer service counter at the main hall was very helpful.',
            'feedback_type' => 'feedback',
            'full_name' => 'Almaz Ayana',
            'phone_number' => '+251911000111',
            'email' => 'almaz@example.et',
        ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Feedback submitted successfully.',
                'data' => [
                    'feedback_for_organization' => $this->boleSubCity->id,
                    'feedback_content' => 'The customer service counter at the main hall was very helpful.',
                    'feedback_type' => 'feedback',
                    'full_name' => 'Almaz Ayana',
                    'phone_number' => '+251911000111',
                    'email' => 'almaz@example.et',
                ],
            ]);

        $this->assertDatabaseHas('feedbacks', [
            'feedback_for_organization' => $this->boleSubCity->id,
            'feedback_type' => 'feedback',
            'full_name' => 'Almaz Ayana',
        ]);
    }

    public function test_public_citizen_can_submit_complaint_and_receives_tracking_number(): void
    {
        $response = $this->postJson('/api/v1/feedbacks', [
            'feedback_for_organization' => $this->boleWoreda->id,
            'feedback_content' => 'Power outage during vital events registration stalled our appointment.',
            'feedback_type' => 'complaint',
            'full_name' => 'Bekele Debele',
        ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Feedback submitted successfully.',
                'data' => [
                    'feedback_for_organization' => $this->boleWoreda->id,
                    'feedback_type' => 'complaint',
                    'full_name' => 'Bekele Debele',
                ],
            ]);

        $trackingNumber = $response->json('data.tracking_number');
        $this->assertNotNull($trackingNumber);
        $this->assertSame(10, strlen($trackingNumber));

        $this->assertDatabaseHas('feedbacks', [
            'feedback_for_organization' => $this->boleWoreda->id,
            'feedback_type' => 'complaint',
            'tracking_number' => $trackingNumber,
        ]);
    }

    public function test_public_citizen_can_submit_satisfaction_rating(): void
    {
        $response = $this->postJson('/api/v1/feedbacks', [
            'feedback_for_organization' => $this->boleBureau->id,
            'feedback_content' => 'Health clearance was issued swiftly without queues.',
            'feedback_type' => 'satisfaction',
        ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Feedback submitted successfully.',
                'data' => [
                    'feedback_for_organization' => $this->boleBureau->id,
                    'feedback_type' => 'satisfaction',
                ],
            ]);
    }

    public function test_feedback_submission_validates_required_fields(): void
    {
        $response = $this->postJson('/api/v1/feedbacks', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'feedback_for_organization',
                'feedback_content',
                'feedback_type',
            ]);
    }

    public function test_feedback_submission_rejects_invalid_feedback_type(): void
    {
        $response = $this->postJson('/api/v1/feedbacks', [
            'feedback_for_organization' => $this->boleSubCity->id,
            'feedback_content' => 'Invalid feedback type submitted.',
            'feedback_type' => 'invalid_type',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['feedback_type']);
    }

    public function test_feedback_show_returns_api_resource_structure(): void
    {
        $feedback = $this->createFeedback($this->boleSubCity, 'complaint');

        $response = $this->actingAs($this->subCityAdmin)
            ->getJson("/api/v1/feedbacks/{$feedback->id}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'id',
                    'feedback_for_organization',
                    'feedback_content',
                    'feedback_type',
                    'tracking_number',
                    'full_name',
                    'phone_number',
                    'email',
                    'organization' => [
                        'id',
                        'name',
                        'code',
                    ],
                    'created_at',
                    'updated_at',
                ],
            ]);
    }

    public function test_feedback_index_supports_pagination_with_metadata(): void
    {
        $this->createFeedback($this->boleSubCity, 'complaint');
        $this->createFeedback($this->boleSubCity, 'feedback');
        $this->createFeedback($this->boleSubCity, 'satisfaction');

        $response = $this->actingAs($this->superAdmin)
            ->getJson('/api/v1/feedbacks?per_page=2&page=1');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Feedback retrieved successfully.',
            ])
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'feedback_for_organization', 'feedback_type'],
                ],
                'meta' => [
                    'current_page',
                    'last_page',
                    'per_page',
                    'total',
                    'from',
                    'to',
                ],
            ]);

        $this->assertCount(2, $response->json('data'));
        $this->assertSame(2, $response->json('meta.per_page'));
        $this->assertGreaterThanOrEqual(3, $response->json('meta.total'));
    }

    public function test_feedback_index_enforces_maximum_page_size(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->getJson('/api/v1/feedbacks?per_page=500');

        $response->assertStatus(200);
        $this->assertSame(100, $response->json('meta.per_page'));
    }

    public function test_feedback_index_filters_by_feedback_type(): void
    {
        $complaint = $this->createFeedback($this->boleSubCity, 'complaint');
        $satisfaction = $this->createFeedback($this->boleSubCity, 'satisfaction');

        $response = $this->actingAs($this->superAdmin)
            ->getJson('/api/v1/feedbacks?feedback_type=complaint');

        $response->assertStatus(200);
        $ids = collect($response->json('data'))->pluck('id')->all();

        $this->assertContains($complaint->id, $ids);
        $this->assertNotContains($satisfaction->id, $ids);
    }

    public function test_feedback_mutations_create_audit_logs(): void
    {
        // 1. Public submission produces audit log
        $submitResponse = $this->postJson('/api/v1/feedbacks', [
            'feedback_for_organization' => $this->boleSubCity->id,
            'feedback_content' => 'Public feedback logging test.',
            'feedback_type' => 'feedback',
        ]);

        $submitResponse->assertStatus(201);
        $feedbackId = $submitResponse->json('data.id');

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'submitted',
            'entity_type' => 'Feedback',
            'entity_id' => (string) $feedbackId,
            'organization_id' => $this->boleSubCity->id,
        ]);

        // 2. Administrative update produces audit log
        $updateResponse = $this->actingAs($this->subCityAdmin)
            ->putJson("/api/v1/feedbacks/{$feedbackId}", [
                'feedback_content' => 'Revised feedback content under administrative review.',
            ]);

        $updateResponse->assertStatus(200);

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'updated',
            'entity_type' => 'Feedback',
            'entity_id' => (string) $feedbackId,
            'organization_id' => $this->boleSubCity->id,
            'user_id' => $this->subCityAdmin->id,
        ]);

        // 3. Administrative response produces audit log
        $respondResponse = $this->actingAs($this->subCityAdmin)
            ->postJson("/api/v1/feedbacks/{$feedbackId}/respond", [
                'response' => 'Audited official administrative response.',
            ]);

        $respondResponse->assertStatus(200);

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'responded',
            'entity_type' => 'Feedback',
            'entity_id' => (string) $feedbackId,
            'organization_id' => $this->boleSubCity->id,
            'user_id' => $this->subCityAdmin->id,
        ]);

        // 4. Administrative deletion produces audit log
        $deleteResponse = $this->actingAs($this->subCityAdmin)
            ->deleteJson("/api/v1/feedbacks/{$feedbackId}");

        $deleteResponse->assertStatus(200);

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'deleted',
            'entity_type' => 'Feedback',
            'entity_id' => (string) $feedbackId,
            'organization_id' => $this->boleSubCity->id,
            'user_id' => $this->subCityAdmin->id,
        ]);
    }

    public function test_audit_logs_for_feedback_are_scoped_to_organization_hierarchy(): void
    {
        // Feedback in Bole
        $boleFeedback = $this->createFeedback($this->boleSubCity, 'complaint');
        $this->actingAs($this->subCityAdmin)
            ->postJson("/api/v1/feedbacks/{$boleFeedback->id}/respond", [
                'response' => 'Response for Bole feedback.',
            ]);

        // Feedback in Kirkos
        $kirkosFeedback = $this->createFeedback($this->kirkosSubCity, 'complaint');
        $this->actingAs($this->superAdmin)
            ->postJson("/api/v1/feedbacks/{$kirkosFeedback->id}/respond", [
                'response' => 'Response for Kirkos feedback.',
            ]);

        // Query dashboard recent activity as Sub-City Admin
        $response = $this->actingAs($this->subCityAdmin)
            ->getJson('/api/v1/dashboard/recent-activity');

        $response->assertStatus(200);
        $logs = collect($response->json('data'));

        // Bole log should be present
        $boleLog = $logs->firstWhere('entity_id', (string) $boleFeedback->id);
        $this->assertNotNull($boleLog);
        $this->assertEquals($this->boleSubCity->id, $boleLog['organization']['id']);

        // Kirkos log MUST NOT be visible to Bole Sub-City Admin
        $kirkosLog = $logs->firstWhere('entity_id', (string) $kirkosFeedback->id);
        $this->assertNull($kirkosLog);
    }

    private function createFeedback(Organization $organization, string $type): Feedback
    {
        return Feedback::create([
            'feedback_for_organization' => $organization->id,
            'feedback_content' => 'Test feedback content.',
            'feedback_type' => $type,
        ]);
    }
}
