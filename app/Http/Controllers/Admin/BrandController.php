<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\ScooterModel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class BrandController extends Controller
{
    public function store(Request $request): JsonResponse|RedirectResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:100', Rule::unique('brands', 'name')],
        ]);

        $brand = Brand::create($request->only('name'));

        if ($request->expectsJson()) {
            return response()->json(['id' => $brand->id, 'name' => $brand->name]);
        }

        return back()->with('success', 'Merk aangemaakt!');
    }

    public function storeModel(Request $request, Brand $brand): JsonResponse|RedirectResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:100'],
        ]);

        $model = $brand->scooterModels()->create($request->only('name'));

        if ($request->expectsJson()) {
            return response()->json(['id' => $model->id, 'name' => $model->name, 'brand_id' => $brand->id]);
        }

        return back()->with('success', 'Model aangemaakt!');
    }
}
