<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MaintenanceJob;
use App\Models\ScooterPart;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MaintenanceController extends Controller
{
    private function smallServiceChecklist(): array
    {
        return [
            ['category' => 'Kleine beurt', 'label' => 'Motorolie verversen'],
            ['category' => 'Kleine beurt', 'label' => 'Oliefilter controleren'],
            ['category' => 'Kleine beurt', 'label' => 'Bandenspanning controleren'],
            ['category' => 'Kleine beurt', 'label' => 'Remmen controleren'],
            ['category' => 'Kleine beurt', 'label' => 'Verlichting testen'],
            ['category' => 'Kleine beurt', 'label' => 'Ketting/aandrijving smeren'],
            ['category' => 'Kleine beurt', 'label' => 'Algemene visuele check'],
        ];
    }

    private function largeServiceChecklist(): array
    {
        return [
            ['category' => 'Motor & Vloeistoffen', 'label' => 'Motorolie verversen (4-takt, bijv. 10W40)'],
            ['category' => 'Motor & Vloeistoffen', 'label' => 'Oliefilter reinigen of vervangen'],
            ['category' => 'Motor & Vloeistoffen', 'label' => 'Kleppen controleren en stellen (inlaat/uitlaat)'],
            ['category' => 'Ontsteking & Lucht', 'label' => 'Bougie controleren/vervangen en elektrodeafstand checken'],
            ['category' => 'Ontsteking & Lucht', 'label' => 'Luchtfilter reinigen of vervangen'],
            ['category' => 'Transmissie (Aandrijving)', 'label' => 'V-snaar controleren op scheuren en slijtage'],
            ['category' => 'Transmissie (Aandrijving)', 'label' => 'Variorollen en geleiders controleren/vervangen'],
            ['category' => 'Transmissie (Aandrijving)', 'label' => 'Koppeling en koppelingshuis controleren'],
            ['category' => 'Remmen & Banden', 'label' => 'Remvloeistof niveau/kleur controleren (bij schijfremmen)'],
            ['category' => 'Remmen & Banden', 'label' => 'Remblokken of remschoenen op slijtage controleren'],
            ['category' => 'Remmen & Banden', 'label' => 'Bandenspanning controleren (richtwaarde 2.0 - 2.5 bar)'],
            ['category' => 'Remmen & Banden', 'label' => 'Profieldiepte en droogtescheuren controleren'],
            ['category' => 'Elektronica & Algemeen', 'label' => 'Verlichting, remlicht, knipperlichten en claxon testen'],
            ['category' => 'Elektronica & Algemeen', 'label' => 'Accu controleren (polen/corrosie/spanning rond 12.5V)'],
            ['category' => 'Elektronica & Algemeen', 'label' => 'Scharnierpunten en kabels smeren'],
        ];
    }

    private function repairChecklist(): array
    {
        return [
            ['category' => 'Diagnose', 'label' => 'Klacht van klant genoteerd en herhaald/gecontroleerd'],
            ['category' => 'Diagnose', 'label' => 'Foutcodes / storingslampjes uitgelezen'],
            ['category' => 'Diagnose', 'label' => 'Oorzaak vastgesteld'],
            ['category' => 'Reparatie', 'label' => 'Defecte onderdelen vervangen of hersteld'],
            ['category' => 'Reparatie', 'label' => 'Bekabeling en aansluitingen gecontroleerd'],
            ['category' => 'Afronding', 'label' => 'Proefrit uitgevoerd na reparatie'],
            ['category' => 'Afronding', 'label' => 'Klacht verholpen en getest'],
        ];
    }

    private function defaultChecklistFor(string $type): array
    {
        $lines = match ($type) {
            'grote_beurt' => $this->largeServiceChecklist(),
            'reparatie' => $this->repairChecklist(),
            default => $this->smallServiceChecklist(),
        };

        return array_map(fn (array $line) => [
            'category' => $line['category'],
            'label' => $line['label'],
            'checked' => false,
            'note' => '',
        ], $lines);
    }

    public function index(Request $request): Response
    {
        abort_unless($request->user()?->canManageScooters(), 403, 'Geen rechten om onderhoud te beheren.');

        $jobs = MaintenanceJob::query()
            ->orderByDesc('id')
            ->get()
            ->map(fn (MaintenanceJob $job) => [
                'id' => $job->id,
                'invoice_number' => $job->invoice_number,
                'service_type' => $job->service_type,
                'status' => $job->status,
                'customer_name' => $job->customer_name,
                'scooter_brand' => $job->scooter_brand,
                'scooter_model' => $job->scooter_model,
                'license_plate' => $job->license_plate,
                'performed_at' => $job->performed_at?->format('Y-m-d'),
                'total_amount' => $job->total_amount,
            ]);

        return Inertia::render('admin/maintenance/index', [
            'jobs' => $jobs,
            'summary' => [
                'total' => $jobs->count(),
                'open' => $jobs->where('status', 'open')->count(),
                'in_progress' => $jobs->where('status', 'bezig')->count(),
                'done' => $jobs->where('status', 'afgerond')->count(),
                'revenue_total' => (float) $jobs->sum('total_amount'),
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        abort_unless($request->user()?->canManageScooters(), 403, 'Geen rechten om onderhoud te beheren.');

        return Inertia::render('admin/maintenance/create');
    }

    public function store(Request $request): RedirectResponse
    {
        abort_unless($request->user()?->canManageScooters(), 403, 'Geen rechten om onderhoud te beheren.');

        $validated = $request->validate([
            'service_type' => ['required', 'in:grote_beurt,kleine_beurt,reparatie'],
            'customer_name' => ['required', 'string', 'max:190'],
            'customer_phone' => ['nullable', 'string', 'max:50'],
            'customer_email' => ['nullable', 'email', 'max:190'],
            'customer_address' => ['nullable', 'string', 'max:255'],
            'scooter_brand' => ['nullable', 'string', 'max:100'],
            'scooter_model' => ['nullable', 'string', 'max:100'],
            'license_plate' => ['nullable', 'string', 'max:20'],
            'mileage' => ['nullable', 'integer', 'min:0', 'max:500000'],
            'performed_at' => ['nullable', 'date'],
            'complaint' => ['nullable', 'string', 'max:2000'],
        ]);

        $job = MaintenanceJob::create([
            ...$validated,
            'invoice_number' => 'TIJDELIJK',
            'status' => 'open',
            'checklist' => $this->defaultChecklistFor($validated['service_type']),
            'parts' => [],
            'labor_cost' => 0,
            'vat_rate' => 21,
            'performed_at' => $validated['performed_at'] ?? now()->toDateString(),
        ]);

        $job->update([
            'invoice_number' => 'OH-' . now()->format('Y') . '-' . str_pad((string) $job->id, 4, '0', STR_PAD_LEFT),
        ]);

        return redirect()->route('admin.maintenance.edit', $job)
            ->with('success', 'Onderhoudsopdracht aangemaakt. Vul de checklist en factuurgegevens verder aan.');
    }

    public function edit(MaintenanceJob $maintenance): Response
    {
        abort_unless(request()->user()?->canManageScooters(), 403, 'Geen rechten om onderhoud te beheren.');

        $productTemplates = ScooterPart::query()
            ->select(['id', 'name', 'part_brand', 'specification', 'category', 'cost', 'quantity'])
            ->where('procurement_status', 'binnen')
            ->where('quantity', '>', 0)
            ->where('name', '!=', '')
            ->orderBy('name')
            ->orderByDesc('id')
            ->take(200)
            ->get()
            ->map(fn (ScooterPart $part) => [
                'id' => $part->id,
                'name' => $part->name,
                'part_brand' => $part->part_brand,
                'specification' => $part->specification,
                'category' => $part->category,
                'cost' => (float) $part->cost,
                'stock_quantity' => (int) $part->quantity,
            ]);

        return Inertia::render('admin/maintenance/edit', [
            'product_templates' => $productTemplates,
            'job' => [
                'id' => $maintenance->id,
                'invoice_number' => $maintenance->invoice_number,
                'service_type' => $maintenance->service_type,
                'complaint' => (string) $maintenance->complaint,
                'status' => $maintenance->status,
                'customer_name' => $maintenance->customer_name,
                'customer_phone' => (string) $maintenance->customer_phone,
                'customer_email' => (string) $maintenance->customer_email,
                'customer_address' => (string) $maintenance->customer_address,
                'scooter_brand' => (string) $maintenance->scooter_brand,
                'scooter_model' => (string) $maintenance->scooter_model,
                'license_plate' => (string) $maintenance->license_plate,
                'mileage' => $maintenance->mileage,
                'performed_at' => $maintenance->performed_at?->format('Y-m-d') ?? now()->toDateString(),
                'checklist' => $maintenance->checklist ?? [],
                'parts' => $maintenance->parts ?? [],
                'labor_cost' => (float) $maintenance->labor_cost,
                'vat_rate' => (float) $maintenance->vat_rate,
                'notes' => (string) $maintenance->notes,
                'parts_total' => $maintenance->parts_total,
                'subtotal' => $maintenance->subtotal,
                'vat_amount' => $maintenance->vat_amount,
                'total_amount' => $maintenance->total_amount,
            ],
        ]);
    }

    public function update(Request $request, MaintenanceJob $maintenance): RedirectResponse
    {
        abort_unless($request->user()?->canManageScooters(), 403, 'Geen rechten om onderhoud te beheren.');

        $validated = $request->validate([
            'service_type' => ['required', 'in:grote_beurt,kleine_beurt,reparatie'],
            'status' => ['required', 'in:open,bezig,afgerond'],
            'customer_name' => ['required', 'string', 'max:190'],
            'customer_phone' => ['nullable', 'string', 'max:50'],
            'customer_email' => ['nullable', 'email', 'max:190'],
            'customer_address' => ['nullable', 'string', 'max:255'],
            'scooter_brand' => ['nullable', 'string', 'max:100'],
            'scooter_model' => ['nullable', 'string', 'max:100'],
            'license_plate' => ['nullable', 'string', 'max:20'],
            'mileage' => ['nullable', 'integer', 'min:0', 'max:500000'],
            'performed_at' => ['nullable', 'date'],
            'complaint' => ['nullable', 'string', 'max:2000'],
            'notes' => ['nullable', 'string', 'max:5000'],
            'labor_cost' => ['required', 'numeric', 'min:0'],
            'vat_rate' => ['required', 'numeric', 'min:0', 'max:100'],
            'checklist' => ['required', 'array', 'min:1', 'max:80'],
            'checklist.*.category' => ['required', 'string', 'max:80'],
            'checklist.*.label' => ['required', 'string', 'max:180'],
            'checklist.*.checked' => ['boolean'],
            'checklist.*.note' => ['nullable', 'string', 'max:300'],
            'parts' => ['nullable', 'array', 'max:50'],
            'parts.*.description' => ['required', 'string', 'max:190'],
            'parts.*.quantity' => ['required', 'numeric', 'min:0'],
            'parts.*.unit_price' => ['required', 'numeric', 'min:0'],
        ]);

        $checklist = collect($validated['checklist'])
            ->map(fn (array $line) => [
                'category' => trim((string) $line['category']) ?: 'Overig',
                'label' => trim((string) $line['label']),
                'checked' => (bool) ($line['checked'] ?? false),
                'note' => trim((string) ($line['note'] ?? '')),
            ])
            ->filter(fn (array $line) => $line['label'] !== '')
            ->values()
            ->all();

        $parts = collect($validated['parts'] ?? [])
            ->map(fn (array $line) => [
                'description' => trim((string) $line['description']),
                'quantity' => (float) $line['quantity'],
                'unit_price' => (float) $line['unit_price'],
            ])
            ->filter(fn (array $line) => $line['description'] !== '')
            ->values()
            ->all();

        $maintenance->update([
            'service_type' => $validated['service_type'],
            'complaint' => $validated['complaint'] ?? null,
            'status' => $validated['status'],
            'customer_name' => $validated['customer_name'],
            'customer_phone' => $validated['customer_phone'] ?? null,
            'customer_email' => $validated['customer_email'] ?? null,
            'customer_address' => $validated['customer_address'] ?? null,
            'scooter_brand' => $validated['scooter_brand'] ?? null,
            'scooter_model' => $validated['scooter_model'] ?? null,
            'license_plate' => $validated['license_plate'] ?? null,
            'mileage' => $validated['mileage'] ?? null,
            'performed_at' => $validated['performed_at'] ?? null,
            'notes' => $validated['notes'] ?? null,
            'labor_cost' => $validated['labor_cost'],
            'vat_rate' => $validated['vat_rate'],
            'checklist' => $checklist,
            'parts' => $parts,
        ]);

        return back()->with('success', 'Onderhoudsopdracht opgeslagen. Je kunt nu de factuur printen of als PDF downloaden.');
    }

    public function destroy(Request $request, MaintenanceJob $maintenance): RedirectResponse
    {
        abort_unless($request->user()?->canManageScooters(), 403, 'Geen rechten om onderhoud te beheren.');

        $maintenance->delete();

        return redirect()->route('admin.maintenance.index')->with('success', 'Onderhoudsopdracht verwijderd.');
    }
}
