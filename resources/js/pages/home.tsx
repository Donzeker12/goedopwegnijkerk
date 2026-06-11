import { Link } from '@inertiajs/react';
import SeoHead from '../components/SeoHead';
import AppLayout from '../layouts/AppLayout';

interface Scooter {
    id: number;
    naam: string;
    prijs: number;
    foto: string | null;
    year: number | null;
    mileage: number | null;
    color: string | null;
}

interface Props {
    featured: Scooter[];
    latestBlogs: {
        id: number;
        title: string;
        slug: string;
        excerpt: string | null;
        published_at: string | null;
        cover: string | null;
    }[];
    cityLandingPages: {
        slug: string;
        name: string;
    }[];
    business: {
        name: string;
        phone: string;
        email: string;
        street: string;
        postal_code: string;
        city: string;
        region: string;
        country: string;
    };
}

export default function Home({ featured, latestBlogs, cityLandingPages, business }: Props) {
    const localBusinessSchema = {
        '@context': 'https://schema.org',
        '@type': 'AutoDealer',
        name: business.name,
        areaServed: [business.city, ...cityLandingPages.map((cityPage) => cityPage.name)],
        url: '/',
        telephone: business.phone,
        email: business.email,
        address: {
            '@type': 'PostalAddress',
            streetAddress: business.street,
            addressLocality: business.city,
            addressRegion: business.region,
            postalCode: business.postal_code,
            addressCountry: business.country,
        },
        priceRange: '€€',
        makesOffer: {
            '@type': 'Offer',
            category: 'Tweedehands scooters',
        },
        slogan: 'Goed op weg begint met vertrouwen',
    };

    const webSiteSchema = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: business.name,
        url: '/',
        potentialAction: {
            '@type': 'SearchAction',
            target: '/scooters?zoek={search_term_string}',
            'query-input': 'required name=search_term_string',
        },
    };

    return (
        <AppLayout>
            <SeoHead
                title="Tweedehands scooter kopen in Nijkerk"
                description="Tweedehands scooter kopen in Nijkerk? Goed Op Weg Nijkerk levert rijklare scooters met heldere historie, eerlijke prijs en persoonlijke service."
                path="/"
                breadcrumbs={[{ name: 'Home' }]}
                jsonLd={[localBusinessSchema, webSiteSchema]}
            />

            <section className="relative overflow-hidden bg-[#0b1326] text-white">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(249,115,22,0.28),transparent_42%),radial-gradient(circle_at_80%_18%,rgba(56,189,248,0.22),transparent_45%),radial-gradient(circle_at_60%_95%,rgba(249,115,22,0.24),transparent_40%)]" />
                <div className="absolute inset-0 opacity-30 bg-[linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-size-[36px_36px]" />

                <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-18 pb-20 sm:pt-24 sm:pb-24">
                    <div className="max-w-3xl">
                        <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-orange-200">
                            Premium occasions met garantie
                        </p>

                        <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.05]">
                            Goed Op Weg
                            <span className="block text-orange-400">Nijkerk</span>
                        </h1>

                        <p className="mt-6 text-base sm:text-lg text-slate-200 max-w-2xl leading-relaxed">
                            Elke scooter wordt technisch nagelopen, rijklaar gemaakt en helder geprijsd. Geen verrassingen, wel vertrouwen vanaf de eerste rit.
                        </p>
                        <p className="mt-3 text-sm sm:text-base text-orange-200 font-semibold">
                            Goed op weg begint met vertrouwen.
                        </p>

                        <div className="mt-8 flex flex-col sm:flex-row gap-3">
                            <Link
                                href="/scooters"
                                className="inline-flex items-center justify-center rounded-xl bg-orange-500 hover:bg-orange-600 px-7 py-3.5 text-base font-bold text-white transition-colors"
                            >
                                Bekijk direct aanbod
                            </Link>
                            <Link
                                href="/over-ons"
                                className="inline-flex items-center justify-center rounded-xl border border-white/25 bg-white/10 hover:bg-white/15 px-7 py-3.5 text-base font-semibold text-white transition-colors"
                            >
                                Onze werkwijze
                            </Link>
                        </div>

                        <div className="mt-9 grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {[
                                { k: 'Inspectie', v: 'Punt voor punt', s: 'Controle op remmen, elektra en aandrijving' },
                                { k: 'Levering', v: 'Rijklaar', s: 'Meteen klaar voor gebruik' },
                                { k: 'Prijsbeleid', v: 'Transparant', s: 'Heldere prijs zonder kleine lettertjes' },
                            ].map((item) => (
                                <div key={item.k} className="rounded-xl border border-white/15 bg-white/6 p-3.5 backdrop-blur-sm">
                                    <div className="text-[11px] uppercase tracking-[0.14em] text-slate-300">{item.k}</div>
                                    <div className="text-lg font-extrabold text-white mt-1">{item.v}</div>
                                    <div className="text-xs text-slate-300 mt-0.5">{item.s}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-16 bg-white">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-end justify-between gap-4 mb-8">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-orange-600">Onze standaard</p>
                            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">Kwaliteit eerst, verkoop daarna</h2>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                        {[
                            { icon: 'VK', title: 'Vakkundig herstel', desc: 'Onderdelen worden waar nodig vervangen of gereviseerd voor duurzaam gebruik.' },
                            { icon: 'QC', title: 'Technische eindcheck', desc: 'Voor aflevering doorloopt elke scooter een vaste kwaliteitscontrole.' },
                            { icon: '€', title: 'Transparante prijs', desc: 'Wij communiceren duidelijk wat je krijgt en waarom de prijs klopt.' },
                        ].map((f) => (
                            <div key={f.title} className="rounded-2xl border border-slate-200 bg-linear-to-b from-white to-slate-50 p-6 shadow-sm">
                                <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold tracking-wide text-white mb-4">{f.icon}</div>
                                <h3 className="font-bold text-slate-900 text-lg mb-2">{f.title}</h3>
                                <p className="text-slate-600 text-sm leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured scooters */}
            {featured.length > 0 && (
                <section className="py-16 bg-slate-50">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between mb-10 gap-4">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-orange-600">Actueel</p>
                                <h2 className="text-3xl font-black text-slate-900 mt-1">Nieuwste aanbod</h2>
                                <p className="text-slate-600 mt-1">Rijklaar geselecteerd en direct beschikbaar</p>
                            </div>
                            <Link
                                href="/scooters"
                                className="text-orange-600 hover:text-orange-700 font-semibold text-sm"
                            >
                                Alle scooters →
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {featured.map((scooter) => (
                                <Link
                                    key={scooter.id}
                                    href={`/scooters/${scooter.id}`}
                                    className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 overflow-hidden group"
                                >
                                    <div className="aspect-video bg-gray-100 relative overflow-hidden">
                                        {scooter.foto ? (
                                            <img
                                                src={scooter.foto}
                                                alt={scooter.naam}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-5xl text-gray-300">
                                                🛵
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-bold text-slate-900 text-lg">{scooter.naam}</h3>
                                        <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-slate-500">
                                            {scooter.year && <span>📅 {scooter.year}</span>}
                                            {scooter.mileage && <span>📏 {scooter.mileage.toLocaleString('nl-NL')} km</span>}
                                            {scooter.color && <span>🎨 {scooter.color}</span>}
                                        </div>
                                        <div className="mt-3 flex items-center justify-between">
                                            <span className="text-2xl font-bold text-orange-500">
                                                €{scooter.prijs.toLocaleString('nl-NL', { minimumFractionDigits: 0 })}
                                            </span>
                                            <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                                                Te koop
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Latest blog posts */}
            {latestBlogs.length > 0 && (
                <section className="py-16 bg-white border-t border-slate-100">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between mb-10 gap-4">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-orange-600">Kennis & updates</p>
                                <h2 className="text-3xl font-black text-slate-900 mt-1">Laatste blogs</h2>
                                <p className="text-slate-600 mt-1">Tips, updates en scooterverhalen</p>
                            </div>
                            <Link href="/blog" className="text-orange-600 hover:text-orange-700 font-semibold text-sm">
                                Alle blogs →
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {latestBlogs.map((post) => (
                                <Link
                                    key={post.id}
                                    href={`/blog/${post.slug}`}
                                    className="group rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden hover:shadow-md transition-shadow"
                                >
                                    <div className="aspect-video bg-gray-200 overflow-hidden">
                                        {post.cover ? (
                                            <img
                                                src={post.cover}
                                                alt={post.title}
                                                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center text-4xl text-gray-400">📰</div>
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <div className="text-xs text-slate-500 mb-2">{post.published_at ?? ''}</div>
                                        <h3 className="font-bold text-slate-900 leading-snug line-clamp-2">{post.title}</h3>
                                        <p className="text-sm text-slate-600 mt-2 line-clamp-3">
                                            {post.excerpt ?? 'Lees dit artikel op onze blog.'}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            <section className="py-18 bg-slate-900 text-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="rounded-3xl border border-white/10 bg-linear-to-r from-orange-600 to-orange-500 p-8 sm:p-10 text-center shadow-2xl shadow-orange-950/20">
                        <h2 className="text-3xl sm:text-4xl font-black mb-3">Klaar voor jouw volgende scooter?</h2>
                        <p className="text-orange-100 max-w-2xl mx-auto mb-7">
                            Bekijk het actuele aanbod en kies met vertrouwen. Liever eerst advies of een proefrit? Wij helpen je persoonlijk.
                        </p>
                        <div className="flex justify-center">
                            <Link
                                href="/scooters"
                                className="bg-white text-orange-600 font-bold px-8 py-3 rounded-xl hover:bg-orange-50 transition-colors inline-flex justify-center"
                            >
                                Bekijk alle scooters
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-14 bg-white border-t border-slate-100">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Tweedehands scooter kopen in Nijkerk</h2>
                    <p className="text-slate-600 mt-3 leading-relaxed">
                        Zoek je een tweedehands scooter in Nijkerk die niet alleen mooi oogt, maar ook technisch goed is? Bij Goed Op Weg Nijkerk staat betrouwbaarheid voorop. Wij controleren, herstellen en leveren rijklaar met een eerlijke prijs en duidelijke informatie per scooter.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
                        <Link href="/scooters" className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-100 transition-colors">
                            Bekijk scooters te koop
                        </Link>
                        <Link href="/faq" className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-100 transition-colors">
                            Lees FAQ en afleverbelofte
                        </Link>
                        <Link href="/over-ons" className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-100 transition-colors">
                            Ontdek onze werkwijze
                        </Link>
                    </div>

                    {cityLandingPages.length > 0 && (
                        <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                            <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-slate-700">Ook gevonden in de regio</h3>
                            <div className="mt-3 flex flex-wrap gap-2">
                                {cityLandingPages.map((cityPage) => (
                                    <Link
                                        key={cityPage.slug}
                                        href={`/scooter-kopen-in-${cityPage.slug}`}
                                        className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-700 hover:bg-orange-100 transition-colors"
                                    >
                                        Scooter kopen in {cityPage.name}
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
