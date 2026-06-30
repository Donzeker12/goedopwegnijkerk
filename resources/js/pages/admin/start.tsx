import { Head, Link, useForm } from '@inertiajs/react';
import { type FormEvent } from 'react';
import AdminLayout from '../../layouts/AdminLayout';

interface Summary {
    new_chats_count: number;
    new_color_requests_count: number;
    new_test_ride_requests_count: number;
    open_payments_count: number;
    open_payments_total: number;
    low_stock_count: number;
}

interface OpenPayment {
    id: number;
    description: string;
    amount: number;
    due_date: string | null;
}

interface ActiveChat {
    id: number;
    name: string;
    status: 'nieuw' | 'open' | 'gesloten';
    last_message_at: string | null;
    created_at: string | null;
}

interface Props {
    summary: Summary;
    open_payments: OpenPayment[];
    active_chats: ActiveChat[];
    can_manage_finance: boolean;
}

function euro(value: number): string {
    return `€${value.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function AdminStart({ summary, open_payments, active_chats, can_manage_finance }: Props) {
    const purchaseForm = useForm({
        category: 'overig' as 'scooter' | 'onderdeel' | 'overig',
        description: '',
        amount: '',
        purchased_at: '',
        due_date: '',
        notes: '',
    });

    function submitQuickPurchase(event: FormEvent) {
        event.preventDefault();
        if (!can_manage_finance) return;

        purchaseForm.post('/admin/financien/inkopen', {
            onSuccess: () => purchaseForm.reset(),
        });
    }

    return (
        <AdminLayout title="Mobiele werkruimte">
            <Head title="Admin Start" />

            <section className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
                <Link href="/admin/blog" className="col-span-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-700">Blog beheren</p>
                    <p className="text-2xl font-black text-slate-900 mt-2">📰 Preview & bewerken</p>
                    <p className="text-xs text-slate-600 mt-2">Open de bloglijst en kijk direct in preview.</p>
                </Link>
                <Link href="/admin/chat?status=nieuw" className="rounded-2xl border border-orange-200 bg-orange-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-orange-700">Nieuwe chats</p>
                    <p className="text-3xl font-black text-orange-800 mt-2">{summary.new_chats_count}</p>
                    <p className="text-xs text-orange-700 mt-2">Snel antwoorden</p>
                </Link>
                <Link href="/admin/financien" className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Open betalingen</p>
                    <p className="text-2xl font-black text-amber-800 mt-2">{summary.open_payments_count}</p>
                    <p className="text-xs text-amber-700 mt-2">{euro(summary.open_payments_total)}</p>
                </Link>
                <Link href="/admin/voorraad" className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-rose-700">Lage voorraad</p>
                    <p className="text-3xl font-black text-rose-800 mt-2">{summary.low_stock_count}</p>
                    <p className="text-xs text-rose-700 mt-2">Controleer onderdelen</p>
                </Link>
                <Link href="/admin" className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Kleur-aanvragen</p>
                    <p className="text-3xl font-black text-indigo-800 mt-2">{summary.new_color_requests_count}</p>
                    <p className="text-xs text-indigo-700 mt-2">Klant opvolgen</p>
                </Link>
                <Link href="/admin/financien" className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Proefritten nieuw</p>
                    <p className="text-3xl font-black text-emerald-800 mt-2">{summary.new_test_ride_requests_count}</p>
                    <p className="text-xs text-emerald-700 mt-2">Vandaag inplannen</p>
                </Link>
                <Link href="/admin/scooters/nieuw" className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-700">Nieuwe scooter</p>
                    <p className="text-2xl font-black text-slate-800 mt-2">+ Invoer</p>
                    <p className="text-xs text-slate-700 mt-2">Direct toevoegen</p>
                </Link>
            </section>

            <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-gray-200 bg-white p-4">
                    <h2 className="text-sm font-bold text-gray-900 mb-3">Snelle inkoop invoer</h2>
                    {!can_manage_finance ? (
                        <p className="text-sm text-gray-500">Je hebt geen rechten om inkoop te beheren.</p>
                    ) : (
                        <form onSubmit={submitQuickPurchase} className="space-y-3" data-offline-queue="true">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <select
                                    value={purchaseForm.data.category}
                                    onChange={(event) => purchaseForm.setData('category', event.target.value as 'scooter' | 'onderdeel' | 'overig')}
                                    className="w-full rounded-xl border border-gray-300 px-3 py-3 text-sm"
                                >
                                    <option value="scooter">Scooter</option>
                                    <option value="onderdeel">Onderdeel</option>
                                    <option value="overig">Overig</option>
                                </select>
                                <input
                                    value={purchaseForm.data.amount}
                                    onChange={(event) => purchaseForm.setData('amount', event.target.value)}
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    inputMode="decimal"
                                    placeholder="Bedrag in euro"
                                    className="w-full rounded-xl border border-gray-300 px-3 py-3 text-sm"
                                    required
                                />
                            </div>
                            <input
                                value={purchaseForm.data.description}
                                onChange={(event) => purchaseForm.setData('description', event.target.value)}
                                placeholder="Omschrijving"
                                className="w-full rounded-xl border border-gray-300 px-3 py-3 text-sm"
                                required
                            />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <input
                                    type="date"
                                    value={purchaseForm.data.purchased_at}
                                    onChange={(event) => purchaseForm.setData('purchased_at', event.target.value)}
                                    className="w-full rounded-xl border border-gray-300 px-3 py-3 text-sm"
                                />
                                <input
                                    type="date"
                                    value={purchaseForm.data.due_date}
                                    onChange={(event) => purchaseForm.setData('due_date', event.target.value)}
                                    className="w-full rounded-xl border border-gray-300 px-3 py-3 text-sm"
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white hover:bg-black"
                                disabled={purchaseForm.processing}
                            >
                                {purchaseForm.processing ? 'Opslaan...' : 'Inkoop opslaan'}
                            </button>
                        </form>
                    )}
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-4">
                    <h2 className="text-sm font-bold text-gray-900 mb-3">Actieve chats</h2>
                    {active_chats.length === 0 ? (
                        <p className="text-sm text-gray-500">Geen open chatgesprekken.</p>
                    ) : (
                        <div className="space-y-2">
                            {active_chats.map((chat) => (
                                <Link
                                    key={chat.id}
                                    href={`/admin/chat/${chat.id}`}
                                    className="block rounded-xl border border-gray-200 px-3 py-2 hover:border-orange-300"
                                >
                                    <p className="text-sm font-semibold text-gray-900">{chat.name}</p>
                                    <p className="text-xs text-gray-500">Status: {chat.status} • Laatste: {chat.last_message_at ?? chat.created_at ?? '-'}</p>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-4 xl:col-span-2">
                    <h2 className="text-sm font-bold text-gray-900 mb-3">Betalingen die aandacht vragen</h2>
                    {open_payments.length === 0 ? (
                        <p className="text-sm text-gray-500">Geen open betalingen.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {open_payments.map((payment) => (
                                <div key={payment.id} className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2">
                                    <p className="text-sm font-semibold text-amber-900">{payment.description}</p>
                                    <p className="text-xs text-amber-700">{euro(payment.amount)}{payment.due_date ? ` • Vervalt ${payment.due_date}` : ''}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </AdminLayout>
    );
}
