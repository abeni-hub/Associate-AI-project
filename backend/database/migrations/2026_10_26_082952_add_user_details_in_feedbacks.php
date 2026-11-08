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
        Schema::table('feedbacks', function (Blueprint $table) {
            if (! Schema::hasColumn('feedbacks', 'full_name')) {
                $table->string('full_name')->nullable();
            }
            if (! Schema::hasColumn('feedbacks', 'phone_number')) {
                $table->string('phone_number')->nullable();
            }
            if (! Schema::hasColumn('feedbacks', 'email')) {
                $table->string('email')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('feedbacks', function (Blueprint $table) {
            $columnsToDrop = array_filter(
                ['full_name', 'phone_number', 'email'],
                fn (string $column) => Schema::hasColumn('feedbacks', $column)
            );

            if (! empty($columnsToDrop)) {
                $table->dropColumn(array_values($columnsToDrop));
            }
        });
    }
};
