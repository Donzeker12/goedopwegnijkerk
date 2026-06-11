import { Link } from '@inertiajs/react';
import SeoHead from '../components/SeoHead';
import AppLayout from '../layouts/AppLayout';

interface Props {
    content: string;
    title: string;
}

export default function About({ content, title }: Props) {
    const hasContent = content && content.trim() !== '' && content !== '<p></p>';

    return (
        <AppLayout>
            <SeoHead
                title="Over ons"
                description="Lees hoe Goed Op Weg Nijkerk werkt: eerlijk advies, nuchtere aanpak en zorgvuldig rijklaar gemaakte tweedehands scooters."
                path="/over-ons"
                breadcrumbs={[
                    { name: 'Home', url: '/' },
                    { name: 'Over ons' },
                ]}
            />

            {/* Hero */}
            <section className="bg-linear-to-br from-gray-900 to-gray-800 text-white py-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="text-5xl mb-4">👋</div>
                    <h1 className="text-4xl font-bold mb-4">{title}</h1>
                    <p className="text-gray-300 text-lg">De passie achter de scooters</p>
                </div>
            </section>

            {/* Profile + intro */}
            <section className="bg-white py-16">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Avatar row */}
                    <div className="flex items-center gap-5 mb-10">
                        <div className="w-20 h-20 shrink-0 bg-linear-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-4xl shadow-lg">
                            🛵
                        </div>
                        <div>
                            <div className="text-xs font-semibold text-orange-500 uppercase tracking-widest mb-1">Over mij</div>
                            <div className="text-2xl font-bold text-gray-900">{title}</div>
                        </div>
                    </div>

                    {/* Content */}
                    {hasContent ? (
                        <div className="about-content" dangerouslySetInnerHTML={{ __html: content }} />
                    ) : (
                        <p className="text-gray-400 italic">
                            Geen inhoud ingesteld. Ga naar het admin-dashboard om de Over Ons pagina te bewerken.
                        </p>
                    )}
                </div>
            </section>

            {/* Values */}
            <section className="py-18 border-t border-gray-200 bg-linear-to-b from-slate-50 via-white to-slate-50">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-1 text-[11px] font-bold text-orange-700 uppercase tracking-[0.16em]">Werkwijze</div>
                        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-4">Zo ga ik te werk</h2>
                        <p className="text-slate-600 mt-3 max-w-2xl mx-auto">Geen snelle handel, maar een vast proces. Zo weet je precies wat je krijgt voordat je de weg op gaat.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {[
                            { step: '01', title: 'Inspectie & Selectie', desc: 'Alleen scooters met een gezonde technische basis komen door de intake.', icon: 'Inspectie' },
                            { step: '02', title: 'Reconstructie & Styling', desc: 'Blok en aandrijving worden gereviseerd, kappen strak gemaakt en opnieuw gespoten.', icon: 'Revisie' },
                            { step: '03', title: 'Rijklaar voor verkoop', desc: 'Pas online na eindcontrole, duidelijke prijs en volledig overzicht van het werk.', icon: 'Rijklaar' },
                        ].map((item, i) => (
                            <article
                                key={item.step}
                                className="group relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/70"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-orange-500 px-2 text-[11px] font-black text-white tracking-[0.08em]">
                                        {item.step}
                                    </div>
                                    <div className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                                        {item.icon}
                                    </div>
                                </div>

                                <h3 className="mt-5 text-2xl font-black leading-tight text-slate-900">{item.title}</h3>
                                <p className="mt-3 text-base leading-relaxed text-slate-600">{item.desc}</p>

                                <div className="mt-5 h-1.5 w-18 rounded-full bg-linear-to-r from-orange-500 to-orange-300 transition-all duration-300 group-hover:w-26" />

                                {i < 2 && (
                                    <div className="hidden md:flex absolute top-1/2 -right-3 -translate-y-1/2 h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 text-xs">
                                        ›
                                    </div>
                                )}
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact */}
            <section className="py-20 bg-gray-900 text-white text-center">
                <div className="max-w-xl mx-auto px-4">
                    <div className="text-4xl mb-5">💬</div>
                    <h2 className="text-3xl font-bold mb-3">Neem contact op</h2>
                    <p className="text-gray-400 mb-8 leading-relaxed">
                        Geïnteresseerd in een scooter, of heb je een vraag? Ik hoor graag van je.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <a
                            href="mailto:info@goedopwegnijkerk.nl"
                            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
                        >
                            📧 Stuur een mail
                        </a>
                        <Link
                            href="/chat?bron=over-ons"
                            className="bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-3 rounded-xl transition-colors border border-white/20"
                        >
                            💬 Start chat
                        </Link>
                    </div>
                </div>
            </section>
        </AppLayout>
    );
}
