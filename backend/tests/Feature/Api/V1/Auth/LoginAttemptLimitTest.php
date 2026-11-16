<?php

declare(strict_types=1);

namespace Tests\Feature\Api\V1\Auth;

use App\Domains\AuditLogs\Models\AuditLog;
use App\Domains\Authentication\Models\LoginLockout;
use App\Domains\Authorization\Models\Role;
use App\Domains\Users\Models\User;
use Database\Seeders\OrganizationTypeSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\RateLimiter;
use Tests\TestCase;

class LoginAttemptLimitTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        config(['two-factor.required_roles' => []]);
        config(['login-security.lockout_minutes' => 1]);
        $this->seed(OrganizationTypeSeeder::class);
        $this->seed(RoleSeeder::class);

        $this->user = $this->makeUser('login.limit.user', 'user@example.gov.et', 'staff');
        $this->admin = $this->makeUser('login.limit.admin', 'admin@example.gov.et', 'super_admin');
    }

    public function test_fifth_failed_attempt_locks_out_email_and_ip_and_audits_without_password(): void
    {
        for ($attempt = 1; $attempt <= 5; $attempt++) {
            $response = $this->withHeaders(['User-Agent' => 'Login security test'])
                ->postJson('/api/v1/auth/login', [
                    'login' => $this->user->email,
                    'password' => 'WrongPassword123!',
                ]);
            $response->assertStatus($attempt === 5 ? 429 : 422);
        }

        $response->assertJsonPath('errors.retry_after_seconds', 60);
        $response->assertJsonPath('message', __('login_security.locked', ['seconds' => 60]));
        $this->assertDatabaseHas('login_lockouts', [
            'identifier_hash' => LoginLockout::identifierHash($this->user->email, '127.0.0.1'),
            'ip_address' => '127.0.0.1',
            'failed_attempts' => 5,
        ]);
        $this->assertSame(5, AuditLog::where('action', 'login_failed')->count());
        $this->assertDatabaseHas('audit_logs', [
            'action' => 'login_locked_out',
            'entity_type' => 'LoginLockout',
            'user_agent' => 'Login security test',
        ]);
        $this->assertStringNotContainsString(
            'WrongPassword123!',
            AuditLog::whereIn('action', ['login_failed', 'login_locked_out'])->get()->toJson()
        );
    }

    public function test_failed_credentials_do_not_reveal_if_an_account_exists(): void
    {
        $known = $this->postJson('/api/v1/auth/login', [
            'login' => $this->user->email,
            'password' => 'WrongPassword123!',
        ]);
        $unknown = $this->postJson('/api/v1/auth/login', [
            'login' => 'unknown@example.gov.et',
            'password' => 'WrongPassword123!',
        ]);

        $known->assertUnprocessable();
        $unknown->assertUnprocessable();
        $this->assertSame($known->json('message'), $unknown->json('message'));
        $this->assertSame($known->json('errors'), $unknown->json('errors'));
    }

    public function test_correct_password_clears_failed_attempt_counter_and_login_works_after_lockout_expires(): void
    {
        for ($attempt = 0; $attempt < 4; $attempt++) {
            $this->postJson('/api/v1/auth/login', [
                'login' => $this->user->email,
                'password' => 'WrongPassword123!',
            ])->assertUnprocessable();
        }

        $key = LoginLockout::limiterKey($this->user->email, '127.0.0.1');
        $this->postJson('/api/v1/auth/login', [
            'login' => $this->user->email,
            'password' => 'CorrectPassword123!',
        ])->assertOk();
        $this->assertSame(0, RateLimiter::attempts($key));

        RateLimiter::clear($key);
        for ($attempt = 0; $attempt < 5; $attempt++) {
            $this->postJson('/api/v1/auth/login', [
                'login' => $this->user->email,
                'password' => 'WrongPassword123!',
            ]);
        }

        $this->travel(61)->seconds();
        $this->postJson('/api/v1/auth/login', [
            'login' => $this->user->email,
            'password' => 'CorrectPassword123!',
        ])->assertOk();
    }

    public function test_admin_can_view_and_unlock_a_lockout_and_the_action_is_audited(): void
    {
        $this->createLockout();

        $this->actingAs($this->admin)
            ->getJson('/api/v1/users/locked-logins')
            ->assertOk()
            ->assertJsonPath('data.0.identifier', $this->user->email);

        $lockout = LoginLockout::firstOrFail();
        $this->actingAs($this->admin)
            ->postJson("/api/v1/users/locked-logins/{$lockout->id}/unlock")
            ->assertOk();

        $this->assertNotNull($lockout->fresh()->unlocked_at);
        $this->assertDatabaseHas('audit_logs', [
            'action' => 'login_lockout_unlocked',
            'entity_id' => (string) $lockout->id,
            'user_id' => $this->admin->id,
        ]);

        $this->postJson('/api/v1/auth/login', [
            'login' => $this->user->email,
            'password' => 'CorrectPassword123!',
        ])->assertOk();
    }

    public function test_user_without_unlock_permission_cannot_view_or_unlock_login_lockouts(): void
    {
        $this->createLockout();
        $lockout = LoginLockout::firstOrFail();
        $staff = $this->makeUser('login.limit.staff', 'staff@example.gov.et', 'staff');

        $this->actingAs($staff)
            ->getJson('/api/v1/users/locked-logins')
            ->assertForbidden();

        $this->actingAs($staff)
            ->postJson("/api/v1/users/locked-logins/{$lockout->id}/unlock")
            ->assertForbidden();

        $this->assertNull($lockout->fresh()->unlocked_at);
    }

    public function test_lockout_is_scoped_to_the_email_and_ip_pair(): void
    {
        $this->createLockout();

        $this->withServerVariables(['REMOTE_ADDR' => '127.0.0.2'])
            ->postJson('/api/v1/auth/login', [
                'login' => $this->user->email,
                'password' => 'CorrectPassword123!',
            ])
            ->assertOk();
    }

    private function createLockout(): void
    {
        for ($attempt = 0; $attempt < 5; $attempt++) {
            $this->postJson('/api/v1/auth/login', [
                'login' => $this->user->email,
                'password' => 'WrongPassword123!',
            ]);
        }
    }

    private function makeUser(string $username, string $email, string $roleSlug): User
    {
        $role = Role::where('slug', $roleSlug)->firstOrFail();

        return User::create([
            'name' => $username,
            'username' => $username,
            'email' => $email,
            'password' => 'CorrectPassword123!',
            'role_id' => $role->id,
            'status' => 'active',
        ]);
    }
}
