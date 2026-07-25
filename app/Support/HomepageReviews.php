<?php

namespace App\Support;

use App\Models\PageContent;

class HomepageReviews
{
    private const PAGE_SLUG = 'site-settings-home-reviews';

    public static function values(): array
    {
        $page = PageContent::where('slug', self::PAGE_SLUG)->first();
        $stored = json_decode((string) ($page?->content ?? ''), true);

        if (! is_array($stored)) {
            return self::defaults();
        }

        return self::mergeValues(self::defaults(), $stored);
    }

    public static function save(array $values): void
    {
        PageContent::updateOrCreate(
            ['slug' => self::PAGE_SLUG],
            [
                'title' => 'Homepage reviews',
                'content' => json_encode(self::normalizeValues($values), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
            ]
        );
    }

    private static function defaults(): array
    {
        return [
            'eyebrow' => 'Reviews',
            'title' => 'Wat klanten over ons zeggen',
            'description' => 'Deze reviews worden door ons team handmatig beheerd.',
            'items' => [],
        ];
    }

    private static function mergeValues(array $defaults, array $stored): array
    {
        $merged = $defaults;

        foreach ($stored as $key => $value) {
            if ($key === 'items' && is_array($value)) {
                $merged[$key] = self::normalizeItems($value);
                continue;
            }

            if (is_scalar($value) || $value === null) {
                $merged[$key] = trim((string) $value);
            }
        }

        return $merged;
    }

    private static function normalizeValues(array $values): array
    {
        return [
            'eyebrow' => trim((string) ($values['eyebrow'] ?? 'Reviews')),
            'title' => trim((string) ($values['title'] ?? 'Wat klanten over ons zeggen')),
            'description' => trim((string) ($values['description'] ?? '')),
            'items' => self::normalizeItems(is_array($values['items'] ?? null) ? $values['items'] : []),
        ];
    }

    private static function normalizeItems(array $items): array
    {
        return collect($items)
            ->map(function ($item) {
                $rating = (int) ($item['rating'] ?? 5);

                return [
                    'name' => trim((string) ($item['name'] ?? '')),
                    'city' => trim((string) ($item['city'] ?? '')),
                    'rating' => (string) max(1, min(5, $rating)),
                    'text' => trim((string) ($item['text'] ?? '')),
                ];
            })
            ->values()
            ->all();
    }
}