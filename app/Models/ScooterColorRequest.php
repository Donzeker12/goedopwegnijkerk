<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ScooterColorRequest extends Model
{
    protected $fillable = [
        'scooter_id',
        'customer_name',
        'customer_email',
        'customer_phone',
        'primary_color',
        'accent_color',
        'notes',
        'status',
    ];

    public function scooter(): BelongsTo
    {
        return $this->belongsTo(Scooter::class);
    }
}
