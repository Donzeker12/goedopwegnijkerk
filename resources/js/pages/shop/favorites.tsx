import { usePage, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AppLayout from '../../layouts/AppLayout';

interface Scooter {
    id: number;
    displayName: string;
    brand: string;
    model: string;
    price: number;
    year: number;
    mileage: number;
    color: string;
    image: string;
    status: string;
    reviewScore: number;
    reviewCount: number;
}

export default function FavoritesPage() {
    const { props } = usePage();
    const isLoggedIn = (props.auth as any)?.user;
    const [favorites, setFavorites] = useState<Scooter[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const normalizeFavorites = (value: unknown): Scooter[] => {
        return Array.isArray(value) ? (value as Scooter[]) : [];
    };

    const readGuestFavoriteIds = (): number[] => {
        try {
            const raw = localStorage.getItem('favorites');
            const parsed = raw ? JSON.parse(raw) : [];
            return Array.isArray(parsed)
                ? parsed
                    .map((id) => Number(id))
                    .filter((id) => Number.isInteger(id) && id > 0)
                : [];
        } catch {
            return [];
        }
    };

    useEffect(() => {
        const loadFavorites = async () => {
            setIsLoading(true);

            if (isLoggedIn) {
                // Load from database for logged-in users
                try {
                    const response = await fetch('/api/favorieten/lijst');
                    const data = await response.json();
                    setFavorites(normalizeFavorites(data?.favorites));
                } catch (error) {
                    console.error('Error loading favorites:', error);
                    setFavorites([]);
                }
            } else {
                // Load from localStorage for guest users
                const ids = readGuestFavoriteIds();

                if (ids.length > 0) {
                    try {
                        const params = new URLSearchParams();
                        ids.forEach((id) => params.append('ids[]', String(id)));
                        const response = await fetch(`/api/favorieten/lijst?${params.toString()}`);
                        const data = await response.json();
                        setFavorites(normalizeFavorites(data?.favorites));
                    } catch (error) {
                        console.error('Error loading favorites:', error);
                        setFavorites([]);
                    }
                } else {
                    setFavorites([]);
                }
            }

            setIsLoading(false);
        };

        loadFavorites();
    }, [isLoggedIn]);

    return (
        <AppLayout>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Mijn Favorieten</h1>
                    <p className="text-gray-600">
                        {favorites.length > 0
                            ? `Je hebt ${favorites.length} scooter${favorites.length !== 1 ? 's' : ''} opgeslagen`
                            : 'Je hebt nog geen favorieten'}
                    </p>
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                    </div>
                ) : favorites.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {favorites.map((scooter) => (
                            <Link key={scooter.id} href={`/scooters/${scooter.id}`}>
                                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:border-orange-500 transition-colors group cursor-pointer">
                                    {/* Image */}
                                    <div className="relative h-48 bg-gray-100 overflow-hidden">
                                        {scooter.image ? (
                                            <img
                                                src={scooter.image}
                                                alt={scooter.displayName}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                Geen afbeelding
                                            </div>
                                        )}
                                        {scooter.status === 'te_koop' && (
                                            <div className="absolute top-3 right-3 bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full">
                                                Te koop
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="p-4">
                                        <h3 className="font-bold text-lg text-gray-900 mb-1 group-hover:text-orange-500 transition-colors">
                                            {scooter.displayName}
                                        </h3>
                                        <p className="text-sm text-gray-600 mb-3">
                                            {scooter.brand} {scooter.model}
                                        </p>

                                        {/* Specs */}
                                        <div className="grid grid-cols-2 gap-2 mb-4 text-xs text-gray-600">
                                            <div>
                                                <span className="font-semibold">Jaar:</span> {scooter.year}
                                            </div>
                                            <div>
                                                <span className="font-semibold">Km:</span> {scooter.mileage.toLocaleString('nl-NL')}
                                            </div>
                                            <div>
                                                <span className="font-semibold">Kleur:</span> {scooter.color}
                                            </div>
                                            {scooter.reviewCount > 0 && (
                                                <div>
                                                    <span className="font-semibold">⭐</span> {scooter.reviewScore.toFixed(1)}/5
                                                </div>
                                            )}
                                        </div>

                                        {/* Price */}
                                        <div className="text-2xl font-bold text-orange-500 mb-4">
                                            €{scooter.price.toLocaleString('nl-NL', { minimumFractionDigits: 0 })}
                                        </div>

                                        <button className="w-full bg-gray-900 hover:bg-black text-white font-semibold py-2 rounded-lg transition-colors">
                                            Bekijk details
                                        </button>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 text-center">
                        <p className="text-blue-900 text-lg mb-4">Je hebt nog geen favorieten opgeslagen.</p>
                        <p className="text-blue-700 mb-6">
                            Klik op het hart-icoontje op een scooter om deze toe te voegen aan je favorieten.
                        </p>
                        <Link href="/scooters">
                            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors">
                                Bekijk alle scooters
                            </button>
                        </Link>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
