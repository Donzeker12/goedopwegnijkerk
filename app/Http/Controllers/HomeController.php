<?php

namespace App\Http\Controllers;

use App\Models\Scooter;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function index(): Response
    {
        $featured = Scooter::with(['brand', 'scooterModel', 'photos'])
            ->where('ready_for_sale', true)
            ->where('status', 'te_koop')
            ->orderBy('created_at', 'desc')
            ->take(3)
            ->get()
            ->map(fn (Scooter $s) => [
                'id' => $s->id,
                'naam' => $s->display_name,
                'prijs' => (float) $s->expected_sale_price,
                'status' => $s->status,
                'foto' => $s->primaryPhoto()?->url,
                'year' => $s->year,
                'mileage' => $s->mileage,
                'color' => $s->color,
            ]);

        return Inertia::render('home', [
            'featured' => $featured,
        ]);
    }
}
