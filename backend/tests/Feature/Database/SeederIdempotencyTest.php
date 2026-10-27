<?php

declare(strict_types=1);

namespace Tests\Feature\Database;

use App\Domains\Authorization\Models\Permission;
use App\Domains\Authorization\Models\Role;
use App\Domains\Organizations\Models\OrganizationType;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SeederIdempotencyTest extends TestCase
{
    use RefreshDatabase;

    public function test_seeders_are_fully_idempotent(): void
    {
        // First run
        $this->seed(DatabaseSeeder::class);

        $orgTypeCountInitial = OrganizationType::count();
        $permissionCountInitial = Permission::count();
        $roleCountInitial = Role::count();

        $this->assertEquals(3, $orgTypeCountInitial);
        $this->assertGreaterThan(30, $permissionCountInitial);
        $this->assertEquals(5, $roleCountInitial);

        // Second run must not produce duplicates
        $this->seed(DatabaseSeeder::class);

        $this->assertEquals($orgTypeCountInitial, OrganizationType::count());
        $this->assertEquals($permissionCountInitial, Permission::count());
        $this->assertEquals($roleCountInitial, Role::count());
    }
}
