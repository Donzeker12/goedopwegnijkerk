<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('maintenance_jobs', function (Blueprint $table) {
            $table->id();
            $table->string('invoice_number')->unique();
            $table->string('service_type');
            $table->string('status')->default('open');
            $table->string('customer_name');
            $table->string('customer_phone')->nullable();
            $table->string('customer_email')->nullable();
            $table->string('customer_address')->nullable();
            $table->string('scooter_brand')->nullable();
            $table->string('scooter_model')->nullable();
            $table->string('license_plate')->nullable();
            $table->integer('mileage')->nullable();
            $table->date('performed_at')->nullable();
            $table->json('checklist')->nullable();
            $table->json('parts')->nullable();
            $table->decimal('labor_cost', 8, 2)->default(0);
            $table->decimal('vat_rate', 5, 2)->default(21);
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('maintenance_jobs');
    }
};
