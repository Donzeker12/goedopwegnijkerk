<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('maintenance_jobs', function (Blueprint $table) {
            $table->text('complaint')->nullable()->after('service_type');
        });
    }

    public function down(): void
    {
        Schema::table('maintenance_jobs', function (Blueprint $table) {
            $table->dropColumn('complaint');
        });
    }
};
