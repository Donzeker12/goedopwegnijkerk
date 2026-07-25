<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('scooters', function (Blueprint $table) {
            $table->string('custom_title', 140)->nullable()->after('scooter_model_id');
        });
    }

    public function down(): void
    {
        Schema::table('scooters', function (Blueprint $table) {
            $table->dropColumn('custom_title');
        });
    }
};
