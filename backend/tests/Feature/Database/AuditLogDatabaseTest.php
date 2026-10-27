<?php

declare(strict_types=1);

namespace Tests\Feature\Database;

use App\Domains\AuditLogs\Models\AuditLog;
use App\Domains\Authorization\Models\Role;
use App\Domains\Organizations\Models\Organization;
use App\Domains\Organizations\Models\OrganizationType;
use App\Domains\Users\Models\User;
use Database\Seeders\OrganizationTypeSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuditLogDatabaseTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(OrganizationTypeSeeder::class);
        $this->seed(RoleSeeder::class);
    }

    public function test_audit_log_stores_user_action_and_json_state(): void
    {
        $orgType = OrganizationType::where('code', 'sub_city')->firstOrFail();
        $role = Role::where('slug', 'sub_city_admin')->firstOrFail();

        $org = Organization::create([
            'organization_type_id' => $orgType->id,
            'name' => 'Akaki Kaliti Sub-City',
            'code' => 'subcity-akaki',
        ]);

        $user = User::create([
            'name' => 'Audited Admin',
            'username' => 'audited.admin',
            'email' => 'audit@akaki.gov.et',
            'password' => 'Pass123!',
            'organization_id' => $org->id,
            'role_id' => $role->id,
        ]);

        $log = AuditLog::create([
            'user_id' => $user->id,
            'organization_id' => $org->id,
            'action' => 'update',
            'entity_type' => Organization::class,
            'entity_id' => (string) $org->id,
            'old_values' => ['status' => 'inactive'],
            'new_values' => ['status' => 'active'],
            'ip_address' => '127.0.0.1',
            'user_agent' => 'PHPUnit Test Suite',
        ]);

        $this->assertEquals($user->id, $log->user->id);
        $this->assertEquals($org->id, $log->organization->id);
        $this->assertEquals(['status' => 'inactive'], $log->old_values);
        $this->assertEquals(['status' => 'active'], $log->new_values);
    }

    public function test_audit_log_persists_when_user_is_deleted(): void
    {
        $role = Role::where('slug', 'staff')->firstOrFail();

        $user = User::create([
            'name' => 'Temporary User',
            'username' => 'temp.user',
            'email' => 'temp@gov.et',
            'password' => 'Pass123!',
            'role_id' => $role->id,
        ]);

        $log = AuditLog::create([
            'user_id' => $user->id,
            'action' => 'login',
            'entity_type' => User::class,
            'entity_id' => (string) $user->id,
            'ip_address' => '127.0.0.1',
        ]);

        $logId = $log->id;

        // Force delete the user
        $user->forceDelete();

        // The audit log must still exist, with user_id set to null
        $refreshedLog = AuditLog::findOrFail($logId);
        $this->assertNull($refreshedLog->user_id);
        $this->assertNull($refreshedLog->user);
        $this->assertEquals('login', $refreshedLog->action);
    }
}
