<?php

namespace App\Http\Controllers;

use App\Support\SiteSettings;
use Inertia\Inertia;
use Inertia\Response;

class MaintenanceController extends Controller
{
    private const TYPES = [
        'fiets' => [
            'section' => 'maintenance-bike',
            'label' => 'Fiets',
            'icon' => '🚴',
        ],
        'e-bike' => [
            'section' => 'maintenance-ebike',
            'label' => 'E-bike',
            'icon' => '⚡',
        ],
        'fatbike' => [
            'section' => 'maintenance-fatbike',
            'label' => 'Fatbike',
            'icon' => '🚲',
        ],
        'scooter' => [
            'section' => 'maintenance-scooter',
            'label' => 'Scooter',
            'icon' => '🛵',
        ],
    ];

    public function show(string $type): Response
    {
        $definition = self::TYPES[$type] ?? null;

        abort_unless($definition !== null, 404);

        $settings = SiteSettings::values($definition['section']);
        $settings['hero_image'] = self::resolveImageUrl((string) ($settings['hero_image'] ?? ''));

        return Inertia::render('maintenance/show', [
            'type' => [
                'slug' => $type,
                'label' => $definition['label'],
                'icon' => $definition['icon'],
            ],
            'settings' => $settings,
        ]);
    }

    private static function resolveImageUrl(string $value): string
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
