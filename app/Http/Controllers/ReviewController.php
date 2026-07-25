<?php

namespace App\Http\Controllers;

use App\Models\CustomerReview;
use App\Models\ReviewInvite;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class ReviewController extends Controller
{
    public function create(string $token): Response
    {
        $invite = ReviewInvite::where('token', $token)->firstOrFail();

        return Inertia::render('reviews/create', [
            'token' => $token,
            'isExpired' => $invite->isExpired(),
            'isUsed' => $invite->used_at !== null,
        ]);
    }

    public function store(Request $request, string $token): RedirectResponse
    {
        $invite = ReviewInvite::where('token', $token)->firstOrFail();

        if (! $invite->isUsable()) {
            return back()->with('error', 'Deze reviewlink is verlopen of al gebruikt. Vraag een nieuwe link aan.');
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:255'],
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'text' => ['required', 'string', 'min:20', 'max:4000'],
        ]);

        CustomerReview::create([
            'review_invite_id' => $invite->id,
            'name' => trim($validated['name']),
            'city' => trim((string) ($validated['city'] ?? '')),
            'rating' => (int) $validated['rating'],
            'text' => trim($validated['text']),
            'status' => CustomerReview::STATUS_PENDING,
            'submitted_at' => Carbon::now(),
        ]);

        $invite->markUsed();

        return redirect()->route('reviews.create', ['token' => $token])->with('success', 'Bedankt! Je review is ontvangen en wordt eerst gecontroleerd.');
    }
}
