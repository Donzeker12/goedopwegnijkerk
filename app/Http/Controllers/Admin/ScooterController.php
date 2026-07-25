<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\PurchaseEntry;
use App\Models\Scooter;
use App\Models\ScooterPart;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ScooterController extends Controller
{
    private const WARRANTY_MONTHS_LIMIT = 3;

    private const WARRANTY_KM_LIMIT = 2500;

    private function defaultWarrantyInspectionLines(): array
    {
        return [
            'Remmen gecontroleerd',
            'Verlichting gecontroleerd',
            'Bandenprofiel en spanning gecontroleerd',
            'Accu en laadsysteem getest',
            'Stuur- en balhoofdspeling gecontroleerd',
            'Motorblok op lekkage gecontroleerd',
            'Aandrijving gecontroleerd',
            'Proefrit uitgevoerd',
            'Vloeistoffen en smering gecontroleerd',
            'Algemene veiligheidscheck afgerond',
        ];
    }

    private function defaultMaintenanceInspectionLines(): array
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

    private function warrantyStatusForScooter(Scooter $scooter): array
    {
        $document = is_array($scooter->warranty_document ?? null) ? $scooter->warranty_document : [];

        $firstCheckupPlanned = (bool) ($document['first_checkup_planned'] ?? false);
        $firstCheckupCompleted = (bool) ($document['first_checkup_completed'] ?? false);

        $expiredByDate = false;
        $deliveryDateRaw = (string) ($document['delivery_date'] ?? '');
        if ($deliveryDateRaw !== '') {
            try {
                $deliveryDate = Carbon::parse($deliveryDateRaw)->startOfDay();
                $dateLimit = $deliveryDate->copy()->addMonths(self::WARRANTY_MONTHS_LIMIT)->endOfDay();
                $expiredByDate = now()->greaterThan($dateLimit);
            } catch (\Throwable) {
                $expiredByDate = false;
            }
        }

        $expiredByKm = false;
        $mileageAtDeliveryRaw = $document['mileage_at_delivery'] ?? null;
        if ($mileageAtDeliveryRaw !== null && $scooter->mileage !== null) {
            $mileageAtDelivery = (int) $mileageAtDeliveryRaw;
            $kmLimit = $mileageAtDelivery + self::WARRANTY_KM_LIMIT;
            $expiredByKm = (int) $scooter->mileage >= $kmLimit;
        }

        if ($firstCheckupCompleted) {
            return [
                'key' => 'checkup_done',
                'label' => 'Nacontrole uitgevoerd',
            ];
        }

        if ($expiredByDate || $expiredByKm) {
            return [
                'key' => 'expired',
                'label' => 'Garantie verlopen',
            ];
        }

        if ($firstCheckupPlanned) {
            return [
                'key' => 'checkup_planned',
                'label' => 'Eerste nacontrole gepland',
            ];
        }

        return [
            'key' => 'active',
            'label' => 'Garantie actief',
        ];
    }

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
                'echte_verkoopprijs' => $s->actual_sale_price ? (float) $s->actual_sale_price : null,
                'onderdelen_kosten' => $s->total_parts_cost,
                'verwachte_winst' => $s->projected_profit,
                'echte_winst' => $s->actual_profit,
                'ready_for_sale' => $s->ready_for_sale,
                'foto' => $s->primaryPhoto()?->url,
                'warranty_status' => $this->warrantyStatusForScooter($s),
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
        if (! $request->user()?->canManageScooters()) {
            abort(403, 'Geen rechten om scooters te beheren.');
        }

        $validated = $request->validate([
            'brand_id' => ['required', 'exists:brands,id'],
            'scooter_model_id' => ['required', 'exists:scooter_models,id'],
            'custom_title' => ['nullable', 'string', 'max:140'],
            'purchase_price' => ['required', 'numeric', 'min:0'],
            'expected_sale_price' => ['nullable', 'numeric', 'min:0'],
            'actual_sale_price' => ['nullable', 'numeric', 'min:0'],
            'sold_at' => ['nullable', 'date'],
            'purchase_receipt' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp,pdf', 'max:10240'],
            'description' => ['nullable', 'string', 'max:12000'],
            'year' => ['nullable', 'integer', 'min:1990', 'max:2030'],
            'mileage' => ['nullable', 'integer', 'min:0'],
            'color' => ['nullable', 'string', 'max:100'],
            'kenteken' => ['nullable', 'string', 'max:20'],
            'status' => ['required', 'in:in_reparatie,te_koop,verkocht'],
            'ready_for_sale' => ['boolean'],
            'warranty_months' => ['nullable', 'integer', 'min:0', 'max:24'],
            'delivery_service_included' => ['boolean'],
            'inspection_points' => ['nullable', 'integer', 'min:0', 'max:100'],
            'review_score' => ['nullable', 'numeric', 'min:0', 'max:5'],
            'review_count' => ['nullable', 'integer', 'min:0', 'max:9999'],
        ]);

        if ($request->hasFile('purchase_receipt')) {
            $validated['purchase_receipt_path'] = $request->file('purchase_receipt')->store('receipts/scooters', 'public');
        }

        unset($validated['purchase_receipt']);

        if (($validated['status'] ?? null) !== 'verkocht') {
            $validated['sold_at'] = null;
        }

        $scooter = Scooter::create($validated);

        PurchaseEntry::create([
            'scooter_id' => $scooter->id,
            'category' => 'scooter',
            'description' => 'Inkoop scooter: ' . $scooter->display_name,
            'amount' => $scooter->purchase_price,
            'purchased_at' => now()->toDateString(),
            'payment_status' => 'open',
            'receipt_path' => $scooter->purchase_receipt_path,
        ]);

        return redirect()->route('admin.scooters.edit', $scooter)
            ->with('success', 'Scooter succesvol aangemaakt!');
    }

    public function edit(Scooter $scooter): Response
    {
        $scooter->load(['brand', 'scooterModel', 'parts', 'photos']);

        $daysOnline = ($scooter->ready_for_sale && $scooter->status === 'te_koop')
            ? (int) $scooter->created_at->diffInDays(now())
            : null;

        $recentViews = $scooter->views()->where('created_at', '>=', now()->subDays(14))->count();
        $recentTestRideRequests = $scooter->testRideRequests()->where('created_at', '>=', now()->subDays(14))->count();

        $pricingHint = null;
        if ($daysOnline !== null && $daysOnline >= 45 && $recentTestRideRequests === 0) {
            $pricingHint = [
                'level' => 'high',
                'title' => 'Prijsreview geadviseerd',
                'message' => 'Deze scooter staat al ' . $daysOnline . ' dagen online zonder recente proefrit-aanvragen. Overweeg 3-5% prijsaanpassing of sterkere presentatie.',
            ];
        } elseif ($daysOnline !== null && $daysOnline >= 30 && $recentViews < 25) {
            $pricingHint = [
                'level' => 'medium',
                'title' => 'Aandachtspunt: lage tractie',
                'message' => 'Deze scooter staat ' . $daysOnline . ' dagen online met beperkt verkeer. Overweeg betere foto\'s, sterkere omschrijving of kleine prijsoptimalisatie.',
            ];
        }

        $productTemplates = ScooterPart::query()
            ->select(['id', 'name', 'part_brand', 'specification', 'category', 'cost', 'quantity'])
            ->whereNull('scooter_id')
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

        return Inertia::render('admin/scooters/edit', [
            'scooter' => [
                'id' => $scooter->id,
                'brand_id' => $scooter->brand_id,
                'scooter_model_id' => $scooter->scooter_model_id,
                'custom_title' => $scooter->custom_title,
                'purchase_price' => (float) $scooter->purchase_price,
                'expected_sale_price' => $scooter->expected_sale_price ? (float) $scooter->expected_sale_price : null,
                'actual_sale_price' => $scooter->actual_sale_price ? (float) $scooter->actual_sale_price : null,
                'sold_at' => $scooter->sold_at?->format('Y-m-d'),
                'description' => $scooter->description,
                'year' => $scooter->year,
                'mileage' => $scooter->mileage,
                'color' => $scooter->color,
                'kenteken' => $scooter->kenteken,
                'status' => $scooter->status,
                'ready_for_sale' => $scooter->ready_for_sale,
                'warranty_months' => $scooter->warranty_months,
                'delivery_service_included' => $scooter->delivery_service_included,
                'inspection_points' => $scooter->inspection_points,
                'review_score' => $scooter->review_score !== null ? (float) $scooter->review_score : null,
                'review_count' => $scooter->review_count,
                'naam' => $scooter->display_name,
                'onderdelen_kosten' => $scooter->total_parts_cost,
                'totale_investering' => $scooter->total_investment,
                'netto_winst' => $scooter->projected_profit,
                'netto_winst_echt' => $scooter->actual_profit,
                'purchase_receipt_url' => $scooter->purchase_receipt_path ? asset('storage/' . $scooter->purchase_receipt_path) : null,
                'parts' => $scooter->parts->map(fn ($p) => [
                    'id' => $p->id,
                    'name' => $p->name,
                    'part_brand' => $p->part_brand,
                    'specification' => $p->specification,
                    'quantity' => $p->quantity,
                    'minimum_stock' => $p->minimum_stock,
                    'procurement_status' => $p->procurement_status,
                    'category' => $p->category,
                    'cost' => (float) $p->cost,
                    'total_cost' => (float) $p->cost * $p->quantity,
                    'purchased_at' => $p->purchased_at?->format('Y-m-d'),
                    'notes' => $p->notes,
                    'receipt_url' => $p->receipt_path ? asset('storage/' . $p->receipt_path) : null,
                ]),
                'photos' => $scooter->photos->map(fn ($ph) => [
                    'id' => $ph->id,
                    'url' => $ph->url,
                    'is_primary' => $ph->is_primary,
                    'sort_order' => $ph->sort_order,
                ]),
                'pricing_hint' => $pricingHint,
                'days_online' => $daysOnline,
                'recent_views' => $recentViews,
                'recent_test_rides' => $recentTestRideRequests,
            ],
            'brands' => Brand::with('scooterModels')->get(),
            'features' => [
                'loyalty_pass_admin_preview' => (bool) config('features.loyalty_pass_admin_preview', true),
            ],
            'product_templates' => $productTemplates,
        ]);
    }

    public function update(Request $request, Scooter $scooter): RedirectResponse
    {
        if (! $request->user()?->canManageScooters()) {
            abort(403, 'Geen rechten om scooters te beheren.');
        }

        $validated = $request->validate([
            'brand_id' => ['required', 'exists:brands,id'],
            'scooter_model_id' => ['required', 'exists:scooter_models,id'],
            'custom_title' => ['nullable', 'string', 'max:140'],
            'purchase_price' => ['required', 'numeric', 'min:0'],
            'expected_sale_price' => ['nullable', 'numeric', 'min:0'],
            'actual_sale_price' => ['nullable', 'numeric', 'min:0'],
            'sold_at' => ['nullable', 'date'],
            'purchase_receipt' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp,pdf', 'max:10240'],
            'description' => ['nullable', 'string', 'max:12000'],
            'year' => ['nullable', 'integer', 'min:1990', 'max:2030'],
            'mileage' => ['nullable', 'integer', 'min:0'],
            'color' => ['nullable', 'string', 'max:100'],
            'kenteken' => ['nullable', 'string', 'max:20'],
            'status' => ['required', 'in:in_reparatie,te_koop,verkocht'],
            'ready_for_sale' => ['boolean'],
            'warranty_months' => ['nullable', 'integer', 'min:0', 'max:24'],
            'delivery_service_included' => ['boolean'],
            'inspection_points' => ['nullable', 'integer', 'min:0', 'max:100'],
            'review_score' => ['nullable', 'numeric', 'min:0', 'max:5'],
            'review_count' => ['nullable', 'integer', 'min:0', 'max:9999'],
        ]);

        if ($request->hasFile('purchase_receipt')) {
            if ($scooter->purchase_receipt_path) {
                Storage::disk('public')->delete($scooter->purchase_receipt_path);
            }

            $validated['purchase_receipt_path'] = $request->file('purchase_receipt')->store('receipts/scooters', 'public');
        }

        unset($validated['purchase_receipt']);

        if (($validated['status'] ?? null) !== 'verkocht') {
            $validated['sold_at'] = null;
            $validated['actual_sale_price'] = null;
        } elseif (empty($validated['sold_at'])) {
            $validated['sold_at'] = now()->toDateString();
        }

        $scooter->update($validated);

        $purchase = PurchaseEntry::query()->where('scooter_id', $scooter->id)
            ->where('category', 'scooter')
            ->first();

        if ($purchase) {
            $purchase->update([
                'description' => 'Inkoop scooter: ' . $scooter->display_name,
                'amount' => $scooter->purchase_price,
                'receipt_path' => $scooter->purchase_receipt_path,
            ]);
        }

        return back()->with('success', 'Scooter succesvol bijgewerkt!');
    }

    public function editWarranty(Scooter $scooter): Response
    {
        if (! request()->user()?->canManageScooters()) {
            abort(403, 'Geen rechten om scooters te beheren.');
        }

        $placedParts = ScooterPart::query()
            ->where('scooter_id', $scooter->id)
            ->where('procurement_status', 'geplaatst')
            ->orderByDesc('placed_at')
            ->orderBy('name')
            ->get()
            ->map(fn (ScooterPart $part) => [
                'name' => $part->name,
                'specification' => (string) ($part->specification ?? ''),
                'quantity' => (int) $part->quantity,
                'placed_at' => $part->placed_at?->format('Y-m-d'),
            ])
            ->values();

        $document = $scooter->warranty_document ?? [];
        $defaultLines = $this->defaultWarrantyInspectionLines();
        $existingLines = is_array($document['inspection_lines'] ?? null) ? $document['inspection_lines'] : [];

        $inspectionLines = [];
        foreach ($defaultLines as $label) {
            $matched = collect($existingLines)->first(fn ($line) => is_array($line) && ($line['label'] ?? '') === $label);
            $inspectionLines[] = [
                'label' => $label,
                'checked' => (bool) ($matched['checked'] ?? false),
                'note' => (string) ($matched['note'] ?? ''),
            ];
        }

        foreach ($existingLines as $line) {
            if (!is_array($line) || empty($line['label'])) {
                continue;
            }

            $label = (string) $line['label'];
            if (in_array($label, $defaultLines, true)) {
                continue;
            }

            $inspectionLines[] = [
                'label' => $label,
                'checked' => (bool) ($line['checked'] ?? false),
                'note' => (string) ($line['note'] ?? ''),
            ];
        }

        return Inertia::render('admin/scooters/warranty', [
            'scooter' => [
                'id' => $scooter->id,
                'naam' => $scooter->display_name,
                'kenteken' => $scooter->kenteken,
                'year' => $scooter->year,
                'warranty_months' => $scooter->warranty_months,
                'delivery_service_included' => (bool) $scooter->delivery_service_included,
                'inspection_points' => $scooter->inspection_points,
                'warranty_status' => $this->warrantyStatusForScooter($scooter),
            ],
            'document' => [
                'certificate_title' => (string) ($document['certificate_title'] ?? 'Garantie & Service Controleblad'),
                'customer_name' => (string) ($document['customer_name'] ?? ''),
                'customer_phone' => (string) ($document['customer_phone'] ?? ''),
                'customer_email' => (string) ($document['customer_email'] ?? ''),
                'delivery_date' => (string) ($document['delivery_date'] ?? now()->toDateString()),
                'mileage_at_delivery' => (string) ($document['mileage_at_delivery'] ?? (string) ($scooter->mileage ?? '')),
                'free_checkup_included' => (bool) ($document['free_checkup_included'] ?? true),
                'first_checkup_planned' => (bool) ($document['first_checkup_planned'] ?? false),
                'first_checkup_completed' => (bool) ($document['first_checkup_completed'] ?? false),
                'general_note' => (string) ($document['general_note'] ?? ''),
                'inspection_lines' => $inspectionLines,
            ],
            'placed_parts' => $placedParts,
        ]);
    }

    public function updateWarranty(Request $request, Scooter $scooter): RedirectResponse
    {
        if (! $request->user()?->canManageScooters()) {
            abort(403, 'Geen rechten om scooters te beheren.');
        }

        $validated = $request->validate([
            'certificate_title' => ['nullable', 'string', 'max:120'],
            'customer_name' => ['nullable', 'string', 'max:190'],
            'customer_phone' => ['nullable', 'string', 'max:50'],
            'customer_email' => ['nullable', 'email', 'max:190'],
            'delivery_date' => ['nullable', 'date'],
            'mileage_at_delivery' => ['nullable', 'integer', 'min:0', 'max:500000'],
            'free_checkup_included' => ['boolean'],
            'first_checkup_planned' => ['boolean'],
            'first_checkup_completed' => ['boolean'],
            'general_note' => ['nullable', 'string', 'max:5000'],
            'inspection_lines' => ['required', 'array', 'min:1', 'max:40'],
            'inspection_lines.*.label' => ['required', 'string', 'max:120'],
            'inspection_lines.*.checked' => ['boolean'],
            'inspection_lines.*.note' => ['nullable', 'string', 'max:300'],
        ]);

        $inspectionLines = collect($validated['inspection_lines'])
            ->map(fn (array $line) => [
                'label' => trim((string) $line['label']),
                'checked' => (bool) ($line['checked'] ?? false),
                'note' => trim((string) ($line['note'] ?? '')),
            ])
            ->filter(fn (array $line) => $line['label'] !== '')
            ->values()
            ->all();

        $scooter->update([
            'warranty_document' => [
                'certificate_title' => trim((string) ($validated['certificate_title'] ?? '')),
                'customer_name' => trim((string) ($validated['customer_name'] ?? '')),
                'customer_phone' => trim((string) ($validated['customer_phone'] ?? '')),
                'customer_email' => trim((string) ($validated['customer_email'] ?? '')),
                'delivery_date' => $validated['delivery_date'] ?? null,
                'mileage_at_delivery' => isset($validated['mileage_at_delivery']) ? (int) $validated['mileage_at_delivery'] : null,
                'free_checkup_included' => (bool) ($validated['free_checkup_included'] ?? false),
                'first_checkup_planned' => (bool) ($validated['first_checkup_planned'] ?? false),
                'first_checkup_completed' => (bool) ($validated['first_checkup_completed'] ?? false),
                'general_note' => trim((string) ($validated['general_note'] ?? '')),
                'inspection_lines' => $inspectionLines,
            ],
        ]);

        return back()->with('success', 'Garantieblad opgeslagen. Je kunt nu printen of als PDF downloaden.');
    }

    public function editMaintenance(Scooter $scooter): Response
    {
        if (! request()->user()?->canManageScooters()) {
            abort(403, 'Geen rechten om scooters te beheren.');
        }

        $document = $scooter->maintenance_document ?? [];
        $defaultLines = $this->defaultMaintenanceInspectionLines();
        $existingLines = is_array($document['inspection_lines'] ?? null) ? $document['inspection_lines'] : [];

        $inspectionLines = [];
        foreach ($defaultLines as $defaultLine) {
            $matched = collect($existingLines)->first(function ($line) use ($defaultLine) {
                if (! is_array($line)) {
                    return false;
                }

                return ($line['label'] ?? '') === $defaultLine['label'];
            });

            $inspectionLines[] = [
                'category' => (string) $defaultLine['category'],
                'label' => (string) $defaultLine['label'],
                'checked' => (bool) ($matched['checked'] ?? false),
                'note' => (string) ($matched['note'] ?? ''),
            ];
        }

        foreach ($existingLines as $line) {
            if (! is_array($line) || empty($line['label'])) {
                continue;
            }

            $label = (string) $line['label'];
            $existsInDefaults = collect($defaultLines)->contains(fn (array $defaultLine) => $defaultLine['label'] === $label);

            if ($existsInDefaults) {
                continue;
            }

            $inspectionLines[] = [
                'category' => trim((string) ($line['category'] ?? 'Overig')) ?: 'Overig',
                'label' => $label,
                'checked' => (bool) ($line['checked'] ?? false),
                'note' => (string) ($line['note'] ?? ''),
            ];
        }

        return Inertia::render('admin/scooters/maintenance', [
            'scooter' => [
                'id' => $scooter->id,
                'naam' => $scooter->display_name,
                'kenteken' => $scooter->kenteken,
                'year' => $scooter->year,
            ],
            'document' => [
                'certificate_title' => (string) ($document['certificate_title'] ?? 'Onderhoud & Service Checklist'),
                'customer_name' => (string) ($document['customer_name'] ?? ''),
                'performed_at' => (string) ($document['performed_at'] ?? now()->toDateString()),
                'mileage_at_service' => (string) ($document['mileage_at_service'] ?? (string) ($scooter->mileage ?? '')),
                'general_note' => (string) ($document['general_note'] ?? ''),
                'last_completed_at' => (string) ($document['last_completed_at'] ?? ''),
                'inspection_lines' => $inspectionLines,
            ],
        ]);
    }

    public function updateMaintenance(Request $request, Scooter $scooter): RedirectResponse
    {
        if (! $request->user()?->canManageScooters()) {
            abort(403, 'Geen rechten om scooters te beheren.');
        }

        $validated = $request->validate([
            'certificate_title' => ['nullable', 'string', 'max:120'],
            'customer_name' => ['nullable', 'string', 'max:190'],
            'performed_at' => ['nullable', 'date'],
            'mileage_at_service' => ['nullable', 'integer', 'min:0', 'max:500000'],
            'general_note' => ['nullable', 'string', 'max:5000'],
            'inspection_lines' => ['required', 'array', 'min:1', 'max:80'],
            'inspection_lines.*.category' => ['required', 'string', 'max:80'],
            'inspection_lines.*.label' => ['required', 'string', 'max:180'],
            'inspection_lines.*.checked' => ['boolean'],
            'inspection_lines.*.note' => ['nullable', 'string', 'max:300'],
        ]);

        $inspectionLines = collect($validated['inspection_lines'])
            ->map(fn (array $line) => [
                'category' => trim((string) ($line['category'] ?? 'Overig')) ?: 'Overig',
                'label' => trim((string) $line['label']),
                'checked' => (bool) ($line['checked'] ?? false),
                'note' => trim((string) ($line['note'] ?? '')),
            ])
            ->filter(fn (array $line) => $line['label'] !== '')
            ->values()
            ->all();

        $scooter->update([
            'maintenance_document' => [
                'certificate_title' => trim((string) ($validated['certificate_title'] ?? '')),
                'customer_name' => trim((string) ($validated['customer_name'] ?? '')),
                'performed_at' => $validated['performed_at'] ?? null,
                'mileage_at_service' => isset($validated['mileage_at_service']) ? (int) $validated['mileage_at_service'] : null,
                'general_note' => trim((string) ($validated['general_note'] ?? '')),
                'last_completed_at' => now()->toDateTimeString(),
                'inspection_lines' => $inspectionLines,
            ],
        ]);

        return back()->with('success', 'Onderhoudsformulier opgeslagen. Je kunt nu printen of als PDF downloaden.');
    }

    public function destroy(Scooter $scooter): RedirectResponse
    {
        if (! request()->user()?->canManageScooters()) {
            abort(403, 'Geen rechten om scooters te beheren.');
        }

        // Delete photos from storage
        foreach ($scooter->photos as $photo) {
            Storage::disk('public')->delete($photo->path);
        }

        if ($scooter->purchase_receipt_path) {
            Storage::disk('public')->delete($scooter->purchase_receipt_path);
        }

        Scooter::destroy($scooter->id);

        return redirect()->route('admin.scooters.index')
            ->with('success', 'Scooter verwijderd.');
    }
}
