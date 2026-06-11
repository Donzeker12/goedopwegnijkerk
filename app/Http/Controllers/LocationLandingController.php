<?php

namespace App\Http\Controllers;

use App\Models\Scooter;
use Inertia\Inertia;
use Inertia\Response;

class LocationLandingController extends Controller
{
    public function show(string $city): Response
    {
        $cityPages = collect(config('seo.city_pages', []));
        $cityData = $cityPages->get($city);

        if (!$cityData) {
            abort(404);
        }

        $scooters = Scooter::with(['brand', 'scooterModel', 'photos'])
            ->where('ready_for_sale', true)
            ->where('status', 'te_koop')
            ->latest()
            ->take(6)
            ->get()
            ->map(fn (Scooter $scooter) => [
                'id' => $scooter->id,
                'naam' => $scooter->display_name,
                'prijs' => (float) $scooter->expected_sale_price,
                'foto' => $scooter->primaryPhoto()?->url,
                'year' => $scooter->year,
                'mileage' => $scooter->mileage,
            ]);

        return Inertia::render('seo/location', [
            'city' => [
                'slug' => $city,
                'name' => $cityData['name'],
                'distance' => $cityData['distance'],
                'keywords' => $cityData['keywords'],
            ],
            'scooters' => $scooters,
            'business' => config('seo.business'),
        ]);
    }
}
