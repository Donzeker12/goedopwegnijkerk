<?php

namespace App\Http\Controllers;

use App\Models\BlogPost;
use App\Models\CustomerReview;
use App\Models\Scooter;
use App\Support\HomepageReviews;
use App\Support\SiteSettings;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function index(): Response
    {
        $featured = Scooter::with(['brand', 'scooterModel', 'photos'])
            ->where('ready_for_sale', true)
            ->where('status', 'te_koop')
            ->orderBy('created_at', 'desc')
            ->take(3)
            ->get()
            ->map(fn (Scooter $s) => [
                'id' => $s->id,
                'naam' => $s->display_name,
                'prijs' => (float) $s->expected_sale_price,
                'status' => $s->status,
                'foto' => $s->primaryPhoto()?->url,
                'year' => $s->year,
                'mileage' => $s->mileage,
                'color' => $s->color,
            ]);

        $latestBlogs = BlogPost::with(['coverPhoto', 'photos'])
            ->where('is_published', true)
            ->whereNotNull('published_at')
            ->orderByDesc('published_at')
            ->take(3)
            ->get()
            ->map(fn (BlogPost $post) => [
                'id' => $post->id,
                'title' => $post->title,
                'slug' => $post->slug,
                'excerpt' => $post->excerpt,
                'published_at' => $post->published_at?->toDateString(),
                'cover' => $post->coverPhoto?->url ?? $post->photos->first()?->url,
            ]);

        $reviewSettings = HomepageReviews::values();

        $approvedReviews = [];

        if (Schema::hasTable('customer_reviews')) {
            $approvedReviews = CustomerReview::query()
                ->approved()
                ->orderByDesc('approved_at')
                ->take(100)
                ->get()
                ->map(fn (CustomerReview $review) => [
                    'name' => $review->name,
                    'city' => $review->city,
                    'rating' => (string) $review->rating,
                    'text' => $review->text,
                ])
                ->values()
                ->all();
        }

        return Inertia::render('home', [
            'featured' => $featured,
            'latestBlogs' => $latestBlogs,
            'siteSettings' => SiteSettings::many([
                'home-hero',
                'home-quality',
                'home-maintenance',
                'home-featured',
                'home-cta',
                'home-info',
            ]),
            'reviews' => [
                'eyebrow' => $reviewSettings['eyebrow'] ?? 'Reviews',
                'title' => $reviewSettings['title'] ?? 'Wat klanten over ons zeggen',
                'description' => $reviewSettings['description'] ?? '',
                'items' => $approvedReviews,
            ],
            'cityLandingPages' => collect(config('seo.city_pages', []))
                ->map(fn (array $city, string $slug) => [
                    'slug' => $slug,
                    'name' => $city['name'],
                ])
                ->values(),
            'business' => config('seo.business'),
        ]);
    }
}
