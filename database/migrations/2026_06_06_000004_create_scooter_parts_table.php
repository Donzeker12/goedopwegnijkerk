<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('scooter_parts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('scooter_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->decimal('cost', 10, 2);
            $table->date('purchased_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('scooter_parts');
    }
};
