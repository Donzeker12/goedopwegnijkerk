<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PurchaseEntry extends Model
{
    protected $fillable = [
        'scooter_id',
        'scooter_part_id',
        'category',
        'description',
        'amount',
        'purchased_at',
        'due_date',
        'payment_status',
        'paid_at',
        'receipt_path',
        'notes',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'purchased_at' => 'date',
        'due_date' => 'date',
        'paid_at' => 'date',
    ];

    public function scooter(): BelongsTo
    {
        return $this->belongsTo(Scooter::class);
    }

    public function scooterPart(): BelongsTo
    {
        return $this->belongsTo(ScooterPart::class);
    }
}
