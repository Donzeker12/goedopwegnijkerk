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

            <section className="relative overflow-hidden border-y border-slate-200/80 bg-slate-50 py-16">
                {hasHeroImage && (
                    <>
                        <img
                            src={settings.hero_image}
                            alt={settings.title}
                            className="absolute inset-0 h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-slate-950/55" />
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

                    <div className={`${hasHeroImage ? 'max-w-3xl text-white' : 'max-w-3xl text-slate-900'} mb-8`}>
                        <p className={`text-xs font-semibold uppercase tracking-[0.14em] ${hasHeroImage ? 'text-orange-200' : 'text-orange-600'}`}>{settings.eyebrow}</p>
                        <h1 className="mt-2 text-3xl font-black sm:text-4xl">{type.icon} {settings.title}</h1>
                        <p className={`mt-3 leading-relaxed ${hasHeroImage ? 'text-slate-100' : 'text-slate-600'}`}>{settings.description}</p>
                    </div>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_0.8fr]">
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
