<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Support\SiteSettings;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SiteSettingsController extends Controller
{
    public function index(): RedirectResponse
    {
        $firstSection = SiteSettings::firstSectionSlug();

        abort_unless($firstSection !== null, 404);

        return redirect()->route('admin.site-settings.edit', ['section' => $firstSection]);
    }

    public function edit(string $section): Response
    {
        return Inertia::render('admin/site-settings/edit', [
            'sections' => SiteSettings::navigation(),
            'section' => SiteSettings::section($section),
        ]);
    }

    public function update(Request $request, string $section): RedirectResponse
    {
        $request->validate([
            'values' => ['required', 'array'],
        ]);

        SiteSettings::save($section, $request->input('values', []));

        return back()->with('success', 'Site instellingen opgeslagen!');
    }
}
