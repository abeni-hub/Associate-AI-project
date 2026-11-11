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
        Schema::table('service_steps', function (Blueprint $table) {
            $table->string('title_amh')->default('');
            $table->string('title_oro')->default('');
            $table->text('instruction_amh')->nullable();
            $table->text('instruction_oro')->nullable();
            $table->string('department_name_amh')->nullable();
            $table->string('department_name_oro')->nullable();
            $table->string('building_amh')->nullable();
            $table->string('building_oro')->nullable();
            $table->string('responsible_title_amh')->nullable();
            $table->string('responsible_title_oro')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('service_steps', function (Blueprint $table) {
            $table->dropColumn([
                'title_amh',
                'title_oro',
                'instruction_amh',
                'instruction_oro',
                'department_name_amh',
                'department_name_oro',
                'building_amh',
                'building_oro',
                'responsible_title_amh',
                'responsible_title_oro',
            ]);
        });
    }
};
