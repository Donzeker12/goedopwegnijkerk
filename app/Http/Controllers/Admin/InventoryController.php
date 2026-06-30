<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PurchaseEntry;
use App\Models\Scooter;
use App\Models\ScooterPart;
use App\Support\PartOrderNotifier;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InventoryController extends Controller
{
    public function index(): Response
    {
        $parts = ScooterPart::with(['scooter.brand', 'scooter.scooterModel'])
            ->orderByRaw('COALESCE(category, "Overig") asc')
            ->orderBy('name')
            ->get();

        $rows = $parts->map(function (ScooterPart $part) {
            $isInStock = $part->procurement_status === 'binnen';
            $stockQuantity = $isInStock ? $part->quantity : 0;
            $stockValue = $isInStock ? (float) $part->total_cost : 0.0;
            $pendingValue = $part->procurement_status !== 'binnen' ? (float) $part->total_cost : 0.0;

            return [
                'id' => $part->id,
                'name' => $part->name,
                'part_brand' => $part->part_brand,
                'category' => $part->category ?: 'Overig',
                'quantity' => $stockQuantity,
                'requested_quantity' => $part->quantity,
                'minimum_stock' => $part->minimum_stock,
                'procurement_status' => $part->procurement_status,
                'unit_cost' => (float) $part->cost,
                'total_value' => $stockValue,
                'pending_value' => $pendingValue,
                'low_stock' => $isInStock && $part->minimum_stock > 0 && $stockQuantity <= $part->minimum_stock,
                'scooter_id' => $part->scooter?->id,
                'scooter_name' => $part->scooter?->display_name,
            ];
        });

        $summary = [
            'distinct_parts' => $rows->count(),
            'total_units' => (int) $rows->sum('quantity'),
            'low_stock_count' => $rows->where('low_stock', true)->count(),
            'total_value' => (float) $rows->sum('total_value'),
            'pending_needed_count' => $rows->where('procurement_status', 'nodig')->count(),
            'pending_ordered_count' => $rows->where('procurement_status', 'besteld')->count(),
            'pending_total_count' => $rows->whereIn('procurement_status', ['nodig', 'besteld'])->count(),
            'pending_needed_units' => (int) $rows->where('procurement_status', 'nodig')->sum('requested_quantity'),
            'pending_ordered_units' => (int) $rows->where('procurement_status', 'besteld')->sum('requested_quantity'),
            'pending_total_units' => (int) $rows->whereIn('procurement_status', ['nodig', 'besteld'])->sum('requested_quantity'),
            'pending_needed_value' => (float) $rows->where('procurement_status', 'nodig')->sum('pending_value'),
            'pending_ordered_value' => (float) $rows->where('procurement_status', 'besteld')->sum('pending_value'),
            'pending_total_value' => (float) $rows->whereIn('procurement_status', ['nodig', 'besteld'])->sum('pending_value'),
            'categories' => [
                'scooter_parts' => $rows->where('category', '!=', 'Overig')->sum('total_value'),
                'overig' => $rows->where('category', 'Overig')->sum('total_value'),
            ],
        ];

        $scooters = Scooter::with(['brand', 'scooterModel'])
            ->orderByDesc('id')
            ->get()
            ->map(fn (Scooter $scooter) => [
                'id' => $scooter->id,
                'naam' => $scooter->display_name,
            ]);

        return Inertia::render('admin/inventory/index', [
            'parts' => $rows,
            'summary' => $summary,
            'scooters' => $scooters,
            'installed_count' => ScooterPart::query()->where('procurement_status', 'geplaatst')->count('*'),
            'can_manage_finance' => (bool) request()->user()?->canManageFinance(),
        ]);
    }

    public function create(): Response
    {
        if (! request()->user()?->canManageFinance()) {
            abort(403, 'Geen rechten om voorraad financieel te beheren.');
        }

        $scooters = Scooter::with(['brand', 'scooterModel'])
            ->orderByDesc('id')
            ->get()
            ->map(fn (Scooter $scooter) => [
                'id' => $scooter->id,
                'naam' => $scooter->display_name,
            ]);

        return Inertia::render('admin/inventory/create', [
            'scooters' => $scooters,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        if (! $request->user()?->canManageFinance()) {
            abort(403, 'Geen rechten om voorraad financieel te beheren.');
        }

        $validated = $request->validate([
            'name' => ['nullable', 'string', 'max:255'],
            'part_brand' => ['nullable', 'string', 'max:100'],
            'category' => ['nullable', 'string', 'max:100'],
            'quantity' => ['required', 'integer', 'min:0', 'max:999'],
            'minimum_stock' => ['required', 'integer', 'min:0', 'max:999'],
            'cost' => ['nullable', 'numeric', 'min:0'],
            'procurement_status' => ['required', 'in:nodig,besteld,binnen,geplaatst'],
            'scooter_id' => ['nullable', 'integer', 'exists:scooters,id'],
        ]);

        $requiresPartDetails = in_array($validated['procurement_status'], ['besteld', 'binnen', 'geplaatst'], true);

        $name = trim((string) ($validated['name'] ?? ''));
        if ($requiresPartDetails && $name === '') {
            return back()->withErrors([
                'name' => 'Productnaam is verplicht bij status besteld, binnen of geplaatst.',
            ])->withInput();
        }

        if ($name === '') {
            $name = 'Nog te bepalen';
        }

        $cost = $validated['cost'] ?? null;
        if ($requiresPartDetails && $cost === null) {
            return back()->withErrors([
                'cost' => 'Prijs is verplicht bij status besteld, binnen of geplaatst.',
            ])->withInput();
        }

        $normalizedCost = $cost !== null ? (float) $cost : 0.0;

        $part = ScooterPart::create([
            'name' => $name,
            'part_brand' => $validated['part_brand'] ?? null,
            'category' => ($validated['category'] ?? null) === 'Overig' ? null : ($validated['category'] ?? null),
            'quantity' => $validated['quantity'],
            'minimum_stock' => $validated['minimum_stock'],
            'cost' => $normalizedCost,
            'procurement_status' => $validated['procurement_status'],
            'scooter_id' => $validated['scooter_id'] ?? null,
            'purchased_at' => in_array($validated['procurement_status'], ['binnen', 'geplaatst'], true)
                ? now()->toDateString()
                : null,
            'placed_at' => $validated['procurement_status'] === 'geplaatst'
                ? now()->toDateString()
                : null,
        ]);

        if (
            $part->scooter_id
            && in_array($part->procurement_status, ['besteld', 'binnen', 'geplaatst'], true)
            && $part->total_cost > 0
        ) {
            PurchaseEntry::create([
                'scooter_id' => $part->scooter_id,
                'scooter_part_id' => $part->id,
                'category' => 'onderdeel',
                'description' => 'Onderdeel: ' . $part->name,
                'amount' => $part->total_cost,
                'purchased_at' => $part->purchased_at?->format('Y-m-d') ?: now()->toDateString(),
                'payment_status' => 'open',
                'receipt_path' => $part->receipt_path,
                'notes' => $part->notes,
            ]);
        }

        if ($part->procurement_status === 'besteld') {
            PartOrderNotifier::send($part, (string) optional($request->user())->name, 'Voorraad / Nieuw product');
        }

        return redirect()->route('admin.inventory.index')->with('success', 'Product toegevoegd aan voorraad.');
    }

    public function installed(): Response
    {
        $parts = ScooterPart::with(['scooter.brand', 'scooter.scooterModel'])
            ->where('procurement_status', 'geplaatst')
            ->orderByDesc('placed_at')
            ->orderByDesc('updated_at')
            ->get()
            ->map(function (ScooterPart $part) {
                return [
                    'id' => $part->id,
                    'name' => $part->name,
                    'category' => $part->category ?: 'Overig',
                    'part_brand' => $part->part_brand,
                    'quantity' => $part->quantity,
                    'unit_cost' => (float) $part->cost,
                    'total_cost' => (float) $part->total_cost,
                    'scooter_id' => $part->scooter?->id,
                    'scooter_name' => $part->scooter?->display_name,
                    'placed_at' => $part->placed_at?->format('Y-m-d'),
                ];
            });

        return Inertia::render('admin/inventory/installed', [
            'parts' => $parts,
        ]);
    }

    public function updatePart(Request $request, ScooterPart $part): RedirectResponse
    {
        if (! $request->user()?->canManageFinance()) {
            abort(403, 'Geen rechten om voorraad financieel te beheren.');
        }

        $validated = $request->validate([
            'name' => ['nullable', 'string', 'max:255'],
            'part_brand' => ['nullable', 'string', 'max:100'],
            'category' => ['nullable', 'string', 'max:100'],
            'quantity' => ['required', 'integer', 'min:0', 'max:999'],
            'minimum_stock' => ['required', 'integer', 'min:0', 'max:999'],
            'cost' => ['nullable', 'numeric', 'min:0'],
            'procurement_status' => ['required', 'in:nodig,besteld,binnen,geplaatst'],
            'scooter_id' => ['nullable', 'integer', 'exists:scooters,id'],
        ]);

        $previousStatus = $part->procurement_status;
        $nextStatus = $validated['procurement_status'];
        $nextScooterId = $validated['scooter_id'] ?? null;
        $nextQuantity = $validated['quantity'];

        $requiresPartDetails = in_array($nextStatus, ['besteld', 'binnen', 'geplaatst'], true);
        $nextName = trim((string) ($validated['name'] ?? ''));
        if ($requiresPartDetails && $nextName === '') {
            return back()->withErrors([
                'name' => 'Productnaam is verplicht bij status besteld, binnen of geplaatst.',
            ])->withInput();
        }

        if ($nextName === '') {
            $nextName = 'Nog te bepalen';
        }

        $nextCostRaw = $validated['cost'] ?? null;
        if ($requiresPartDetails && $nextCostRaw === null) {
            return back()->withErrors([
                'cost' => 'Prijs is verplicht bij status besteld, binnen of geplaatst.',
            ])->withInput();
        }

        $nextCost = $nextCostRaw !== null ? (float) $nextCostRaw : 0.0;

        if ($previousStatus === 'binnen' && $nextStatus === 'geplaatst' && $nextQuantity === $part->quantity && $nextQuantity > 1) {
            $nextQuantity = $nextQuantity - 1;
        }

        if ($nextStatus === 'geplaatst' && $nextQuantity < 1) {
            $nextQuantity = 1;
        }

        $part->update([
            'name' => $nextName,
            'part_brand' => $validated['part_brand'] ?? null,
            'category' => $validated['category'] ?? null,
            'quantity' => $nextQuantity,
            'minimum_stock' => $validated['minimum_stock'],
            'cost' => $nextCost,
            'procurement_status' => $nextStatus,
            'scooter_id' => $nextScooterId,
            'purchased_at' => in_array($nextStatus, ['binnen', 'geplaatst'], true)
                ? ($part->purchased_at ?? now()->toDateString())
                : $part->purchased_at,
            'placed_at' => $nextStatus === 'geplaatst'
                ? ($part->placed_at ?? now()->toDateString())
                : null,
        ]);

        if (
            $part->scooter_id
            && in_array($nextStatus, ['besteld', 'binnen', 'geplaatst'], true)
            && $part->total_cost > 0
        ) {
            $entry = PurchaseEntry::query()->where('scooter_part_id', $part->id)->first();

            $payload = [
                'scooter_id' => $part->scooter_id,
                'scooter_part_id' => $part->id,
                'category' => 'onderdeel',
                'description' => 'Onderdeel: ' . $part->name,
                'amount' => $part->total_cost,
                'purchased_at' => $part->purchased_at?->format('Y-m-d') ?: now()->toDateString(),
                'payment_status' => 'open',
                'receipt_path' => $part->receipt_path,
                'notes' => $part->notes,
            ];

            if ($entry) {
                $entry->update($payload);
            } else {
                PurchaseEntry::create($payload);
            }
        }

        if ($previousStatus !== 'besteld' && $nextStatus === 'besteld') {
            PartOrderNotifier::send($part, (string) optional($request->user())->name, 'Voorraad / Finance');
        }

        return back()->with('success', 'Onderdeel bijgewerkt.');
    }

    public function destroyPart(Request $request, ScooterPart $part): RedirectResponse
    {
        if (! $request->user()?->canManageFinance()) {
            abort(403, 'Geen rechten om voorraad financieel te beheren.');
        }

        PurchaseEntry::query()->where('scooter_part_id', $part->id)->delete();

        $part->delete();

        return back()->with('success', 'Product verwijderd uit voorraad.');
    }
}
