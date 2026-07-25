import { Link, useForm } from '@inertiajs/react';
import { type FormEvent, useState } from 'react';
import AppLayout from '../../layouts/AppLayout';
import SeoHead from '../../components/SeoHead';

interface Props {
    source: string;
    selected_scooter_id: number | null;
    scooters: {
        id: number;
        naam: string;
    }[];
}

export default function ChatIndex({ source, selected_scooter_id, scooters }: Props) {
    const [sent, setSent] = useState(false);

    const form = useForm({
        name: '',
        email: '',
        phone: '',
        best_time: '',
        message: '',
        scooter_id: selected_scooter_id ? String(selected_scooter_id) : '',
        source,
        page: typeof window !== 'undefined' ? window.location.href : '/chat',
    });

    function submit(e: FormEvent) {
        e.preventDefault();

        form.post('/chat-aanvraag', {
            preserveScroll: true,
            onSuccess: () => {
                form.reset('name', 'email', 'phone', 'best_time', 'message');
                form.setData('scooter_id', selected_scooter_id ? String(selected_scooter_id) : '');
                setSent(true);
            },
        });
    }

    return (
        <AppLayout>
            <SeoHead
                title="Start chat"
                description="Stuur een chatverzoek naar Goed Op Weg Nijkerk en chat direct verder op de website."
                path="/chat"
                noindex
                breadcrumbs={[
                    { name: 'Home', url: '/' },
                    { name: 'Start chat' },
                ]}
            />

            <section className="bg-linear-to-br from-gray-900 via-gray-800 to-orange-900 text-white py-16">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="text-4xl mb-4">💬</div>
                    <h1 className="text-4xl font-black mb-3">Start chatgesprek</h1>
                    <p className="text-gray-200 leading-relaxed">
                        Vul je gegevens in en start direct een gesprek in onze website-chat. Wij reageren persoonlijk en zo snel mogelijk.
                    </p>
                </div>
            </section>

            <section className="py-12 bg-gray-50">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-7 shadow-sm">
                        <div className="mb-6">
                            <p className="text-xs uppercase tracking-[0.16em] text-orange-600 font-semibold">Chat-aanvraag</p>
                            <p className="text-sm text-gray-500 mt-1">Bron: {source}</p>
                        </div>

                        <form onSubmit={submit} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-gray-500">Naam</label>
                                    <input
                                        value={form.data.name}
                                        onChange={(e) => form.setData('name', e.target.value)}
                                        className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm"
                                        required
                                    />
                                    {form.errors.name && <p className="text-xs text-red-600 mt-1">{form.errors.name}</p>}
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500">E-mail</label>
                                    <input
                                        type="email"
                                        value={form.data.email}
                                        onChange={(e) => form.setData('email', e.target.value)}
                                        className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm"
                                        required
                                    />
                                    {form.errors.email && <p className="text-xs text-red-600 mt-1">{form.errors.email}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-gray-500">Telefoon (optioneel)</label>
                                    <input
                                        value={form.data.phone}
                                        onChange={(e) => form.setData('phone', e.target.value)}
                                        className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500">Kanaal</label>
                                    <div className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 bg-gray-50">
                                        Website chat
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs text-gray-500">Beste tijdstip (optioneel)</label>
                                <input
                                    value={form.data.best_time}
                                    onChange={(e) => form.setData('best_time', e.target.value)}
                                    placeholder="Bijv. doordeweeks na 18:00"
                                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm"
                                />
                            </div>

                            <div>
                                <label className="text-xs text-gray-500">Scooter (optioneel)</label>
                                <select
                                    value={form.data.scooter_id}
                                    onChange={(e) => form.setData('scooter_id', e.target.value)}
                                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm"
                                >
                                    <option value="">Algemene vraag (geen specifieke scooter)</option>
                                    {scooters.map((scooter) => (
                                        <option key={scooter.id} value={String(scooter.id)}>{scooter.naam}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-xs text-gray-500">Waar wil je over chatten?</label>
                                <textarea
                                    value={form.data.message}
                                    onChange={(e) => form.setData('message', e.target.value)}
                                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm min-h-28"
                                    placeholder="Bijv. interesse in een model, budget, proefrit of inruil"
                                />
                                {form.errors.message && <p className="text-xs text-red-600 mt-1">{form.errors.message}</p>}
                            </div>

                            {sent && (
                                <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                                    Verzoek verzonden. Je ontvangt hier snel een reactie in de chat.
                                </p>
                            )}

                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
                                >
                                    {form.processing ? 'Bezig met verzenden...' : '💬 Start chataanvraag'}
                                </button>
                                <Link
                                    href="/scooters"
                                    className="flex-1 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-2.5 rounded-xl text-sm transition-colors border border-gray-300 text-center"
                                >
                                    Bekijk scooters
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </section>
        </AppLayout>
    );
}
