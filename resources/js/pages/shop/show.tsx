import { Link, useForm } from '@inertiajs/react';
import { type FormEvent, useCallback, useEffect, useState } from 'react';
import ScooterGuaranteeBadge from '../../components/ScooterGuaranteeBadge';
import SeoHead from '../../components/SeoHead';
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
    warranty_months: number | null;
    delivery_service_included: boolean;
    inspection_points: number | null;
    review_score: number | null;
    review_count: number | null;
    recent_work: { name: string; placed_at: string | null }[];
    photos: Photo[];
}

interface Props {
    scooter: ScooterDetail;
    features: {
        loyalty_pass_public: boolean;
    };
    related_scooters: {
        id: number;
        naam: string;
        prijs: number;
        foto: string | null;
        year: number | null;
        mileage: number | null;
    }[];
}

function PhotoSlider({ photos, naam, primaryColor, accentColor }: { photos: Photo[]; naam: string; primaryColor: string; accentColor: string }) {
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
                            loading={idx === 0 ? 'eager' : 'lazy'}
                            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                                idx === active ? 'opacity-100' : 'opacity-0 pointer-events-none'
                            }`}
                        />
                    ))}
                    <div className="absolute inset-0 pointer-events-none" style={{ backgroundColor: primaryColor, mixBlendMode: 'multiply', opacity: 0.28 }} />
                    <div className="absolute inset-x-0 bottom-0 h-1/3 pointer-events-none" style={{ backgroundColor: accentColor, mixBlendMode: 'overlay', opacity: 0.35 }} />
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
                            className={`shrink-0 snap-start w-20 h-16 rounded-xl overflow-hidden border-2 transition-all ${
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
                        <div className="absolute inset-0 pointer-events-none rounded-xl" style={{ backgroundColor: primaryColor, mixBlendMode: 'multiply', opacity: 0.25 }} />
                        <div className="absolute inset-x-0 bottom-0 h-1/3 pointer-events-none rounded-b-xl" style={{ backgroundColor: accentColor, mixBlendMode: 'overlay', opacity: 0.32 }} />
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

export default function ShopShow({ scooter, features, related_scooters }: Props) {
    const showColorConfigurator = false;

    const faqItems = [
        {
            id: 'proefrit',
            question: `Kan ik met deze ${scooter.merk} ${scooter.model} eerst een proefrit maken?`,
            answer: 'Ja. Via het formulier op deze pagina plan je direct een proefrit-aanvraag. We nemen daarna persoonlijk contact op voor een moment dat past.',
        },
        {
            id: 'controle',
            question: 'Wat is er gecontroleerd voordat de scooter te koop staat?',
            answer: `Elke scooter wordt rijklaar gemaakt. ${scooter.inspection_points !== null ? `Bij deze scooter zijn ${scooter.inspection_points} keuringspunten gecontroleerd.` : 'We controleren onder andere aandrijving, remmen en basis-elektra.'}`,
        },
        {
            id: 'garantie',
            question: 'Is er afleverservice of garantie mogelijk?',
            answer: `${scooter.delivery_service_included ? 'Afleverbeurt is inbegrepen.' : 'Afleverbeurt is niet standaard inbegrepen.'} ${scooter.warranty_months !== null ? `Daarnaast is er ${scooter.warranty_months} maanden garantie vermeld bij deze scooter.` : 'Garantieperiode verschilt per scooter; kijk daarvoor naar de specificaties op deze pagina.'}`,
        },
        {
            id: 'reserveren',
            question: 'Kan ik deze scooter reserveren?',
            answer: 'Reserveren kan in overleg. De snelste route is een proefrit-aanvraag of direct bellen, zodat we beschikbaarheid direct kunnen bevestigen.',
        },
    ];

    const productSchema = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: scooter.naam,
        brand: scooter.merk,
        description: scooter.description ?? `${scooter.merk} ${scooter.model} tweedehands scooter`,
        image: scooter.photos.map((p) => p.url),
        sku: `scooter-${scooter.id}`,
        category: 'Tweedehands scooter',
        offers: {
            '@type': 'Offer',
            priceCurrency: 'EUR',
            price: scooter.prijs,
            url: `/scooters/${scooter.id}`,
            availability: 'https://schema.org/InStock',
            itemCondition: 'https://schema.org/UsedCondition',
        },
        ...(scooter.review_score !== null && scooter.review_count !== null && scooter.review_count > 0
            ? {
                aggregateRating: {
                    '@type': 'AggregateRating',
                    ratingValue: scooter.review_score,
                    ratingCount: scooter.review_count,
                    bestRating: 5,
                    worstRating: 1,
                },
            }
            : {}),
    };

    const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqItems.map((item) => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: item.answer,
            },
        })),
    };

    const colorForm = useForm({
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        primary_color: '#F472B6',
        accent_color: '#111827',
        notes: '',
    });

    const testRideForm = useForm({
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        preferred_date: '',
        preferred_time: '',
        contact_preference: 'telefoon' as 'telefoon' | 'email' | 'website_chat',
        notes: '',
    });

    function submitColorRequest(e: FormEvent) {
        e.preventDefault();
        colorForm.post(`/scooters/${scooter.id}/kleur-aanvraag`, {
            preserveScroll: true,
            onSuccess: () => {
                colorForm.reset('customer_name', 'customer_email', 'customer_phone', 'notes');
            },
        });
    }

    function submitTestRideRequest(e: FormEvent) {
        e.preventDefault();
        testRideForm.post(`/scooters/${scooter.id}/proefrit-aanvraag`, {
            preserveScroll: true,
            onSuccess: () => {
                testRideForm.reset('customer_name', 'customer_email', 'customer_phone', 'preferred_date', 'preferred_time', 'notes');
                testRideForm.setData('contact_preference', 'telefoon');
            },
        });
    }

    const specs = [
        { label: 'Merk', value: scooter.merk, icon: '🏷️' },
        { label: 'Model', value: scooter.model, icon: '📋' },
        { label: 'Bouwjaar', value: scooter.year ? String(scooter.year) : null, icon: '📅' },
        { label: 'Kilometerstand', value: scooter.mileage ? `${scooter.mileage.toLocaleString('nl-NL')} km` : null, icon: '📏' },
        { label: 'Kleur', value: scooter.color, icon: '🎨' },
        { label: 'Kenteken', value: scooter.kenteken, icon: '🪪' },
    ].filter((s) => s.value !== null);

    const introParts = [
        `${scooter.merk} ${scooter.model}`,
        scooter.year ? `uit ${scooter.year}` : null,
        scooter.mileage ? `met ${scooter.mileage.toLocaleString('nl-NL')} km` : null,
    ].filter(Boolean);

    const uniqueIntro = `${introParts.join(' ')} staat rijklaar in Nijkerk en is transparant geprijsd, zodat je nuchter kunt vergelijken en met vertrouwen kunt kiezen.`;

    return (
        <AppLayout>
            <SeoHead
                title={scooter.naam}
                description={`${scooter.naam} kopen in Nijkerk? Tweedehands, rijklaar en transparant geprijsd. Plan direct een proefrit bij Goed Op Weg Nijkerk.`}
                path={`/scooters/${scooter.id}`}
                type="product"
                image={scooter.photos[0]?.url}
                jsonLd={[productSchema, faqSchema]}
                breadcrumbs={[
                    { name: 'Home', url: '/' },
                    { name: 'Scooters', url: '/scooters' },
                    { name: scooter.naam },
                ]}
            />

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
                        <PhotoSlider
                            photos={scooter.photos}
                            naam={scooter.naam}
                            primaryColor={showColorConfigurator ? colorForm.data.primary_color : 'transparent'}
                            accentColor={showColorConfigurator ? colorForm.data.accent_color : 'transparent'}
                        />
                    </div>

                    {/* Details */}
                    <div>
                        <div className="flex items-start justify-between mb-2">
                            <h1 className="text-3xl font-bold text-gray-900">{scooter.naam}</h1>
                            <span className="bg-emerald-100 text-emerald-700 text-sm font-bold px-3 py-1 rounded-full ml-4 shrink-0">
                                Te koop
                            </span>
                        </div>

                        <div className="text-4xl font-bold text-orange-500 mb-6">
                            €{scooter.prijs.toLocaleString('nl-NL', { minimumFractionDigits: 0 })}
                        </div>
                        <ScooterGuaranteeBadge variant="block" className="mb-6" />

                        <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                            {uniqueIntro}
                        </p>

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

                        <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6">
                            <h2 className="font-bold text-gray-900 mb-3">Waarom deze scooter betrouwbaar is</h2>
                            <ul className="space-y-2 text-sm text-gray-700">
                                {scooter.warranty_months !== null && (
                                    <li className="flex items-center gap-2"><span>✅</span><span>{scooter.warranty_months} maanden garantie</span></li>
                                )}
                                {scooter.delivery_service_included && (
                                    <li className="flex items-center gap-2"><span>✅</span><span>Afleverbeurt inbegrepen</span></li>
                                )}
                                {scooter.inspection_points !== null && (
                                    <li className="flex items-center gap-2"><span>✅</span><span>{scooter.inspection_points} keuringspunten gecontroleerd</span></li>
                                )}
                                {scooter.review_score !== null && scooter.review_count !== null && (
                                    <li className="flex items-center gap-2"><span>⭐</span><span>{scooter.review_score.toLocaleString('nl-NL', { minimumFractionDigits: 1 })}/5 uit {scooter.review_count} reviews</span></li>
                                )}
                            </ul>

                            {scooter.recent_work.length > 0 && (
                                <div className="mt-4 border-t border-gray-100 pt-3">
                                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Wat is recent gedaan</h3>
                                    <ul className="space-y-1.5 text-sm text-gray-600">
                                        {scooter.recent_work.map((work, idx) => (
                                            <li key={`${work.name}-${idx}`} className="flex items-center justify-between gap-3">
                                                <span className="truncate">{work.name}</span>
                                                <span className="text-xs text-gray-400 shrink-0">{work.placed_at ?? '-'}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        {features.loyalty_pass_public && (
                            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-6">
                                <h3 className="font-bold text-slate-900 mb-1">Goed Op Weg Vertrouwenspas</h3>
                                <p className="text-sm text-slate-600">Testfase: gratis check na 30 dagen en servicevoordeel voor vaste klanten.</p>
                            </div>
                        )}

                        {showColorConfigurator && (
                            <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6">
                                <h3 className="font-bold text-gray-900 mb-1">Kleurconfigurator</h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    Kies je kleurencombinatie. De preview links toont direct hoe jouw stijl eruit kan zien.
                                </p>

                                <form onSubmit={submitColorRequest} className="space-y-3">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-xs text-gray-500">Basiskleur</label>
                                            <div className="mt-1 flex items-center gap-2">
                                                <input
                                                    type="color"
                                                    value={colorForm.data.primary_color}
                                                    onChange={(e) => colorForm.setData('primary_color', e.target.value)}
                                                    className="h-10 w-14 rounded border border-gray-300 p-1"
                                                />
                                                <input
                                                    type="text"
                                                    value={colorForm.data.primary_color}
                                                    onChange={(e) => colorForm.setData('primary_color', e.target.value)}
                                                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500">Accentkleur</label>
                                            <div className="mt-1 flex items-center gap-2">
                                                <input
                                                    type="color"
                                                    value={colorForm.data.accent_color}
                                                    onChange={(e) => colorForm.setData('accent_color', e.target.value)}
                                                    className="h-10 w-14 rounded border border-gray-300 p-1"
                                                />
                                                <input
                                                    type="text"
                                                    value={colorForm.data.accent_color}
                                                    onChange={(e) => colorForm.setData('accent_color', e.target.value)}
                                                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-xs text-gray-500">Naam</label>
                                            <input
                                                value={colorForm.data.customer_name}
                                                onChange={(e) => colorForm.setData('customer_name', e.target.value)}
                                                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500">E-mail</label>
                                            <input
                                                type="email"
                                                value={colorForm.data.customer_email}
                                                onChange={(e) => colorForm.setData('customer_email', e.target.value)}
                                                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs text-gray-500">Telefoon (optioneel)</label>
                                        <input
                                            value={colorForm.data.customer_phone}
                                            onChange={(e) => colorForm.setData('customer_phone', e.target.value)}
                                            className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs text-gray-500">Extra wens (optioneel)</label>
                                        <textarea
                                            value={colorForm.data.notes}
                                            onChange={(e) => colorForm.setData('notes', e.target.value)}
                                            className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm min-h-20"
                                            placeholder="Bijvoorbeeld: glans afwerking, zwart stuur, roze accenten op zijkap"
                                        />
                                    </div>

                                    {colorForm.recentlySuccessful && (
                                        <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                                            Aanvraag verstuurd. Wij hebben jouw kleurkeuze ontvangen.
                                        </p>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={colorForm.processing}
                                        className="w-full bg-gray-900 hover:bg-black text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
                                    >
                                        {colorForm.processing ? 'Bezig met versturen...' : 'Wil je deze kopen met deze kleur?'}
                                    </button>
                                </form>
                            </div>
                        )}

                        <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6">
                            <h3 className="font-bold text-gray-900 mb-1">Plan een proefrit</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Vul hieronder je gegevens in. Dan nemen we contact op voor een proefrit op deze scooter.
                            </p>

                            <form onSubmit={submitTestRideRequest} className="space-y-3">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs text-gray-500">Naam</label>
                                        <input
                                            value={testRideForm.data.customer_name}
                                            onChange={(e) => testRideForm.setData('customer_name', e.target.value)}
                                            className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500">E-mail</label>
                                        <input
                                            type="email"
                                            value={testRideForm.data.customer_email}
                                            onChange={(e) => testRideForm.setData('customer_email', e.target.value)}
                                            className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs text-gray-500">Telefoon (optioneel)</label>
                                        <input
                                            value={testRideForm.data.customer_phone}
                                            onChange={(e) => testRideForm.setData('customer_phone', e.target.value)}
                                            className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500">Voorkeur contact</label>
                                        <select
                                            value={testRideForm.data.contact_preference}
                                            onChange={(e) => testRideForm.setData('contact_preference', e.target.value as 'telefoon' | 'email' | 'website_chat')}
                                            className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                        >
                                            <option value="telefoon">Telefoon</option>
                                            <option value="email">E-mail</option>
                                            <option value="website_chat">Website chat</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs text-gray-500">Voorkeursdatum (optioneel)</label>
                                        <input
                                            type="date"
                                            value={testRideForm.data.preferred_date}
                                            onChange={(e) => testRideForm.setData('preferred_date', e.target.value)}
                                            className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500">Voorkeurstijd (optioneel)</label>
                                        <input
                                            value={testRideForm.data.preferred_time}
                                            onChange={(e) => testRideForm.setData('preferred_time', e.target.value)}
                                            placeholder="Bijv. na 18:00 of zaterdag ochtend"
                                            className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs text-gray-500">Extra info (optioneel)</label>
                                    <textarea
                                        value={testRideForm.data.notes}
                                        onChange={(e) => testRideForm.setData('notes', e.target.value)}
                                        className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm min-h-20"
                                        placeholder="Bijv. ik wil vooral remmen en acceleratie testen"
                                    />
                                </div>

                                {testRideForm.recentlySuccessful && (
                                    <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                                        Proefrit-aanvraag verstuurd. We nemen snel contact met je op.
                                    </p>
                                )}

                                <button
                                    type="submit"
                                    disabled={testRideForm.processing}
                                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
                                >
                                    {testRideForm.processing ? 'Bezig met versturen...' : 'Ik wil een proefrit plannen'}
                                </button>
                            </form>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6">
                            <h3 className="font-bold text-gray-900 mb-3">Veelgestelde vragen over deze scooter</h3>
                            <div className="mb-4 flex flex-wrap gap-2">
                                {faqItems.map((item) => (
                                    <a
                                        key={`faq-link-${item.id}`}
                                        href={`#faq-${item.id}`}
                                        className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700 hover:bg-orange-100"
                                    >
                                        {item.question}
                                    </a>
                                ))}
                            </div>
                            <div className="space-y-2">
                                {faqItems.map((item) => (
                                    <details id={`faq-${item.id}`} key={item.question} className="group rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 scroll-mt-24">
                                        <summary className="cursor-pointer list-none flex items-center justify-between gap-3 text-sm font-semibold text-gray-900">
                                            <span>{item.question}</span>
                                            <span className="text-orange-500 transition-transform group-open:rotate-45">+</span>
                                        </summary>
                                        <p className="mt-2 text-sm text-gray-600 leading-relaxed">{item.answer}</p>
                                    </details>
                                ))}
                            </div>
                        </div>

                        {related_scooters.length > 0 && (
                            <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6">
                                <h3 className="font-bold text-gray-900 mb-1">Vergelijk met vergelijkbare scooters</h3>
                                <p className="text-sm text-gray-600 mb-4">Andere modellen op voorraad met vergelijkbare merk/model kenmerken.</p>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {related_scooters.map((related) => (
                                        <Link
                                            key={related.id}
                                            href={`/scooters/${related.id}`}
                                            className="rounded-xl border border-gray-200 bg-gray-50 overflow-hidden hover:shadow-sm transition-shadow"
                                        >
                                            <div className="aspect-video bg-gray-100">
                                                {related.foto ? (
                                                    <img src={related.foto} alt={related.naam} className="w-full h-full object-cover" loading="lazy" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-3xl text-gray-300">🛵</div>
                                                )}
                                            </div>
                                            <div className="p-3">
                                                <div className="font-semibold text-sm text-gray-900 leading-snug">{related.naam}</div>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    {related.year ? `${related.year}` : ''}
                                                    {related.mileage ? ` • ${related.mileage.toLocaleString('nl-NL')} km` : ''}
                                                    <div className="mt-2">
                                                        <ScooterGuaranteeBadge />
                                                    </div>
                                                </div>
                                                <div className="text-orange-600 font-bold mt-2">€{related.prijs.toLocaleString('nl-NL')}</div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
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
                                <Link
                                    href={`/chat?bron=scooter-${scooter.id}&scooter_id=${scooter.id}`}
                                    className="flex-1 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-2.5 rounded-xl text-center transition-colors text-sm border border-gray-200"
                                >
                                    💬 Start chat
                                </Link>
                            </div>
                            <div className="mt-4 flex flex-wrap gap-2 text-xs">
                                <Link href="/faq" className="rounded-lg border border-orange-200 bg-white px-3 py-1.5 text-orange-700 hover:bg-orange-50">
                                    FAQ en afleverbelofte
                                </Link>
                                <Link href="/over-ons" className="rounded-lg border border-orange-200 bg-white px-3 py-1.5 text-orange-700 hover:bg-orange-50">
                                    Onze werkwijze
                                </Link>
                                <Link href="/scooters" className="rounded-lg border border-orange-200 bg-white px-3 py-1.5 text-orange-700 hover:bg-orange-50">
                                    Meer scooters bekijken
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
