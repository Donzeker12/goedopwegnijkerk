import { Head, useForm, usePage } from '@inertiajs/react';
import { type FormEvent } from 'react';
import AppLayout from '../../layouts/AppLayout';

interface Props {
    token: string;
    isExpired: boolean;
    isUsed: boolean;
}

export default function ReviewCreate({ token, isExpired, isUsed }: Props) {
    const { props } = usePage<{ flash?: { success?: string; error?: string } }>();
    const flash = props.flash;

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        city: '',
        rating: '5',
        text: '',
    });

    function submit(event: FormEvent) {
        event.preventDefault();
        post(`/review/${token}`);
    }

    const blocked = isExpired || isUsed;

    return (
        <AppLayout>
            <Head title="Review achterlaten" />

            <section className="bg-slate-50 py-14 sm:py-18">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-orange-600">Goed Op Weg Nijkerk</p>
                        <h1 className="mt-2 text-3xl font-black text-slate-900 sm:text-4xl">Laat je review achter</h1>
                        <p className="mt-3 text-sm leading-relaxed text-slate-600">
                            Bedankt dat je de tijd neemt. Je review wordt eerst door ons gecontroleerd en daarna pas geplaatst.
                        </p>

                        {flash?.success && (
                            <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                                {flash.success}
                            </div>
                        )}

                        {flash?.error && (
                            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                {flash.error}
                            </div>
                        )}

                        {blocked ? (
                            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
                                {isExpired
                                    ? 'Deze reviewlink is verlopen. Vraag een nieuwe link aan.'
                                    : 'Deze reviewlink is al gebruikt. Vraag een nieuwe link aan als je nog iets wilt aanpassen.'}
                            </div>
                        ) : (
                            <form onSubmit={submit} className="mt-6 space-y-4">
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-slate-700">Naam</label>
                                        <input
                                            type="text"
                                            value={data.name}
                                            onChange={(event) => setData('name', event.target.value)}
                                            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                            placeholder="Je naam"
                                            required
                                        />
                                        {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                                    </div>

                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-slate-700">Plaats (optioneel)</label>
                                        <input
                                            type="text"
                                            value={data.city}
                                            onChange={(event) => setData('city', event.target.value)}
                                            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                            placeholder="Bijv. Nijkerk"
                                        />
                                        {errors.city && <p className="mt-1 text-xs text-red-600">{errors.city}</p>}
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Aantal sterren</label>
                                    <select
                                        value={data.rating}
                                        onChange={(event) => setData('rating', event.target.value)}
                                        className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    >
                                        <option value="5">5 sterren - uitstekend</option>
                                        <option value="4">4 sterren - heel goed</option>
                                        <option value="3">3 sterren - goed</option>
                                        <option value="2">2 sterren - matig</option>
                                        <option value="1">1 ster - slecht</option>
                                    </select>
                                    {errors.rating && <p className="mt-1 text-xs text-red-600">{errors.rating}</p>}
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Je review</label>
                                    <textarea
                                        value={data.text}
                                        onChange={(event) => setData('text', event.target.value)}
                                        rows={6}
                                        className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        placeholder="Bijv. snelle service, duidelijke communicatie en scooter rijdt top..."
                                        required
                                    />
                                    {errors.text && <p className="mt-1 text-xs text-red-600">{errors.text}</p>}
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex items-center justify-center rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-600 disabled:opacity-60"
                                >
                                    {processing ? 'Versturen...' : 'Review versturen'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </section>
        </AppLayout>
    );
}
