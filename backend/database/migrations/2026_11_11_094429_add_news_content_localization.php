<?php

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
        Schema::table('news_content', function (Blueprint $table) {
            $table->longText('content_amh')->nullable(false)->default('');
            $table->longText('content_oro')->nullable(false)->default('');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('news_content', function (Blueprint $table) {
            $table->dropColumn(['content_amh', 'content_oro']);
        });
    }
};
