<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ChatSession extends Model
{
    protected $fillable = [
        'token',
        'name',
        'email',
        'phone',
        'preferred_channel',
        'best_time',
        'source',
        'page',
        'scooter_id',
        'status',
        'last_message_at',
        'closed_at',
    ];

    protected $casts = [
        'last_message_at' => 'datetime',
        'closed_at' => 'datetime',
    ];

    public function messages(): HasMany
    {
        return $this->hasMany(ChatMessage::class)->orderBy('created_at');
    }

    public function scooter(): BelongsTo
    {
        return $this->belongsTo(Scooter::class);
    }

    public static function autoCloseInactive(): int
    {
        $days = max(1, (int) config('chat.auto_close_days', 7));
        $cutoff = now()->subDays($days);

        return static::query()
            ->where(function ($query) {
                $query->where('status', 'nieuw')
                    ->orWhere('status', 'open');
            })
            ->where(function ($query) use ($cutoff) {
                $query->where('last_message_at', '<=', $cutoff)
                    ->orWhere(function ($innerQuery) use ($cutoff) {
                        $innerQuery->whereNull('last_message_at')
                            ->where('created_at', '<=', $cutoff);
                    });
            })
            ->update([
                'status' => 'gesloten',
                'closed_at' => now(),
            ]);
    }
}
