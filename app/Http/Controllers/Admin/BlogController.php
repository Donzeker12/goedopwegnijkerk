<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BlogPhoto;
use App\Models\BlogPost;
use App\Models\Scooter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class BlogController extends Controller
{
    public function index(): Response
    {
        $posts = BlogPost::with(['coverPhoto'])
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (BlogPost $post) => [
                'id' => $post->id,
                'title' => $post->title,
                'slug' => $post->slug,
                'is_published' => $post->is_published,
                'published_at' => $post->published_at?->toDateTimeString(),
                'created_at' => $post->created_at?->toDateTimeString(),
                'cover' => $post->coverPhoto?->url,
            ]);

        return Inertia::render('admin/blog/index', [
            'posts' => $posts,
        ]);
    }

    public function create(Request $request): Response
    {
        $mode = $request->query('mode') === 'normal' ? 'normal' : 'quick';

        return Inertia::render('admin/blog/create', [
            'mode' => $mode,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'excerpt' => ['nullable', 'string', 'max:500'],
            'content' => ['required', 'string'],
            'is_published' => ['nullable', 'boolean'],
        ]);

        $isPublished = (bool) ($validated['is_published'] ?? false);

        $post = BlogPost::create([
            'title' => $validated['title'],
            'slug' => $this->uniqueSlug($validated['title']),
            'excerpt' => $validated['excerpt'] ?? null,
            'content' => $validated['content'],
            'is_published' => $isPublished,
            'published_at' => $isPublished ? now() : null,
        ]);

        return redirect()->route('admin.blog.edit', $post)->with('success', 'Blog aangemaakt. Voeg nu foto\'s toe.');
    }

    public function edit(BlogPost $post): Response
    {
        $post->load('photos');

        return Inertia::render('admin/blog/edit', [
            'post' => [
                'id' => $post->id,
                'title' => $post->title,
                'slug' => $post->slug,
                'excerpt' => $post->excerpt,
                'content' => $post->content,
                'is_published' => $post->is_published,
                'published_at' => $post->published_at?->toDateTimeString(),
                'photos' => $post->photos->map(fn (BlogPhoto $photo) => [
                    'id' => $photo->id,
                    'url' => $photo->url,
                    'is_cover' => $photo->is_cover,
                    'sort_order' => $photo->sort_order,
                ]),
            ],
        ]);
    }

    public function preview(BlogPost $post): Response
    {
        $post->load('photos');
        $relatedScooters = $this->relatedScootersFor($post);

        return Inertia::render('blog/show', [
            'post' => [
                'id' => $post->id,
                'title' => $post->title,
                'slug' => $post->slug,
                'excerpt' => $post->excerpt,
                'content' => $post->content,
                'published_at' => $post->published_at?->toDateString(),
                'photos' => $post->photos->map(fn (BlogPhoto $photo) => [
                    'id' => $photo->id,
                    'url' => $photo->url,
                    'is_cover' => $photo->is_cover,
                ]),
            ],
            'related_scooters' => $relatedScooters,
            'preview' => true,
        ]);
    }

    public function update(Request $request, BlogPost $post): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'excerpt' => ['nullable', 'string', 'max:500'],
            'content' => ['required', 'string'],
            'is_published' => ['nullable', 'boolean'],
        ]);

        $isPublished = (bool) ($validated['is_published'] ?? false);

        $post->update([
            'title' => $validated['title'],
            'slug' => $validated['title'] !== $post->title ? $this->uniqueSlug($validated['title'], $post->id) : $post->slug,
            'excerpt' => $validated['excerpt'] ?? null,
            'content' => $validated['content'],
            'is_published' => $isPublished,
            'published_at' => $isPublished ? ($post->published_at ?? now()) : null,
        ]);

        return back()->with('success', 'Blog bijgewerkt.');
    }

    public function destroy(BlogPost $post): RedirectResponse
    {
        foreach ($post->photos as $photo) {
            Storage::disk('public')->delete($photo->path);
        }

        BlogPost::query()->whereKey($post->id)->delete();

        return redirect()->route('admin.blog.index')->with('success', 'Blog verwijderd.');
    }

    public function uploadPhotos(Request $request, BlogPost $post): RedirectResponse
    {
        $request->validate([
            'photos' => ['required', 'array', 'min:1'],
            'photos.*' => ['required', 'image', 'mimes:jpeg,png,jpg,webp', 'max:20480'],
        ], [
            'photos.required' => 'Selecteer minimaal één foto.',
            'photos.*.image' => 'Bestand moet een afbeelding zijn.',
            'photos.*.mimes' => 'Alleen jpeg, png, jpg en webp zijn toegestaan.',
            'photos.*.max' => 'Foto mag maximaal 20MB zijn.',
        ]);

        $sortStart = ($post->photos()->max('sort_order') ?? 0) + 1;
        $hasCover = $post->photos()->where('is_cover', true)->exists();

        foreach ($request->file('photos') as $index => $photo) {
            $path = $photo->store('blogs/' . $post->id, 'public');

            BlogPhoto::create([
                'blog_post_id' => $post->id,
                'path' => $path,
                'is_cover' => !$hasCover && $index === 0,
                'sort_order' => $sortStart + $index,
            ]);

            if (!$hasCover && $index === 0) {
                $hasCover = true;
            }
        }

        return back()->with('success', 'Foto\'s geüpload.');
    }

    public function uploadEditorImage(Request $request): JsonResponse
    {
        $request->validate([
            'photo' => ['required', 'image', 'mimes:jpeg,png,jpg,webp', 'max:20480'],
        ], [
            'photo.required' => 'Selecteer een afbeelding.',
            'photo.image' => 'Bestand moet een afbeelding zijn.',
            'photo.mimes' => 'Alleen jpeg, png, jpg en webp zijn toegestaan.',
            'photo.max' => 'Foto mag maximaal 20MB zijn.',
        ]);

        $path = $request->file('photo')->store('blogs/inline', 'public');

        return response()->json([
            'url' => Storage::url($path),
        ]);
    }

    public function setCover(BlogPost $post, BlogPhoto $photo): RedirectResponse
    {
        if ($photo->blog_post_id !== $post->id) {
            abort(404);
        }

        $post->photos()->update(['is_cover' => false]);
        $photo->update(['is_cover' => true]);

        return back()->with('success', 'Coverfoto ingesteld.');
    }

    public function destroyPhoto(BlogPost $post, BlogPhoto $photo): RedirectResponse
    {
        if ($photo->blog_post_id !== $post->id) {
            abort(404);
        }

        $wasCover = $photo->is_cover;
        Storage::disk('public')->delete($photo->path);
        BlogPhoto::query()->whereKey($photo->id)->delete();

        if ($wasCover) {
            $next = $post->photos()->first();
            $next?->update(['is_cover' => true]);
        }

        return back()->with('success', 'Foto verwijderd.');
    }

    private function uniqueSlug(string $title, ?int $ignoreId = null): string
    {
        $base = Str::slug($title);
        $slug = $base !== '' ? $base : 'blog';
        $original = $slug;
        $i = 1;

        while (
            BlogPost::query()
                ->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))
                ->where('slug', $slug)
                ->exists()
        ) {
            $slug = $original . '-' . $i;
            $i++;
        }

        return $slug;
    }

    /**
     * @return array<int, array{id:int,naam:string,prijs:float,foto:string|null,year:int|null,mileage:int|null}>
     */
    private function relatedScootersFor(BlogPost $post): array
    {
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

        return $relatedScooters->map(fn (Scooter $scooter) => [
            'id' => $scooter->id,
            'naam' => $scooter->display_name,
            'prijs' => (float) $scooter->expected_sale_price,
            'foto' => $scooter->primaryPhoto()?->url,
            'year' => $scooter->year,
            'mileage' => $scooter->mileage,
        ])->all();
    }
}
