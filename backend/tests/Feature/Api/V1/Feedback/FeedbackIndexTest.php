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

        $this->bureauStaff = User::create([
            'name' => 'Health Staff',
            'username' => 'health.staff',
            'email' => 'staff@health01.gov.et',
            'password' => 'Password123!',
            'role_id' => $staffRole->id,
            'organization_id' => $this->boleBureau->id,
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

    private function createFeedback(Organization $organization, string $type): Feedback
    {
        return Feedback::create([
            'feedback_for_organization' => $organization->id,
            'feedback_content' => 'Test feedback content.',
            'feedback_type' => $type,
        ]);
    }
}
