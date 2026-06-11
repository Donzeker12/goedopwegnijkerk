<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('scooter_parts', function (Blueprint $table) {
            $table->unsignedInteger('minimum_stock')->default(0)->after('quantity');
            $table->string('receipt_path')->nullable()->after('notes');
        });
    }

    public function down(): void
    {
        Schema::table('scooter_parts', function (Blueprint $table) {
            $table->dropColumn(['minimum_stock', 'receipt_path']);
        });
    }
};
