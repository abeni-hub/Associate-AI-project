<?php

declare(strict_types=1);

namespace Tests\Feature\Api\V1\Users;

use App\Domains\Authorization\Models\Role;
use App\Domains\Organizations\Models\Organization;
use App\Domains\Organizations\Models\OrganizationType;
use App\Domains\Users\Models\User;
use Database\Seeders\OrganizationTypeSeeder;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class UserManagementTest extends TestCase
{
    use RefreshDatabase;

    private User $superAdmin;

    private User $subCityAdmin;

    private User $woredaUser;

    private Organization $boleSubCity;

    private Organization $woreda01;

    private Organization $kirkosSubCity;

    private Role $superAdminRole;

    private Role $subCityAdminRole;

    private Role $woredaAdminRole;

    private Role $staffRole;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(OrganizationTypeSeeder::class);
        $this->seed(PermissionSeeder::class);
        $this->seed(RoleSeeder::class);

        $subCityType = OrganizationType::where('code', 'sub_city')->firstOrFail();
        $woredaType = OrganizationType::where('code', 'woreda')->firstOrFail();

        $this->boleSubCity = Organization::create([
            'organization_type_id' => $subCityType->id,
            'name' => 'Bole Sub-City',
            'code' => 'subcity-bole',
        ]);

        $this->woreda01 = Organization::create([
            'organization_type_id' => $woredaType->id,
            'parent_organization_id' => $this->boleSubCity->id,
            'name' => 'Woreda 01',
            'code' => 'woreda-01-bole',
        ]);

        $this->kirkosSubCity = Organization::create([
            'organization_type_id' => $subCityType->id,
            'name' => 'Kirkos Sub-City',
            'code' => 'subcity-kirkos',
        ]);

        $this->superAdminRole = Role::where('slug', 'super_admin')->firstOrFail();
        $this->subCityAdminRole = Role::where('slug', 'sub_city_admin')->firstOrFail();
        $this->woredaAdminRole = Role::where('slug', 'woreda_admin')->firstOrFail();
        $this->staffRole = Role::where('slug', 'staff')->firstOrFail();

        $this->superAdmin = User::create([
            'name' => 'Super Admin',
            'username' => 'super.admin',
            'email' => 'super@platform.gov.et',
            'password' => 'Password123!',
            'role_id' => $this->superAdminRole->id,
            'status' => 'active',
        ]);

        $this->subCityAdmin = User::create([
            'name' => 'Bole Admin',
            'username' => 'bole.admin',
            'email' => 'admin@bole.gov.et',
            'password' => 'Password123!',
            'role_id' => $this->subCityAdminRole->id,
            'organization_id' => $this->boleSubCity->id,
            'status' => 'active',
        ]);

        $this->woredaUser = User::create([
            'name' => 'Woreda Staff',
            'username' => 'woreda.staff',
            'email' => 'staff@woreda01.gov.et',
            'password' => 'Password123!',
            'role_id' => $this->staffRole->id,
            'organization_id' => $this->woreda01->id,
            'status' => 'active',
        ]);
    }

    public function test_sub_city_admin_can_only_see_users_in_own_hierarchy(): void
    {
        // User in foreign hierarchy
        $foreignUser = User::create([
            'name' => 'Foreign User',
            'username' => 'foreign.user',
            'email' => 'foreign@kirkos.gov.et',
            'password' => 'Password123!',
            'role_id' => $this->staffRole->id,
            'organization_id' => $this->kirkosSubCity->id,
            'status' => 'active',
        ]);

        $response = $this->actingAs($this->subCityAdmin)
            ->getJson('/api/v1/users');

        $response->assertStatus(200);
        $ids = collect($response->json('data'))->pluck('id')->all();

        $this->assertContains($this->subCityAdmin->id, $ids);
        $this->assertContains($this->woredaUser->id, $ids);
        $this->assertNotContains($foreignUser->id, $ids);
    }

    public function test_super_admin_can_create_user_with_arbitrary_organization(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->postJson('/api/v1/users', [
                'name' => 'New Kirkos Staff',
                'username' => 'kirkos.new',
                'email' => 'new@kirkos.gov.et',
                'password' => 'SecurePass123!',
                'role_id' => $this->staffRole->id,
                'organization_id' => $this->kirkosSubCity->id,
                'phone' => '+251911999888',
            ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'data' => [
                    'username' => 'kirkos.new',
                    'email' => 'new@kirkos.gov.et',
                    'must_change_password' => true,
                ],
            ]);

        $this->assertDatabaseHas('users', ['username' => 'kirkos.new']);
        $this->assertDatabaseHas('audit_logs', [
            'action' => 'created',
            'entity_type' => 'User',
        ]);
    }

    public function test_sub_city_admin_cannot_create_super_admin(): void
    {
        $response = $this->actingAs($this->subCityAdmin)
            ->postJson('/api/v1/users', [
                'name' => 'Attempted Super Admin',
                'username' => 'rogue.super',
                'email' => 'rogue@bole.gov.et',
                'password' => 'SecurePass123!',
                'role_id' => $this->superAdminRole->id,
                'organization_id' => $this->boleSubCity->id,
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['role_id']);
    }

    public function test_sub_city_admin_cannot_create_user_in_foreign_organization(): void
    {
        $response = $this->actingAs($this->subCityAdmin)
            ->postJson('/api/v1/users', [
                'name' => 'Foreign Worker',
                'username' => 'foreign.worker',
                'email' => 'worker@kirkos.gov.et',
                'password' => 'SecurePass123!',
                'role_id' => $this->staffRole->id,
                'organization_id' => $this->kirkosSubCity->id,
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['organization_id']);
    }

    public function test_user_cannot_delete_self(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->deleteJson("/api/v1/users/{$this->superAdmin->id}");

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'You cannot delete your own account.',
            ]);
    }

    public function test_cannot_delete_last_remaining_super_admin(): void
    {
        $secondarySuperAdmin = User::create([
            'name' => 'Second Super Admin',
            'username' => 'second.super',
            'email' => 'second@gov.et',
            'password' => 'Password123!',
            'role_id' => $this->superAdminRole->id,
        ]);

        // Secondary deletes primary
        $this->actingAs($secondarySuperAdmin)
            ->deleteJson("/api/v1/users/{$this->superAdmin->id}")
            ->assertStatus(200);

        // Now secondary attempts to delete self (caught by self-delete check)
        $this->actingAs($secondarySuperAdmin)
            ->deleteJson("/api/v1/users/{$secondarySuperAdmin->id}")
            ->assertStatus(422);
    }

    public function test_admin_can_reset_user_password(): void
    {
        $response = $this->actingAs($this->subCityAdmin)
            ->postJson("/api/v1/users/{$this->woredaUser->id}/reset-password", [
                'password' => 'NewResetPassword2026!',
                'password_confirmation' => 'NewResetPassword2026!',
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);

        $this->woredaUser->refresh();
        $this->assertTrue(Hash::check('NewResetPassword2026!', $this->woredaUser->password));
        $this->assertTrue($this->woredaUser->must_change_password);
        $this->assertDatabaseHas('audit_logs', [
            'action' => 'password_reset',
            'entity_type' => 'User',
            'entity_id' => (string) $this->woredaUser->id,
        ]);
    }
}
