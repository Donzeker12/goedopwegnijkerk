<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ScooterPart extends Model
{
    protected $fillable = [
        'scooter_id',
        'name',
        'part_brand',
        'specification',
        'quantity',
        'minimum_stock',
        'procurement_status',
        'category',
        'cost',
        'purchased_at',
        'placed_at',
        'notes',
        'receipt_path',
    ];

    protected $casts = [
        'cost' => 'decimal:2',
        'purchased_at' => 'date',
        'placed_at' => 'date',
        'quantity' => 'integer',
        'minimum_stock' => 'integer',
    ];

    public function getTotalCostAttribute(): float
    {
        return (float) $this->cost * $this->quantity;
    }

    public function scooter(): BelongsTo
    {
        return $this->belongsTo(Scooter::class);
    }

    public function purchases(): HasMany
    {
        return $this->hasMany(PurchaseEntry::class);
    }
}
