<?php

namespace App\Http\Controllers;

use App\Models\Scooter;
use App\Support\SiteSettings;
use Inertia\Inertia;
use Inertia\Response;

class SalesController extends Controller
{
    private const TYPES = [
        'fiets' => [
            'section' => 'sales-bike',
            'label' => 'Fiets',
            'icon' => '🚴',
        ],
        'e-bike' => [
            'section' => 'sales-ebike',
            'label' => 'E-bike',
            'icon' => '⚡',
        ],
        'fatbike' => [
            'section' => 'sales-fatbike',
            'label' => 'Fatbike',
            'icon' => '🚲',
        ],
        'scooter' => [
            'section' => 'sales-scooter',
            'label' => 'Scooter',
            'icon' => '🛵',
        ],
    ];

    public function show(string $type): Response
    {
        $definition = self::TYPES[$type] ?? null;

        abort_unless($definition !== null, 404);

        $scooters = collect();

        if ($type === 'scooter') {
            $scooters = Scooter::with(['brand', 'scooterModel', 'photos'])
                ->where('ready_for_sale', true)
                ->where('status', 'te_koop')
                ->latest()
                ->take(6)
                ->get()
                ->map(fn (Scooter $s) => [
                    'id' => $s->id,
                    'naam' => $s->display_name,
                    'prijs' => (float) $s->expected_sale_price,
                    'foto' => $s->primaryPhoto()?->url,
                    'year' => $s->year,
                    'mileage' => $s->mileage,
                ])
                ->values();
        }

        return Inertia::render('sales/show', [
            'type' => [
                'slug' => $type,
                'label' => $definition['label'],
                'icon' => $definition['icon'],
            ],
            'settings' => SiteSettings::values($definition['section']),
            'scooters' => $scooters,
        ]);
    }
}
