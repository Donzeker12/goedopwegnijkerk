<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('review_invites', function (Blueprint $table) {
            $table->id();
            $table->string('token', 96)->unique();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('used_at')->nullable();
            $table->timestamps();

            $table->index('expires_at');
            $table->index('used_at');
        });

        Schema::create('customer_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('review_invite_id')->nullable()->constrained('review_invites')->nullOnDelete();
            $table->string('name');
            $table->string('city')->nullable();
            $table->unsignedTinyInteger('rating');
            $table->text('text');
            $table->string('status', 20)->default('pending');
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index('status');
            $table->index('approved_at');
            $table->index('submitted_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customer_reviews');
        Schema::dropIfExists('review_invites');
    }
};
