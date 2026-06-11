<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('scooter_parts', function (Blueprint $table) {
            $table->dropForeign(['scooter_id']);
        });

        Schema::table('scooter_parts', function (Blueprint $table) {
            $table->unsignedBigInteger('scooter_id')->nullable()->change();
            $table->foreign('scooter_id')->references('id')->on('scooters')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('scooter_parts', function (Blueprint $table) {
            $table->dropForeign(['scooter_id']);
            $table->unsignedBigInteger('scooter_id')->nullable(false)->change();
            $table->foreign('scooter_id')->references('id')->on('scooters')->cascadeOnDelete();
        });
    }
};
