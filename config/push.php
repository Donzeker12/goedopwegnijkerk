<?php

return [
    'enabled' => (bool) env('PUSH_ENABLED', false),
    'vapid' => [
        'subject' => env('PUSH_VAPID_SUBJECT', env('APP_URL', 'mailto:admin@example.com')),
        'public_key' => env('PUSH_VAPID_PUBLIC_KEY'),
        'private_key' => env('PUSH_VAPID_PRIVATE_KEY'),
    ],
    'default_cooldown_seconds' => (int) env('PUSH_DEFAULT_COOLDOWN_SECONDS', 20),
    'cooldowns' => [
        'new_chat' => (int) env('PUSH_COOLDOWN_NEW_CHAT_SECONDS', 30),
        'chat_reply' => (int) env('PUSH_COOLDOWN_CHAT_REPLY_SECONDS', 20),
        'color_request' => (int) env('PUSH_COOLDOWN_COLOR_REQUEST_SECONDS', 60),
        'test_ride_request' => (int) env('PUSH_COOLDOWN_TEST_RIDE_SECONDS', 60),
    ],
];
