import { Link } from '@inertiajs/react';
import { useState } from 'react';
import SeoHead from '../components/SeoHead';
import AppLayout from '../layouts/AppLayout';
import type { FaqCtaSettings, FaqHeroSettings, FaqQuestionsSettings } from '../types/site-settings';

interface FaqItem {
    id: string;
    question: string;
    answer: React.ReactNode;
}

interface Props {
    siteSettings: {
        'faq-hero': FaqHeroSettings;
        'faq-questions': FaqQuestionsSettings;
        'faq-cta': FaqCtaSettings;
    };
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

export default function Faq({ siteSettings }: Props) {
    const hero = siteSettings['faq-hero'];
    const questionSettings = siteSettings['faq-questions'];
    const cta = siteSettings['faq-cta'];
    const faqItems: FaqItem[] = questionSettings.items.map((item, index) => ({
        id: String(index + 1),
        question: item.question,
        answer: item.answer
            .split(/\n\n+/)
            .filter(Boolean)
            .map((paragraph, paragraphIndex) => <p key={`${index}-${paragraphIndex}`}>{paragraph}</p>),
    }));

    const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqItems.map((item) => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: questionSettings.items[index]?.answer ?? '',
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
                    <div className="mb-4 text-5xl">{hero.icon}</div>
                    <h1 className="mb-4 text-4xl font-bold">{hero.title}</h1>
                    <p className="mx-auto max-w-xl text-lg text-gray-300">
                        {hero.description}
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
                    <h2 className="mb-4 text-3xl font-bold">{cta.title}</h2>
                    <p className="mx-auto mb-8 max-w-xl text-orange-100">
                        {cta.description}
                    </p>
                    <Link href={cta.button_href} className="inline-block rounded-xl bg-gray-900 px-8 py-3 font-semibold text-white transition-colors hover:bg-black">
                        {cta.button_label}
                    </Link>
                </div>
            </section>
        </AppLayout>
    );
}