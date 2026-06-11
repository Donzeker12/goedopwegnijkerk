<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('scooter_views', function (Blueprint $table) {
            $table->id();
            $table->foreignId('scooter_id')->constrained()->cascadeOnDelete();
            $table->ipAddress('ip_address')->nullable();
            $table->string('user_agent', 500)->nullable();
            $table->timestamps();

            $table->index(['scooter_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('scooter_views');
    }
};
