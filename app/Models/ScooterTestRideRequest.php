<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ScooterTestRideRequest extends Model
{
    protected $fillable = [
        'scooter_id',
        'customer_name',
        'customer_email',
        'customer_phone',
        'preferred_date',
        'preferred_time',
        'contact_preference',
        'status',
        'notes',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'preferred_date' => 'date',
    ];

    public function scooter(): BelongsTo
    {
        return $this->belongsTo(Scooter::class);
    }
}
