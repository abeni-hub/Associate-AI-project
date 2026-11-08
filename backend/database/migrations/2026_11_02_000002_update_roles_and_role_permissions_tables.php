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
        Schema::table('roles', function (Blueprint $table) {
            if (! Schema::hasColumn('roles', 'scope_level')) {
                $table->string('scope_level', 32)->default('global')->after('slug')->index();
            }
        });

        Schema::table('role_permissions', function (Blueprint $table) {
            if (! Schema::hasColumn('role_permissions', 'can_create')) {
                $table->boolean('can_create')->default(true)->after('permission_id');
            }
            if (! Schema::hasColumn('role_permissions', 'can_read')) {
                $table->boolean('can_read')->default(true)->after('can_create');
            }
            if (! Schema::hasColumn('role_permissions', 'can_update')) {
                $table->boolean('can_update')->default(true)->after('can_read');
            }
            if (! Schema::hasColumn('role_permissions', 'can_delete')) {
                $table->boolean('can_delete')->default(true)->after('can_update');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('role_permissions', function (Blueprint $table) {
            $columns = ['can_create', 'can_read', 'can_update', 'can_delete'];
            $existing = array_filter($columns, fn ($col) => Schema::hasColumn('role_permissions', $col));
            if (! empty($existing)) {
                $table->dropColumn(array_values($existing));
            }
        });

        Schema::table('roles', function (Blueprint $table) {
            if (Schema::hasColumn('roles', 'scope_level')) {
                $table->dropColumn('scope_level');
            }
        });
    }
};
