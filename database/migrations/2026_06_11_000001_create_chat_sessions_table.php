<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('chat_sessions', function (Blueprint $table) {
            $table->id();
            $table->string('token', 64)->unique();
            $table->string('name', 120);
            $table->string('email', 190);
            $table->string('phone', 50)->nullable();
            $table->enum('preferred_channel', ['whatsapp', 'email', 'telefoon'])->default('whatsapp');
            $table->string('best_time', 120)->nullable();
            $table->string('source', 120)->nullable();
            $table->string('page', 500)->nullable();
            $table->enum('status', ['nieuw', 'open', 'gesloten'])->default('nieuw');
            $table->timestamp('last_message_at')->nullable();
            $table->timestamp('closed_at')->nullable();
            $table->timestamps();

            $table->index(['status', 'last_message_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('chat_sessions');
    }
};
