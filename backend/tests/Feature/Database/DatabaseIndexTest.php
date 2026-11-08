<?php

declare(strict_types=1);

namespace Tests\Feature\Database;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class DatabaseIndexTest extends TestCase
{
    use RefreshDatabase;

    public function test_composite_performance_indexes_exist_in_database(): void
    {
        $this->assertTrue(
            Schema::hasIndex('news', 'news_organization_id_created_at_index'),
            "Index 'news_organization_id_created_at_index' was not found on 'news' table."
        );

        $this->assertTrue(
            Schema::hasIndex('news_content', 'news_content_news_id_order_index'),
            "Index 'news_content_news_id_order_index' was not found on 'news_content' table."
        );

        $this->assertTrue(
            Schema::hasIndex('feedbacks', 'feedbacks_feedback_for_organization_created_at_index'),
            "Index 'feedbacks_feedback_for_organization_created_at_index' was not found on 'feedbacks' table."
        );

        $this->assertTrue(
            Schema::hasIndex('feedbacks', 'feedbacks_feedback_for_organization_feedback_type_index'),
            "Index 'feedbacks_feedback_for_organization_feedback_type_index' was not found on 'feedbacks' table."
        );
    }

    public function test_indexes_exist_in_postgresql_catalog(): void
    {
        $indexRows = DB::select("
            SELECT tablename, indexname 
            FROM pg_indexes 
            WHERE schemaname = 'public' 
              AND tablename IN ('news', 'news_content', 'feedbacks');
        ");

        $indexMap = collect($indexRows)->groupBy('tablename')->map(fn ($rows) => $rows->pluck('indexname')->all());

        $this->assertContains('news_organization_id_created_at_index', $indexMap->get('news', []));
        $this->assertContains('news_content_news_id_order_index', $indexMap->get('news_content', []));
        $this->assertContains('feedbacks_feedback_for_organization_created_at_index', $indexMap->get('feedbacks', []));
        $this->assertContains('feedbacks_feedback_for_organization_feedback_type_index', $indexMap->get('feedbacks', []));
    }

    public function test_performance_index_migration_can_rollback_and_remigrate(): void
    {
        $migration = require database_path('migrations/2026_10_27_000001_add_performance_indexes_to_news_and_feedbacks.php');

        // Rollback indexes
        $migration->down();

        $this->assertFalse(Schema::hasIndex('news', 'news_organization_id_created_at_index'));
        $this->assertFalse(Schema::hasIndex('news_content', 'news_content_news_id_order_index'));
        $this->assertFalse(Schema::hasIndex('feedbacks', 'feedbacks_feedback_for_organization_created_at_index'));
        $this->assertFalse(Schema::hasIndex('feedbacks', 'feedbacks_feedback_for_organization_feedback_type_index'));

        // Re-apply migration
        $migration->up();

        $this->assertTrue(Schema::hasIndex('news', 'news_organization_id_created_at_index'));
        $this->assertTrue(Schema::hasIndex('news_content', 'news_content_news_id_order_index'));
        $this->assertTrue(Schema::hasIndex('feedbacks', 'feedbacks_feedback_for_organization_created_at_index'));
        $this->assertTrue(Schema::hasIndex('feedbacks', 'feedbacks_feedback_for_organization_feedback_type_index'));
    }
}
