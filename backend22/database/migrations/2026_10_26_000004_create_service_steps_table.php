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
        Schema::create('service_steps', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_id')->constrained('services')->cascadeOnDelete();
            $table->foreignId('organization_id')->nullable()->constrained('organizations')->nullOnDelete();
            $table->unsignedInteger('step_number')->default(1);
            $table->string('title');
            $table->text('instruction');
            $table->string('room_number')->nullable();
            $table->string('floor')->nullable();
            $table->string('building')->nullable();
            $table->string('department_name')->nullable();
            $table->string('responsible_title')->nullable();
            $table->unsignedInteger('estimated_duration_minutes')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['service_id', 'step_number']);
            $table->index(['service_id', 'organization_id']);
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('service_steps');
    }
};
