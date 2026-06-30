import { useForm, router, Link } from '@inertiajs/react';
import { type FormEvent, useEffect, useMemo, useRef } from 'react';
import AdminLayout from '../../../layouts/AdminLayout';
import SeoHead from '../../../components/SeoHead';

interface ChatMessage {
    id: number;
    sender_type: 'visitor' | 'admin';
    sender_name: string | null;
    message: string;
    created_at: string | null;
}

interface ChatSessionDetail {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    best_time: string | null;
    status: 'nieuw' | 'open' | 'gesloten';
    source: string | null;
    scooter: string | null;
    scooter_id: number | null;
    page: string | null;
    token: string;
    created_at: string | null;
}

interface Props {
    session: ChatSessionDetail;
    messages: ChatMessage[];
}

function formatDateTime(value: string | null): string {
    if (!value) return '-';
    return new Date(value).toLocaleString('nl-NL', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function AdminChatShow({ session, messages }: Props) {
    const form = useForm({ message: '' });
    const statusForm = useForm({ status: session.status });
    const appointmentForm = useForm({
        appointment_at: '',
        location: 'Goed Op Weg Nijkerk',
        note: '',
    });
    const endRef = useRef<HTMLDivElement | null>(null);

    const publicChatLink = useMemo(() => `/chat/${session.token}`, [session.token]);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        const interval = window.setInterval(() => {
            router.reload({
                only: ['messages', 'session'],
                preserveScroll: true,
                preserveState: true,
            });
        }, 4000);

        return () => window.clearInterval(interval);
    }, []);

    function sendMessage(e: FormEvent) {
        e.preventDefault();

        form.post(`/admin/chat/${session.id}/bericht`, {
            preserveScroll: true,
            onSuccess: () => form.reset('message'),
        });
    }

    function updateStatus(nextStatus: 'nieuw' | 'open' | 'gesloten') {
        statusForm.setData('status', nextStatus);
        statusForm.patch(`/admin/chat/${session.id}/status`, {
            preserveScroll: true,
        });
    }

    function sendAppointmentConfirmation(e: FormEvent) {
        e.preventDefault();

        appointmentForm.post(`/admin/chat/${session.id}/afspraak-bevestigen`, {
            preserveScroll: true,
            onSuccess: () => appointmentForm.reset('appointment_at', 'note'),
        });
    }

    function deleteChat() {
        if (confirm(`Weet je zeker dat je chat van "${session.name}" wilt verwijderen?`)) {
            router.delete(`/admin/chat/${session.id}`);
        }
    }

    return (
        <AdminLayout title={`Chat #${session.id}`}>
            <SeoHead title="Admin chat detail" description="Reageer op chatgesprek" path={`/admin/chat/${session.id}`} noindex />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <aside className="bg-white border border-gray-200 rounded-2xl p-5 h-fit">
                    <h2 className="font-bold text-gray-900 mb-4">Gegevens bezoeker</h2>
                    <dl className="space-y-2 text-sm">
                        <div><dt className="text-gray-500">Naam</dt><dd className="font-semibold text-gray-900">{session.name}</dd></div>
                        <div><dt className="text-gray-500">E-mail</dt><dd className="text-gray-900">{session.email}</dd></div>
                        <div><dt className="text-gray-500">Telefoon</dt><dd className="text-gray-900">{session.phone ?? '-'}</dd></div>
                        <div><dt className="text-gray-500">Kanaal</dt><dd className="text-gray-900">Website chat</dd></div>
                        <div>
                            <dt className="text-gray-500">Scooter</dt>
                            <dd className="text-gray-900">
                                {session.scooter_id && session.scooter ? (
                                    <Link href={`/scooters/${session.scooter_id}`} className="text-orange-600 hover:text-orange-700 font-semibold">
                                        {session.scooter}
                                    </Link>
                                ) : (
                                    'Algemene vraag'
                                )}
                            </dd>
                        </div>
                        <div><dt className="text-gray-500">Beste tijd</dt><dd className="text-gray-900">{session.best_time ?? '-'}</dd></div>
                        <div><dt className="text-gray-500">Bron</dt><dd className="text-gray-900">{session.source ?? '-'}</dd></div>
                        <div><dt className="text-gray-500">Aangemaakt</dt><dd className="text-gray-900">{formatDateTime(session.created_at)}</dd></div>
                    </dl>

                    <div className="mt-5 pt-4 border-t border-gray-100 space-y-2">
                        <p className="text-xs uppercase tracking-wide text-gray-500">Status</p>
                        <div className="flex flex-wrap gap-2">
                            {(['nieuw', 'open', 'gesloten'] as const).map((status) => (
                                <button
                                    key={status}
                                    type="button"
                                    onClick={() => updateStatus(status)}
                                    className={`rounded-full px-3 py-1 text-xs font-semibold border ${
                                        session.status === status
                                            ? 'bg-orange-500 text-white border-orange-500'
                                            : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                                    }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-gray-100 space-y-2">
                        <Link href="/admin/chat" className="inline-flex rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50">← Terug naar inbox</Link>
                        <a href={publicChatLink} target="_blank" rel="noreferrer" className="inline-flex rounded-lg bg-gray-900 px-3 py-2 text-xs font-semibold text-white hover:bg-black">Open publieke chatlink</a>
                        <button type="button" onClick={deleteChat} className="inline-flex rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100">Verwijder chat</button>
                    </div>

                    <form onSubmit={sendAppointmentConfirmation} className="mt-5 pt-4 border-t border-gray-100 space-y-3">
                        <h3 className="text-sm font-bold text-gray-900">Afspraak bevestigen</h3>
                        <div>
                            <label className="text-xs text-gray-500">Datum en tijd</label>
                            <input
                                type="datetime-local"
                                value={appointmentForm.data.appointment_at}
                                onChange={(e) => appointmentForm.setData('appointment_at', e.target.value)}
                                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                required
                            />
                            {appointmentForm.errors.appointment_at && <p className="mt-1 text-xs text-red-600">{appointmentForm.errors.appointment_at}</p>}
                        </div>
                        <div>
                            <label className="text-xs text-gray-500">Locatie</label>
                            <input
                                type="text"
                                value={appointmentForm.data.location}
                                onChange={(e) => appointmentForm.setData('location', e.target.value)}
                                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                placeholder="Bijv. Winkel Nijkerk"
                            />
                            {appointmentForm.errors.location && <p className="mt-1 text-xs text-red-600">{appointmentForm.errors.location}</p>}
                        </div>
                        <div>
                            <label className="text-xs text-gray-500">Opmerking (optioneel)</label>
                            <textarea
                                value={appointmentForm.data.note}
                                onChange={(e) => appointmentForm.setData('note', e.target.value)}
                                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm min-h-20"
                                placeholder="Bijv. neem legitimatie mee"
                            />
                            {appointmentForm.errors.note && <p className="mt-1 text-xs text-red-600">{appointmentForm.errors.note}</p>}
                        </div>
                        <button
                            type="submit"
                            disabled={appointmentForm.processing}
                            className="w-full rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-semibold px-3 py-2 text-xs transition-colors disabled:opacity-60"
                        >
                            {appointmentForm.processing ? 'Verzenden...' : 'Verstuur afspraakbevestiging per e-mail'}
                        </button>
                    </form>
                </aside>

                <section className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="h-[58vh] overflow-y-auto p-4 space-y-3 bg-gray-50">
                        {messages.map((message) => {
                            const isAdmin = message.sender_type === 'admin';
                            return (
                                <div key={message.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[86%] rounded-2xl px-4 py-3 ${
                                        isAdmin ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-800'
                                    }`}>
                                        <div className="text-[11px] font-semibold opacity-80 mb-1">
                                            {message.sender_name ?? (isAdmin ? 'Admin' : session.name)} · {formatDateTime(message.created_at)}
                                        </div>
                                        <p className="text-sm leading-relaxed whitespace-pre-line">{message.message}</p>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={endRef} />
                    </div>

                    <form onSubmit={sendMessage} className="border-t border-gray-200 p-4 bg-white space-y-3">
                        <textarea
                            value={form.data.message}
                            onChange={(e) => form.setData('message', e.target.value)}
                            placeholder="Typ je antwoord..."
                            className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm min-h-24"
                            disabled={form.processing}
                            required
                        />
                        {form.errors.message && <p className="text-xs text-red-600">{form.errors.message}</p>}
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={form.processing}
                                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-60"
                            >
                                {form.processing ? 'Verzenden...' : 'Verstuur als admin'}
                            </button>
                        </div>
                    </form>
                </section>
            </div>
        </AdminLayout>
    );
}
