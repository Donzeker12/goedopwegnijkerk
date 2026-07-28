<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('favorites', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('scooter_id')->constrained()->onDelete('cascade');
            $table->timestamps();
            
            // Een user kan maar 1x dezelfde scooter favoriet hebben
            $table->unique(['user_id', 'scooter_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('favorites');
    }
};
