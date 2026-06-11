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
            ->where('procurement_status', '!=', 'geplaatst')
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
                'low_stock' => $part->minimum_stock > 0 && $stockQuantity <= $part->minimum_stock,
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
            'name' => ['required', 'string', 'max:255'],
            'part_brand' => ['nullable', 'string', 'max:100'],
            'category' => ['nullable', 'string', 'max:100'],
            'quantity' => ['required', 'integer', 'min:0', 'max:999'],
            'minimum_stock' => ['required', 'integer', 'min:0', 'max:999'],
            'cost' => ['required', 'numeric', 'min:0'],
            'procurement_status' => ['required', 'in:nodig,besteld,binnen,geplaatst'],
            'scooter_id' => ['nullable', 'integer', 'exists:scooters,id'],
        ]);

        $previousStatus = $part->procurement_status;
        $nextStatus = $validated['procurement_status'];
        $nextScooterId = $validated['scooter_id'] ?? null;
        $autoPlaced = false;

        // If stock is marked as "binnen" and linked to a scooter, place it immediately.
        if ($nextStatus === 'binnen' && $nextScooterId) {
            $nextStatus = 'geplaatst';
            $autoPlaced = true;
        }

        $part->update([
            'name' => $validated['name'],
            'part_brand' => $validated['part_brand'] ?? null,
            'category' => $validated['category'] ?? null,
            'quantity' => $validated['quantity'],
            'minimum_stock' => $validated['minimum_stock'],
            'cost' => $validated['cost'],
            'procurement_status' => $nextStatus,
            'scooter_id' => $nextScooterId,
            'purchased_at' => in_array($nextStatus, ['binnen', 'geplaatst'], true)
                ? ($part->purchased_at ?? now()->toDateString())
                : $part->purchased_at,
            'placed_at' => $nextStatus === 'geplaatst'
                ? ($part->placed_at ?? now()->toDateString())
                : $part->placed_at,
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

        return back()->with('success', $autoPlaced
            ? 'Onderdeel bijgewerkt en automatisch als geplaatst gemarkeerd.'
            : 'Onderdeel bijgewerkt.');
    }
}
