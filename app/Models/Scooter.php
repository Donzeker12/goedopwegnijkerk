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
        'custom_title',
        'purchase_price',
        'expected_sale_price',
        'actual_sale_price',
        'sold_at',
        'purchase_receipt_path',
        'description',
        'year',
        'mileage',
        'color',
        'kenteken',
        'status',
        'ready_for_sale',
        'warranty_months',
        'delivery_service_included',
        'inspection_points',
        'review_score',
        'review_count',
        'warranty_document',
        'maintenance_document',
    ];

    protected $casts = [
        'purchase_price' => 'decimal:2',
        'expected_sale_price' => 'decimal:2',
        'actual_sale_price' => 'decimal:2',
        'sold_at' => 'date',
        'ready_for_sale' => 'boolean',
        'delivery_service_included' => 'boolean',
        'review_score' => 'decimal:1',
        'warranty_document' => 'array',
        'maintenance_document' => 'array',
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

    public function purchases(): HasMany
    {
        return $this->hasMany(PurchaseEntry::class);
    }

    public function colorRequests(): HasMany
    {
        return $this->hasMany(ScooterColorRequest::class);
    }

    public function views(): HasMany
    {
        return $this->hasMany(ScooterView::class);
    }

    public function testRideRequests(): HasMany
    {
        return $this->hasMany(ScooterTestRideRequest::class);
    }

    public function favorites(): HasMany
    {
        return $this->hasMany(Favorite::class);
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

    public function getActualProfitAttribute(): ?float
    {
        if ($this->actual_sale_price === null) {
            return null;
        }

        return (float) $this->actual_sale_price - $this->total_investment;
    }

    public function getDisplayNameAttribute(): string
    {
        $customTitle = trim((string) ($this->custom_title ?? ''));
        if ($customTitle !== '') {
            return $customTitle;
        }

        return $this->brand->name . ' ' . $this->scooterModel->name . ($this->year ? ' (' . $this->year . ')' : '');
    }
}
