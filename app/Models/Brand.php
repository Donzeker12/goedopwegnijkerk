<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Brand extends Model
{
    protected $fillable = ['name'];

    public function scooterModels(): HasMany
    {
        return $this->hasMany(ScooterModel::class);
    }

    public function scooters(): HasMany
    {
        return $this->hasMany(Scooter::class);
    }
}
