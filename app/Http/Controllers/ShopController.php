<?php

namespace App\Http\Controllers;

use App\Models\Scooter;
use App\Models\ScooterColorRequest;
use App\Models\ScooterTestRideRequest;
use App\Support\WebPushNotifier;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ShopController extends Controller
{
    public function index(): Response
    {
        $scooters = Scooter::with(['brand', 'scooterModel', 'photos'])
            ->where('ready_for_sale', true)
            ->where('status', 'te_koop')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn (Scooter $s) => [
                'id' => $s->id,
                'naam' => $s->display_name,
                'merk' => $s->brand->name,
                'model' => $s->scooterModel->name,
                'prijs' => (float) $s->expected_sale_price,
                'status' => $s->status,
                'foto' => $s->primaryPhoto()?->url,
                'year' => $s->year,
                'mileage' => $s->mileage,
                'color' => $s->color,
                'description' => $s->description,
            ]);

        return Inertia::render('shop/index', [
            'scooters' => $scooters,
        ]);
    }

    public function show(Scooter $scooter): Response
    {
        if (!$scooter->ready_for_sale || $scooter->status !== 'te_koop') {
            abort(404);
        }

        $scooter->views()->create([
            'ip_address' => request()->ip(),
            'user_agent' => substr((string) request()->userAgent(), 0, 500),
        ]);

        $scooter->load(['brand', 'scooterModel', 'photos', 'parts']);

        $recentWork = $scooter->parts
            ->where('procurement_status', 'geplaatst')
            ->sortByDesc(fn ($part) => $part->placed_at?->getTimestamp() ?? 0)
            ->take(5)
            ->map(fn ($part) => [
                'name' => $part->name,
                'placed_at' => $part->placed_at?->format('Y-m-d'),
            ])
            ->values();

        $relatedScooters = Scooter::with(['brand', 'scooterModel', 'photos'])
            ->where('ready_for_sale', true)
            ->where('status', 'te_koop')
            ->where('id', '!=', $scooter->id)
            ->where(function ($query) use ($scooter) {
                $query->where('brand_id', $scooter->brand_id)
                    ->orWhere('scooter_model_id', $scooter->scooter_model_id);
            })
            ->latest()
            ->take(3)
            ->get();

        if ($relatedScooters->count() < 3) {
            $fallbackScooters = Scooter::with(['brand', 'scooterModel', 'photos'])
                ->where('ready_for_sale', true)
                ->where('status', 'te_koop')
                ->where('id', '!=', $scooter->id)
                ->whereNotIn('id', $relatedScooters->pluck('id'))
                ->latest()
                ->take(3 - $relatedScooters->count())
                ->get();

            $relatedScooters = $relatedScooters->concat($fallbackScooters);
        }

        return Inertia::render('shop/show', [
            'scooter' => [
                'id' => $scooter->id,
                'naam' => $scooter->display_name,
                'merk' => $scooter->brand->name,
                'model' => $scooter->scooterModel->name,
                'prijs' => (float) $scooter->expected_sale_price,
                'year' => $scooter->year,
                'mileage' => $scooter->mileage,
                'color' => $scooter->color,
                'kenteken' => $scooter->kenteken,
                'description' => $scooter->description,
                'status' => $scooter->status,
                'warranty_months' => $scooter->warranty_months,
                'delivery_service_included' => $scooter->delivery_service_included,
                'inspection_points' => $scooter->inspection_points,
                'review_score' => $scooter->review_score !== null ? (float) $scooter->review_score : null,
                'review_count' => $scooter->review_count,
                'recent_work' => $recentWork,
                'photos' => $scooter->photos->map(fn ($ph) => [
                    'id' => $ph->id,
                    'url' => $ph->url,
                    'is_primary' => $ph->is_primary,
                ]),
            ],
            'features' => [
                'loyalty_pass_public' => (bool) config('features.loyalty_pass_public', false),
            ],
            'related_scooters' => $relatedScooters->map(fn (Scooter $related) => [
                'id' => $related->id,
                'naam' => $related->display_name,
                'prijs' => (float) $related->expected_sale_price,
                'foto' => $related->primaryPhoto()?->url,
                'year' => $related->year,
                'mileage' => $related->mileage,
            ])->values(),
        ]);
    }

    public function storeColorRequest(Request $request, Scooter $scooter): RedirectResponse
    {
        if (! $scooter->ready_for_sale || $scooter->status !== 'te_koop') {
            abort(404);
        }

        $validated = $request->validate([
            'customer_name' => ['required', 'string', 'max:120'],
            'customer_email' => ['required', 'email', 'max:190'],
            'customer_phone' => ['nullable', 'string', 'max:50'],
            'primary_color' => ['required', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'accent_color' => ['required', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $colorRequest = ScooterColorRequest::create([
            'scooter_id' => $scooter->id,
            'customer_name' => $validated['customer_name'],
            'customer_email' => $validated['customer_email'],
            'customer_phone' => $validated['customer_phone'] ?? null,
            'primary_color' => strtoupper($validated['primary_color']),
            'accent_color' => strtoupper($validated['accent_color']),
            'notes' => $validated['notes'] ?? null,
            'status' => 'nieuw',
        ]);

        WebPushNotifier::broadcastToAdmins([
            'title' => 'Nieuwe kleur-aanvraag',
            'body' => $validated['customer_name'] . ' voor ' . $scooter->display_name,
            'url' => '/admin',
            'tag' => 'color-request-' . $colorRequest->id,
            'debounce_key' => 'color-request',
            'cooldown_seconds' => (int) config('push.cooldowns.color_request', 60),
        ]);

        return back()->with('success', 'Top! Je kleuraanvraag is ontvangen. We nemen snel contact op.');
    }

    public function storeTestRideRequest(Request $request, Scooter $scooter): RedirectResponse
    {
        if (! $scooter->ready_for_sale || $scooter->status !== 'te_koop') {
            abort(404);
        }

        $validated = $request->validate([
            'customer_name' => ['required', 'string', 'max:120'],
            'customer_email' => ['required', 'email', 'max:190'],
            'customer_phone' => ['nullable', 'string', 'max:50'],
            'preferred_date' => ['nullable', 'date'],
            'preferred_time' => ['nullable', 'string', 'max:50'],
            'contact_preference' => ['required', 'in:telefoon,email,website_chat'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $testRideRequest = ScooterTestRideRequest::create([
            'scooter_id' => $scooter->id,
            'customer_name' => $validated['customer_name'],
            'customer_email' => $validated['customer_email'],
            'customer_phone' => $validated['customer_phone'] ?? null,
            'preferred_date' => $validated['preferred_date'] ?? null,
            'preferred_time' => $validated['preferred_time'] ?? null,
            'contact_preference' => $validated['contact_preference'],
            'notes' => $validated['notes'] ?? null,
            'status' => 'nieuw',
            'ip_address' => $request->ip(),
            'user_agent' => substr((string) $request->userAgent(), 0, 500),
        ]);

        WebPushNotifier::broadcastToAdmins([
            'title' => 'Nieuwe proefrit-aanvraag',
            'body' => $validated['customer_name'] . ' wil een proefrit voor ' . $scooter->display_name,
            'url' => '/admin/financien',
            'tag' => 'test-ride-request-' . $testRideRequest->id,
            'debounce_key' => 'test-ride-request',
            'cooldown_seconds' => (int) config('push.cooldowns.test_ride_request', 60),
        ]);

        return back()->with('success', 'Top! Je proefrit-aanvraag is binnen. We nemen contact met je op.');
    }
}
