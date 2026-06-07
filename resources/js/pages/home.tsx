import { Head, Link } from '@inertiajs/react';
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
}

export default function Home({ featured }: Props) {
    return (
        <AppLayout>
            <Head title="Home" />

            {/* Hero */}
            <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-orange-900 text-white">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
                    <div className="text-6xl mb-6">🛵</div>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                        Goed Op Weg
                        <span className="block text-orange-400">Nijkerk</span>
                    </h1>
                    <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto mb-10">
                        Opgeknapte scooters met passie en vakmanschap. Elke scooter wordt grondig gecontroleerd en opgeknapt voordat hij te koop staat.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/scooters"
                            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3 rounded-xl transition-colors text-lg"
                        >
                            Bekijk aanbod
                        </Link>
                        <Link
                            href="/over-ons"
                            className="bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-3 rounded-xl transition-colors text-lg border border-white/20"
                        >
                            Over ons
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-16 bg-white">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
                        {[
                            { icon: '🔧', title: 'Vakkundige reparatie', desc: 'Elk defect wordt vakkundig verholpen voordat de scooter te koop staat.' },
                            { icon: '✅', title: 'Gecheckt & klaar', desc: 'Alle scooters worden grondig geïnspecteerd op technische staat en veiligheid.' },
                            { icon: '💶', title: 'Eerlijke prijs', desc: 'Transparante prijzen zonder verborgen kosten. Wat je ziet is wat je betaalt.' },
                        ].map((f) => (
                            <div key={f.title} className="p-6">
                                <div className="text-4xl mb-4">{f.icon}</div>
                                <h3 className="font-bold text-gray-900 text-lg mb-2">{f.title}</h3>
                                <p className="text-gray-600 text-sm">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured scooters */}
            {featured.length > 0 && (
                <section className="py-16 bg-gray-50">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900">Nieuwste aanbod</h2>
                                <p className="text-gray-600 mt-1">Direct rijklaar en te koop</p>
                            </div>
                            <Link
                                href="/scooters"
                                className="text-orange-500 hover:text-orange-600 font-medium text-sm"
                            >
                                Alle scooters →
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {featured.map((scooter) => (
                                <Link
                                    key={scooter.id}
                                    href={`/scooters/${scooter.id}`}
                                    className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
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
                                        <h3 className="font-bold text-gray-900 text-lg">{scooter.naam}</h3>
                                        <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                                            {scooter.year && <span>📅 {scooter.year}</span>}
                                            {scooter.mileage && <span>📏 {scooter.mileage.toLocaleString('nl-NL')} km</span>}
                                            {scooter.color && <span>🎨 {scooter.color}</span>}
                                        </div>
                                        <div className="mt-3 flex items-center justify-between">
                                            <span className="text-2xl font-bold text-orange-500">
                                                €{scooter.prijs.toLocaleString('nl-NL', { minimumFractionDigits: 0 })}
                                            </span>
                                            <span className="text-sm text-emerald-600 font-medium bg-emerald-50 px-2 py-1 rounded-full">
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

            {/* CTA */}
            <section className="py-16 bg-orange-500 text-white text-center">
                <div className="max-w-2xl mx-auto px-4">
                    <h2 className="text-3xl font-bold mb-4">Interesse in een scooter?</h2>
                    <p className="text-orange-100 mb-8">
                        Bekijk ons volledige aanbod en neem contact op voor een proefrit.
                    </p>
                    <Link
                        href="/scooters"
                        className="bg-white text-orange-500 font-bold px-8 py-3 rounded-xl hover:bg-orange-50 transition-colors inline-block"
                    >
                        Bekijk alle scooters
                    </Link>
                </div>
            </section>
        </AppLayout>
    );
}
