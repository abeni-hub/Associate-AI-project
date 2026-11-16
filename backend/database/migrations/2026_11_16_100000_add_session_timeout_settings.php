<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->unsignedSmallInteger('session_timeout')->nullable();
        });

        Schema::table('roles', function (Blueprint $table) {
            $table->unsignedSmallInteger('session_timeout')->nullable();
        });

        Schema::table('personal_access_tokens', function (Blueprint $table) {
            $table->timestamp('last_activity_at')->nullable()->index();
        });
    }

    public function down(): void
    {
        Schema::table('personal_access_tokens', function (Blueprint $table) {
            $table->dropIndex(['last_activity_at']);
            $table->dropColumn('last_activity_at');
        });

        Schema::table('roles', function (Blueprint $table) {
            $table->dropColumn('session_timeout');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('session_timeout');
        });
    }
};
