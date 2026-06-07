<?php

namespace App\Http\Controllers;

use App\Models\Scooter;
use Inertia\Inertia;
use Inertia\Response;

class ShopController extends Controller
{
    public function index(): Response
    {
        $scooters = Scooter::with(['brand', 'scooterModel', 'photos'])
            ->where('ready_for_sale', true)
            ->where('status', 'te_koop')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn (Scooter $s) => [
                'id' => $s->id,
                'naam' => $s->display_name,
                'merk' => $s->brand->name,
                'model' => $s->scooterModel->name,
                'prijs' => (float) $s->expected_sale_price,
                'status' => $s->status,
                'foto' => $s->primaryPhoto()?->url,
                'year' => $s->year,
                'mileage' => $s->mileage,
                'color' => $s->color,
                'description' => $s->description,
            ]);

        return Inertia::render('shop/index', [
            'scooters' => $scooters,
        ]);
    }

    public function show(Scooter $scooter): Response
    {
        if (!$scooter->ready_for_sale || $scooter->status !== 'te_koop') {
            abort(404);
        }

        $scooter->load(['brand', 'scooterModel', 'photos']);

        return Inertia::render('shop/show', [
            'scooter' => [
                'id' => $scooter->id,
                'naam' => $scooter->display_name,
                'merk' => $scooter->brand->name,
                'model' => $scooter->scooterModel->name,
                'prijs' => (float) $scooter->expected_sale_price,
                'year' => $scooter->year,
                'mileage' => $scooter->mileage,
                'color' => $scooter->color,
                'kenteken' => $scooter->kenteken,
                'description' => $scooter->description,
                'status' => $scooter->status,
                'photos' => $scooter->photos->map(fn ($ph) => [
                    'id' => $ph->id,
                    'url' => $ph->url,
                    'is_primary' => $ph->is_primary,
                ]),
            ],
        ]);
    }
}
