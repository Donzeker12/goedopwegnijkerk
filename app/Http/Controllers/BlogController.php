<?php

namespace App\Http\Controllers;

use App\Models\BlogPost;
use Inertia\Inertia;
use Inertia\Response;

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
        ]);
    }
}
