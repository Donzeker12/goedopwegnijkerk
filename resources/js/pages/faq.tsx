import { useState } from 'react';
import SeoHead from '../components/SeoHead';
import AppLayout from '../layouts/AppLayout';
import { Link } from '@inertiajs/react';

interface FaqItem {
    id: string;
    question: string;
    answer: React.ReactNode;
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
                <span className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold transition-all ${open ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
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

const faqItems: FaqItem[] = [
    {
        id: '1',
        question: 'Zit er garantie op de scooters van Goed op Weg Nijkerk?',
        answer: (
            <>
                <p>
                    <strong>Ja, absoluut!</strong> Wij staan achter de kwaliteit van de scooters die wij opknappen. Daarom leveren wij al onze scooters standaard met een vaste garantieregeling op het motorblok en de accu.
                </p>
                <p>
                    Zo rijd je altijd met een gerust hart weg. <strong>Vraag bij de aankoop naar de exacte garantietermijn van jouw scooter.</strong>
                </p>
            </>
        ),
    },
    {
        id: '2',
        question: 'Wat houdt de gratis eerste onderhoudsbeurt in?',
        answer: (
            <>
                <p>
                    Bij de all-in prijs van je scooter zit een gratis controle- en onderhoudsbeurt inbegrepen. We adviseren om hiervoor een afspraak te maken zodra je <strong>1.500 kilometer</strong> hebt gereden (of na 6 maanden). Tijdens deze beurt lopen we de scooter volledig na:
                </p>
                <ul className="list-disc list-inside space-y-1.5 mt-2 ml-2">
                    <li>We verversen de motorolie.</li>
                    <li>De bougie en filters worden gecontroleerd en schoongemaakt/vervangen.</li>
                    <li>De remmen en bandenspanning worden perfect afgesteld.</li>
                </ul>
                <p className="mt-2">
                    Zo blijft je scooter in topconditie!
                </p>
            </>
        ),
    },
    {
        id: '3',
        question: 'Wat valt er buiten de garantie?',
        answer: (
            <>
                <p>
                    De garantie dekt vitale onderdelen zoals het motorblok en de elektronica (accu). Slijtagedelen die door het gebruik dunner worden of kapot kunnen gaan, vallen hierbuiten.
                </p>
                <p>
                    Denk hierbij aan banden, remblokken, lampjes en eventuele schade die is ontstaan door vallen of een ongeluk.
                </p>
            </>
        ),
    },
    {
        id: '4',
        question: 'Kan ik ook mijn oude scooter aan jullie verkopen?',
        answer: (
            <>
                <p>
                    <strong>Zeker!</strong> Heb je nog een scooter in de schuur staan die niet meer start, schade heeft of waar je simpelweg vanaf wilt? Wij kopen ook opknappers in.
                </p>
                <p>
                    Neem contact met ons op, stuur een paar foto's en de details op, en we kijken of we een mooie deal kunnen maken.
                </p>
            </>
        ),
    },
    {
        id: '5',
        question: 'Kan ik langskomen voor een proefrit?',
        answer: (
            <>
                <p>
                    Natuurlijk! Als je een mooie scooter op onze website hebt gezien, ben je van harte welkom om hem in het echt te komen bekijken en een proefrit te maken.
                </p>
                <p>
                    Neem vooraf even contact met ons op om een moment af te spreken, dan zorgen wij dat de koffie en de scooter voor je klaarstaan.
                </p>
            </>
        ),
    },
];

export default function Faq() {
    const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqItems.map((item) => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: item.question,
            },
        })),
    };

    return (
        <AppLayout>
            <SeoHead
                title="Veelgestelde vragen - Service & Garantie"
                description="Veelgestelde vragen over garantie, onderhoud en service van Goed Op Weg Nijkerk."
                path="/faq"
                breadcrumbs={[
                    { name: 'Home', url: '/' },
                    { name: 'Veelgestelde vragen' },
                ]}
                jsonLd={faqSchema}
            />

            {/* Hero */}
            <section className="bg-linear-to-br from-gray-900 to-gray-800 text-white py-20">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="text-5xl mb-4">❓</div>
                    <h1 className="text-4xl font-bold mb-4">Veelgestelde vragen</h1>
                    <p className="text-gray-300 text-lg max-w-xl mx-auto">
                        Alles wat je moet weten over onze garantie, onderhoud, en service.
                    </p>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-16 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="space-y-3">
                    {faqItems.map((item) => (
                        <AccordionItem key={item.id} item={item} />
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="bg-orange-500 text-white py-16">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold mb-4">Nog vragen?</h2>
                    <p className="text-orange-100 mb-8 max-w-xl mx-auto">
                        Neem gerust contact met ons op. We helpen je graag verder met alles wat je wilt weten.
                    </p>
                    <Link
                        href="/chat"
                        className="inline-block bg-gray-900 hover:bg-black text-white font-semibold px-8 py-3 rounded-xl transition-colors"
                    >
                        💬 Neem contact op
                    </Link>
                </div>
            </section>
        </AppLayout>
    );
}