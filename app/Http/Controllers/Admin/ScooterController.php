<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Scooter;
use App\Models\ScooterModel;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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
                'onderdelen_kosten' => $s->total_parts_cost,
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
        $validated = $request->validate([
            'brand_id' => ['required', 'exists:brands,id'],
            'scooter_model_id' => ['required', 'exists:scooter_models,id'],
            'purchase_price' => ['required', 'numeric', 'min:0'],
            'expected_sale_price' => ['nullable', 'numeric', 'min:0'],
            'description' => ['nullable', 'string', 'max:2000'],
            'year' => ['nullable', 'integer', 'min:1990', 'max:2030'],
            'mileage' => ['nullable', 'integer', 'min:0'],
            'color' => ['nullable', 'string', 'max:100'],
            'kenteken' => ['nullable', 'string', 'max:20'],
            'status' => ['required', 'in:in_reparatie,te_koop,verkocht'],
            'ready_for_sale' => ['boolean'],
        ]);

        $scooter = Scooter::create($validated);

        return redirect()->route('admin.scooters.edit', $scooter)
            ->with('success', 'Scooter succesvol aangemaakt!');
    }

    public function edit(Scooter $scooter): Response
    {
        $scooter->load(['brand', 'scooterModel', 'parts', 'photos']);

        return Inertia::render('admin/scooters/edit', [
            'scooter' => [
                'id' => $scooter->id,
                'brand_id' => $scooter->brand_id,
                'scooter_model_id' => $scooter->scooter_model_id,
                'purchase_price' => (float) $scooter->purchase_price,
                'expected_sale_price' => $scooter->expected_sale_price ? (float) $scooter->expected_sale_price : null,
                'description' => $scooter->description,
                'year' => $scooter->year,
                'mileage' => $scooter->mileage,
                'color' => $scooter->color,
                'kenteken' => $scooter->kenteken,
                'status' => $scooter->status,
                'ready_for_sale' => $scooter->ready_for_sale,
                'naam' => $scooter->display_name,
                'onderdelen_kosten' => $scooter->total_parts_cost,
                'totale_investering' => $scooter->total_investment,
                'netto_winst' => $scooter->projected_profit,
                'parts' => $scooter->parts->map(fn ($p) => [
                    'id' => $p->id,
                    'name' => $p->name,
                    'part_brand' => $p->part_brand,
                    'specification' => $p->specification,
                    'quantity' => $p->quantity,
                    'category' => $p->category,
                    'cost' => (float) $p->cost,
                    'total_cost' => (float) $p->cost * $p->quantity,
                    'purchased_at' => $p->purchased_at?->format('Y-m-d'),
                    'notes' => $p->notes,
                ]),
                'photos' => $scooter->photos->map(fn ($ph) => [
                    'id' => $ph->id,
                    'url' => $ph->url,
                    'is_primary' => $ph->is_primary,
                    'sort_order' => $ph->sort_order,
                ]),
            ],
            'brands' => Brand::with('scooterModels')->get(),
        ]);
    }

    public function update(Request $request, Scooter $scooter): RedirectResponse
    {
        $validated = $request->validate([
            'brand_id' => ['required', 'exists:brands,id'],
            'scooter_model_id' => ['required', 'exists:scooter_models,id'],
            'purchase_price' => ['required', 'numeric', 'min:0'],
            'expected_sale_price' => ['nullable', 'numeric', 'min:0'],
            'description' => ['nullable', 'string', 'max:2000'],
            'year' => ['nullable', 'integer', 'min:1990', 'max:2030'],
            'mileage' => ['nullable', 'integer', 'min:0'],
            'color' => ['nullable', 'string', 'max:100'],
            'kenteken' => ['nullable', 'string', 'max:20'],
            'status' => ['required', 'in:in_reparatie,te_koop,verkocht'],
            'ready_for_sale' => ['boolean'],
        ]);

        $scooter->update($validated);

        return back()->with('success', 'Scooter succesvol bijgewerkt!');
    }

    public function destroy(Scooter $scooter): RedirectResponse
    {
        // Delete photos from storage
        foreach ($scooter->photos as $photo) {
            \Storage::disk('public')->delete($photo->path);
        }

        $scooter->delete();

        return redirect()->route('admin.scooters.index')
            ->with('success', 'Scooter verwijderd.');
    }
}
