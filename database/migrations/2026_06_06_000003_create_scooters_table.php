<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('scooters', function (Blueprint $table) {
            $table->id();
            $table->foreignId('brand_id')->constrained()->onDelete('restrict');
            $table->foreignId('scooter_model_id')->constrained()->onDelete('restrict');
            $table->decimal('purchase_price', 10, 2);
            $table->decimal('expected_sale_price', 10, 2)->nullable();
            $table->text('description')->nullable();
            $table->integer('year')->nullable();
            $table->integer('mileage')->nullable();
            $table->string('color')->nullable();
            $table->string('kenteken')->nullable();
            $table->enum('status', ['in_reparatie', 'te_koop', 'verkocht'])->default('in_reparatie');
            $table->boolean('ready_for_sale')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('scooters');
    }
};
