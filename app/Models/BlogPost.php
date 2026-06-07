<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class BlogPost extends Model
{
    protected $fillable = [
        'title',
        'slug',
        'excerpt',
        'content',
        'is_published',
        'published_at',
    ];

    protected $casts = [
        'is_published' => 'boolean',
        'published_at' => 'datetime',
    ];

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    public function photos(): HasMany
    {
        return $this->hasMany(BlogPhoto::class)->orderBy('sort_order')->orderBy('id');
    }

    public function coverPhoto(): HasOne
    {
        return $this->hasOne(BlogPhoto::class)->where('is_cover', true);
    }
}
