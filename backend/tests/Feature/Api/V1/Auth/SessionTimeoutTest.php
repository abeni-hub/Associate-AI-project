<?php

declare(strict_types=1);

namespace Tests\Feature\Api\V1\Auth;

use App\Domains\Authorization\Models\Role;
use App\Domains\Users\Models\User;
use Database\Seeders\OrganizationTypeSeeder;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SessionTimeoutTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private User $staff;

    private Role $staffRole;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(OrganizationTypeSeeder::class);
        $this->seed(PermissionSeeder::class);
        $this->seed(RoleSeeder::class);

        $adminRole = Role::where('slug', 'super_admin')->firstOrFail();
        $this->staffRole = Role::where('slug', 'staff')->firstOrFail();

        $this->admin = User::create([
            'name' => 'Platform Admin',
            'username' => 'platform.admin',
            'email' => 'admin@example.gov.et',
            'password' => 'Password123!',
            'role_id' => $adminRole->id,
            'status' => 'active',
        ]);
        $this->admin->forceFill([
            'two_factor_secret' => 'JBSWY3DPEHPK3PXP',
            'two_factor_recovery_codes' => [],
            'two_factor_confirmed_at' => now(),
        ])->save();

        $this->staff = User::create([
            'name' => 'Staff User',
            'username' => 'staff.user',
            'email' => 'staff@example.gov.et',
            'password' => 'Password123!',
            'role_id' => $this->staffRole->id,
            'status' => 'active',
        ]);
    }

    public function test_expired_idle_token_is_revoked_and_audited(): void
    {
        $this->staff->forceFill(['session_timeout' => 5])->save();
        $issuedToken = $this->staff->createToken('test-session');
        $issuedToken->accessToken->forceFill([
            'created_at' => now()->subMinutes(6),
            'last_activity_at' => now()->subMinutes(6),
        ])->save();

        $response = $this->withToken($issuedToken->plainTextToken)
            ->getJson('/api/v1/auth/me')
            ->assertUnauthorized()
            ->assertJsonPath('errors.reason', 'session_timeout');

        $this->assertDatabaseMissing('personal_access_tokens', ['id' => $issuedToken->accessToken->id]);
        $this->assertDatabaseHas('audit_logs', [
            'action' => 'session_timeout',
            'entity_type' => 'User',
            'entity_id' => (string) $this->staff->id,
            'status_code' => 401,
        ]);
        $this->assertStringContainsString('session has expired', strtolower($response->json('message')));
    }

    public function test_one_minute_timeout_is_enforced_for_a_test_fixture(): void
    {
        $this->staff->forceFill(['session_timeout' => 1])->save();
        $issuedToken = $this->staff->createToken('one-minute-session');
        $issuedToken->accessToken->forceFill([
            'created_at' => now()->subMinutes(2),
            'last_activity_at' => now()->subMinutes(2),
        ])->save();

        $this->withToken($issuedToken->plainTextToken)
            ->postJson('/api/v1/auth/activity')
            ->assertUnauthorized()
            ->assertJsonPath('errors.reason', 'session_timeout');
    }

    public function test_absolute_lifetime_expires_even_when_the_token_was_recently_active(): void
    {
        config(['session-timeout.absolute_lifetime' => 5]);

        $issuedToken = $this->staff->createToken('absolute-session');
        $issuedToken->accessToken->forceFill([
            'created_at' => now()->subMinutes(6),
            'last_activity_at' => now(),
        ])->save();

        $this->withToken($issuedToken->plainTextToken)
            ->getJson('/api/v1/auth/me')
            ->assertUnauthorized()
            ->assertJsonPath('errors.reason', 'session_timeout');

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'session_timeout',
            'entity_id' => (string) $this->staff->id,
        ]);
    }

    public function test_admin_can_change_account_timeout_and_out_of_range_values_are_rejected(): void
    {
        $response = $this->actingAs($this->admin)
            ->putJson("/api/v1/users/{$this->staff->id}", ['session_timeout' => 15]);

        $response->assertOk()
            ->assertJsonPath('data.session_timeout', 15);
        $this->assertDatabaseHas('audit_logs', [
            'action' => 'session_timeout_changed',
            'entity_type' => 'User',
            'entity_id' => (string) $this->staff->id,
            'ip_address' => '127.0.0.1',
        ]);

        foreach ([4, 121] as $invalidTimeout) {
            $this->actingAs($this->admin)
                ->putJson("/api/v1/users/{$this->staff->id}", ['session_timeout' => $invalidTimeout])
                ->assertUnprocessable()
                ->assertJsonValidationErrors(['session_timeout']);
        }
    }

    public function test_user_without_management_permission_cannot_change_account_timeout(): void
    {
        $this->actingAs($this->staff)
            ->putJson("/api/v1/users/{$this->admin->id}", ['session_timeout' => 10])
            ->assertForbidden();

        $this->assertNull($this->admin->fresh()->session_timeout);
        $this->assertDatabaseMissing('audit_logs', [
            'action' => 'session_timeout_changed',
            'entity_type' => 'User',
            'entity_id' => (string) $this->admin->id,
        ]);
    }

    public function test_role_timeout_is_audited_and_used_when_account_override_is_unset(): void
    {
        $this->actingAs($this->admin)
            ->putJson("/api/v1/roles/{$this->staffRole->id}", ['session_timeout' => 20])
            ->assertOk()
            ->assertJsonPath('data.session_timeout', 20);

        $this->assertSame(20, $this->staff->fresh()->effectiveSessionTimeout());
        $this->assertDatabaseHas('audit_logs', [
            'action' => 'session_timeout_changed',
            'entity_type' => 'Role',
            'entity_id' => (string) $this->staffRole->id,
            'ip_address' => '127.0.0.1',
        ]);
    }
}
