<?php

declare(strict_types=1);

namespace Tests\Feature\Api\V1\Auth;

use App\Domains\AuditLogs\Models\AuditLog;
use App\Domains\Authorization\Models\Role;
use App\Domains\Users\Models\User;
use Database\Seeders\OrganizationTypeSeeder;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use PragmaRX\Google2FA\Google2FA;
use Tests\TestCase;

class TwoFactorAuthenticationTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private User $staff;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(OrganizationTypeSeeder::class);
        $this->seed(PermissionSeeder::class);
        $this->seed(RoleSeeder::class);

        $this->admin = $this->makeUser('two.factor.admin', 'super_admin');
        $this->staff = $this->makeUser('two.factor.staff', 'staff');
    }

    public function test_admin_setup_encrypts_secret_and_returns_recovery_codes_only_on_confirmation(): void
    {
        $setup = $this->actingAs($this->admin)
            ->postJson('/api/v1/auth/two-factor/setup')
            ->assertOk()
            ->assertJsonStructure(['data' => ['secret', 'otpauth_url']]);

        $secret = $setup->json('data.secret');
        $this->assertStringStartsWith('otpauth://totp/', $setup->json('data.otpauth_url'));
        $this->assertNotSame($secret, $this->admin->fresh()->getRawOriginal('two_factor_secret'));

        $response = $this->postJson('/api/v1/auth/two-factor/confirm', [
            'code' => app(Google2FA::class)->getCurrentOtp($secret),
        ])->assertOk()->assertJsonCount(10, 'data.recovery_codes');

        $this->assertTrue($this->admin->fresh()->two_factor_confirmed_at !== null);
        $this->assertDatabaseHas('audit_logs', [
            'action' => 'two_factor_enabled',
            'entity_id' => (string) $this->admin->id,
        ]);
        $this->assertStringNotContainsString($secret, json_encode($response->json()));
    }

    public function test_password_login_requires_an_otp_challenge_before_issuing_a_token(): void
    {
        $this->enableTwoFactor($this->admin);

        $login = $this->postJson('/api/v1/auth/login', [
            'username' => $this->admin->username,
            'password' => 'Password123!',
        ])->assertOk()->assertJsonPath('data.two_factor_required', true);

        $this->assertArrayNotHasKey('token', $login->json('data'));
        Auth::forgetGuards();

        $this->postJson('/api/v1/auth/two-factor/challenge', [
            'challenge_token' => $login->json('data.challenge_token'),
            'code' => app(Google2FA::class)->getCurrentOtp($this->admin->fresh()->two_factor_secret),
        ])->assertOk()->assertJsonStructure(['data' => ['token', 'session_expires_at']]);
    }

    public function test_bad_login_challenge_is_audited_and_rate_limited(): void
    {
        $this->enableTwoFactor($this->admin);
        $login = $this->postJson('/api/v1/auth/login', [
            'username' => $this->admin->username,
            'password' => 'Password123!',
        ])->assertOk();
        Auth::forgetGuards();

        $google2fa = app(Google2FA::class);
        $secret = $this->admin->fresh()->two_factor_secret;
        do {
            $wrongCode = str_pad((string) random_int(0, 999_999), 6, '0', STR_PAD_LEFT);
        } while ($google2fa->verifyKey($secret, $wrongCode, (int) config('two-factor.code_window', 1)));
        for ($attempt = 0; $attempt < 5; $attempt++) {
            $response = $this->postJson('/api/v1/auth/two-factor/challenge', [
                'challenge_token' => $login->json('data.challenge_token'),
                'code' => $wrongCode,
            ]);
            $response->assertStatus($attempt === 4 ? 429 : 422);
        }

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'two_factor_failed_challenge',
            'entity_id' => (string) $this->admin->id,
            'status' => 'failed',
        ]);
        $this->assertStringNotContainsString($wrongCode, json_encode(
            AuditLog::where('action', 'two_factor_failed_challenge')->first()->toArray()
        ));
    }

    public function test_recovery_code_is_consumed_once_and_audited(): void
    {
        $codes = ['ABCD-EFGH-IJKL'];
        $this->enableTwoFactor($this->admin, $codes);
        $login = $this->postJson('/api/v1/auth/login', [
            'username' => $this->admin->username,
            'password' => 'Password123!',
        ])->assertOk();
        Auth::forgetGuards();

        $this->postJson('/api/v1/auth/two-factor/challenge', [
            'challenge_token' => $login->json('data.challenge_token'),
            'recovery_code' => $codes[0],
        ])->assertOk();

        $this->assertSame([], $this->admin->fresh()->two_factor_recovery_codes);
        $this->assertDatabaseHas('audit_logs', [
            'action' => 'two_factor_recovery_code_used',
            'entity_id' => (string) $this->admin->id,
        ]);
    }

    public function test_disable_and_recovery_code_regeneration_require_password_confirmation(): void
    {
        $this->enableTwoFactor($this->admin);
        $this->actingAs($this->admin)
            ->postJson('/api/v1/auth/two-factor/recovery-codes', ['password' => 'incorrect'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['password']);

        $this->postJson('/api/v1/auth/two-factor/recovery-codes', ['password' => 'Password123!'])
            ->assertOk()
            ->assertJsonCount(10, 'data.recovery_codes');

        $this->deleteJson('/api/v1/auth/two-factor', ['password' => 'Password123!'])
            ->assertOk();
        $this->assertNull($this->admin->fresh()->two_factor_confirmed_at);
        $this->assertDatabaseHas('audit_logs', [
            'action' => 'two_factor_disabled',
            'entity_id' => (string) $this->admin->id,
        ]);
    }

    public function test_admin_can_reset_another_users_two_factor_but_unprivileged_user_cannot(): void
    {
        $this->enableTwoFactor($this->staff);
        $this->enableTwoFactor($this->admin);
        $this->actingAs($this->staff)
            ->postJson("/api/v1/users/{$this->staff->id}/two-factor/reset")
            ->assertForbidden();

        $this->actingAs($this->admin)
            ->postJson("/api/v1/users/{$this->staff->id}/two-factor/reset")
            ->assertOk();

        $this->assertNull($this->staff->fresh()->two_factor_confirmed_at);
        $this->assertDatabaseHas('audit_logs', [
            'action' => 'two_factor_admin_reset',
            'entity_id' => (string) $this->staff->id,
            'user_id' => $this->admin->id,
        ]);
    }

    public function test_required_role_is_gated_until_setup_and_users_without_2fa_can_still_login(): void
    {
        $login = $this->postJson('/api/v1/auth/login', [
            'username' => $this->admin->username,
            'password' => 'Password123!',
        ])->assertOk()
            ->assertJsonPath('data.two_factor_setup_required', true);

        $this->withToken($login->json('data.token'))
            ->getJson('/api/v1/users')
            ->assertForbidden()
            ->assertJsonPath('errors.reason', 'two_factor_setup_required');

        $this->postJson('/api/v1/auth/login', [
            'username' => $this->staff->username,
            'password' => 'Password123!',
        ])->assertOk()
            ->assertJsonPath('data.username', $this->staff->username)
            ->assertJsonPath('data.two_factor_setup_required', false);
    }

    private function makeUser(string $username, string $roleSlug): User
    {
        $role = Role::where('slug', $roleSlug)->firstOrFail();

        return User::create([
            'name' => $username,
            'username' => $username,
            'email' => $username.'@example.gov.et',
            'password' => 'Password123!',
            'role_id' => $role->id,
            'status' => 'active',
        ]);
    }

    /**
     * @param  list<string>|null  $codes
     */
    private function enableTwoFactor(User $user, ?array $codes = null): void
    {
        $user->forceFill([
            'two_factor_secret' => app(Google2FA::class)->generateSecretKey(),
            'two_factor_recovery_codes' => $codes ?? [],
            'two_factor_confirmed_at' => now(),
        ])->save();
        Cache::flush();
    }
}
