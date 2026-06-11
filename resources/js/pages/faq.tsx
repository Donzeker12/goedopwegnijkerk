import { Link } from '@inertiajs/react';
import { useState } from 'react';
import SeoHead from '../components/SeoHead';
import AppLayout from '../layouts/AppLayout';

interface FaqItem {
    id: string;
    question: string;
    answer: React.ReactNode;
}

function AccordionItem({ item }: { item: FaqItem }) {
    const [open, setOpen] = useState(false);

    return (
        <div className="overflow-hidden rounded-2xl border border-gray-100">
            <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                className="flex w-full items-center justify-between gap-4 bg-white px-6 py-5 text-left transition-colors hover:bg-gray-50"
            >
                <span className="text-sm font-semibold leading-snug text-gray-900 sm:text-base">{item.question}</span>
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-all ${open ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                    {open ? '−' : '+'}
                </span>
            </button>
            {open && (
                <div className="border-t border-gray-50 bg-white px-6 pb-6">
                    <div className="space-y-3 pt-4 text-sm leading-relaxed text-gray-600 sm:text-base">
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
                    Ja, absoluut. Wij staan achter de kwaliteit van de scooters die wij opknappen. Daarom leveren wij al onze scooters standaard met een vaste garantieregeling op het motorblok en de accu.
                </p>
                <p>
                    Vraag bij de aankoop naar de exacte garantietermijn van jouw scooter.
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
                    Bij de all-in prijs van je scooter zit een gratis controle- en onderhoudsbeurt inbegrepen. We adviseren om hiervoor een afspraak te maken zodra je 1.500 kilometer hebt gereden of na 6 maanden.
                </p>
                <p>
                    Tijdens deze beurt lopen we de scooter volledig na: we verversen de motorolie, controleren de bougie en filters en stellen de remmen en bandenspanning af.
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
                    De garantie dekt vitale onderdelen zoals het motorblok en de elektronica. Slijtageonderdelen die door gebruik minder worden of kapot kunnen gaan, vallen hierbuiten.
                </p>
                <p>
                    Denk hierbij aan banden, remblokken, lampjes en schade die is ontstaan door vallen of een ongeluk.
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
                    Zeker. Heb je nog een scooter in de schuur staan die niet meer start, schade heeft of waar je simpelweg vanaf wilt? Wij kopen ook opknappers in.
                </p>
                <p>
                    Neem contact met ons op, stuur een paar foto&apos;s en de details door, en we kijken of we een mooie deal kunnen maken.
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
                    Natuurlijk. Als je een mooie scooter op onze website hebt gezien, ben je van harte welkom om hem in het echt te komen bekijken en een proefrit te maken.
                </p>
                <p>
                    Neem vooraf even contact met ons op om een moment af te spreken.
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

            <section className="bg-linear-to-br from-gray-900 to-gray-800 py-20 text-white">
                <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
                    <div className="mb-4 text-5xl">❓</div>
                    <h1 className="mb-4 text-4xl font-bold">Veelgestelde vragen</h1>
                    <p className="mx-auto max-w-xl text-lg text-gray-300">
                        Alles wat je moet weten over onze garantie, onderhoud en service.
                    </p>
                </div>
            </section>

            <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="space-y-3">
                    {faqItems.map((item) => (
                        <AccordionItem key={item.id} item={item} />
                    ))}
                </div>
            </section>

            <section className="bg-orange-500 py-16 text-white">
                <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
                    <h2 className="mb-4 text-3xl font-bold">Nog vragen?</h2>
                    <p className="mx-auto mb-8 max-w-xl text-orange-100">
                        Neem gerust contact met ons op. We helpen je graag verder met alles wat je wilt weten.
                    </p>
                    <Link href="/chat" className="inline-block rounded-xl bg-gray-900 px-8 py-3 font-semibold text-white transition-colors hover:bg-black">
                        💬 Neem contact op
                    </Link>
                </div>
            </section>
        </AppLayout>
    );
}