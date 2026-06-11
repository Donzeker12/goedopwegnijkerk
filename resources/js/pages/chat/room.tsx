import { useForm, router } from '@inertiajs/react';
import { type FormEvent, useEffect, useMemo, useRef } from 'react';
import AppLayout from '../../layouts/AppLayout';
import SeoHead from '../../components/SeoHead';

interface ChatMessage {
    id: number;
    sender_type: 'visitor' | 'admin';
    sender_name: string | null;
    message: string;
    created_at: string | null;
}

interface ChatSession {
    token: string;
    name: string;
    status: 'nieuw' | 'open' | 'gesloten';
    scooter: string | null;
    created_at: string | null;
}

interface Props {
    session: ChatSession;
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

export default function ChatRoom({ session, messages }: Props) {
    const form = useForm({ message: '' });
    const endRef = useRef<HTMLDivElement | null>(null);

    const headerStatus = useMemo(() => {
        if (session.status === 'gesloten') return 'Gesloten';
        if (session.status === 'open') return 'Actief';
        return 'Nieuw';
    }, [session.status]);

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
        }, 5000);

        return () => window.clearInterval(interval);
    }, []);

    function submit(e: FormEvent) {
        e.preventDefault();

        form.post(`/chat/${session.token}/bericht`, {
            preserveScroll: true,
            onSuccess: () => {
                form.reset('message');
            },
        });
    }

    return (
        <AppLayout>
            <SeoHead
                title="Chatgesprek"
                description="Praat direct verder met Goed Op Weg Nijkerk via de chatpagina."
                path={`/chat/${session.token}`}
                noindex
                breadcrumbs={[
                    { name: 'Home', url: '/' },
                    { name: 'Chat' },
                ]}
            />

            <section className="bg-linear-to-br from-gray-900 via-gray-800 to-orange-900 text-white py-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                            <h1 className="text-3xl font-black">Chat met Goed Op Weg</h1>
                            <p className="text-gray-200 text-sm mt-1">Hoi {session.name}, je berichten verschijnen hier automatisch.</p>
                            {session.scooter && <p className="text-gray-300 text-xs mt-1">Onderwerp: {session.scooter}</p>}
                        </div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold">
                            <span className="h-2 w-2 rounded-full bg-emerald-400" />
                            Status: {headerStatus}
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
                        <div className="h-[52vh] overflow-y-auto p-4 space-y-3 bg-gray-50">
                            {messages.length === 0 && (
                                <div className="text-center text-sm text-gray-500 py-12">Nog geen berichten. Start het gesprek hieronder.</div>
                            )}

                            {messages.map((message) => {
                                const isVisitor = message.sender_type === 'visitor';
                                return (
                                    <div key={message.id} className={`flex ${isVisitor ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${isVisitor ? 'bg-orange-500 text-white' : 'bg-white border border-gray-200 text-gray-800'}`}>
                                            <div className="text-[11px] font-semibold opacity-80 mb-1">
                                                {isVisitor ? 'Jij' : (message.sender_name || 'Goed Op Weg')} · {formatDateTime(message.created_at)}
                                            </div>
                                            <p className="text-sm leading-relaxed whitespace-pre-line">{message.message}</p>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={endRef} />
                        </div>

                        <form onSubmit={submit} className="border-t border-gray-200 p-4 bg-white space-y-3">
                            <textarea
                                value={form.data.message}
                                onChange={(e) => form.setData('message', e.target.value)}
                                placeholder={session.status === 'gesloten' ? 'Deze chat is gesloten' : 'Typ je bericht...'}
                                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm min-h-24"
                                disabled={form.processing || session.status === 'gesloten'}
                                required
                            />
                            {form.errors.message && <p className="text-xs text-red-600">{form.errors.message}</p>}
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={form.processing || session.status === 'gesloten'}
                                    className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-60"
                                >
                                    {form.processing ? 'Verzenden...' : 'Verstuur bericht'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </section>
        </AppLayout>
    );
}
