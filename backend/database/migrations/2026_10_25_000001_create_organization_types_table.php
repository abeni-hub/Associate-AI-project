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
        Schema::create('organization_types', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('code')->unique();
            $table->text('description')->nullable();
            $table->unsignedSmallInteger('level')->default(1);
            $table->boolean('can_be_root')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Hierarchy rule table: defines which organization types are allowed to be parents of other types
        Schema::create('organization_type_allowed_parents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_type_id')
                ->constrained('organization_types')
                ->cascadeOnDelete();
            $table->foreignId('allowed_parent_type_id')
                ->constrained('organization_types')
                ->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['organization_type_id', 'allowed_parent_type_id'], 'org_type_allowed_parent_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('organization_type_allowed_parents');
        Schema::dropIfExists('organization_types');
    }
};
