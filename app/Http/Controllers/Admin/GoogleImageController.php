<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Scooter;
use App\Models\ScooterPhoto;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class GoogleImageController extends Controller
{
    /**
     * Search Google Images for a scooter and return thumbnail results.
     */
    public function search(Scooter $scooter): JsonResponse
    {
        $apiKey = config('services.google.api_key');
        $engineId = config('services.google.search_engine_id');

        if (!$apiKey || !$engineId) {
            return response()->json([
                'error' => 'Google API sleutels zijn niet ingesteld. Voeg GOOGLE_API_KEY en GOOGLE_SEARCH_ENGINE_ID toe aan het .env bestand.',
                'configured' => false,
            ], 503);
        }

        $scooter->load(['brand', 'scooterModel']);
        $query = $scooter->brand->name . ' ' . $scooter->scooterModel->name . ' scooter';

        $response = Http::timeout(10)->get('https://www.googleapis.com/customsearch/v1', [
            'key'        => $apiKey,
            'cx'         => $engineId,
            'searchType' => 'image',
            'q'          => $query,
            'num'        => 8,
            'safe'       => 'active',
            'imgType'    => 'photo',
        ]);

        if (!$response->ok()) {
            $errorMsg = $response->json('error.message') ?? 'Onbekende fout van Google API.';
            return response()->json(['error' => $errorMsg], 500);
        }

        $items = collect($response->json('items', []))->map(fn($item) => [
            'title'     => $item['title'] ?? '',
            'url'       => $item['link'],
            'thumbnail' => $item['image']['thumbnailLink'] ?? $item['link'],
            'width'     => $item['image']['width'] ?? null,
            'height'    => $item['image']['height'] ?? null,
            'source'    => $item['displayLink'] ?? '',
        ]);

        return response()->json([
            'images'  => $items,
            'query'   => $query,
            'configured' => true,
        ]);
    }

    /**
     * Download a chosen Google image URL and save it as a scooter photo.
     */
    public function import(Request $request, Scooter $scooter): JsonResponse
    {
        $request->validate([
            'url' => ['required', 'url'],
        ]);

        $imageUrl = $request->input('url');

        // Only allow HTTPS
        if (!str_starts_with($imageUrl, 'https://')) {
            return response()->json(['error' => 'Alleen HTTPS afbeeldingen zijn toegestaan.'], 422);
        }

        $download = Http::withOptions([
            'timeout'         => 15,
            'connect_timeout' => 5,
        ])->get($imageUrl);

        if (!$download->ok()) {
            return response()->json(['error' => 'Afbeelding kon niet worden gedownload.'], 422);
        }

        // Validate content type
        $contentType = strtolower(explode(';', $download->header('Content-Type') ?? '')[0]);
        $allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

        if (!in_array($contentType, $allowed)) {
            return response()->json(['error' => 'Bestandstype niet ondersteund. Alleen JPG, PNG en WebP.'], 422);
        }

        // Limit size to 20 MB
        if (strlen($download->body()) > 20 * 1024 * 1024) {
            return response()->json(['error' => 'Afbeelding is te groot (max 20MB).'], 422);
        }

        $ext = match ($contentType) {
            'image/png'  => 'png',
            'image/webp' => 'webp',
            default      => 'jpg',
        };

        $path = 'scooters/' . $scooter->id . '/google_' . Str::random(12) . '.' . $ext;
        Storage::disk('public')->put($path, $download->body());

        $hasPrimary = $scooter->photos()->where('is_primary', true)->exists();
        $sortOrder  = ($scooter->photos()->max('sort_order') ?? 0) + 1;

        $photo = ScooterPhoto::create([
            'scooter_id' => $scooter->id,
            'path'       => $path,
            'is_primary' => !$hasPrimary,
            'sort_order' => $sortOrder,
        ]);

        return response()->json([
            'id'         => $photo->id,
            'url'        => $photo->url,
            'is_primary' => $photo->is_primary,
        ]);
    }
}
