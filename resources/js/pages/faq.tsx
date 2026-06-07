import { Head } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '../layouts/AppLayout';

interface FaqItem {
    id: string;
    question: string;
    answer: React.ReactNode;
}

interface FaqSection {
    id: string;
    icon: string;
    title: string;
    color: string;
    items: FaqItem[];
}

function AccordionItem({ item }: { item: FaqItem }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="border border-gray-100 rounded-2xl overflow-hidden">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left bg-white hover:bg-gray-50 transition-colors"
            >
                <span className="font-semibold text-gray-900 text-sm sm:text-base leading-snug">{item.question}</span>
                <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold transition-all ${open ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                    {open ? '−' : '+'}
                </span>
            </button>
            {open && (
                <div className="px-6 pb-6 bg-white border-t border-gray-50">
                    <div className="pt-4 text-gray-600 text-sm sm:text-base leading-relaxed space-y-3">
                        {item.answer}
                    </div>
                </div>
            )}
        </div>
    );
}

const sections: FaqSection[] = [
    {
        id: 'filosofie',
        icon: '🛠️',
        title: 'Onze filosofie: De GoedOpWeg Afleverbelofte',
        color: 'from-orange-500 to-amber-500',
        items: [
            {
                id: 'f1',
                question: 'Krijg ik garantie op een tweedehands scooter?',
                answer: (
                    <>
                        <p>
                            Nee, wij geven geen langdurige, commerciële garanties zoals een grote showroom dat doet. Wij verkopen gebruikte scooters voor een eerlijke, scherpe prijs.
                        </p>
                        <p>
                            Wel geloven wij in onze <strong>Afleverbelofte</strong>: elke scooter die onze garage in Nijkerk verlaat, is door ons persoonlijk en met de hand volledig optisch puntgaaf gemaakt en technisch tot in de puntjes nagezien — denk aan de transmissie, carburateur en kleppenafstelling.
                        </p>
                        <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 mt-1">
                            <p className="text-orange-800 text-sm font-medium">
                                ✅ Je koopt bij ons een scooter die op het moment van wegrijden 100% in orde is en start met één druk op de knop.
                            </p>
                        </div>
                    </>
                ),
            },
            {
                id: 'f2',
                question: 'Wat als er in de eerste week tóch direct iets misgaat?',
                answer: (
                    <>
                        <p>
                            Wij zijn geen gladde handelaren; we zijn techneuten met passie voor ons werk. Mocht de scooter in de eerste <strong>14 dagen</strong> na aankoop door een aantoonbare mechanische productiefout plotseling stilvallen — bijvoorbeeld een defecte CDI of een losgeschoten slang?
                        </p>
                        <p>
                            Neem dan direct contact op. We kijken samen naar een redelijke, laagdrempelige oplossing in onze garage om je weer <strong>GoedOpWeg</strong> te helpen.
                        </p>
                    </>
                ),
            },
            {
                id: 'f3',
                question: 'Wat is er sowieso uitgesloten na aankoop?',
                answer: (
                    <>
                        <p>
                            Zodra de scooter onze garage verlaat, is de koper verantwoordelijk voor het voertuig. Wij bieden geen service of vergoeding op:
                        </p>
                        <ul className="space-y-1.5 mt-2">
                            {[
                                'Slijtagegevoelige onderdelen — zoals lampjes, banden, remmen of een accu die leegloopt door eigen toedoen.',
                                'Schade of verstopte sproeiers door het tanken van verkeerde, goedkope benzine (wij verplichten Euro 98 / E5).',
                                'Afstellingen die na verloop van tijd door intensief gebruik minimaal veranderen, zoals het stationair toerental bij wisselend weer.',
                            ].map((punt) => (
                                <li key={punt} className="flex items-start gap-2">
                                    <span className="text-red-400 mt-0.5 flex-shrink-0">✕</span>
                                    <span>{punt}</span>
                                </li>
                            ))}
                        </ul>
                    </>
                ),
            },
        ],
    },
    {
        id: 'onderhoud',
        icon: '⛽',
        title: 'Onderhoud & Brandstof',
        color: 'from-blue-500 to-indigo-600',
        items: [
            {
                id: 'o1',
                question: 'Welke benzine moet ik tanken?',
                answer: (
                    <>
                        <p>
                            Voor het behoud van de motor en de carburateur raden wij ten strengste aan om altijd{' '}
                            <strong>Euro 98 (E5 / Premium brandstof)</strong> te tanken — zoals Shell V-Power, BP Ultimate of Esso Synergy+.
                        </p>
                        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mt-3 space-y-1">
                            <p className="text-blue-900 font-semibold text-sm">Waarom geen Euro 95 (E10)?</p>
                            <p className="text-blue-700 text-sm">
                                E10 bevat veel ethanol. Als de scooter een tijdje stilstaat, trekt dit vocht aan en verstopt het de gevoelige sproeiers in de carburateur. Schade of verstoppingen door het aantoonbaar tanken van E10-benzine vallen buiten onze Afleverbelofte.
                            </p>
                        </div>
                    </>
                ),
            },
            {
                id: 'o2',
                question: 'Hoe zit het met het onderhoud van de scooter?',
                answer: (
                    <>
                        <p>
                            Onze scooters worden afgeleverd met een <em>factory reset</em>: de kappen zijn puntgaaf gespoten en de transmissie (rollen, V-snaar, koppeling) en kleppen zijn perfect afgesteld.
                        </p>
                        <p>
                            Om de scooter in topconditie te houden adviseren wij om elke{' '}
                            <strong>1.500 tot 2.000 kilometer</strong> de motorolie te verversen en de kleppen te laten controleren.
                        </p>
                    </>
                ),
            },
        ],
    },
    {
        id: 'aankoop',
        icon: '🛒',
        title: 'Aankoop & Bezichtiging',
        color: 'from-emerald-500 to-teal-600',
        items: [
            {
                id: 'a1',
                question: 'Kan ik een scooter komen bekijken en een proefrit maken?',
                answer: (
                    <>
                        <p>
                            Absoluut! Sterker nog, dat moedigen we alleen maar aan. Een scooter moet goed aanvoelen.
                        </p>
                        <p>
                            Je bent op afspraak van harte welkom in <strong>Nijkerk</strong> voor een bezichtiging en een proefrit op de rollerbank of op een rustig stuk weg.
                        </p>
                    </>
                ),
            },
            {
                id: 'a2',
                question: 'Kan de scooter ook thuisbezorgd worden?',
                answer: (
                    <p>
                        Helaas bieden wij geen thuisbezorging aan. Je dient de scooter zelf op te halen in <strong>Nijkerk</strong>. Zorg voor een aanhanger, busje of iemand die je kan helpen met het transport.
                    </p>
                ),
            },
        ],
    },
];

