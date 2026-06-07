<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Scooter;
use App\Models\ScooterPhoto;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ScooterPhotoController extends Controller
{
    public function store(Request $request, Scooter $scooter): RedirectResponse
    {
        $request->validate([
            'photos' => ['required', 'array', 'min:1'],
            'photos.*' => ['required', 'image', 'mimes:jpeg,png,jpg,webp', 'max:20480'],
        ], [
            'photos.required' => 'Selecteer minimaal één foto.',
            'photos.*.image' => 'Bestand moet een afbeelding zijn.',
            'photos.*.mimes' => 'Alleen jpeg, png, jpg en webp zijn toegestaan.',
            'photos.*.max' => 'Foto mag maximaal 20MB zijn.',
        ]);

        $sortStart = $scooter->photos()->max('sort_order') + 1;
        $hasPrimary = $scooter->photos()->where('is_primary', true)->exists();

        foreach ($request->file('photos') as $index => $photo) {
            $path = $photo->store('scooters/' . $scooter->id, 'public');

            ScooterPhoto::create([
                'scooter_id' => $scooter->id,
                'path' => $path,
                'is_primary' => !$hasPrimary && $index === 0,
                'sort_order' => $sortStart + $index,
            ]);

            if (!$hasPrimary && $index === 0) {
                $hasPrimary = true;
            }
        }

        return back()->with('success', 'Foto\'s geüpload!');
    }

    public function setPrimary(Scooter $scooter, ScooterPhoto $photo): RedirectResponse
    {
        $scooter->photos()->update(['is_primary' => false]);
        $photo->update(['is_primary' => true]);

        return back()->with('success', 'Hoofdfoto ingesteld.');
    }

    public function destroy(Scooter $scooter, ScooterPhoto $photo): RedirectResponse
    {
        Storage::disk('public')->delete($photo->path);
        $photo->delete();

        // If deleted photo was primary, set next photo as primary
        if ($photo->is_primary) {
            $next = $scooter->photos()->first();
            $next?->update(['is_primary' => true]);
        }

        return back()->with('success', 'Foto verwijderd.');
    }
}
