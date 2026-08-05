import { Link } from '@inertiajs/react';
import ScooterGuaranteeBadge from '../components/ScooterGuaranteeBadge';
import SeoHead from '../components/SeoHead';
import AppLayout from '../layouts/AppLayout';
import type { HomeCtaSettings, HomeFeaturedSettings, HomeHeroSettings, HomeInfoSettings, HomeMaintenanceSettings, HomeQualitySettings, HomeReviewsSettings } from '../types/site-settings';

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
    reviews: HomeReviewsSettings;
    siteSettings: {
        'home-hero': HomeHeroSettings;
        'home-quality': HomeQualitySettings;
        'home-maintenance': HomeMaintenanceSettings;
        'home-featured': HomeFeaturedSettings;
        'home-cta': HomeCtaSettings;
        'home-info': HomeInfoSettings;
    };
}

export default function Home({ featured, latestBlogs, cityLandingPages, business, reviews, siteSettings }: Props) {
    const hero = siteSettings['home-hero'];
    const quality = siteSettings['home-quality'];
    const maintenance = siteSettings['home-maintenance'];
    const featuredSection = siteSettings['home-featured'];
    const cta = siteSettings['home-cta'];
    const info = siteSettings['home-info'];

    const visibleReviews = (reviews.items ?? []).filter((item) => {
        return item && item.name?.trim() !== '' && item.text?.trim() !== '';
    });

    const reviewStats = visibleReviews.reduce(
        (stats, item) => {
            const rating = Math.max(1, Math.min(5, Number.parseInt(item.rating || '5', 10) || 5));

            return {
                total: stats.total + 1,
                sum: stats.sum + rating,
            };
        },
        { total: 0, sum: 0 },
    );

    const averageRating = reviewStats.total > 0 ? Number((reviewStats.sum / reviewStats.total).toFixed(1)) : 0;
    const averageStars = reviewStats.total > 0
        ? '★'.repeat(Math.round(averageRating)) + '☆'.repeat(5 - Math.round(averageRating))
        : '';

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
            category: 'Tweewielers, reparatie en onderhoud',
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
                title="Alles voor tweewielers in Nijkerk"
                description="Alles voor tweewielers in Nijkerk: verkoop, reparatie, onderhoud en service voor fietsen, e-bikes en scooters."
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
                            {hero.badge}
                        </p>

                        <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.05]">
                            {hero.title_line_1}
                            <span className="block text-orange-400">{hero.title_highlight}</span>
                        </h1>

                        <p className="mt-6 text-base sm:text-lg text-slate-200 max-w-2xl leading-relaxed">
                            {hero.description}
                        </p>
                        <p className="mt-3 text-sm sm:text-base text-orange-200 font-semibold">
                            {hero.tagline}
                        </p>

                        <div className="mt-8 flex flex-col sm:flex-row gap-3">
                            <Link
                                href={hero.primary_cta_href}
                                className="inline-flex items-center justify-center rounded-xl bg-orange-500 hover:bg-orange-600 px-7 py-3.5 text-base font-bold text-white transition-colors"
                            >
                                {hero.primary_cta_label}
                            </Link>
                            <Link
                                href={hero.secondary_cta_href}
                                className="inline-flex items-center justify-center rounded-xl border border-white/25 bg-white/10 hover:bg-white/15 px-7 py-3.5 text-base font-semibold text-white transition-colors"
                            >
                                {hero.secondary_cta_label}
                            </Link>
                        </div>

                        <div className="mt-9 grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {hero.highlights.map((item) => (
                                <div key={`${item.eyebrow}-${item.title}`} className="rounded-xl border border-white/15 bg-white/6 p-3.5 backdrop-blur-sm">
                                    <div className="text-[11px] uppercase tracking-[0.14em] text-slate-300">{item.eyebrow}</div>
                                    <div className="text-lg font-extrabold text-white mt-1">{item.title}</div>
                                    <div className="text-xs text-slate-300 mt-0.5">{item.description}</div>
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
                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-orange-600">{quality.eyebrow}</p>
                            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{quality.title}</h2>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                        {quality.cards.map((card) => (
                            <div key={`${card.icon}-${card.title}`} className="rounded-2xl border border-slate-200 bg-linear-to-b from-white to-slate-50 p-6 shadow-sm">
                                <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold tracking-wide text-white mb-4">{card.icon}</div>
                                <h3 className="font-bold text-slate-900 text-lg mb-2">{card.title}</h3>
                                <p className="text-slate-600 text-sm leading-relaxed">{card.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-16 bg-slate-50 border-y border-slate-200/80">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl mb-8">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-orange-600">{maintenance.eyebrow}</p>
                        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-2">{maintenance.title}</h2>
                        <p className="text-slate-600 mt-3 leading-relaxed">
                            {maintenance.description}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {maintenance.service_cards.map((card, index) => (
                            <article
                                key={`${card.title}-${index}`}
                                className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-sm"
                            >
                                <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-lg text-white mb-4">{card.icon}</div>
                                <h3 className="text-2xl font-black text-slate-900">{card.title}</h3>
                                <p className="mt-2 text-sm text-slate-600 leading-relaxed min-h-16">{card.description}</p>
                                <Link
                                    href={card.button_href}
                                    className="mt-6 inline-flex items-center justify-center rounded-xl bg-orange-500 hover:bg-orange-600 px-5 py-2.5 text-sm font-bold text-white transition-colors"
                                >
                                    {card.button_label}
                                </Link>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            {visibleReviews.length > 0 && (
                <section className="py-16 bg-white border-b border-slate-100">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="max-w-3xl mb-8">
                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-orange-600">{reviews.eyebrow}</p>
                            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-2">{reviews.title}</h2>
                            {reviews.description && (
                                <p className="text-slate-600 mt-3 leading-relaxed">{reviews.description}</p>
                            )}
                            <div className="mt-4 inline-flex flex-wrap items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm">
                                <span className="font-semibold text-amber-700">{averageStars}</span>
                                <span className="font-bold text-slate-900">{averageRating.toLocaleString('nl-NL', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} / 5</span>
                                <span className="text-slate-600">op basis van {reviewStats.total.toLocaleString('nl-NL')} review{reviewStats.total === 1 ? '' : 's'}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {visibleReviews.map((item, index) => {
                                const rating = Math.max(1, Math.min(5, Number.parseInt(item.rating || '5', 10) || 5));
                                const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);

                                return (
                                    <article key={`${item.name}-${index}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                                        <div className="text-amber-500 text-lg tracking-wide">{stars}</div>
                                        <p className="mt-3 text-sm text-slate-700 leading-relaxed">{item.text}</p>
                                        <div className="mt-4 pt-3 border-t border-slate-200">
                                            <p className="font-bold text-slate-900 text-sm">{item.name}</p>
                                            {item.city && <p className="text-xs text-slate-500">{item.city}</p>}
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    </div>
                </section>
            )}

            {/* Featured scooters */}
            {featured.length > 0 && (
                <section className="py-16 bg-slate-50">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between mb-10 gap-4">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-orange-600">{featuredSection.eyebrow}</p>
                                <h2 className="text-3xl font-black text-slate-900 mt-1">{featuredSection.title}</h2>
                                <p className="text-slate-600 mt-1">{featuredSection.description}</p>
                            </div>
                            <Link
                                href={featuredSection.link_href}
                                className="text-orange-600 hover:text-orange-700 font-semibold text-sm"
                            >
                                {featuredSection.link_label}
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
                                        <div className="mt-3">
                                            <ScooterGuaranteeBadge />
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
                        <h2 className="text-3xl sm:text-4xl font-black mb-3">{cta.title}</h2>
                        <p className="text-orange-100 max-w-2xl mx-auto mb-7">
                            {cta.description}
                        </p>
                        <div className="flex justify-center">
                            <Link
                                href={cta.button_href}
                                className="bg-white text-orange-600 font-bold px-8 py-3 rounded-xl hover:bg-orange-50 transition-colors inline-flex justify-center"
                            >
                                {cta.button_label}
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-14 bg-white border-t border-slate-100">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900">{info.title}</h2>
                    <p className="text-slate-600 mt-3 leading-relaxed">
                        {info.description}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
                        {info.links.map((item) => (
                            <Link key={`${item.label}-${item.href}`} href={item.href} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-100 transition-colors">
                                {item.label}
                            </Link>
                        ))}
                        <Link href="/contact" className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-700 hover:bg-orange-100 transition-colors">
                            Contact opnemen
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
