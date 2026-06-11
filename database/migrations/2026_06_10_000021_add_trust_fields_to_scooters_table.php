<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('scooters', function (Blueprint $table) {
            $table->unsignedTinyInteger('warranty_months')->nullable()->after('ready_for_sale');
            $table->boolean('delivery_service_included')->default(false)->after('warranty_months');
            $table->unsignedTinyInteger('inspection_points')->nullable()->after('delivery_service_included');
            $table->decimal('review_score', 2, 1)->nullable()->after('inspection_points');
            $table->unsignedSmallInteger('review_count')->nullable()->after('review_score');
        });
    }

    public function down(): void
    {
        Schema::table('scooters', function (Blueprint $table) {
            $table->dropColumn([
                'warranty_months',
                'delivery_service_included',
                'inspection_points',
                'review_score',
                'review_count',
            ]);
        });
    }
};
