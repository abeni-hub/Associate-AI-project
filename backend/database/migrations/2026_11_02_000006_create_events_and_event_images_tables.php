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
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')
                ->constrained('organizations')
                ->cascadeOnDelete();
            $table->string('title', 255);
            $table->text('description');
            $table->string('location_name', 255);
            $table->dateTime('event_date');
            $table->dateTime('end_date')->nullable();
            $table->string('audience', 150)->nullable();
            $table->string('status', 32)->default('published')->index();
            $table->timestamps();

            $table->index(['organization_id', 'event_date']);
        });

        Schema::create('event_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')
                ->constrained('events')
                ->cascadeOnDelete();
            $table->string('image_url', 2048);
            $table->string('caption', 255)->nullable();
            $table->unsignedInteger('order_column')->default(1);
            $table->timestamps();

            $table->index(['event_id', 'order_column']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('event_images');
        Schema::dropIfExists('events');
    }
};
