<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Scooter extends Model
{
    protected $fillable = [
        'brand_id',
        'scooter_model_id',
        'purchase_price',
        'expected_sale_price',
        'description',
        'year',
        'mileage',
        'color',
        'kenteken',
        'status',
        'ready_for_sale',
    ];

    protected $casts = [
        'purchase_price' => 'decimal:2',
        'expected_sale_price' => 'decimal:2',
        'ready_for_sale' => 'boolean',
    ];

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    public function scooterModel(): BelongsTo
    {
        return $this->belongsTo(ScooterModel::class);
    }

    public function parts(): HasMany
    {
        return $this->hasMany(ScooterPart::class);
    }

    public function photos(): HasMany
    {
        return $this->hasMany(ScooterPhoto::class)->orderBy('sort_order');
    }

    public function primaryPhoto(): ?ScooterPhoto
    {
        return $this->photos()->where('is_primary', true)->first()
            ?? $this->photos()->first();
    }

    public function getTotalPartsCostAttribute(): float
    {
        // cost * quantity per part
        return (float) $this->parts()->selectRaw('SUM(cost * quantity) as total')->value('total') ?? 0;
    }

    public function getTotalInvestmentAttribute(): float
    {
        return (float) $this->purchase_price + $this->total_parts_cost;
    }

    public function getProjectedProfitAttribute(): ?float
    {
        if ($this->expected_sale_price === null) {
            return null;
        }

        return (float) $this->expected_sale_price - $this->total_investment;
    }

    public function getDisplayNameAttribute(): string
    {
        return $this->brand->name . ' ' . $this->scooterModel->name . ($this->year ? ' (' . $this->year . ')' : '');
    }
}
