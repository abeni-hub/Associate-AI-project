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
        Schema::table('organizations', function (Blueprint $table) {
            $table->string('name_amh')->default('')->after('name');
            $table->string('name_oro')->default('')->after('name_amh');
            $table->text('description_amh')->nullable()->after('description');
            $table->text('description_oro')->nullable()->after('description_amh');
            $table->string('address_amh')->nullable()->after('address');
            $table->string('address_oro')->nullable()->after('address_amh');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('organizations', function (Blueprint $table) {
            $table->dropColumn([
                'name_amh',
                'name_oro',
                'description_amh',
                'description_oro',
                'address_amh',
                'address_oro',
            ]);
        });
    }
};

