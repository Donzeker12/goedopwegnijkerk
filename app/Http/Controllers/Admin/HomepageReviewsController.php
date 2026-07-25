<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CustomerReview;
use App\Models\ReviewInvite;
use App\Support\HomepageReviews;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class HomepageReviewsController extends Controller
{
    public function index(): Response
    {
        $settings = HomepageReviews::values();

        $pending = collect();
        $approved = collect();
        $invites = collect();

        if (Schema::hasTable('customer_reviews')) {
            $pending = CustomerReview::query()
                ->where('status', CustomerReview::STATUS_PENDING)
                ->orderByDesc('submitted_at')
                ->take(50)
                ->get()
                ->map(fn (CustomerReview $review) => $this->serializeReview($review));

            $approved = CustomerReview::query()
                ->where('status', CustomerReview::STATUS_APPROVED)
                ->orderByDesc('approved_at')
                ->take(100)
                ->get()
                ->map(fn (CustomerReview $review) => $this->serializeReview($review));
        }

        if (Schema::hasTable('review_invites')) {
            $invites = ReviewInvite::query()
                ->latest()
                ->take(30)
                ->get()
                ->map(fn (ReviewInvite $invite) => [
                    'id' => $invite->id,
                    'link' => route('reviews.create', ['token' => $invite->token]),
                    'expires_at' => $invite->expires_at?->toDateTimeString(),
                    'used_at' => $invite->used_at?->toDateTimeString(),
                    'created_at' => $invite->created_at?->toDateTimeString(),
                    'is_expired' => $invite->isExpired(),
                    'is_used' => $invite->used_at !== null,
                    'is_usable' => $invite->isUsable(),
                ]);
        }

        return Inertia::render('admin/reviews/index', [
            'settings' => [
                'eyebrow' => $settings['eyebrow'] ?? 'Reviews',
                'title' => $settings['title'] ?? 'Wat klanten over ons zeggen',
                'description' => $settings['description'] ?? '',
            ],
            'pendingReviews' => $pending,
            'approvedReviews' => $approved,
            'reviewInvites' => $invites,
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'eyebrow' => ['nullable', 'string', 'max:255'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
        ]);

        HomepageReviews::save([
            'eyebrow' => $validated['eyebrow'] ?? 'Reviews',
            'title' => $validated['title'],
            'description' => $validated['description'] ?? '',
            'items' => [],
        ]);

        return back()->with('success', 'Review sectie opgeslagen!');
    }

    public function createInvite(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'expires_in_days' => ['nullable', 'integer', 'min:1', 'max:365'],
        ]);

        $days = (int) ($validated['expires_in_days'] ?? 30);

        ReviewInvite::create([
            'token' => Str::random(64),
            'created_by' => $request->user()?->id,
            'expires_at' => Carbon::now()->addDays($days),
        ]);

        return back()->with('success', 'Nieuwe beveiligde reviewlink aangemaakt.');
    }

    public function updateStatus(Request $request, CustomerReview $review): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'in:' . implode(',', [
                CustomerReview::STATUS_PENDING,
                CustomerReview::STATUS_APPROVED,
                CustomerReview::STATUS_REJECTED,
            ])],
        ]);

        $status = $validated['status'];

        $review->forceFill([
            'status' => $status,
            'approved_at' => $status === CustomerReview::STATUS_APPROVED ? Carbon::now() : null,
            'approved_by' => $status === CustomerReview::STATUS_APPROVED ? $request->user()?->id : null,
        ])->save();

        if ($status === CustomerReview::STATUS_APPROVED) {
            return back()->with('success', 'Review goedgekeurd en zichtbaar op de website.');
        }

        if ($status === CustomerReview::STATUS_REJECTED) {
            return back()->with('success', 'Review afgekeurd.');
        }

        return back()->with('success', 'Review teruggezet naar in afwachting.');
    }

    private function serializeReview(CustomerReview $review): array
    {
        return [
            'id' => $review->id,
            'name' => $review->name,
            'city' => $review->city,
            'rating' => (int) $review->rating,
            'text' => $review->text,
            'status' => $review->status,
            'submitted_at' => $review->submitted_at?->toDateTimeString(),
            'approved_at' => $review->approved_at?->toDateTimeString(),
        ];
    }
}