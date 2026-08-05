<?php

namespace App\Support;

class MediaUrl
{
    public static function normalize(string $value): string
    {
        $image = trim($value);

        if ($image === '') {
            return '';
        }

        if (str_starts_with($image, 'http://') || str_starts_with($image, 'https://') || str_starts_with($image, '//')) {
            $path = parse_url($image, PHP_URL_PATH);

            if (is_string($path) && str_starts_with($path, '/storage/')) {
                return $path;
            }

            return $image;
        }

        if (str_starts_with($image, '/')) {
            return $image;
        }

        if (str_starts_with($image, 'storage/')) {
            return '/' . $image;
        }

        if (str_starts_with($image, 'site-settings/') || str_starts_with($image, 'scooters/')) {
            return '/storage/' . $image;
        }

        return '/' . ltrim($image, '/');
    }
}
