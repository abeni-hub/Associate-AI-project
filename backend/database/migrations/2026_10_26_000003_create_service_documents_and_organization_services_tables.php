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
        Schema::create('service_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_id')
                ->constrained('services')
                ->cascadeOnDelete();
            $table->foreignId('document_id')
                ->constrained('documents')
                ->cascadeOnDelete();
            $table->boolean('is_mandatory')->default(true);
            $table->unsignedInteger('order_column')->default(1);
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['service_id', 'document_id']);
            $table->index(['service_id', 'order_column']);
        });

        Schema::create('organization_services', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')
                ->constrained('organizations')
                ->cascadeOnDelete();
            $table->foreignId('service_id')
                ->constrained('services')
                ->cascadeOnDelete();
            $table->boolean('is_available')->default(true)->index();
            $table->text('specific_instructions')->nullable();
            $table->timestamps();

            $table->unique(['organization_id', 'service_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('organization_services');
        Schema::dropIfExists('service_documents');
    }
};
