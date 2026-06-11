<?php

namespace App\Support;

use App\Models\PageContent;
use InvalidArgumentException;

class SiteSettings
{
    public static function definitions(): array
    {
        return config('site_settings.sections', []);
    }

    public static function navigation(): array
    {
        return collect(self::definitions())
            ->map(fn (array $definition, string $slug) => [
                'slug' => $slug,
                'title' => $definition['title'],
                'description' => $definition['description'] ?? '',
                'preview_url' => $definition['preview_url'] ?? null,
            ])
            ->values()
            ->all();
    }

    public static function firstSectionSlug(): ?string
    {
        return array_key_first(self::definitions());
    }

    public static function section(string $slug): array
    {
        $definition = self::definitions()[$slug] ?? null;

        if (! $definition) {
            throw new InvalidArgumentException("Unknown site settings section [{$slug}].");
        }

        return [
            'slug' => $slug,
            'title' => $definition['title'],
            'description' => $definition['description'] ?? '',
            'preview_url' => $definition['preview_url'] ?? null,
            'fields' => $definition['fields'] ?? [],
            'values' => self::values($slug),
        ];
    }

    public static function values(string $slug): array
    {
        $definition = self::definitions()[$slug] ?? null;

        if (! $definition) {
            throw new InvalidArgumentException("Unknown site settings section [{$slug}].");
        }

        $defaults = $definition['defaults'] ?? [];
        $page = PageContent::where('slug', self::pageSlug($slug))->first();
        $stored = json_decode((string) ($page?->content ?? ''), true);

        if (! is_array($stored)) {
            return $defaults;
        }

        return self::mergeValues($defaults, $stored);
    }

    public static function many(array $slugs): array
    {
        $result = [];

        foreach ($slugs as $slug) {
            $result[$slug] = self::values($slug);
        }

        return $result;
    }

    public static function save(string $slug, array $values): void
    {
        $section = self::section($slug);
        $normalized = self::normalizeValues($section['fields'], $values, $section['values']);

        PageContent::updateOrCreate(
            ['slug' => self::pageSlug($slug)],
            [
                'title' => $section['title'],
                'content' => json_encode($normalized, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
            ]
        );
    }

    private static function pageSlug(string $slug): string
    {
        return 'site-settings-' . $slug;
    }

    private static function mergeValues(array $defaults, array $stored): array
    {
        $merged = $defaults;

        foreach ($stored as $key => $value) {
            if (is_array($value) && isset($defaults[$key]) && is_array($defaults[$key]) && ! array_is_list($value) && ! array_is_list($defaults[$key])) {
                $merged[$key] = self::mergeValues($defaults[$key], $value);
                continue;
            }

            $merged[$key] = $value;
        }

        return $merged;
    }

    private static function normalizeValues(array $fields, array $values, array $fallbacks): array
    {
        $normalized = [];

        foreach ($fields as $field) {
            $key = $field['key'];
            $type = $field['type'];
            $value = $values[$key] ?? ($fallbacks[$key] ?? null);

            if ($type === 'repeater') {
                $normalized[$key] = collect(is_array($value) ? $value : [])
                    ->map(function ($item) use ($field) {
                        $result = [];

                        foreach ($field['fields'] as $subField) {
                            $subKey = $subField['key'];
                            $result[$subKey] = is_array($item) ? (string) ($item[$subKey] ?? '') : '';
                        }

                        return $result;
                    })
                    ->values()
                    ->all();

                continue;
            }

            $normalized[$key] = is_scalar($value) ? trim((string) $value) : '';
        }

        return $normalized;
    }
}
