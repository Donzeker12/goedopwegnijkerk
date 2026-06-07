import { Head } from '@inertiajs/react';
import AppLayout from '../layouts/AppLayout';

interface Props {
    content: string;
    title: string;
}

export default function About({ content, title }: Props) {
    const hasContent = content && content.trim() !== '' && content !== '<p></p>';

    return (
        <AppLayout>
            <Head title="Over Ons" />

            {/* Hero */}
            <section className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-20">
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
                        <div className="w-20 h-20 flex-shrink-0 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-4xl shadow-lg">
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
            <section className="py-16 bg-gray-50 border-t border-gray-100">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <div className="text-xs font-semibold text-orange-500 uppercase tracking-widest mb-2">Werkwijze</div>
                        <h2 className="text-3xl font-bold text-gray-900">Zo ga ik te werk</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        {[
                            { step: '01', title: 'Inspectie & Selectie', desc: 'Elke scooter die onze werkplaats binnenkomt, wordt eerst aan een strenge inspectie onderworpen. We selecteren alleen scooters met een gezonde basis, zodat we kwaliteit kunnen garanderen.', icon: '🔍' },
                            { step: '02', title: 'Reconstructie & Styling', desc: 'Vervolgens gaan we grondig te werk. Technisch krijgt het blok een volledige revisie (van kleppen tot transmissie) en optisch wordt de scooter door mijn vrouw volledig strak gemaakt en vakkundig nieuw gespoten. Zonder gebruikerssporen.', icon: '🔧' },
                            { step: '03', title: 'Rijklaar voor de Verkoop', desc: 'De scooter staat pas te koop als hij 100% aan onze eisen voldoet. Transparant, eerlijk geprijsd en inclusief een helder overzicht van wat er allemaal aan vernieuwd is.', icon: '✅' },
                        ].map((item, i) => (
                            <div key={item.step} className="relative bg-white rounded-2xl p-7 shadow-sm border border-gray-100">
                                <div className="absolute -top-3 left-6 bg-orange-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                                    {item.step}
                                </div>
                                <div className="text-3xl mb-4 mt-2">{item.icon}</div>
                                <h3 className="font-bold text-gray-900 text-lg mb-2">{item.title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                                {i < 2 && (
                                    <div className="hidden sm:block absolute top-1/2 -right-3 -translate-y-1/2 text-gray-200 text-xl z-10">→</div>
                                )}
                            </div>
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
                        <a
                            href="tel:+31600000000"
                            className="bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-3 rounded-xl transition-colors border border-white/20"
                        >
                            📞 Bel mij
                        </a>
                    </div>
                </div>
            </section>
        </AppLayout>
    );
}
