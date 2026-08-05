import { Link } from '@inertiajs/react';
import SeoHead from '../../components/SeoHead';
import AppLayout from '../../layouts/AppLayout';
import type { MaintenancePageSettings } from '../../types/site-settings';

interface Props {
    type: {
        slug: string;
        label: string;
        icon: string;
    };
    settings: MaintenancePageSettings;
}

function renderItems(items: string) {
    const trimmed = (items ?? '').trim();

    if (trimmed.includes('<')) {
        return <div className="maintenance-items" dangerouslySetInnerHTML={{ __html: trimmed }} />;
    }

    const lines = trimmed
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

    return (
        <ul className="maintenance-items-list mt-4 space-y-2.5 text-sm text-slate-700">
            {lines.map((line) => (
                <li key={line}>{line}</li>
            ))}
        </ul>
    );
}

export default function MaintenanceShow({ type, settings }: Props) {
    return (
        <AppLayout>
            <SeoHead
                title={`${settings.title} in Nijkerk`}
                description={settings.description}
                path={`/onderhoud/${type.slug}`}
                breadcrumbs={[
                    { name: 'Home', url: '/' },
                    { name: 'Onderhoud', url: '/' },
                    { name: settings.title },
                ]}
            />

            <section className="py-16 bg-slate-50 border-y border-slate-200/80">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <style>{`
                        .maintenance-items ul,
                        .maintenance-items ol,
                        .maintenance-items-list {
                            margin-top: 1rem;
                            color: #334155;
                            font-size: 0.875rem;
                            line-height: 1.6;
                        }

                        .maintenance-items ul,
                        .maintenance-items-list {
                            list-style: disc;
                            padding-left: 1.35rem;
                        }

                        .maintenance-items ol {
                            list-style: decimal;
                            padding-left: 1.35rem;
                        }

                        .maintenance-items li,
                        .maintenance-items-list li {
                            margin-bottom: 0.5rem;
                        }

                        .maintenance-items p {
                            margin-bottom: 0.75rem;
                            color: #475569;
                        }
                    `}</style>

                    <div className="max-w-3xl mb-8">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-orange-600">{settings.eyebrow}</p>
                        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mt-2">{type.icon} {settings.title}</h1>
                        <p className="text-slate-600 mt-3 leading-relaxed">
                            {settings.description}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <article className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-sm">
                            <div className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-emerald-700 border border-emerald-100">
                                {settings.small_badge}
                            </div>
                            <h2 className="mt-4 text-2xl font-black text-slate-900">{settings.small_title}</h2>
                            <p className="mt-2 text-sm text-slate-600">{settings.small_description}</p>
                            {renderItems(settings.small_items)}
                            <div className="mt-6 border-t border-slate-200 pt-4">
                                <p className="text-xs uppercase tracking-[0.12em] text-slate-500 font-semibold">{settings.small_price_label}</p>
                                <p className="text-3xl font-black text-orange-500 mt-1">{settings.small_price}</p>
                            </div>
                        </article>

                        <article className="rounded-3xl border border-orange-200 bg-gradient-to-br from-white via-orange-50 to-orange-100/50 p-6 sm:p-7 shadow-sm">
                            <div className="inline-flex items-center rounded-full bg-orange-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-orange-700 border border-orange-200">
                                {settings.large_badge}
                            </div>
                            <h2 className="mt-4 text-2xl font-black text-slate-900">{settings.large_title}</h2>
                            <p className="mt-2 text-sm text-slate-600">{settings.large_description}</p>
                            {renderItems(settings.large_items)}
                            <div className="mt-6 border-t border-orange-200 pt-4">
                                <p className="text-xs uppercase tracking-[0.12em] text-slate-500 font-semibold">{settings.large_price_label}</p>
                                <p className="text-3xl font-black text-orange-600 mt-1">{settings.large_price}</p>
                            </div>
                        </article>
                    </div>

                    <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Meer weten of een afspraak maken?</h3>
                            <p className="text-sm text-slate-600 mt-1">Neem contact op voor advies of plan direct jouw onderhoudsbeurt.</p>
                        </div>
                        <Link
                            href="/contact"
                            className="inline-flex items-center justify-center rounded-xl bg-orange-500 hover:bg-orange-600 px-5 py-2.5 text-sm font-bold text-white transition-colors"
                        >
                            Neem contact op
                        </Link>
                    </div>
                </div>
            </section>
        </AppLayout>
    );
}
