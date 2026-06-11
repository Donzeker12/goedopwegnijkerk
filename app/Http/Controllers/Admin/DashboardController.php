<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PurchaseEntry;
use App\Models\Scooter;
use App\Models\ScooterColorRequest;
use App\Models\ScooterTestRideRequest;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $scooters = Scooter::with(['brand', 'scooterModel', 'parts'])
            ->withCount('views')
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
                    'echte_verkoopprijs' => $scooter->actual_sale_price ? (float) $scooter->actual_sale_price : null,
                    'netto_winst' => $scooter->projected_profit,
                    'netto_winst_echt' => $scooter->actual_profit,
                    'ready_for_sale' => $scooter->ready_for_sale,
                    'views_count' => (int) $scooter->views_count,
                ];
            });

        $categoryTotals = [
            'scooter' => (float) PurchaseEntry::query()->where('category', 'scooter')->sum('amount'),
            'onderdeel' => (float) PurchaseEntry::query()->where('category', 'onderdeel')->sum('amount'),
            'overig' => (float) PurchaseEntry::query()->where('category', 'overig')->sum('amount'),
        ];

        $expectedProfitStock = $scooters
            ->whereIn('status', ['in_reparatie', 'te_koop'])
            ->whereNotNull('netto_winst')
            ->sum('netto_winst');

        $openPayments = [
            'count' => PurchaseEntry::query()->where('payment_status', 'open')->count('*'),
            'total' => (float) PurchaseEntry::query()->where('payment_status', 'open')->sum('amount'),
        ];

        $totals = [
            'totale_investering' => $scooters->sum('totale_investering'),
            'verwachte_omzet' => $scooters->whereNotNull('verwachte_verkoopprijs')->sum('verwachte_verkoopprijs'),
            'verwachte_winst' => $scooters->whereNotNull('netto_winst')->sum('netto_winst'),
            'verwachte_winst_actuele_voorraad' => $expectedProfitStock,
            'aantal_te_koop' => $scooters->where('status', 'te_koop')->count(),
            'aantal_verkocht' => $scooters->where('status', 'verkocht')->count(),
            'aantal_in_reparatie' => $scooters->where('status', 'in_reparatie')->count(),
            'open_betalingen_aantal' => $openPayments['count'],
            'open_betalingen_totaal' => $openPayments['total'],
            'inkoop_per_categorie' => $categoryTotals,
        ];

        $colorRequests = ScooterColorRequest::with(['scooter.brand', 'scooter.scooterModel'])
            ->latest('id')
            ->limit(20)
            ->get()
            ->map(fn (ScooterColorRequest $request) => [
                'id' => $request->id,
                'customer_name' => $request->customer_name,
                'customer_email' => $request->customer_email,
                'customer_phone' => $request->customer_phone,
                'primary_color' => $request->primary_color,
                'accent_color' => $request->accent_color,
                'status' => $request->status,
                'notes' => $request->notes,
                'created_at' => $request->created_at?->format('Y-m-d H:i'),
                'scooter_id' => $request->scooter?->id,
                'scooter_name' => $request->scooter?->display_name,
            ]);

        $testRideRequests = ScooterTestRideRequest::with(['scooter.brand', 'scooter.scooterModel'])
            ->latest('id')
            ->limit(20)
            ->get()
            ->map(fn (ScooterTestRideRequest $request) => [
                'id' => $request->id,
                'customer_name' => $request->customer_name,
                'customer_email' => $request->customer_email,
                'customer_phone' => $request->customer_phone,
                'preferred_date' => $request->preferred_date?->format('Y-m-d'),
                'preferred_time' => $request->preferred_time,
                'contact_preference' => $request->contact_preference,
                'status' => $request->status,
                'notes' => $request->notes,
                'created_at' => $request->created_at?->format('Y-m-d H:i'),
                'scooter_id' => $request->scooter?->id,
                'scooter_name' => $request->scooter?->display_name,
            ]);

        return Inertia::render('admin/dashboard', [
            'scooters' => $scooters,
            'totals' => $totals,
            'color_requests' => $colorRequests,
            'new_color_requests_count' => (int) ScooterColorRequest::query()->where('status', 'nieuw')->count('*'),
            'test_ride_requests' => $testRideRequests,
            'new_test_ride_requests_count' => (int) ScooterTestRideRequest::query()->where('status', 'nieuw')->count('*'),
            'total_scooter_views' => (int) $scooters->sum('views_count'),
        ]);
    }
}
