<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PushSubscription;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PushSubscriptionController extends Controller
{
    public function index(Request $request): Response
    {
        if (! $request->user()?->canManageOperations()) {
            abort(403, 'Geen rechten om push devices te beheren.');
        }

        $subscriptions = PushSubscription::query()
            ->with('user:id,name,email')
            ->latest('id')
            ->limit(200)
            ->get()
            ->map(fn (PushSubscription $subscription) => [
                'id' => $subscription->id,
                'user' => [
                    'id' => $subscription->user?->id,
                    'name' => $subscription->user?->name,
                    'email' => $subscription->user?->email,
                ],
                'endpoint' => $subscription->endpoint,
                'content_encoding' => $subscription->content_encoding,
                'created_at' => $subscription->created_at?->format('Y-m-d H:i'),
                'last_used_at' => $subscription->last_used_at?->format('Y-m-d H:i'),
            ]);

        return Inertia::render('admin/push/index', [
            'subscriptions' => $subscriptions,
            'stats' => [
                'total' => (int) $subscriptions->count(),
                'active_last_7_days' => (int) PushSubscription::query()
                    ->where('last_used_at', '>=', now()->subDays(7))
                    ->count('*'),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        if (!config('push.enabled')) {
            return response()->json(['message' => 'Push notificaties zijn uitgeschakeld.'], 422);
        }

        $validated = $request->validate([
            'endpoint' => ['required', 'string', 'max:2000'],
            'keys.p256dh' => ['required', 'string', 'max:1000'],
            'keys.auth' => ['required', 'string', 'max:255'],
            'contentEncoding' => ['nullable', 'string', 'max:50'],
        ]);

        $subscription = PushSubscription::query()->updateOrCreate(
            ['endpoint' => $validated['endpoint']],
            [
                'user_id' => $request->user()->id,
                'public_key' => $validated['keys']['p256dh'],
                'auth_token' => $validated['keys']['auth'],
                'content_encoding' => $validated['contentEncoding'] ?? 'aesgcm',
                'last_used_at' => now(),
            ]
        );

        return response()->json([
            'id' => $subscription->id,
            'message' => 'Push subscription opgeslagen.',
        ]);
    }

    public function destroy(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'endpoint' => ['required', 'string', 'max:2000'],
        ]);

        PushSubscription::query()
            ->where('endpoint', $validated['endpoint'])
            ->where('user_id', $request->user()->id)
            ->delete();

        return response()->json([
            'message' => 'Push subscription verwijderd.',
        ]);
    }

    public function destroyManaged(Request $request, PushSubscription $subscription): RedirectResponse
    {
        if (! $request->user()?->canManageOperations()) {
            abort(403, 'Geen rechten om push devices te beheren.');
        }

        PushSubscription::query()->whereKey($subscription->id)->delete();

        return back()->with('success', 'Push device verwijderd.');
    }
}
