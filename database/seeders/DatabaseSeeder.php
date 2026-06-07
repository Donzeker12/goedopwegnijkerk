<?php

namespace Database\Seeders;

use App\Models\Brand;
use App\Models\ScooterModel;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Admin user
        User::firstOrCreate(
            ['email' => 'admin@goedopwegnijkerk.nl'],
            [
                'name' => 'Admin',
                'password' => Hash::make('admin123'),
            ]
        );

        // Brands and models
        $brandsData = [
            'BTC' => ['City', 'Roma', 'Riva', 'Splash', 'Flash'],
            'La Souris' => ['Retro', 'City', 'Sport'],
            'Killerbee' => ['VX50', 'Sprint 25', 'Sprint 45'],
            'Tomos' => ['Classic', 'Youngst\'R', 'Revival'],
            'Peugeot' => ['Kisbee', 'Speedfight', 'Tweet'],
            'Sym' => ['Symphony', 'Jet', 'Orbit'],
        ];

        foreach ($brandsData as $brandName => $models) {
            $brand = Brand::firstOrCreate(['name' => $brandName]);
            foreach ($models as $modelName) {
                ScooterModel::firstOrCreate([
                    'brand_id' => $brand->id,
                    'name' => $modelName,
                ]);
            }
        }
    }
}
