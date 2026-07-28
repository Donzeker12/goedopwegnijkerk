import { Head, useForm, usePage } from '@inertiajs/react';
import { type FormEvent } from 'react';
import AppLayout from '../layouts/AppLayout';
import SeoHead from '../components/SeoHead';

export default function ContactPage() {
    const { props } = usePage<{ flash?: { success?: string } }>();

    const form = useForm({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        form.post('/contact');
    }

    return (
        <AppLayout>
            <SeoHead
                title="Contact"
                description="Neem contact op met Goed Op Weg Nijkerk voor vragen, offertes of een afspraak."
                path="/contact"
            />
            <Head title="Contact" />

            <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
                    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
                        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-orange-600">Contact</p>
                        <h1 className="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">We horen graag van je</h1>
                        <p className="mt-4 text-base leading-relaxed text-slate-600">
                            Heb je een vraag over een scooter, wil je een afspraak maken of wil je iets bespreken? Vul het formulier in en we reageren snel.
                        </p>

                        <div className="mt-8 space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-700">
                            <div>
                                <div className="font-semibold text-slate-900">E-mail</div>
                                <a href="mailto:info@goedopwegnijkerk.nl" className="mt-1 inline-flex text-orange-600 hover:text-orange-700">
                                    info@goedopwegnijkerk.nl
                                </a>
                            </div>
                            <div>
                                <div className="font-semibold text-slate-900">Locatie</div>
                                <div className="mt-1">Nijkerk, Nederland</div>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
                        {props.flash?.success && (
                            <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                                {props.flash.success}
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-4">
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">Naam</label>
                                <input
                                    value={form.data.name}
                                    onChange={(e) => form.setData('name', e.target.value)}
                                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none ring-0 focus:border-orange-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">E-mail</label>
                                <input
                                    type="email"
                                    value={form.data.email}
                                    onChange={(e) => form.setData('email', e.target.value)}
                                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none ring-0 focus:border-orange-500"
                                    required
                                />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-700">Telefoon <span className="text-xs font-normal text-slate-500">(optioneel)</span></label>
                                    <input
                                        value={form.data.phone}
                                        onChange={(e) => form.setData('phone', e.target.value)}
                                        className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none ring-0 focus:border-orange-500"
                                    />
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-700">Onderwerp <span className="text-xs font-normal text-slate-500">(optioneel)</span></label>
                                    <input
                                        value={form.data.subject}
                                        onChange={(e) => form.setData('subject', e.target.value)}
                                        className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none ring-0 focus:border-orange-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">Bericht</label>
                                <textarea
                                    rows={6}
                                    value={form.data.message}
                                    onChange={(e) => form.setData('message', e.target.value)}
                                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none ring-0 focus:border-orange-500"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={form.processing}
                                className="inline-flex items-center justify-center rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {form.processing ? 'Versturen...' : 'Verstuur bericht'}
                            </button>
                        </form>
                    </div>
                </div>
            </section>
        </AppLayout>
    );
}
