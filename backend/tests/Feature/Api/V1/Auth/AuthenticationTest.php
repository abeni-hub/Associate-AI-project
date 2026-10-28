<?php

declare(strict_types=1);

namespace Tests\Feature\Api\V1\Auth;

use App\Domains\Authorization\Models\Role;
use App\Domains\Organizations\Models\Organization;
use App\Domains\Organizations\Models\OrganizationType;
use App\Domains\Users\Models\User;
use Database\Seeders\OrganizationTypeSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    private User $activeUser;

    private User $inactiveUser;

    private Role $role;

    private Organization $organization;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(OrganizationTypeSeeder::class);
        $this->seed(RoleSeeder::class);

        $orgType = OrganizationType::where('code', 'sub_city')->firstOrFail();
        $this->role = Role::where('slug', 'sub_city_admin')->firstOrFail();

        $this->organization = Organization::create([
            'organization_type_id' => $orgType->id,
            'name' => 'Bole Sub-City',
            'code' => 'subcity-bole',
        ]);

        $this->activeUser = User::create([
            'name' => 'Abebe Kebede',
            'username' => 'abebe.k',
            'email' => 'abebe@bole.gov.et',
            'password' => Hash::make('CorrectPassword123!'),
            'organization_id' => $this->organization->id,
            'role_id' => $this->role->id,
            'status' => 'active',
            'must_change_password' => false,
        ]);

        $this->inactiveUser = User::create([
            'name' => 'Disabled User',
            'username' => 'disabled.user',
            'email' => 'disabled@bole.gov.et',
            'password' => Hash::make('CorrectPassword123!'),
            'organization_id' => $this->organization->id,
            'role_id' => $this->role->id,
            'status' => 'inactive',
        ]);
    }

    public function test_user_can_login_with_username_and_valid_password(): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'username' => 'abebe.k',
            'password' => 'CorrectPassword123!',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Logged in successfully.',
                'data' => [
                    'id' => $this->activeUser->id,
                    'username' => 'abebe.k',
                    'email' => 'abebe@bole.gov.et',
                    'organization' => [
                        'code' => 'subcity-bole',
                    ],
                    'role' => [
                        'slug' => 'sub_city_admin',
                    ],
                ],
            ]);

        $this->assertAuthenticatedAs($this->activeUser);
    }

    public function test_user_can_login_with_email_identifier(): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'login' => 'abebe@bole.gov.et',
            'password' => 'CorrectPassword123!',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'email' => 'abebe@bole.gov.et',
                ],
            ]);

        $this->assertAuthenticatedAs($this->activeUser);
    }

    public function test_login_with_invalid_password_returns_generic_error(): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'username' => 'abebe.k',
            'password' => 'WrongPassword!',
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'Validation failed.',
                'errors' => [
                    'login' => ['These credentials do not match our records.'],
                ],
            ]);

        $this->assertGuest();
    }

    public function test_login_with_non_existent_account_returns_generic_error(): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'username' => 'nonexistent.user',
            'password' => 'SomePassword123!',
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'Validation failed.',
                'errors' => [
                    'login' => ['These credentials do not match our records.'],
                ],
            ]);

        $this->assertGuest();
    }

    public function test_disabled_account_login_is_rejected(): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'username' => 'disabled.user',
            'password' => 'CorrectPassword123!',
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'errors' => [
                    'login' => ['Your account is deactivated. Please contact your organization administrator.'],
                ],
            ]);

        $this->assertGuest();
    }

    public function test_unauthenticated_request_to_me_returns_401(): void
    {
        $response = $this->getJson('/api/v1/auth/me');

        $response->assertStatus(401)
            ->assertJson([
                'success' => false,
                'message' => 'Unauthenticated.',
            ]);
    }

    public function test_authenticated_user_can_retrieve_profile(): void
    {
        $response = $this->actingAs($this->activeUser)
            ->getJson('/api/v1/auth/me');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'id' => $this->activeUser->id,
                    'username' => 'abebe.k',
                    'organization' => [
                        'name' => 'Bole Sub-City',
                    ],
                ],
            ]);
    }

    public function test_authenticated_user_can_logout(): void
    {
        // 1. Log in to establish session
        $this->postJson('/api/v1/auth/login', [
            'username' => 'abebe.k',
            'password' => 'CorrectPassword123!',
        ])->assertStatus(200);

        // 2. Perform logout
        $response = $this->postJson('/api/v1/auth/logout');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Logged out successfully.',
            ]);

        // 3. Ensure subsequent request to protected endpoint is unauthenticated (401)
        $this->getJson('/api/v1/auth/me')->assertStatus(401);
    }

    public function test_authenticated_user_can_change_password(): void
    {
        $response = $this->actingAs($this->activeUser)
            ->putJson('/api/v1/auth/change-password', [
                'current_password' => 'CorrectPassword123!',
                'new_password' => 'BrandNewPassword2026!',
                'new_password_confirmation' => 'BrandNewPassword2026!',
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Password changed successfully.',
            ]);

        // Refresh user and verify new password works
        $this->activeUser->refresh();
        $this->assertTrue(Hash::check('BrandNewPassword2026!', $this->activeUser->password));
        $this->assertFalse($this->activeUser->must_change_password);
    }

    public function test_change_password_fails_if_current_password_is_incorrect(): void
    {
        $response = $this->actingAs($this->activeUser)
            ->putJson('/api/v1/auth/change-password', [
                'current_password' => 'IncorrectCurrentPassword!',
                'new_password' => 'BrandNewPassword2026!',
                'new_password_confirmation' => 'BrandNewPassword2026!',
            ]);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'errors' => [
                    'current_password' => ['The provided current password is incorrect.'],
                ],
            ]);
    }

    public function test_forgot_password_endpoint_returns_generic_success_message(): void
    {
        $response = $this->postJson('/api/v1/auth/forgot-password', [
            'email' => 'abebe@bole.gov.et',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'If your email address exists in our system, you will receive a password reset link.',
            ]);
    }

    public function test_reset_password_with_valid_token_updates_password(): void
    {
        $token = Password::broker()->createToken($this->activeUser);

        $response = $this->postJson('/api/v1/auth/reset-password', [
            'token' => $token,
            'email' => 'abebe@bole.gov.et',
            'password' => 'ResetPassword123!',
            'password_confirmation' => 'ResetPassword123!',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Password has been reset successfully.',
            ]);

        $this->activeUser->refresh();
        $this->assertTrue(Hash::check('ResetPassword123!', $this->activeUser->password));
    }
}
