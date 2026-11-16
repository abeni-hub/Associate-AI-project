<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('login_lockouts', function (Blueprint $table) {
            $table->id();
            $table->string('login_identifier');
            $table->string('identifier_hash', 64)->unique();
            $table->string('ip_address', 45);
            $table->text('user_agent')->nullable();
            $table->unsignedSmallInteger('failed_attempts');
            $table->timestamp('locked_until')->index();
            $table->timestamp('unlocked_at')->nullable();
            $table->foreignId('unlocked_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('login_lockouts');
    }
};
