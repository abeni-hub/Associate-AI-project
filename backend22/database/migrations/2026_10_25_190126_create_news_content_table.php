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
        Schema::create('news_content', function (Blueprint $table) {
            $table->id();
            $table->timestamps();
            $table->foreignId('news_id')->constrained('news');
            $table->longText('content')->nullable(false);
            $table->text('content_type')->nullable(false);
            $table->integer('order');

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('news_content');
    }
};
