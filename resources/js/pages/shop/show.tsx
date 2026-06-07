import { Head, Link } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';
import AppLayout from '../../layouts/AppLayout';

interface Photo {
    id: number;
    url: string;
    is_primary: boolean;
}

interface ScooterDetail {
    id: number;
    naam: string;
    merk: string;
    model: string;
    prijs: number;
    year: number | null;
    mileage: number | null;
    color: string | null;
    kenteken: string | null;
    description: string | null;
    status: string;
    photos: Photo[];
}

interface Props {
    scooter: ScooterDetail;
}

function PhotoSlider({ photos, naam }: { photos: Photo[]; naam: string }) {
    const primaryIdx = photos.findIndex((p) => p.is_primary);
    const [active, setActive] = useState(primaryIdx >= 0 ? primaryIdx : 0);
    const [lightbox, setLightbox] = useState(false);

    const prev = useCallback(() => {
        setActive((i) => (i === 0 ? photos.length - 1 : i - 1));
    }, [photos.length]);

    const next = useCallback(() => {
        setActive((i) => (i === photos.length - 1 ? 0 : i + 1));
    }, [photos.length]);

    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (e.key === 'ArrowLeft') prev();
            if (e.key === 'ArrowRight') next();
            if (e.key === 'Escape') setLightbox(false);
        }
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [prev, next]);

    if (photos.length === 0) {
        return (
            <div className="aspect-video bg-gray-100 rounded-2xl flex items-center justify-center text-8xl text-gray-200">
                🛵
            </div>
        );
    }

    return (
        <>
            {/* Main slider */}
            <div className="relative group">
                <div
                    className="aspect-video bg-gray-900 rounded-2xl overflow-hidden cursor-zoom-in relative"
                    onClick={() => setLightbox(true)}
                >
                    {photos.map((photo, idx) => (
                        <img
                            key={photo.id}
                            src={photo.url}
                            alt={`${naam} - foto ${idx + 1}`}
                            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                                idx === active ? 'opacity-100' : 'opacity-0 pointer-events-none'
                            }`}
                        />
                    ))}
                </div>

                {/* Arrows */}
                {photos.length > 1 && (
                    <>
                        <button
                            onClick={(e) => { e.stopPropagation(); prev(); }}
                            aria-label="Vorige foto"
                            className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                        >
                            ‹
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); next(); }}
                            aria-label="Volgende foto"
                            className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                        >
                            ›
                        </button>

                        {/* Dot indicators */}
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                            {photos.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={(e) => { e.stopPropagation(); setActive(idx); }}
                                    aria-label={`Foto ${idx + 1}`}
                                    className={`w-2 h-2 rounded-full transition-all ${
                                        idx === active ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/80'
                                    }`}
                                />
                            ))}
                        </div>
                    </>
                )}

                {/* Counter */}
                {photos.length > 1 && (
                    <div className="absolute top-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full pointer-events-none">
                        {active + 1} / {photos.length}
                    </div>
                )}
            </div>

            {/* Thumbnails */}
            {photos.length > 1 && (
                <div className="flex gap-2 mt-3 overflow-x-auto pb-1 snap-x">
                    {photos.map((photo, idx) => (
                        <button
                            key={photo.id}
                            onClick={() => setActive(idx)}
                            className={`flex-shrink-0 snap-start w-20 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                                idx === active
                                    ? 'border-orange-500 scale-105 shadow-md'
                                    : 'border-transparent opacity-60 hover:opacity-100'
                            }`}
                        >
                            <img src={photo.url} alt="" className="w-full h-full object-cover" />
                        </button>
                    ))}
                </div>
            )}

            {/* Lightbox */}
            {lightbox && (
                <div
                    className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
                    onClick={() => setLightbox(false)}
                >
                    <button
                        onClick={() => setLightbox(false)}
                        className="absolute top-4 right-4 text-white/70 hover:text-white text-3xl w-10 h-10 flex items-center justify-center"
                        aria-label="Sluiten"
                    >
                        ✕
                    </button>

                    {photos.length > 1 && (
                        <>
                            <button
                                onClick={(e) => { e.stopPropagation(); prev(); }}
                                aria-label="Vorige foto"
                                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/25 text-white w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-colors"
                            >
                                ‹
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); next(); }}
                                aria-label="Volgende foto"
                                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/25 text-white w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-colors"
                            >
                                ›
                            </button>
                        </>
                    )}

                    <div
                        className="max-w-5xl max-h-[85vh] mx-16 relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={photos[active].url}
                            alt={`${naam} - foto ${active + 1}`}
                            className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
                        />
                        {photos.length > 1 && (
                            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5">
                                {photos.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActive(idx)}
                                        className={`w-2 h-2 rounded-full transition-all ${
                                            idx === active ? 'bg-white scale-125' : 'bg-white/40 hover:bg-white/70'
                                        }`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}

export default function ShopShow({ scooter }: Props) {
    const specs = [
        { label: 'Merk', value: scooter.merk, icon: '🏷️' },
        { label: 'Model', value: scooter.model, icon: '📋' },
        { label: 'Bouwjaar', value: scooter.year ? String(scooter.year) : null, icon: '📅' },
        { label: 'Kilometerstand', value: scooter.mileage ? `${scooter.mileage.toLocaleString('nl-NL')} km` : null, icon: '📏' },
        { label: 'Kleur', value: scooter.color, icon: '🎨' },
        { label: 'Kenteken', value: scooter.kenteken, icon: '🪪' },
    ].filter((s) => s.value !== null);

    return (
        <AppLayout>
            <Head title={scooter.naam} />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Breadcrumb */}
                <nav className="text-sm text-gray-500 mb-6">
                    <Link href="/" className="hover:text-orange-500">Home</Link>
                    <span className="mx-2">/</span>
                    <Link href="/scooters" className="hover:text-orange-500">Scooters</Link>
                    <span className="mx-2">/</span>
                    <span className="text-gray-900">{scooter.naam}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* Photo slider */}
                    <div>
                        <PhotoSlider photos={scooter.photos} naam={scooter.naam} />
                    </div>

                    {/* Details */}
                    <div>
                        <div className="flex items-start justify-between mb-2">
                            <h1 className="text-3xl font-bold text-gray-900">{scooter.naam}</h1>
                            <span className="bg-emerald-100 text-emerald-700 text-sm font-bold px-3 py-1 rounded-full ml-4 flex-shrink-0">
                                Te koop
                            </span>
                        </div>

                        <div className="text-4xl font-bold text-orange-500 mb-6">
                            €{scooter.prijs.toLocaleString('nl-NL', { minimumFractionDigits: 0 })}
                        </div>

                        {/* Specs */}
                        <div className="bg-gray-50 rounded-2xl p-5 mb-6">
                            <h2 className="font-bold text-gray-900 mb-4">Specificaties</h2>
                            <dl className="grid grid-cols-2 gap-3">
                                {specs.map((spec) => (
                                    <div key={spec.label}>
                                        <dt className="text-xs text-gray-500 font-medium uppercase tracking-wide">{spec.label}</dt>
                                        <dd className="text-sm font-semibold text-gray-900 mt-0.5">
                                            {spec.icon} {spec.value}
                                        </dd>
                                    </div>
                                ))}
                            </dl>
                        </div>

                        {/* Description */}
                        {scooter.description && (
                            <div className="mb-6">
                                <h2 className="font-bold text-gray-900 mb-2">Omschrijving</h2>
                                <p className="text-gray-600 leading-relaxed whitespace-pre-line">{scooter.description}</p>
                            </div>
                        )}

                        {/* CTA */}
                        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5">
                            <h3 className="font-bold text-gray-900 mb-1">Interesse?</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Neem contact op voor meer informatie of een afspraak voor een bezichtiging.
                            </p>
                            <div className="flex gap-3">
                                <a
                                    href="mailto:info@goedopwegnijkerk.nl"
                                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-xl text-center transition-colors text-sm"
                                >
                                    📧 Stuur een mail
                                </a>
                                <a
                                    href="tel:+31600000000"
                                    className="flex-1 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-2.5 rounded-xl text-center transition-colors text-sm border border-gray-200"
                                >
                                    📞 Bel mij
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
