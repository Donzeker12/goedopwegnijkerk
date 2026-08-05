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

        return Inertia::render('maintenance/show', [
            'type' => [
                'slug' => $type,
                'label' => $definition['label'],
                'icon' => $definition['icon'],
            ],
            'settings' => SiteSettings::values($definition['section']),
        ]);
    }
}
