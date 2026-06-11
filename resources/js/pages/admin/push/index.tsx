import { Head, router } from '@inertiajs/react';
import AdminLayout from '../../../layouts/AdminLayout';

interface SubscriptionRow {
    id: number;
    user: {
        id: number | null;
        name: string | null;
        email: string | null;
    };
    endpoint: string;
    content_encoding: string;
    created_at: string | null;
    last_used_at: string | null;
}

interface Props {
    subscriptions: SubscriptionRow[];
    stats: {
        total: number;
        active_last_7_days: number;
    };
}

function shortEndpoint(endpoint: string): string {
    if (endpoint.length <= 80) return endpoint;
    return `${endpoint.slice(0, 38)}...${endpoint.slice(-32)}`;
}

export default function PushSubscriptionsIndex({ subscriptions, stats }: Props) {
    function removeSubscription(id: number) {
        if (!window.confirm('Weet je zeker dat je dit device wilt verwijderen?')) {
            return;
        }

        router.delete(`/admin/push/subscriptions/${id}`);
    }

    return (
        <AdminLayout title="Push devices">
            <Head title="Push devices" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="rounded-2xl border border-gray-200 bg-white p-4">
                    <div className="text-xs text-gray-500">Totaal geregistreerde devices</div>
                    <div className="text-3xl font-black text-gray-900 mt-1">{stats.total}</div>
                </div>
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                    <div className="text-xs text-emerald-700">Actief in laatste 7 dagen</div>
                    <div className="text-3xl font-black text-emerald-800 mt-1">{stats.active_last_7_days}</div>
                </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100">
                    <h2 className="font-bold text-gray-900">Gekoppelde meldingsdevices</h2>
                </div>

                {subscriptions.length === 0 ? (
                    <p className="p-4 text-sm text-gray-500">Er zijn nog geen push subscriptions opgeslagen.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-gray-600 text-xs">
                                <tr>
                                    <th className="text-left px-4 py-2 font-semibold">Gebruiker</th>
                                    <th className="text-left px-4 py-2 font-semibold">Endpoint</th>
                                    <th className="text-left px-4 py-2 font-semibold">Encoding</th>
                                    <th className="text-left px-4 py-2 font-semibold">Aangemaakt</th>
                                    <th className="text-left px-4 py-2 font-semibold">Laatst gebruikt</th>
                                    <th className="text-left px-4 py-2 font-semibold">Actie</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {subscriptions.map((subscription) => (
                                    <tr key={subscription.id}>
                                        <td className="px-4 py-2">
                                            <div className="font-semibold text-gray-900">{subscription.user.name ?? 'Onbekend'}</div>
                                            <div className="text-xs text-gray-500">{subscription.user.email ?? '-'}</div>
                                        </td>
                                        <td className="px-4 py-2 text-xs text-gray-700 max-w-105">
                                            <span title={subscription.endpoint}>{shortEndpoint(subscription.endpoint)}</span>
                                        </td>
                                        <td className="px-4 py-2 text-gray-700">{subscription.content_encoding}</td>
                                        <td className="px-4 py-2 text-gray-600">{subscription.created_at ?? '-'}</td>
                                        <td className="px-4 py-2 text-gray-600">{subscription.last_used_at ?? '-'}</td>
                                        <td className="px-4 py-2">
                                            <button
                                                type="button"
                                                onClick={() => removeSubscription(subscription.id)}
                                                className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
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
