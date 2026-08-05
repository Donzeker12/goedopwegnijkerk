import { Link } from '@inertiajs/react';
import SeoHead from '../../components/SeoHead';
import AppLayout from '../../layouts/AppLayout';
import type { SalesPageSettings } from '../../types/site-settings';

interface ScooterCard {
    id: number;
    naam: string;
    prijs: number;
    foto: string | null;
    year: number | null;
    mileage: number | null;
}

interface Props {
    type: {
        slug: string;
        label: string;
        icon: string;
    };
    settings: SalesPageSettings;
    scooters: ScooterCard[];
}

function renderItems(items: string) {
    const trimmed = (items ?? '').trim();

    if (trimmed.includes('<')) {
        return <div className="sales-items" dangerouslySetInnerHTML={{ __html: trimmed }} />;
    }

    const lines = trimmed
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

    return (
        <ul className="sales-items-list mt-3 space-y-2 text-sm text-slate-700">
            {lines.map((line) => (
                <li key={line}>{line}</li>
            ))}
        </ul>
    );
}

export default function SalesShow({ type, settings, scooters }: Props) {
    const hasHeroImage = (settings.hero_image ?? '').trim() !== '';

    return (
        <AppLayout>
            <SeoHead
                title={`${settings.title} in Nijkerk`}
                description={settings.description}
                path={`/verkoop/${type.slug}`}
                breadcrumbs={[
                    { name: 'Home', url: '/' },
                    { name: 'Verkoop', url: '/' },
                    { name: settings.title },
                ]}
            />

            <section className={`relative overflow-hidden border-y border-slate-200/80 ${hasHeroImage ? 'bg-slate-900 py-0' : 'bg-slate-50 py-16'} ${hasHeroImage ? 'pb-12 sm:pb-16' : 'pb-12 sm:pb-14'}`}>
                {hasHeroImage && (
                    <>
                        <img
                            src={settings.hero_image}
                            alt={settings.title}
                            className="absolute inset-0 h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_12%,rgba(249,115,22,0.34),transparent_35%),linear-gradient(125deg,rgba(2,6,23,0.84),rgba(30,41,59,0.55))]" />
                        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,rgba(255,255,255,0.2)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.2)_1px,transparent_1px)] bg-size-[44px_44px]" />
                    </>
                )}

                <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                    <style>{`
                        .sales-items ul,
                        .sales-items ol,
                        .sales-items-list {
                            margin-top: 1rem;
                            color: #334155;
                            font-size: 0.875rem;
                            line-height: 1.6;
                        }
                        .sales-items ul,
                        .sales-items-list {
                            list-style: disc;
                            padding-left: 1.35rem;
                        }
                        .sales-items ol {
                            list-style: decimal;
                            padding-left: 1.35rem;
                        }
                        .sales-items li,
                        .sales-items-list li {
                            margin-bottom: 0.5rem;
                        }
                    `}</style>

                    {hasHeroImage ? (
                        <div className="py-14 sm:py-18 lg:py-24">
                            <div className="max-w-4xl rounded-3xl border border-white/25 bg-white/10 p-6 sm:p-8 backdrop-blur-md">
                                <p className="inline-flex items-center rounded-full border border-white/35 bg-white/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-orange-100">
                                    {settings.eyebrow}
                                </p>
                                <h1 className="mt-4 text-3xl sm:text-5xl font-black text-white leading-tight">{type.icon} {settings.title}</h1>
                                <p className="mt-4 max-w-3xl text-sm sm:text-base leading-relaxed text-slate-100">{settings.description}</p>
                                <div className="mt-6 flex flex-wrap gap-2.5">
                                    <span className="rounded-full border border-white/35 bg-white/15 px-3 py-1 text-xs font-semibold text-white">Persoonlijk advies</span>
                                    <span className="rounded-full border border-white/35 bg-white/15 px-3 py-1 text-xs font-semibold text-white">Rijklaar opleveren</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="max-w-3xl text-slate-900 mb-8">
                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-orange-600">{settings.eyebrow}</p>
                            <h1 className="mt-2 text-3xl font-black sm:text-4xl">{type.icon} {settings.title}</h1>
                            <p className="mt-3 leading-relaxed text-slate-600">{settings.description}</p>
                        </div>
                    )}

                    <div className={`grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_0.8fr] ${hasHeroImage ? '-mt-4 pb-12 sm:pb-14' : ''}`}>
                        <article className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-sm">
                            <h2 className="text-2xl font-black text-slate-900">{settings.intro_title}</h2>
                            <p className="mt-2 text-sm text-slate-600">{settings.intro_text}</p>
                            {renderItems(settings.usp_items)}
                            <div className="mt-6 flex flex-wrap gap-3">
                                <Link href={settings.primary_cta_href} className="inline-flex items-center justify-center rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-orange-600">
                                    {settings.primary_cta_label}
                                </Link>
                                <Link href={settings.secondary_cta_href} className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-100">
                                    {settings.secondary_cta_label}
                                </Link>
                            </div>
                        </article>

                        <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h3 className="text-lg font-black text-slate-900">Advies nodig?</h3>
                            <p className="mt-2 text-sm text-slate-600">We helpen je met de juiste keuze voor gebruik, budget en onderhoud.</p>
                            <div className="mt-4 space-y-2 text-sm text-slate-600">
                                <p>Bel of app voor direct advies.</p>
                                <p>Plan een bezichtiging of proefmoment.</p>
                            </div>
                            <Link href="/contact" className="mt-5 inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-slate-800">
                                Neem contact op
                            </Link>
                        </aside>
                    </div>

                    {type.slug === 'scooter' && scooters.length > 0 && (
                        <div className="mt-10">
                            <div className="mb-4 flex items-center justify-between gap-3">
                                <h2 className="text-2xl font-black text-slate-900">Direct beschikbaar</h2>
                                <Link href="/scooters" className="text-sm font-bold text-orange-600 hover:text-orange-700">Bekijk alle scooters</Link>
                            </div>

                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                                {scooters.map((item) => (
                                    <Link key={item.id} href={`/scooters/${item.id}`} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-lg">
                                        <div className="aspect-video bg-slate-100">
                                            {item.foto ? (
                                                <img src={item.foto} alt={item.naam} className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="flex h-full items-center justify-center text-5xl text-slate-300">🛵</div>
                                            )}
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-bold text-slate-900">{item.naam}</h3>
                                            <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                                                {item.year && <span>📅 {item.year}</span>}
                                                {item.mileage && <span>📏 {item.mileage.toLocaleString('nl-NL')} km</span>}
                                            </div>
                                            <p className="mt-3 text-xl font-black text-orange-500">€{item.prijs.toLocaleString('nl-NL', { maximumFractionDigits: 0 })}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </AppLayout>
    );
}
