import { Link } from '@inertiajs/react';
import AppLayout from '../../layouts/AppLayout';
import SeoHead from '../../components/SeoHead';

interface ScooterItem {
    id: number;
    naam: string;
    prijs: number;
    foto: string | null;
    year: number | null;
    mileage: number | null;
}

interface CityInfo {
    slug: string;
    name: string;
    distance: string;
    keywords: string[];
}

interface BusinessInfo {
    name: string;
    phone: string;
    email: string;
    city: string;
    region: string;
    country: string;
}

interface Props {
    city: CityInfo;
    scooters: ScooterItem[];
    business: BusinessInfo;
}

export default function LocationLanding({ city, scooters, business }: Props) {
    const pagePath = `/scooter-kopen-in-${city.slug}`;

    const localLandingSchema = {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: `Tweedehands scooter kopen in ${city.name}`,
        description: `Scooter kopen in ${city.name}? Bekijk rijklare tweedehands scooters met transparante prijs bij Goed Op Weg Nijkerk.`,
        about: {
            '@type': 'AutoDealer',
            name: business.name,
            areaServed: [city.name, business.city],
            address: {
                '@type': 'PostalAddress',
                addressLocality: business.city,
                addressRegion: business.region,
                addressCountry: business.country,
            },
        },
    };

    const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
            {
                '@type': 'Question',
                name: `Kan ik vanuit ${city.name} een scooter komen bekijken?`,
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: `Ja. Je bent vanuit ${city.name} welkom op afspraak in ${business.city} voor bezichtiging en proefrit.`,
                },
            },
            {
                '@type': 'Question',
                name: `Waarom kiezen klanten uit ${city.name} voor Goed Op Weg?`,
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Door de combinatie van rijklare aflevering, heldere prijsopbouw en nuchter advies zonder verkooppraat.',
                },
            },
            {
                '@type': 'Question',
                name: 'Kan ik direct een proefrit plannen?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Ja, op iedere scooterpagina kun je direct een proefrit-aanvraag doen.',
                },
            },
        ],
    };

    return (
        <AppLayout>
            <SeoHead
                title={`Tweedehands scooter kopen in ${city.name}`}
                description={`Scooter kopen in ${city.name}? Goed Op Weg Nijkerk helpt je met rijklare tweedehands scooters, transparante prijzen en persoonlijke service.`}
                path={pagePath}
                jsonLd={[localLandingSchema, faqSchema]}
                breadcrumbs={[
                    { name: 'Home', url: '/' },
                    { name: `Scooter kopen in ${city.name}` },
                ]}
            />

            <section className="bg-linear-to-br from-gray-900 via-gray-800 to-orange-900 text-white py-18">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <p className="text-xs uppercase tracking-[0.16em] text-orange-300 font-semibold">Regio pagina</p>
                    <h1 className="mt-3 text-4xl sm:text-5xl font-black leading-tight">Scooter kopen in {city.name}</h1>
                    <p className="mt-4 max-w-2xl text-gray-200 leading-relaxed">
                        Woon je in {city.name}? Dan ben je in {city.distance} bij onze locatie in {business.city}. Je krijgt een rijklare scooter met heldere historie en een eerlijke prijs.
                    </p>
                    <div className="mt-7 flex flex-col sm:flex-row gap-3">
                        <Link href="/scooters" className="inline-flex justify-center rounded-xl bg-orange-500 hover:bg-orange-600 px-6 py-3 font-bold text-white transition-colors">
                            Bekijk actuele scooters
                        </Link>
                        <Link href="/faq" className="inline-flex justify-center rounded-xl border border-white/20 bg-white/10 hover:bg-white/15 px-6 py-3 font-semibold text-white transition-colors">
                            Lees FAQ en afleverbelofte
                        </Link>
                    </div>
                </div>
            </section>

            <section className="py-14 bg-white">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-2xl font-black text-gray-900">Waarom klanten uit {city.name} kiezen voor {business.name}</h2>
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                            <h3 className="font-bold text-gray-900">Rijklaar afgeleverd</h3>
                            <p className="text-sm text-gray-600 mt-2">Elke scooter wordt technisch nagezien voor aflevering, zodat je zonder gedoe kunt rijden.</p>
                        </div>
                        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                            <h3 className="font-bold text-gray-900">Transparante prijs</h3>
                            <p className="text-sm text-gray-600 mt-2">Geen vage meerprijzen achteraf. Je ziet vooraf wat je koopt en waarom die prijs klopt.</p>
                        </div>
                        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                            <h3 className="font-bold text-gray-900">Persoonlijk advies</h3>
                            <p className="text-sm text-gray-600 mt-2">Wij nemen de tijd voor jouw gebruikssituatie, zodat je een scooter kiest die echt past.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-14 bg-gray-50 border-y border-gray-200">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-2xl font-black text-gray-900">Populaire zoekopdrachten in {city.name}</h2>
                    <div className="mt-4 flex flex-wrap gap-2">
                        {city.keywords.map((keyword) => (
                            <span key={keyword} className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
                                scooter {keyword}
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-14 bg-white">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between gap-4 mb-7">
                        <h2 className="text-2xl font-black text-gray-900">Beschikbare scooters</h2>
                        <Link href="/scooters" className="text-sm font-semibold text-orange-600 hover:text-orange-700">Alle scooters →</Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {scooters.map((scooter) => (
                            <Link key={scooter.id} href={`/scooters/${scooter.id}`} className="rounded-2xl border border-gray-200 bg-white overflow-hidden hover:shadow-md transition-shadow">
                                <div className="aspect-video bg-gray-100">
                                    {scooter.foto ? (
                                        <img src={scooter.foto} alt={scooter.naam} className="w-full h-full object-cover" loading="lazy" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-4xl text-gray-300">🛵</div>
                                    )}
                                </div>
                                <div className="p-4">
                                    <h3 className="font-bold text-gray-900">{scooter.naam}</h3>
                                    <div className="mt-2 text-xs text-gray-500">
                                        {scooter.year ? `${scooter.year}` : ''}
                                        {scooter.mileage ? ` • ${scooter.mileage.toLocaleString('nl-NL')} km` : ''}
                                    </div>
                                    <div className="mt-3 text-xl font-black text-orange-600">€{scooter.prijs.toLocaleString('nl-NL')}</div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
        </AppLayout>
    );
}
