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
        Schema::create('navigation_items', function (Blueprint $table) {
            $table->id();
            $table->string('label', 100);
            $table->string('route', 150);
            $table->string('icon', 100)->nullable();
            $table->unsignedInteger('display_order')->default(1);
            $table->boolean('is_active')->default(true)->index();
            $table->string('required_permission', 100)->nullable();
            $table->timestamps();

            $table->index(['is_active', 'display_order']);
        });

        Schema::create('role_navigation_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('role_id')
                ->constrained('roles')
                ->cascadeOnDelete();
            $table->foreignId('navigation_item_id')
                ->constrained('navigation_items')
                ->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['role_id', 'navigation_item_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('role_navigation_items');
        Schema::dropIfExists('navigation_items');
    }
};
