<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Support\HomepageReviews;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HomepageReviewsController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/reviews/index', [
            'reviews' => HomepageReviews::values(),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'eyebrow' => ['nullable', 'string', 'max:255'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'items' => ['required', 'array'],
            'items.*.name' => ['required', 'string', 'max:255'],
            'items.*.city' => ['nullable', 'string', 'max:255'],
            'items.*.rating' => ['nullable', 'integer', 'min:1', 'max:5'],
            'items.*.text' => ['required', 'string'],
        ]);

        HomepageReviews::save($validated);

        return back()->with('success', 'Reviews opgeslagen!');
    }
}