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
        Schema::table('organization_services', function (Blueprint $table) {
            if (Schema::hasColumn('organization_services', 'specific_instructions')) {
                $table->dropColumn('specific_instructions');
            }
            if (Schema::hasColumn('organization_services', 'access_level')) {
                $table->dropColumn('access_level');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('organization_services', function (Blueprint $table) {
            if (! Schema::hasColumn('organization_services', 'specific_instructions')) {
                $table->text('specific_instructions')->nullable();
            }
        });
    }
};
