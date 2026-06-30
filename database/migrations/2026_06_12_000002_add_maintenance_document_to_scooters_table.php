<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('scooters', function (Blueprint $table) {
            $table->json('maintenance_document')->nullable()->after('warranty_document');
        });
    }

    public function down(): void
    {
        Schema::table('scooters', function (Blueprint $table) {
            $table->dropColumn('maintenance_document');
        });
    }
};
