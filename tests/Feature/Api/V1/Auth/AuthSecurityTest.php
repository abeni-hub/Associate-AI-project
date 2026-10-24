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
use Tests\TestCase;

class AuthSecurityTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(OrganizationTypeSeeder::class);
        $this->seed(RoleSeeder::class);

        $orgType = OrganizationType::where('code', 'sub_city')->firstOrFail();
        $role = Role::where('slug', 'staff')->firstOrFail();

        $org = Organization::create([
            'organization_type_id' => $orgType->id,
            'name' => 'Nifas Silk Sub-City',
            'code' => 'subcity-nifas-silk',
        ]);

        $this->user = User::create([
            'name' => 'Security Tester',
            'username' => 'sec.tester',
            'email' => 'sec@nifas.gov.et',
            'password' => Hash::make('ValidPass123!'),
            'organization_id' => $org->id,
            'role_id' => $role->id,
            'status' => 'active',
        ]);
    }

    public function test_login_endpoint_enforces_rate_limiting(): void
    {
        // 5 allowed attempts per minute
        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/v1/auth/login', [
                'username' => 'sec.tester',
                'password' => 'WrongPassword',
            ]);
        }

        // 6th attempt should receive HTTP 429 Too Many Requests
        $response = $this->postJson('/api/v1/auth/login', [
            'username' => 'sec.tester',
            'password' => 'WrongPassword',
        ]);

        $response->assertStatus(429)
            ->assertJson([
                'success' => false,
                'message' => 'Too many login attempts. Please try again later.',
            ]);
    }

    public function test_active_session_is_terminated_if_account_is_deactivated_mid_session(): void
    {
        // 1. Log in to establish real session
        $this->postJson('/api/v1/auth/login', [
            'username' => 'sec.tester',
            'password' => 'ValidPass123!',
        ])->assertStatus(200);

        // 2. Suspend account in database while session is active
        $this->user->update(['status' => 'suspended']);

        // 3. Subsequent request is rejected by EnsureAccountIsActive middleware with 403
        $response = $this->getJson('/api/v1/auth/me');

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
                'message' => 'Your account is deactivated. Please contact your organization administrator.',
            ]);

        // 4. Session has been cleared, subsequent request receives 401
        $this->getJson('/api/v1/auth/me')->assertStatus(401);
    }
}
