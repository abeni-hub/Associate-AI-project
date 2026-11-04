<?php

declare(strict_types=1);

namespace Tests\Feature\Database;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class DatabaseMigrationIntegrityTest extends TestCase
{
    use RefreshDatabase;

    public function test_all_expected_platform_tables_exist(): void
    {
        $expectedTables = [
            'organization_types',
            'organizations',
            'roles',
            'permissions',
            'role_permissions',
            'users',
            'audit_logs',
            'services',
            'documents',
            'service_documents',
            'organization_services',
            'service_steps',
            'news',
            'news_content',
            'feedbacks',
        ];

        foreach ($expectedTables as $table) {
            $this->assertTrue(
                Schema::hasTable($table),
                "Expected table '{$table}' was not found in schema."
            );
        }
    }

    public function test_feedbacks_table_has_all_required_columns(): void
    {
        $expectedColumns = [
            'id',
            'feedback_for_organization',
            'feedback_content',
            'feedback_type',
            'tracking_number',
            'full_name',
            'phone_number',
            'email',
            'created_at',
            'updated_at',
        ];

        foreach ($expectedColumns as $column) {
            $this->assertTrue(
                Schema::hasColumn('feedbacks', $column),
                "Expected column '{$column}' was not found in 'feedbacks' table."
            );
        }
    }

    public function test_feedback_add_columns_migrations_are_idempotent(): void
    {
        // Re-executing up() on existing columns should gracefully succeed without throwing duplicate column errors
        $trackingNumberMigration = require database_path('migrations/2026_10_26_080732_add_tracking_number_column.php');
        $userDetailsMigration = require database_path('migrations/2026_10_26_082952_add_user_details_in_feedbacks.php');

        $trackingNumberMigration->up();
        $userDetailsMigration->up();

        $this->assertTrue(Schema::hasColumn('feedbacks', 'tracking_number'));
        $this->assertTrue(Schema::hasColumn('feedbacks', 'full_name'));
        $this->assertTrue(Schema::hasColumn('feedbacks', 'phone_number'));
        $this->assertTrue(Schema::hasColumn('feedbacks', 'email'));
    }

    public function test_feedback_migrations_can_safely_rollback_and_remigrate(): void
    {
        $trackingNumberMigration = require database_path('migrations/2026_10_26_080732_add_tracking_number_column.php');
        $userDetailsMigration = require database_path('migrations/2026_10_26_082952_add_user_details_in_feedbacks.php');

        // Rollback added columns
        $userDetailsMigration->down();
        $this->assertFalse(Schema::hasColumn('feedbacks', 'full_name'));
        $this->assertFalse(Schema::hasColumn('feedbacks', 'phone_number'));
        $this->assertFalse(Schema::hasColumn('feedbacks', 'email'));

        $trackingNumberMigration->down();
        $this->assertFalse(Schema::hasColumn('feedbacks', 'tracking_number'));

        // Base table and essential columns remain intact
        $this->assertTrue(Schema::hasTable('feedbacks'));
        $this->assertTrue(Schema::hasColumn('feedbacks', 'feedback_for_organization'));
        $this->assertTrue(Schema::hasColumn('feedbacks', 'feedback_content'));

        // Re-migrate
        $trackingNumberMigration->up();
        $userDetailsMigration->up();

        $this->assertTrue(Schema::hasColumn('feedbacks', 'tracking_number'));
        $this->assertTrue(Schema::hasColumn('feedbacks', 'full_name'));
        $this->assertTrue(Schema::hasColumn('feedbacks', 'phone_number'));
        $this->assertTrue(Schema::hasColumn('feedbacks', 'email'));
    }
}
