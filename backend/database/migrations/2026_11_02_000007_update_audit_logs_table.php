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
        Schema::table('audit_logs', function (Blueprint $table) {
            if (Schema::hasColumn('audit_logs', 'organization_id')) {
                // Drop index and foreign key first if they exist
                $table->dropForeign(['organization_id']);
                $table->dropIndex(['organization_id', 'created_at']);
                $table->dropColumn('organization_id');
            }

            if (! Schema::hasColumn('audit_logs', 'status')) {
                $table->string('status', 32)->default('success')->after('entity_id')->index();
            }

            if (! Schema::hasColumn('audit_logs', 'status_code')) {
                $table->unsignedSmallInteger('status_code')->nullable()->after('status');
            }

            if (! Schema::hasColumn('audit_logs', 'error_message')) {
                $table->text('error_message')->nullable()->after('status_code');
            }

            if (! Schema::hasColumn('audit_logs', 'request_payload')) {
                $table->jsonb('request_payload')->nullable()->after('error_message');
            }

            if (! Schema::hasColumn('audit_logs', 'response_payload')) {
                $table->jsonb('response_payload')->nullable()->after('request_payload');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('audit_logs', function (Blueprint $table) {
            $colsToDrop = ['status', 'status_code', 'error_message', 'request_payload', 'response_payload'];
            $existing = array_filter($colsToDrop, fn ($col) => Schema::hasColumn('audit_logs', $col));
            if (! empty($existing)) {
                $table->dropColumn(array_values($existing));
            }

            if (! Schema::hasColumn('audit_logs', 'organization_id')) {
                $table->foreignId('organization_id')
                    ->nullable()
                    ->constrained('organizations')
                    ->nullOnDelete();
                $table->index(['organization_id', 'created_at']);
            }
        });
    }
};
