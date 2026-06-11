<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('purchase_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('scooter_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('scooter_part_id')->nullable()->constrained('scooter_parts')->nullOnDelete();
            $table->enum('category', ['scooter', 'onderdeel', 'overig']);
            $table->string('description');
            $table->decimal('amount', 10, 2);
            $table->date('purchased_at')->nullable();
            $table->date('due_date')->nullable();
            $table->enum('payment_status', ['open', 'betaald'])->default('open');
            $table->date('paid_at')->nullable();
            $table->string('receipt_path')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['payment_status', 'due_date']);
            $table->index('category');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('purchase_entries');
    }
};
