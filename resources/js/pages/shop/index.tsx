import { Head, Link } from '@inertiajs/react';
import AppLayout from '../../layouts/AppLayout';

interface Scooter {
    id: number;
    naam: string;
    merk: string;
    model: string;
    prijs: number;
    foto: string | null;
    year: number | null;
    mileage: number | null;
    color: string | null;
    description: string | null;
}

interface Props {
    scooters: Scooter[];
}

export default function ShopIndex({ scooters }: Props) {
    return (
        <AppLayout>
            <Head title="Scooters te koop" />

            {/* Hero */}
            <section className="bg-gray-900 text-white py-16">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl font-bold mb-3">Scooters te koop</h1>
                    <p className="text-gray-400 text-lg">
                        {scooters.length} {scooters.length === 1 ? 'scooter' : 'scooters'} beschikbaar
                    </p>
                </div>
            </section>

            <section className="py-12 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {scooters.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">🛵</div>
                        <h2 className="text-2xl font-bold text-gray-700 mb-2">Momenteel geen scooters beschikbaar</h2>
                        <p className="text-gray-500">Kom binnenkort terug voor nieuw aanbod!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {scooters.map((scooter) => (
                            <Link
                                key={scooter.id}
                                href={`/scooters/${scooter.id}`}
                                className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden group"
                            >
                                <div className="aspect-video bg-gray-100 relative overflow-hidden">
                                    {scooter.foto ? (
                                        <img
                                            src={scooter.foto}
                                            alt={scooter.naam}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-6xl text-gray-200">
                                            🛵
                                        </div>
                                    )}
                                    <div className="absolute top-3 right-3 bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                        Te koop
                                    </div>
                                </div>
                                <div className="p-5">
                                    <h3 className="font-bold text-gray-900 text-xl mb-1">{scooter.naam}</h3>
                                    {scooter.description && (
                                        <p className="text-gray-500 text-sm mb-3 line-clamp-2">{scooter.description}</p>
                                    )}
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {scooter.year && (
                                            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                                                📅 {scooter.year}
                                            </span>
                                        )}
                                        {scooter.mileage && (
                                            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                                                📏 {scooter.mileage.toLocaleString('nl-NL')} km
                                            </span>
                                        )}
                                        {scooter.color && (
                                            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                                                🎨 {scooter.color}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                                        <span className="text-2xl font-bold text-orange-500">
                                            €{scooter.prijs.toLocaleString('nl-NL', { minimumFractionDigits: 0 })}
                                        </span>
                                        <span className="text-orange-500 text-sm font-medium group-hover:translate-x-1 transition-transform inline-block">
                                            Meer info →
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>
        </AppLayout>
    );
}
