<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\PurchaseEntry;
use App\Models\Scooter;
use App\Models\ScooterPart;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ScooterController extends Controller
{
    public function index(): Response
    {
        $scooters = Scooter::with(['brand', 'scooterModel', 'parts', 'photos'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn (Scooter $s) => [
                'id' => $s->id,
                'naam' => $s->display_name,
                'status' => $s->status,
                'inkoopprijs' => (float) $s->purchase_price,
                'verwachte_verkoopprijs' => $s->expected_sale_price ? (float) $s->expected_sale_price : null,
                'echte_verkoopprijs' => $s->actual_sale_price ? (float) $s->actual_sale_price : null,
                'onderdelen_kosten' => $s->total_parts_cost,
                'verwachte_winst' => $s->projected_profit,
                'echte_winst' => $s->actual_profit,
                'ready_for_sale' => $s->ready_for_sale,
                'foto' => $s->primaryPhoto()?->url,
            ]);

        return Inertia::render('admin/scooters/index', [
            'scooters' => $scooters,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/scooters/create', [
            'brands' => Brand::with('scooterModels')->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        if (! $request->user()?->canManageScooters()) {
            abort(403, 'Geen rechten om scooters te beheren.');
        }

        $validated = $request->validate([
            'brand_id' => ['required', 'exists:brands,id'],
            'scooter_model_id' => ['required', 'exists:scooter_models,id'],
            'purchase_price' => ['required', 'numeric', 'min:0'],
            'expected_sale_price' => ['nullable', 'numeric', 'min:0'],
            'actual_sale_price' => ['nullable', 'numeric', 'min:0'],
            'sold_at' => ['nullable', 'date'],
            'purchase_receipt' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp,pdf', 'max:10240'],
            'description' => ['nullable', 'string', 'max:2000'],
            'year' => ['nullable', 'integer', 'min:1990', 'max:2030'],
            'mileage' => ['nullable', 'integer', 'min:0'],
            'color' => ['nullable', 'string', 'max:100'],
            'kenteken' => ['nullable', 'string', 'max:20'],
            'status' => ['required', 'in:in_reparatie,te_koop,verkocht'],
            'ready_for_sale' => ['boolean'],
            'warranty_months' => ['nullable', 'integer', 'min:0', 'max:24'],
            'delivery_service_included' => ['boolean'],
            'inspection_points' => ['nullable', 'integer', 'min:0', 'max:100'],
            'review_score' => ['nullable', 'numeric', 'min:0', 'max:5'],
            'review_count' => ['nullable', 'integer', 'min:0', 'max:9999'],
        ]);

        if ($request->hasFile('purchase_receipt')) {
            $validated['purchase_receipt_path'] = $request->file('purchase_receipt')->store('receipts/scooters', 'public');
        }

        unset($validated['purchase_receipt']);

        if (($validated['status'] ?? null) !== 'verkocht') {
            $validated['sold_at'] = null;
        }

        $scooter = Scooter::create($validated);

        PurchaseEntry::create([
            'scooter_id' => $scooter->id,
            'category' => 'scooter',
            'description' => 'Inkoop scooter: ' . $scooter->display_name,
            'amount' => $scooter->purchase_price,
            'purchased_at' => now()->toDateString(),
            'payment_status' => 'open',
            'receipt_path' => $scooter->purchase_receipt_path,
        ]);

        return redirect()->route('admin.scooters.edit', $scooter)
            ->with('success', 'Scooter succesvol aangemaakt!');
    }

    public function edit(Scooter $scooter): Response
    {
        $scooter->load(['brand', 'scooterModel', 'parts', 'photos']);

        $daysOnline = ($scooter->ready_for_sale && $scooter->status === 'te_koop')
            ? (int) $scooter->created_at->diffInDays(now())
            : null;

        $recentViews = $scooter->views()->where('created_at', '>=', now()->subDays(14))->count();
        $recentTestRideRequests = $scooter->testRideRequests()->where('created_at', '>=', now()->subDays(14))->count();

        $pricingHint = null;
        if ($daysOnline !== null && $daysOnline >= 45 && $recentTestRideRequests === 0) {
            $pricingHint = [
                'level' => 'high',
                'title' => 'Prijsreview geadviseerd',
                'message' => 'Deze scooter staat al ' . $daysOnline . ' dagen online zonder recente proefrit-aanvragen. Overweeg 3-5% prijsaanpassing of sterkere presentatie.',
            ];
        } elseif ($daysOnline !== null && $daysOnline >= 30 && $recentViews < 25) {
            $pricingHint = [
                'level' => 'medium',
                'title' => 'Aandachtspunt: lage tractie',
                'message' => 'Deze scooter staat ' . $daysOnline . ' dagen online met beperkt verkeer. Overweeg betere foto\'s, sterkere omschrijving of kleine prijsoptimalisatie.',
            ];
        }

        $productTemplates = ScooterPart::query()
            ->select(['name', 'part_brand', 'specification', 'category', 'cost'])
            ->where('name', '!=', '')
            ->orderByDesc('id')
            ->get()
            ->unique(fn (ScooterPart $part) => mb_strtolower(
                trim($part->name) . '|' . trim((string) $part->part_brand) . '|' . trim((string) $part->specification)
            ))
            ->take(120)
            ->values()
            ->map(fn (ScooterPart $part) => [
                'name' => $part->name,
                'part_brand' => $part->part_brand,
                'specification' => $part->specification,
                'category' => $part->category,
                'cost' => (float) $part->cost,
            ]);

        return Inertia::render('admin/scooters/edit', [
            'scooter' => [
                'id' => $scooter->id,
                'brand_id' => $scooter->brand_id,
                'scooter_model_id' => $scooter->scooter_model_id,
                'purchase_price' => (float) $scooter->purchase_price,
                'expected_sale_price' => $scooter->expected_sale_price ? (float) $scooter->expected_sale_price : null,
                'actual_sale_price' => $scooter->actual_sale_price ? (float) $scooter->actual_sale_price : null,
                'sold_at' => $scooter->sold_at?->format('Y-m-d'),
                'description' => $scooter->description,
                'year' => $scooter->year,
                'mileage' => $scooter->mileage,
                'color' => $scooter->color,
                'kenteken' => $scooter->kenteken,
                'status' => $scooter->status,
                'ready_for_sale' => $scooter->ready_for_sale,
                'warranty_months' => $scooter->warranty_months,
                'delivery_service_included' => $scooter->delivery_service_included,
                'inspection_points' => $scooter->inspection_points,
                'review_score' => $scooter->review_score !== null ? (float) $scooter->review_score : null,
                'review_count' => $scooter->review_count,
                'naam' => $scooter->display_name,
                'onderdelen_kosten' => $scooter->total_parts_cost,
                'totale_investering' => $scooter->total_investment,
                'netto_winst' => $scooter->projected_profit,
                'netto_winst_echt' => $scooter->actual_profit,
                'purchase_receipt_url' => $scooter->purchase_receipt_path ? asset('storage/' . $scooter->purchase_receipt_path) : null,
                'parts' => $scooter->parts->map(fn ($p) => [
                    'id' => $p->id,
                    'name' => $p->name,
                    'part_brand' => $p->part_brand,
                    'specification' => $p->specification,
                    'quantity' => $p->quantity,
                    'minimum_stock' => $p->minimum_stock,
                    'procurement_status' => $p->procurement_status,
                    'category' => $p->category,
                    'cost' => (float) $p->cost,
                    'total_cost' => (float) $p->cost * $p->quantity,
                    'purchased_at' => $p->purchased_at?->format('Y-m-d'),
                    'notes' => $p->notes,
                    'receipt_url' => $p->receipt_path ? asset('storage/' . $p->receipt_path) : null,
                ]),
                'photos' => $scooter->photos->map(fn ($ph) => [
                    'id' => $ph->id,
                    'url' => $ph->url,
                    'is_primary' => $ph->is_primary,
                    'sort_order' => $ph->sort_order,
                ]),
                'pricing_hint' => $pricingHint,
                'days_online' => $daysOnline,
                'recent_views' => $recentViews,
                'recent_test_rides' => $recentTestRideRequests,
            ],
            'brands' => Brand::with('scooterModels')->get(),
            'features' => [
                'loyalty_pass_admin_preview' => (bool) config('features.loyalty_pass_admin_preview', true),
            ],
            'product_templates' => $productTemplates,
        ]);
    }

    public function update(Request $request, Scooter $scooter): RedirectResponse
    {
        if (! $request->user()?->canManageScooters()) {
            abort(403, 'Geen rechten om scooters te beheren.');
        }

        $validated = $request->validate([
            'brand_id' => ['required', 'exists:brands,id'],
            'scooter_model_id' => ['required', 'exists:scooter_models,id'],
            'purchase_price' => ['required', 'numeric', 'min:0'],
            'expected_sale_price' => ['nullable', 'numeric', 'min:0'],
            'actual_sale_price' => ['nullable', 'numeric', 'min:0'],
            'sold_at' => ['nullable', 'date'],
            'purchase_receipt' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp,pdf', 'max:10240'],
            'description' => ['nullable', 'string', 'max:2000'],
            'year' => ['nullable', 'integer', 'min:1990', 'max:2030'],
            'mileage' => ['nullable', 'integer', 'min:0'],
            'color' => ['nullable', 'string', 'max:100'],
            'kenteken' => ['nullable', 'string', 'max:20'],
            'status' => ['required', 'in:in_reparatie,te_koop,verkocht'],
            'ready_for_sale' => ['boolean'],
            'warranty_months' => ['nullable', 'integer', 'min:0', 'max:24'],
            'delivery_service_included' => ['boolean'],
            'inspection_points' => ['nullable', 'integer', 'min:0', 'max:100'],
            'review_score' => ['nullable', 'numeric', 'min:0', 'max:5'],
            'review_count' => ['nullable', 'integer', 'min:0', 'max:9999'],
        ]);

        if ($request->hasFile('purchase_receipt')) {
            if ($scooter->purchase_receipt_path) {
                Storage::disk('public')->delete($scooter->purchase_receipt_path);
            }

            $validated['purchase_receipt_path'] = $request->file('purchase_receipt')->store('receipts/scooters', 'public');
        }

        unset($validated['purchase_receipt']);

        if (($validated['status'] ?? null) !== 'verkocht') {
            $validated['sold_at'] = null;
            $validated['actual_sale_price'] = null;
        } elseif (empty($validated['sold_at'])) {
            $validated['sold_at'] = now()->toDateString();
        }

        $scooter->update($validated);

        $purchase = PurchaseEntry::query()->where('scooter_id', $scooter->id)
            ->where('category', 'scooter')
            ->first();

        if ($purchase) {
            $purchase->update([
                'description' => 'Inkoop scooter: ' . $scooter->display_name,
                'amount' => $scooter->purchase_price,
                'receipt_path' => $scooter->purchase_receipt_path,
            ]);
        }

        return back()->with('success', 'Scooter succesvol bijgewerkt!');
    }

    public function destroy(Scooter $scooter): RedirectResponse
    {
        if (! request()->user()?->canManageScooters()) {
            abort(403, 'Geen rechten om scooters te beheren.');
        }

        // Delete photos from storage
        foreach ($scooter->photos as $photo) {
            Storage::disk('public')->delete($photo->path);
        }

        if ($scooter->purchase_receipt_path) {
            Storage::disk('public')->delete($scooter->purchase_receipt_path);
        }

        Scooter::destroy($scooter->id);

        return redirect()->route('admin.scooters.index')
            ->with('success', 'Scooter verwijderd.');
    }
}
