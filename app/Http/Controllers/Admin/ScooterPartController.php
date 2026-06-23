<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PurchaseEntry;
use App\Models\Scooter;
use App\Models\ScooterPart;
use App\Support\PartOrderNotifier;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ScooterPartController extends Controller
{
    public function store(Request $request, Scooter $scooter): RedirectResponse
    {
        if (! $request->user()?->canManageScooters()) {
            abort(403, 'Geen rechten om onderdelen te beheren.');
        }

        $validated = $request->validate([
            'name'          => ['required', 'string', 'max:255'],
            'part_brand'    => ['nullable', 'string', 'max:100'],
            'specification' => ['nullable', 'string', 'max:100'],
            'quantity'      => ['nullable', 'integer', 'min:1', 'max:999'],
            'minimum_stock' => ['nullable', 'integer', 'min:0', 'max:999'],
            'procurement_status' => ['nullable', 'in:nodig,besteld,binnen,geplaatst'],
            'category'      => ['nullable', 'string', 'max:100'],
            'cost'          => ['required', 'numeric', 'min:0'],
            'source_stock_part_id' => ['nullable', 'integer', 'exists:scooter_parts,id'],
            'purchased_at'  => ['nullable', 'date'],
            'notes'         => ['nullable', 'string', 'max:500'],
            'receipt'       => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp,pdf', 'max:10240'],
        ]);

        $sourceStockPartId = isset($validated['source_stock_part_id']) ? (int) $validated['source_stock_part_id'] : null;
        unset($validated['source_stock_part_id']);

        if ($request->hasFile('receipt')) {
            $validated['receipt_path'] = $request->file('receipt')->store('receipts/parts', 'public');
        }

        unset($validated['receipt']);

        $validated['scooter_id'] = $scooter->id;
        $validated['quantity'] = $validated['quantity'] ?? 1;
        $validated['minimum_stock'] = $validated['minimum_stock'] ?? 0;
        $validated['procurement_status'] = $validated['procurement_status'] ?? 'binnen';

        if ($validated['procurement_status'] === 'binnen' && empty($validated['purchased_at'])) {
            $validated['purchased_at'] = now()->toDateString();
        }

        if ($validated['procurement_status'] === 'geplaatst') {
            $validated['placed_at'] = now()->toDateString();
        }

        $part = ScooterPart::create($validated);

        if ($part->procurement_status === 'besteld') {
            PartOrderNotifier::send($part, (string) optional($request->user())->name, 'Scooter beheer');
        }

        if ($part->procurement_status === 'geplaatst') {
            $this->consumeFromInventory($part, $sourceStockPartId);
        }

        if (in_array($part->procurement_status, ['besteld', 'binnen'], true) && $part->total_cost > 0) {
            PurchaseEntry::create([
                'scooter_id' => $scooter->id,
                'scooter_part_id' => $part->id,
                'category' => 'onderdeel',
                'description' => 'Onderdeel: ' . $part->name . ' (' . $scooter->display_name . ')',
                'amount' => $part->total_cost,
                'purchased_at' => $part->purchased_at?->format('Y-m-d') ?: now()->toDateString(),
                'payment_status' => 'open',
                'receipt_path' => $part->receipt_path,
                'notes' => $part->notes,
            ]);
        }

        return back()->with('success', 'Onderdeel toegevoegd!');
    }

    public function destroy(Scooter $scooter, ScooterPart $part): RedirectResponse
    {
        if (! request()->user()?->canManageScooters()) {
            abort(403, 'Geen rechten om onderdelen te beheren.');
        }

        if ($part->receipt_path) {
            Storage::disk('public')->delete($part->receipt_path);
        }

        ScooterPart::destroy($part->id);

        return back()->with('success', 'Onderdeel verwijderd.');
    }

    public function updateStatus(Request $request, Scooter $scooter, ScooterPart $part): RedirectResponse
    {
        if (! $request->user()?->canManageScooters()) {
            abort(403, 'Geen rechten om onderdelen te beheren.');
        }

        $validated = $request->validate([
            'procurement_status' => ['required', 'in:nodig,besteld,binnen,geplaatst'],
        ]);

        $previousStatus = $part->procurement_status;
        $nextStatus = $validated['procurement_status'];

        $part->update([
            'procurement_status' => $nextStatus,
            'purchased_at' => in_array($nextStatus, ['binnen', 'geplaatst'], true) ? ($part->purchased_at ?? now()->toDateString()) : $part->purchased_at,
            'placed_at' => $nextStatus === 'geplaatst' ? ($part->placed_at ?? now()->toDateString()) : null,
        ]);

        if ($previousStatus !== 'geplaatst' && $nextStatus === 'geplaatst') {
            $this->consumeFromInventory($part);
        }

        if (
            in_array($nextStatus, ['besteld', 'binnen', 'geplaatst'], true)
            && $part->total_cost > 0
            && ! PurchaseEntry::query()->where('scooter_part_id', $part->id)->exists()
        ) {
            PurchaseEntry::create([
                'scooter_id' => $scooter->id,
                'scooter_part_id' => $part->id,
                'category' => 'onderdeel',
                'description' => 'Onderdeel: ' . $part->name . ' (' . $scooter->display_name . ')',
                'amount' => $part->total_cost,
                'purchased_at' => $part->purchased_at?->format('Y-m-d') ?: now()->toDateString(),
                'payment_status' => 'open',
                'receipt_path' => $part->receipt_path,
                'notes' => $part->notes,
            ]);
        }

        if ($previousStatus !== 'besteld' && $nextStatus === 'besteld') {
            PartOrderNotifier::send($part, (string) optional($request->user())->name, 'Scooter beheer');
        }

        return back()->with('success', 'Onderdeelstatus bijgewerkt.');
    }

    private function consumeFromInventory(ScooterPart $part, ?int $sourceStockPartId = null): void
    {
        $source = null;

        if ($sourceStockPartId) {
            $source = ScooterPart::query()
                ->whereKey($sourceStockPartId)
                ->whereNull('scooter_id')
                ->where('procurement_status', 'binnen')
                ->where('quantity', '>', 0)
                ->first();
        }

        if (! $source) {
            $source = ScooterPart::query()
                ->whereNull('scooter_id')
                ->where('procurement_status', 'binnen')
                ->where('quantity', '>', 0)
                ->where('name', $part->name)
                ->where('cost', $part->cost)
                ->where(function ($query) use ($part) {
                    if ($part->part_brand === null) {
                        $query->whereNull('part_brand');
                    } else {
                        $query->where('part_brand', $part->part_brand);
                    }
                })
                ->where(function ($query) use ($part) {
                    if ($part->specification === null) {
                        $query->whereNull('specification');
                    } else {
                        $query->where('specification', $part->specification);
                    }
                })
                ->orderBy('id')
                ->first();
        }

        if (! $source) {
            return;
        }

        $source->decrement('quantity', 1);
    }
}