export default function Faq() {
    return (
        <AppLayout>
            <Head title="FAQ & Afleverbelofte" />

            {/* Hero */}
            <section className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-20">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="text-5xl mb-4">❓</div>
                    <h1 className="text-4xl font-bold mb-4">FAQ & Afleverbelofte</h1>
                    <p className="text-gray-300 text-lg max-w-xl mx-auto">
                        Bij GoedOpWeg staat eerlijkheid voorop. Geen grote garantiebeloften, maar een scooter die op het moment van wegrijden gewoon 100% in orde is.
                    </p>
                </div>
            </section>

            {/* Afleverbelofte banner */}
            <section className="bg-orange-500 text-white">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                        <div className="flex-shrink-0 w-20 h-20 bg-white/15 rounded-2xl flex items-center justify-center text-4xl">
                            🛠️
                        </div>
                        <div className="flex-1">
                            <div className="text-xs font-bold uppercase tracking-widest text-orange-100 mb-1">Inbegrepen bij elke scooter</div>
                            <h2 className="text-2xl font-bold mb-1">De GoedOpWeg Afleverbelofte</h2>
                            <p className="text-orange-100 text-sm leading-relaxed max-w-xl">
                                Elke scooter is persoonlijk en met de hand volledig optisch puntgaaf gemaakt én technisch nagezien. Je rijdt weg op een scooter die 100% in orde is — gegarandeerd.
                            </p>
                        </div>
                        <div className="flex-shrink-0 flex flex-col items-center gap-1 bg-white/15 rounded-2xl px-6 py-4">
                            <div className="text-3xl font-black">14</div>
                            <div className="text-xs font-bold text-orange-100 uppercase tracking-wide">Dagen</div>
                            <div className="text-xs text-orange-100">Overleggarantie</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ sections */}
            <section className="py-16 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
                {sections.map((section) => (
                    <div key={section.id}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${section.color} flex items-center justify-center text-xl flex-shrink-0`}>
                                {section.icon}
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">{section.title}</h2>
                        </div>
                        <div className="space-y-3">
                            {section.items.map((item) => (
                                <AccordionItem key={item.id} item={item} />
                            ))}
                        </div>
                    </div>
                ))}
            </section>

            {/* Still have questions */}
            <section className="bg-gray-900 text-white py-20 text-center">
                <div className="max-w-xl mx-auto px-4">
                    <div className="text-4xl mb-5">💬</div>
                    <h2 className="text-3xl font-bold mb-3">Nog een vraag?</h2>
                    <p className="text-gray-400 mb-8 leading-relaxed">
                        Staat je vraag er niet bij? Neem gerust contact op — we helpen je graag verder.
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
