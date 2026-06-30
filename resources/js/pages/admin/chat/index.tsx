import { Link } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import AdminLayout from '../../../layouts/AdminLayout';
import SeoHead from '../../../components/SeoHead';

interface ChatSessionItem {
    id: number;
    name: string;
    email: string;
    status: 'nieuw' | 'open' | 'gesloten';
    source: string | null;
    scooter: string | null;
    messages_count: number;
    last_message_at: string | null;
    created_at: string | null;
}

interface Props {
    sessions: ChatSessionItem[];
    filters: {
        status: 'alle' | 'nieuw' | 'open' | 'gesloten';
    };
    auto_closed_count: number;
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

function deleteSession(id: number, name: string) {
    if (confirm(`Weet je zeker dat je chat van "${name}" wilt verwijderen?`)) {
        router.delete(`/admin/chat/${id}`);
    }
}

export default function AdminChatIndex({ sessions, filters, auto_closed_count }: Props) {
    const statusFilters: Array<{ value: 'alle' | 'nieuw' | 'open' | 'gesloten'; label: string }> = [
        { value: 'alle', label: 'Alle' },
        { value: 'nieuw', label: 'Nieuw' },
        { value: 'open', label: 'Open' },
        { value: 'gesloten', label: 'Gesloten' },
    ];

    return (
        <AdminLayout title="Chat inbox">
            <SeoHead title="Admin chat" description="Beheer chatgesprekken met bezoekers." path="/admin/chat" noindex />

            {auto_closed_count > 0 && (
                <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    {auto_closed_count} inactieve chat(s) automatisch gesloten.
                </div>
            )}

            <div className="mb-4 flex flex-wrap gap-2">
                {statusFilters.map((filter) => (
                    <Link
                        key={filter.value}
                        href={`/admin/chat?status=${filter.value}`}
                        className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                            filters.status === filter.value
                                ? 'border-orange-500 bg-orange-500 text-white'
                                : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                        }`}
                    >
                        {filter.label}
                    </Link>
                ))}
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
                    <h2 className="font-bold text-gray-900">Binnengekomen chats</h2>
                    <span className="text-sm text-gray-500">{sessions.length} gesprekken</span>
                </div>

                {sessions.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 text-sm">Nog geen chatgesprekken ontvangen.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-gray-600">
                                <tr>
                                    <th className="text-left px-4 py-3 font-semibold">Bezoeker</th>
                                    <th className="text-left px-4 py-3 font-semibold">Scooter</th>
                                    <th className="text-left px-4 py-3 font-semibold">Status</th>
                                    <th className="text-left px-4 py-3 font-semibold">Berichten</th>
                                    <th className="text-left px-4 py-3 font-semibold">Laatste activiteit</th>
                                    <th className="text-left px-4 py-3 font-semibold">Actie</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sessions.map((session) => (
                                    <tr key={session.id} className="border-t border-gray-100">
                                        <td className="px-4 py-3">
                                            <div className="font-semibold text-gray-900">{session.name}</div>
                                            <div className="text-xs text-gray-500">{session.email}</div>
                                            <div className="text-xs text-gray-400">Bron: {session.source ?? '-'}</div>
                                        </td>
                                        <td className="px-4 py-3 text-gray-700">{session.scooter ?? 'Algemene vraag'}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                                                session.status === 'nieuw'
                                                    ? 'bg-orange-100 text-orange-700'
                                                    : session.status === 'open'
                                                        ? 'bg-emerald-100 text-emerald-700'
                                                        : 'bg-gray-200 text-gray-700'
                                            }`}>
                                                {session.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-700">{session.messages_count}</td>
                                        <td className="px-4 py-3 text-gray-600">{formatDateTime(session.last_message_at ?? session.created_at)}</td>
                                        <td className="px-4 py-3">
                                            <Link
                                                href={`/admin/chat/${session.id}`}
                                                className="inline-flex items-center rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-black"
                                            >
                                                Open chat
                                            </Link>
                                            <button
                                                type="button"
                                                onClick={() => deleteSession(session.id, session.name)}
                                                className="ml-2 inline-flex items-center rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
                                            >
                                                Verwijder
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
