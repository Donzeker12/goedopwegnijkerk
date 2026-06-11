<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('scooters', function (Blueprint $table) {
            $table->decimal('actual_sale_price', 10, 2)->nullable()->after('expected_sale_price');
            $table->date('sold_at')->nullable()->after('actual_sale_price');
            $table->string('purchase_receipt_path')->nullable()->after('sold_at');
        });
    }

    public function down(): void
    {
        Schema::table('scooters', function (Blueprint $table) {
            $table->dropColumn(['actual_sale_price', 'sold_at', 'purchase_receipt_path']);
        });
    }
};
