<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Support\SiteSettings;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    private const TYPES = [
        'fiets' => [
            'label' => 'Fiets',
            'icon' => '🚴',
            'maintenance_section' => 'maintenance-bike',
            'sales_section' => 'sales-bike',
        ],
        'e-bike' => [
            'label' => 'E-bike',
            'icon' => '⚡',
            'maintenance_section' => 'maintenance-ebike',
            'sales_section' => 'sales-ebike',
        ],
        'fatbike' => [
            'label' => 'Fatbike',
            'icon' => '🚲',
            'maintenance_section' => 'maintenance-fatbike',
            'sales_section' => 'sales-fatbike',
        ],
        'scooter' => [
            'label' => 'Scooter',
            'icon' => '🛵',
            'maintenance_section' => 'maintenance-scooter',
            'sales_section' => 'sales-scooter',
        ],
    ];

    public function index(): RedirectResponse
    {
        return redirect()->route('admin.categories.edit', ['type' => 'fiets']);
    }

    public function edit(string $type): Response
    {
        $definition = $this->resolveType($type);

        return Inertia::render('admin/categories/edit', [
            'categories' => collect(self::TYPES)
                ->map(fn (array $item, string $slug) => [
                    'slug' => $slug,
                    'label' => $item['label'],
                    'icon' => $item['icon'],
                ])
                ->values(),
            'category' => [
                'slug' => $type,
                'label' => $definition['label'],
                'icon' => $definition['icon'],
            ],
            'maintenanceSection' => SiteSettings::section($definition['maintenance_section']),
            'salesSection' => SiteSettings::section($definition['sales_section']),
        ]);
    }

    public function update(Request $request, string $type, string $section): RedirectResponse
    {
        $definition = $this->resolveType($type);
        $sectionSlug = $this->resolveSectionSlug($definition, $section);

        $request->validate([
            'values' => ['required', 'array'],
        ]);

        SiteSettings::save($sectionSlug, $request->input('values', []));

        return back()->with('success', ucfirst($section) . ' opgeslagen voor ' . $definition['label'] . '.');
    }

    public function uploadImage(Request $request, string $type, string $section): JsonResponse
    {
        $definition = $this->resolveType($type);
        $sectionSlug = $this->resolveSectionSlug($definition, $section);
        $sectionDefinition = SiteSettings::section($sectionSlug);

        $validated = $request->validate([
            'field' => ['required', 'string'],
            'image' => ['required', 'image', 'mimes:jpeg,png,jpg,webp', 'max:20480'],
        ]);

        $fieldKey = (string) $validated['field'];
        $allowedFieldKeys = collect($sectionDefinition['fields'])->pluck('key')->all();
        abort_unless(in_array($fieldKey, $allowedFieldKeys, true), 422);

        $path = $request->file('image')->store('site-settings/' . $sectionSlug, 'public');

        return response()->json([
            'path' => $path,
            'url' => Storage::disk('public')->url($path),
        ]);
    }

    private function resolveType(string $type): array
    {
        $definition = self::TYPES[$type] ?? null;
        abort_unless($definition !== null, 404);

        return $definition;
    }

    private function resolveSectionSlug(array $definition, string $section): string
    {
        return match ($section) {
            'maintenance' => $definition['maintenance_section'],
            'sales' => $definition['sales_section'],
            default => abort(404),
        };
    }
}
