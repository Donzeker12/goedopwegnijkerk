<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PurchaseEntry;
use App\Models\Scooter;
use App\Models\ScooterPart;
use App\Models\ScooterTestRideRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class FinanceController extends Controller
{
    public function index(Request $request): Response
    {
        $entries = PurchaseEntry::with(['scooter.brand', 'scooter.scooterModel'])
            ->latest('purchased_at')
            ->latest('id')
            ->limit(60)
            ->get();

        $openPayments = PurchaseEntry::with(['scooter.brand', 'scooter.scooterModel'])
            ->where('payment_status', 'open')
            ->orderByRaw('due_date IS NULL')
            ->orderBy('due_date')
            ->orderByDesc('id')
            ->get();

        $categoryTotals = [
            'scooter' => (float) PurchaseEntry::query()->where('category', 'scooter')->sum('amount'),
            'onderdeel' => (float) PurchaseEntry::query()->where('category', 'onderdeel')->sum('amount'),
            'overig' => (float) PurchaseEntry::query()->where('category', 'overig')->sum('amount'),
        ];

        $expectedProfitStock = Scooter::with('parts')
            ->whereIn('status', ['in_reparatie', 'te_koop'])
            ->get()
            ->sum(fn (Scooter $s) => $s->projected_profit ?? 0);

        $lowStockParts = ScooterPart::with(['scooter.brand', 'scooter.scooterModel'])
            ->where('minimum_stock', '>', 0)
            ->whereColumn('quantity', '<=', 'minimum_stock')
            ->orderByRaw('(minimum_stock - quantity) DESC')
            ->limit(20)
            ->get();

        $topViewedScooters = Scooter::with(['brand', 'scooterModel'])
            ->withCount('views')
            ->orderByDesc('views_count')
            ->limit(12)
            ->get()
            ->map(fn (Scooter $s) => [
                'id' => $s->id,
                'naam' => $s->display_name,
                'status' => $s->status,
                'views_count' => (int) $s->views_count,
            ]);

        $testRideRequests = ScooterTestRideRequest::with(['scooter.brand', 'scooter.scooterModel'])
            ->latest('id')
            ->limit(20)
            ->get()
            ->map(fn (ScooterTestRideRequest $request) => [
                'id' => $request->id,
                'customer_name' => $request->customer_name,
                'customer_email' => $request->customer_email,
                'customer_phone' => $request->customer_phone,
                'preferred_date' => $request->preferred_date?->format('Y-m-d'),
                'preferred_time' => $request->preferred_time,
                'contact_preference' => $request->contact_preference,
                'status' => $request->status,
                'notes' => $request->notes,
                'created_at' => $request->created_at?->format('Y-m-d H:i'),
                'scooter_id' => $request->scooter?->id,
                'scooter_name' => $request->scooter?->display_name,
            ]);

        return Inertia::render('admin/finance/index', [
            'entries' => $entries->map(fn (PurchaseEntry $e) => [
                'id' => $e->id,
                'category' => $e->category,
                'description' => $e->description,
                'amount' => (float) $e->amount,
                'payment_status' => $e->payment_status,
                'purchased_at' => $e->purchased_at?->format('Y-m-d'),
                'due_date' => $e->due_date?->format('Y-m-d'),
                'paid_at' => $e->paid_at?->format('Y-m-d'),
                'receipt_url' => $e->receipt_path ? asset('storage/' . $e->receipt_path) : null,
                'notes' => $e->notes,
                'scooter' => $e->scooter ? [
                    'id' => $e->scooter->id,
                    'naam' => $e->scooter->display_name,
                ] : null,
            ]),
            'open_payments' => $openPayments->map(fn (PurchaseEntry $e) => [
                'id' => $e->id,
                'category' => $e->category,
                'description' => $e->description,
                'amount' => (float) $e->amount,
                'due_date' => $e->due_date?->format('Y-m-d'),
                'purchased_at' => $e->purchased_at?->format('Y-m-d'),
                'scooter_name' => $e->scooter?->display_name,
            ]),
            'category_totals' => $categoryTotals,
            'expected_profit_stock' => (float) $expectedProfitStock,
            'low_stock_parts' => $lowStockParts->map(fn (ScooterPart $p) => [
                'id' => $p->id,
                'name' => $p->name,
                'category' => $p->category,
                'quantity' => $p->quantity,
                'minimum_stock' => $p->minimum_stock,
                'scooter_name' => $p->scooter?->display_name,
                'scooter_id' => $p->scooter?->id,
            ]),
            'can_manage_finance' => (bool) $request->user()?->canManageFinance(),
            'can_manage_roles' => (bool) $request->user()?->canManageOperations(),
            'top_viewed_scooters' => $topViewedScooters,
            'total_scooter_views' => (int) $topViewedScooters->sum('views_count'),
            'test_ride_requests' => $testRideRequests,
            'new_test_ride_requests_count' => (int) ScooterTestRideRequest::query()->where('status', 'nieuw')->count('*'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        if (! $request->user()?->canManageFinance()) {
            abort(403, 'Geen rechten om financiën te beheren.');
        }

        $validated = $request->validate([
            'category' => ['required', 'in:scooter,onderdeel,overig'],
            'description' => ['required', 'string', 'max:255'],
            'amount' => ['required', 'numeric', 'min:0'],
            'purchased_at' => ['nullable', 'date'],
            'due_date' => ['nullable', 'date'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'receipt' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp,pdf', 'max:10240'],
        ]);

        if ($request->hasFile('receipt')) {
            $validated['receipt_path'] = $request->file('receipt')->store('receipts/purchases', 'public');
        }

        $validated['payment_status'] = 'open';

        unset($validated['receipt']);

        PurchaseEntry::create($validated);

        return back()->with('success', 'Inkoopregel toegevoegd.');
    }

    public function markPaid(Request $request, PurchaseEntry $entry): RedirectResponse
    {
        if (! $request->user()?->canManageFinance()) {
            abort(403, 'Geen rechten om betalingen te beheren.');
        }

        $request->validate([
            'paid_at' => ['nullable', 'date'],
        ]);

        $entry->update([
            'payment_status' => 'betaald',
            'paid_at' => $request->input('paid_at') ?: now()->toDateString(),
        ]);

        return back()->with('success', 'Betaling als betaald gemarkeerd.');
    }

    public function updateAdminRole(Request $request): RedirectResponse
    {
        if (! $request->user()?->canManageOperations()) {
            abort(403, 'Geen rechten om rollen te beheren.');
        }

        $validated = $request->validate([
            'email' => ['required', 'email', 'exists:users,email'],
            'admin_role' => ['required', 'in:operations,finance,both'],
        ]);

        $user = User::query()->where('email', $validated['email'])->firstOrFail();

        $user->update([
            'is_admin' => true,
            'admin_role' => $validated['admin_role'],
        ]);

        return back()->with('success', 'Rol bijgewerkt voor ' . $user->email . '.');
    }
}
