<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ScooterPart extends Model
{
    protected $fillable = [
        'scooter_id',
        'name',
        'part_brand',
        'specification',
        'quantity',
        'category',
        'cost',
        'purchased_at',
        'notes',
    ];

    protected $casts = [
        'cost' => 'decimal:2',
        'purchased_at' => 'date',
        'quantity' => 'integer',
    ];

    public function getTotalCostAttribute(): float
    {
        return (float) $this->cost * $this->quantity;
    }

    public function scooter(): BelongsTo
    {
        return $this->belongsTo(Scooter::class);
    }
}
