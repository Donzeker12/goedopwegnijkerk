<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Support\SiteSettings;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use InvalidArgumentException;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Storage;

class SiteSettingsController extends Controller
{
    public function index(): RedirectResponse
    {
        $firstSection = SiteSettings::firstSectionSlug();

        abort_unless($firstSection !== null, 404);

        return redirect()->route('admin.site-settings.edit', ['section' => $firstSection]);
    }

    public function edit(string $section): Response|RedirectResponse
    {
        if ($section === 'home-reviews') {
            return redirect()->route('admin.reviews.index');
        }

        try {
            $currentSection = SiteSettings::section($section);
        } catch (InvalidArgumentException) {
            abort(404);
        }

        return Inertia::render('admin/site-settings/edit', [
            'sections' => SiteSettings::navigation(),
            'section' => $currentSection,
        ]);
    }

    public function update(Request $request, string $section): RedirectResponse
    {
        if ($section === 'home-reviews') {
            return redirect()->route('admin.reviews.index');
        }

        $request->validate([
            'values' => ['required', 'array'],
        ]);

        SiteSettings::save($section, $request->input('values', []));

        return back()->with('success', 'Site instellingen opgeslagen!');
    }

    public function uploadImage(Request $request, string $section): JsonResponse
    {
        try {
            $currentSection = SiteSettings::section($section);
        } catch (InvalidArgumentException) {
            abort(404);
        }

        $validated = $request->validate([
            'field' => ['required', 'string'],
            'image' => ['required', 'image', 'mimes:jpeg,png,jpg,webp', 'max:20480'],
        ], [
            'image.required' => 'Selecteer een afbeelding.',
            'image.image' => 'Bestand moet een afbeelding zijn.',
            'image.mimes' => 'Alleen jpeg, png, jpg en webp zijn toegestaan.',
            'image.max' => 'Afbeelding mag maximaal 20MB zijn.',
        ]);

        $fieldKey = (string) $validated['field'];
        $allowedFieldKeys = collect($currentSection['fields'])->pluck('key')->all();

        abort_unless(in_array($fieldKey, $allowedFieldKeys, true), 422);

        $path = $request->file('image')->store('site-settings/' . $section, 'public');

        return response()->json([
            'path' => $path,
            'url' => Storage::disk('public')->url($path),
        ]);
    }
}
