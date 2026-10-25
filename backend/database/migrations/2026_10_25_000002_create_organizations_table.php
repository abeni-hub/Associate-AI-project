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
        Schema::create('organizations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_type_id')
                ->constrained('organization_types')
                ->restrictOnDelete();
            $table->foreignId('parent_organization_id')
                ->nullable()
                ->constrained('organizations')
                ->restrictOnDelete();
            $table->string('name');
            $table->string('code')->unique();
            $table->text('description')->nullable();
            $table->string('address')->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->string('status', 32)->default('active')->index();
            $table->softDeletes();
            $table->timestamps();

            $table->index(['parent_organization_id', 'status']);
            $table->index(['organization_type_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('organizations');
    }
};
