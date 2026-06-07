<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('scooter_parts', function (Blueprint $table) {
            $table->string('part_brand')->nullable()->after('name');
            $table->string('specification')->nullable()->after('part_brand'); // e.g. "10 inch", "230mm"
            $table->unsignedTinyInteger('quantity')->default(1)->after('specification');
            $table->string('category')->nullable()->after('quantity'); // e.g. "Motor", "Remmen", "Verlichting"
        });
    }

    public function down(): void
    {
        Schema::table('scooter_parts', function (Blueprint $table) {
            $table->dropColumn(['part_brand', 'specification', 'quantity', 'category']);
        });
    }
};
