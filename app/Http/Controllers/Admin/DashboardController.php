<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Scooter;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $scooters = Scooter::with(['brand', 'scooterModel', 'parts'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function (Scooter $scooter) {
                return [
                    'id' => $scooter->id,
                    'naam' => $scooter->display_name,
                    'status' => $scooter->status,
                    'inkoopprijs' => (float) $scooter->purchase_price,
                    'onderdelen_kosten' => $scooter->total_parts_cost,
                    'totale_investering' => $scooter->total_investment,
                    'verwachte_verkoopprijs' => $scooter->expected_sale_price ? (float) $scooter->expected_sale_price : null,
                    'netto_winst' => $scooter->projected_profit,
                    'ready_for_sale' => $scooter->ready_for_sale,
                ];
            });

        $totals = [
            'totale_investering' => $scooters->sum('totale_investering'),
            'verwachte_omzet' => $scooters->whereNotNull('verwachte_verkoopprijs')->sum('verwachte_verkoopprijs'),
            'verwachte_winst' => $scooters->whereNotNull('netto_winst')->sum('netto_winst'),
            'aantal_te_koop' => $scooters->where('status', 'te_koop')->count(),
            'aantal_verkocht' => $scooters->where('status', 'verkocht')->count(),
            'aantal_in_reparatie' => $scooters->where('status', 'in_reparatie')->count(),
        ];

        return Inertia::render('admin/dashboard', [
            'scooters' => $scooters,
            'totals' => $totals,
        ]);
    }
}
