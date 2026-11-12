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
        Schema::table('feedbacks', function (Blueprint $table) {
            $table->text('feedback_content_amh')->nullable();
            $table->text('feedback_content_oro')->nullable();
            $table->text('response_amh')->nullable();
            $table->text('response_oro')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('feedbacks', function (Blueprint $table) {
            $table->dropColumn([
                'feedback_content_amh',
                'feedback_content_oro',
                'response_amh',
                'response_oro',
            ]);
        });
    }
};
