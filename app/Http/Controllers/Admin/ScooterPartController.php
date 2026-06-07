<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Scooter;
use App\Models\ScooterPart;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ScooterPartController extends Controller
{
    public function store(Request $request, Scooter $scooter): RedirectResponse
    {
        $validated = $request->validate([
            'name'          => ['required', 'string', 'max:255'],
            'part_brand'    => ['nullable', 'string', 'max:100'],
            'specification' => ['nullable', 'string', 'max:100'],
            'quantity'      => ['nullable', 'integer', 'min:1', 'max:999'],
            'category'      => ['nullable', 'string', 'max:100'],
            'cost'          => ['required', 'numeric', 'min:0'],
            'purchased_at'  => ['nullable', 'date'],
            'notes'         => ['nullable', 'string', 'max:500'],
        ]);

        $validated['scooter_id'] = $scooter->id;
        $validated['quantity'] = $validated['quantity'] ?? 1;
        ScooterPart::create($validated);

        return back()->with('success', 'Onderdeel toegevoegd!');
    }

    public function destroy(Scooter $scooter, ScooterPart $part): RedirectResponse
    {
        $part->delete();

        return back()->with('success', 'Onderdeel verwijderd.');
    }
}
