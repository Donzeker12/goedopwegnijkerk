<?php

namespace App\Support;

use App\Models\PushSubscription;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Minishlink\WebPush\Subscription;
use Minishlink\WebPush\WebPush;

class WebPushNotifier
{
    /**
     * @param array<string, mixed> $payload
     */
    public static function broadcastToAdmins(array $payload): void
    {
        if (!config('push.enabled')) {
            return;
        }

        $publicKey = (string) config('push.vapid.public_key');
        $privateKey = (string) config('push.vapid.private_key');

        if ($publicKey === '' || $privateKey === '') {
            return;
        }

        if (!self::passesDebounce($payload)) {
            return;
        }

        $subscriptions = PushSubscription::query()
            ->whereHas('user', fn ($query) => $query->where('is_admin', true))
            ->get();

        if ($subscriptions->isEmpty()) {
            return;
        }

        $webPush = new WebPush([
            'VAPID' => [
                'subject' => (string) config('push.vapid.subject', config('app.url')),
                'publicKey' => $publicKey,
                'privateKey' => $privateKey,
            ],
        ]);

        unset($payload['debounce_key'], $payload['cooldown_seconds']);

        $encodedPayload = json_encode($payload, JSON_UNESCAPED_UNICODE);
        if ($encodedPayload === false) {
            return;
        }

        foreach ($subscriptions as $subscription) {
            $webPush->queueNotification(
                Subscription::create([
                    'endpoint' => $subscription->endpoint,
                    'contentEncoding' => $subscription->content_encoding,
                    'keys' => [
                        'p256dh' => $subscription->public_key,
                        'auth' => $subscription->auth_token,
                    ],
                ]),
                $encodedPayload
            );
        }

        foreach ($webPush->flush() as $report) {
            $endpoint = $report->getRequest()->getUri()->__toString();

            if ($report->isSuccess()) {
                PushSubscription::query()->where('endpoint', $endpoint)->update(['last_used_at' => now()]);
                continue;
            }

            PushSubscription::query()->where('endpoint', $endpoint)->delete();
            Log::warning('Web push failed for subscription', [
                'endpoint' => $endpoint,
                'reason' => $report->getReason(),
            ]);
        }
    }

    /**
     * @param array<string, mixed> $payload
     */
    private static function passesDebounce(array $payload): bool
    {
        $debounceKey = trim((string) ($payload['debounce_key'] ?? $payload['tag'] ?? ''));
        if ($debounceKey === '') {
            return true;
        }

        $cooldownSeconds = isset($payload['cooldown_seconds'])
            ? max(0, (int) $payload['cooldown_seconds'])
            : max(0, (int) config('push.default_cooldown_seconds', 20));

        if ($cooldownSeconds === 0) {
            return true;
        }

        return Cache::add('push:debounce:' . $debounceKey, now()->timestamp, $cooldownSeconds);
    }
}
