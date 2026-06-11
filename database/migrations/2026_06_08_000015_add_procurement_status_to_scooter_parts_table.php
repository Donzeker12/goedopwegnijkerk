<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('scooter_parts', function (Blueprint $table) {
            $table->enum('procurement_status', ['nodig', 'besteld', 'binnen'])
                ->default('binnen')
                ->after('minimum_stock');
        });

        DB::table('scooter_parts')->update([
            'procurement_status' => 'binnen',
        ]);
    }

    public function down(): void
    {
        Schema::table('scooter_parts', function (Blueprint $table) {
            $table->dropColumn('procurement_status');
        });
    }
};
