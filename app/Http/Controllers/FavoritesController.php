<?php

namespace App\Http\Controllers;

use App\Models\Favorite;
use App\Models\Scooter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FavoritesController extends Controller
{
    /**
     * Toggle favorite status for a scooter
     */
    public function toggle(Request $request, int $scooterId): JsonResponse
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $favorite = Favorite::where('user_id', $user->id)
            ->where('scooter_id', $scooterId)
            ->first();

        if ($favorite) {
            $favorite->delete();
            return response()->json(['is_favorited' => false, 'message' => 'Verwijderd van favorieten']);
        } else {
            Favorite::create([
                'user_id' => $user->id,
                'scooter_id' => $scooterId,
            ]);
            return response()->json(['is_favorited' => true, 'message' => 'Toegevoegd aan favorieten']);
        }
    }

    /**
     * Check if a scooter is favorited by the current user
     */
    public function isFavorited(Request $request, int $scooterId): JsonResponse
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['is_favorited' => false]);
        }

        $isFavorited = Favorite::where('user_id', $user->id)
            ->where('scooter_id', $scooterId)
            ->exists();

        return response()->json(['is_favorited' => $isFavorited]);
    }

    /**
     * Get list of favorited scooter IDs for the current user
     */
    public function listFavoritedIds(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['favorites' => []]);
        }

        $favoriteIds = Favorite::where('user_id', $user->id)
            ->pluck('scooter_id')
            ->toArray();

        return response()->json(['favorites' => $favoriteIds]);
    }

    /**
     * Get full list of favorited scooters with details
     */
    public function list(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $favorites = Favorite::where('user_id', $user->id)
            ->with([
                'scooter' => function ($query) {
                    $query->with(['brand', 'scooterModel', 'photos']);
                },
            ])
            ->latest('created_at')
            ->get()
            ->map(function (Favorite $favorite) {
                $scooter = $favorite->scooter;
                return [
                    'id' => $scooter->id,
                    'displayName' => $scooter->display_name,
                    'brand' => $scooter->brand->name,
                    'model' => $scooter->scooterModel->name,
                    'price' => $scooter->expected_sale_price,
                    'year' => $scooter->year,
                    'mileage' => $scooter->mileage,
                    'color' => $scooter->color,
                    'image' => $scooter->primaryPhoto()?->image_path,
                    'status' => $scooter->status,
                    'reviewScore' => $scooter->review_score,
                    'reviewCount' => $scooter->review_count,
                ];
            });

        return response()->json(['favorites' => $favorites]);
    }

    public function listPublic(Request $request)
    {
        $ids = $request->input('ids', []);
        if (empty($ids)) {
            return response()->json(['favorites' => []]);
        }

        $scooters = Scooter::whereIn('id', $ids)
            ->with(['brand', 'scooterModel', 'photos'])
            ->get()
            ->map(function (Scooter $scooter) {
                return [
                    'id' => $scooter->id,
                    'displayName' => $scooter->display_name,
                    'brand' => $scooter->brand->name,
                    'model' => $scooter->scooterModel->name,
                    'price' => $scooter->expected_sale_price,
                    'year' => $scooter->year,
                    'mileage' => $scooter->mileage,
                    'color' => $scooter->color,
                    'image' => $scooter->primaryPhoto()?->image_path,
                    'status' => $scooter->status,
                    'reviewScore' => $scooter->review_score,
                    'reviewCount' => $scooter->review_count,
                ];
            });

        return response()->json(['favorites' => $scooters]);
    }

    public function listPublicPage()
    {
        return Inertia::render('shop/favorites');
    }

    public function getList(Request $request)
    {
        $user = $request->user();

        if ($user) {
            // Return database favorites for logged-in users
            $favorites = Favorite::where('user_id', $user->id)
                ->with([
                    'scooter' => function ($query) {
                        $query->with(['brand', 'scooterModel', 'photos']);
                    },
                ])
                ->latest('created_at')
                ->get()
                ->map(function (Favorite $favorite) {
                    $scooter = $favorite->scooter;
                    return [
                        'id' => $scooter->id,
                        'displayName' => $scooter->display_name,
                        'brand' => $scooter->brand->name,
                        'model' => $scooter->scooterModel->name,
                        'price' => $scooter->expected_sale_price,
                        'year' => $scooter->year,
                        'mileage' => $scooter->mileage,
                        'color' => $scooter->color,
                        'image' => $scooter->primaryPhoto()?->image_path,
                        'status' => $scooter->status,
                        'reviewScore' => $scooter->review_score,
                        'reviewCount' => $scooter->review_count,
                    ];
                });

            return response()->json(['favorites' => $favorites]);
        }

        // For guests, they should provide IDs
        $ids = $request->input('ids', []);
        if (empty($ids)) {
            return response()->json(['favorites' => []]);
        }

        $scooters = Scooter::whereIn('id', $ids)
            ->with(['brand', 'scooterModel', 'photos'])
            ->get()
            ->map(function (Scooter $scooter) {
                return [
                    'id' => $scooter->id,
                    'displayName' => $scooter->display_name,
                    'brand' => $scooter->brand->name,
                    'model' => $scooter->scooterModel->name,
                    'price' => $scooter->expected_sale_price,
                    'year' => $scooter->year,
                    'mileage' => $scooter->mileage,
                    'color' => $scooter->color,
                    'image' => $scooter->primaryPhoto()?->image_path,
                    'status' => $scooter->status,
                    'reviewScore' => $scooter->review_score,
                    'reviewCount' => $scooter->review_count,
                ];
            });

        return response()->json(['favorites' => $scooters]);
    }
}
