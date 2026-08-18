<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MaintenanceJob extends Model
{
    protected $fillable = [
        'invoice_number',
        'service_type',
        'complaint',
        'status',
        'customer_name',
        'customer_phone',
        'customer_email',
        'customer_address',
        'scooter_brand',
        'scooter_model',
        'license_plate',
        'mileage',
        'performed_at',
        'checklist',
        'parts',
        'labor_cost',
        'vat_rate',
        'notes',
    ];

    protected $casts = [
        'performed_at' => 'date',
        'checklist' => 'array',
        'parts' => 'array',
        'labor_cost' => 'decimal:2',
        'vat_rate' => 'decimal:2',
        'mileage' => 'integer',
    ];

    public function getPartsTotalAttribute(): float
    {
        return collect($this->parts ?? [])
            ->sum(fn (array $line) => (float) ($line['quantity'] ?? 0) * (float) ($line['unit_price'] ?? 0));
    }

    public function getPartsCostAttribute(): float
    {
        return collect($this->parts ?? [])
            ->sum(fn (array $line) => (float) ($line['quantity'] ?? 0) * (float) ($line['cost_price'] ?? 0));
    }

    public function getSubtotalAttribute(): float
    {
        return round($this->parts_total + (float) $this->labor_cost, 2);
    }

    public function getVatAmountAttribute(): float
    {
        return round($this->subtotal * ((float) $this->vat_rate / 100), 2);
    }

    public function getTotalAmountAttribute(): float
    {
        return round($this->subtotal + $this->vat_amount, 2);
    }

    public function getProfitAttribute(): float
    {
        return round($this->subtotal - $this->parts_cost, 2);
    }
}
