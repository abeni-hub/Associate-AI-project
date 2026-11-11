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
        Schema::table('feedbacks', function (Blueprint $table) {
            if (! Schema::hasColumn('feedbacks', 'status')) {
                $table->string('status', 32)->default('submitted')->index();
            }
            if (! Schema::hasColumn('feedbacks', 'response')) {
                $table->text('response')->nullable();
            }
            if (! Schema::hasColumn('feedbacks', 'resolved_at')) {
                $table->timestamp('resolved_at')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('feedbacks', function (Blueprint $table) {
            $columns = [];
            if (Schema::hasColumn('feedbacks', 'status')) {
                $columns[] = 'status';
            }
            if (Schema::hasColumn('feedbacks', 'response')) {
                $columns[] = 'response';
            }
            if (Schema::hasColumn('feedbacks', 'resolved_at')) {
                $columns[] = 'resolved_at';
            }
            if (! empty($columns)) {
                $table->dropColumn($columns);
            }
        });
    }
};

