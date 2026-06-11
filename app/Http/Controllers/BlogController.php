<?php

namespace App\Http\Controllers;

use App\Models\BlogPost;
use App\Models\Scooter;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Str;

class BlogController extends Controller
{
    public function index(): Response
    {
        $posts = BlogPost::with(['photos', 'coverPhoto'])
            ->where('is_published', true)
            ->whereNotNull('published_at')
            ->orderByDesc('published_at')
            ->get()
            ->map(fn (BlogPost $post) => [
                'id' => $post->id,
                'title' => $post->title,
                'slug' => $post->slug,
                'excerpt' => $post->excerpt,
                'published_at' => $post->published_at?->toDateString(),
                'cover' => $post->coverPhoto?->url ?? $post->photos->first()?->url,
            ]);

        return Inertia::render('blog/index', [
            'posts' => $posts,
        ]);
    }

    public function show(BlogPost $post): Response
    {
        if (!$post->is_published) {
            abort(404);
        }

        $post->load('photos');

        $contentForMatch = Str::lower(strip_tags(trim(implode(' ', [
            $post->title,
            $post->excerpt,
            $post->content,
        ]))));

        $candidateScooters = Scooter::with(['brand', 'scooterModel', 'photos'])
            ->where('ready_for_sale', true)
            ->where('status', 'te_koop')
            ->latest()
            ->take(12)
            ->get();

        $relatedScooters = $candidateScooters
            ->filter(function (Scooter $scooter) use ($contentForMatch) {
                $brand = Str::lower($scooter->brand->name ?? '');
                $model = Str::lower($scooter->scooterModel->name ?? '');

                return ($brand !== '' && Str::contains($contentForMatch, $brand))
                    || ($model !== '' && Str::contains($contentForMatch, $model));
            })
            ->take(3)
            ->values();

        if ($relatedScooters->isEmpty()) {
            $relatedScooters = $candidateScooters->take(3)->values();
        }

        return Inertia::render('blog/show', [
            'post' => [
                'id' => $post->id,
                'title' => $post->title,
                'slug' => $post->slug,
                'excerpt' => $post->excerpt,
                'content' => $post->content,
                'published_at' => $post->published_at?->toDateString(),
                'photos' => $post->photos->map(fn ($photo) => [
                    'id' => $photo->id,
                    'url' => $photo->url,
                    'is_cover' => $photo->is_cover,
                ]),
            ],
            'related_scooters' => $relatedScooters->map(fn (Scooter $scooter) => [
                'id' => $scooter->id,
                'naam' => $scooter->display_name,
                'prijs' => (float) $scooter->expected_sale_price,
                'foto' => $scooter->primaryPhoto()?->url,
                'year' => $scooter->year,
                'mileage' => $scooter->mileage,
            ]),
        ]);
    }
}
