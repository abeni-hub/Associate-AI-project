<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. News: Optimize organization-scoped timeline lookups
        Schema::table('news', function (Blueprint $table) {
            if (! Schema::hasIndex('news', ['organization_id', 'created_at'])) {
                $table->index(['organization_id', 'created_at'], 'news_organization_id_created_at_index');
            }
        });

        // 2. News Content: Optimize parent block retrieval ordered by sequence
        Schema::table('news_content', function (Blueprint $table) {
            if (! Schema::hasIndex('news_content', ['news_id', 'order'])) {
                $table->index(['news_id', 'order'], 'news_content_news_id_order_index');
            }
        });

        // 3. Feedbacks: Optimize tenant-scoped chronological sorting and category filtering
        Schema::table('feedbacks', function (Blueprint $table) {
            if (! Schema::hasIndex('feedbacks', ['feedback_for_organization', 'created_at'])) {
                $table->index(['feedback_for_organization', 'created_at'], 'feedbacks_feedback_for_organization_created_at_index');
            }

            if (! Schema::hasIndex('feedbacks', ['feedback_for_organization', 'feedback_type'])) {
                $table->index(['feedback_for_organization', 'feedback_type'], 'feedbacks_feedback_for_organization_feedback_type_index');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('news', function (Blueprint $table) {
            if (Schema::hasIndex('news', 'news_organization_id_created_at_index')) {
                $table->dropIndex('news_organization_id_created_at_index');
            }
        });

        Schema::table('news_content', function (Blueprint $table) {
            if (Schema::hasIndex('news_content', 'news_content_news_id_order_index')) {
                $table->dropIndex('news_content_news_id_order_index');
            }
        });

        Schema::table('feedbacks', function (Blueprint $table) {
            if (Schema::hasIndex('feedbacks', 'feedbacks_feedback_for_organization_created_at_index')) {
                $table->dropIndex('feedbacks_feedback_for_organization_created_at_index');
            }

            if (Schema::hasIndex('feedbacks', 'feedbacks_feedback_for_organization_feedback_type_index')) {
                $table->dropIndex('feedbacks_feedback_for_organization_feedback_type_index');
            }
        });
    }
};
