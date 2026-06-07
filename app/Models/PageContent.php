<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PageContent extends Model
{
    protected $fillable = ['slug', 'title', 'content'];

    public static function forSlug(string $slug): ?self
    {
        return self::where('slug', $slug)->first();
    }
}
