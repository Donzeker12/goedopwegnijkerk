<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Carbon;

class ReviewInvite extends Model
{
    protected $fillable = [
        'token',
        'created_by',
        'expires_at',
        'used_at',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'used_at' => 'datetime',
    ];

    public function review(): HasOne
    {
        return $this->hasOne(CustomerReview::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function isExpired(): bool
    {
        return $this->expires_at !== null && $this->expires_at->isPast();
    }

    public function isUsable(): bool
    {
        return $this->used_at === null && ! $this->isExpired();
    }

    public function markUsed(): void
    {
        if ($this->used_at !== null) {
            return;
        }

        $this->forceFill([
            'used_at' => Carbon::now(),
        ])->save();
    }
}
