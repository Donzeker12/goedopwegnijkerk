<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('scooter_parts', 'placed_at')) {
            Schema::table('scooter_parts', function (Blueprint $table) {
                $table->date('placed_at')->nullable()->after('purchased_at');
            });
        }

        if (DB::connection()->getDriverName() !== 'sqlite') {
            DB::statement("ALTER TABLE scooter_parts MODIFY procurement_status ENUM('nodig','besteld','binnen','geplaatst') NOT NULL DEFAULT 'binnen'");
        }
    }

    public function down(): void
    {
        if (DB::connection()->getDriverName() !== 'sqlite') {
            DB::table('scooter_parts')
                ->where('procurement_status', 'geplaatst')
                ->update(['procurement_status' => 'binnen']);

            DB::statement("ALTER TABLE scooter_parts MODIFY procurement_status ENUM('nodig','besteld','binnen') NOT NULL DEFAULT 'binnen'");
        }

        if (Schema::hasColumn('scooter_parts', 'placed_at')) {
            Schema::table('scooter_parts', function (Blueprint $table) {
                $table->dropColumn('placed_at');
            });
        }
    }
};
