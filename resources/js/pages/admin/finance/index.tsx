import { Head, Link, router, useForm } from '@inertiajs/react';
import { type FormEvent, useState } from 'react';
import AdminLayout from '../../../layouts/AdminLayout';

interface FinanceEntry {
    id: number;
    category: 'scooter' | 'onderdeel' | 'overig';
    description: string;
    amount: number;
    payment_status: 'open' | 'betaald';
    purchased_at: string | null;
    due_date: string | null;
    paid_at: string | null;
    receipt_url: string | null;
    notes: string | null;
    scooter: { id: number; naam: string } | null;
}

interface OpenPayment {
    id: number;
    category: 'scooter' | 'onderdeel' | 'overig';
    description: string;
    amount: number;
    due_date: string | null;
    purchased_at: string | null;
    scooter_name: string | null;
}

interface LowStockPart {
    id: number;
    name: string;
    category: string | null;
    quantity: number;
    minimum_stock: number;
    scooter_name: string | null;
    scooter_id: number | null;
}

interface Props {
    entries: FinanceEntry[];
    open_payments: OpenPayment[];
    category_totals: {
        scooter: number;
        onderdeel: number;
        overig: number;
    };
    expected_profit_stock: number;
    low_stock_parts: LowStockPart[];
    can_manage_finance: boolean;
    can_manage_roles: boolean;
    top_viewed_scooters: {
        id: number;
        naam: string;
        status: string;
        views_count: number;
    }[];
    total_scooter_views: number;
    test_ride_requests: {
        id: number;
        customer_name: string;
        customer_email: string;
        customer_phone: string | null;
        preferred_date: string | null;
        preferred_time: string | null;
        contact_preference: string;
        status: string;
        notes: string | null;
        created_at: string | null;
        scooter_id: number | null;
        scooter_name: string | null;
    }[];
    new_test_ride_requests_count: number;
}

function contactPreferenceLabel(value: string) {
    switch (value) {
        case 'telefoon':
            return 'Telefoon';
        case 'email':
            return 'E-mail';
        case 'website_chat':
            return 'Website chat';
        case 'whatsapp':
            return 'WhatsApp';
        default:
            return value;
    }
}

function euro(amount: number) {
    return `€${amount.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}`;
}

const categoryLabel: Record<string, string> = {
    scooter: 'Scooters',
    onderdeel: 'Onderdelen',
    overig: 'Overig',
};

export default function FinanceIndex({ entries, open_payments, category_totals, expected_profit_stock, low_stock_parts, can_manage_finance, can_manage_roles, top_viewed_scooters, total_scooter_views, test_ride_requests, new_test_ride_requests_count }: Props) {
    const [showAdd, setShowAdd] = useState(false);

    const purchaseForm = useForm({
        category: 'overig',
        description: '',
        amount: '',
        purchased_at: '',
        due_date: '',
        notes: '',
        receipt: null as File | null,
    });

    const roleForm = useForm({
        email: '',
        admin_role: 'finance' as 'operations' | 'finance' | 'both',
    });

    function submitPurchase(e: FormEvent) {
        e.preventDefault();
        purchaseForm.post('/admin/financien/inkopen', {
            forceFormData: true,
            onSuccess: () => {
                purchaseForm.reset();
                setShowAdd(false);
            },
        });
    }

    function markPaid(id: number) {
        if (!can_manage_finance) return;
        router.patch(`/admin/financien/inkopen/${id}/betaald`, { paid_at: new Date().toISOString().slice(0, 10) });
    }

    function submitRole(e: FormEvent) {
        e.preventDefault();
        if (!can_manage_roles) return;

        roleForm.patch('/admin/financien/gebruikersrol');
    }

    return (
        <AdminLayout title="Financien">
            <Head title="Financien" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                    <div className="text-xs text-gray-500">Inkoop scooters</div>
                    <div className="text-2xl font-bold text-gray-900">{euro(category_totals.scooter)}</div>
                </div>
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                    <div className="text-xs text-gray-500">Inkoop onderdelen</div>
                    <div className="text-2xl font-bold text-gray-900">{euro(category_totals.onderdeel)}</div>
                </div>
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                    <div className="text-xs text-gray-500">Inkoop overig</div>
                    <div className="text-2xl font-bold text-gray-900">{euro(category_totals.overig)}</div>
                </div>
                <div className="rounded-2xl p-4 shadow-sm border border-emerald-100 bg-emerald-50">
                    <div className="text-xs text-emerald-700">Verwachte winst actuele voorraad</div>
                    <div className={`text-2xl font-bold ${expected_profit_stock >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                        {expected_profit_stock >= 0 ? '+' : ''}{euro(expected_profit_stock)}
                    </div>
                </div>
                <div className="rounded-2xl p-4 shadow-sm border border-indigo-100 bg-indigo-50">
                    <div className="text-xs text-indigo-700">Totale scooter weergaves</div>
                    <div className="text-2xl font-bold text-indigo-700">{total_scooter_views.toLocaleString('nl-NL')}</div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="font-bold text-gray-900">Proefrit-aanvragen</h2>
                            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-semibold">
                                Nieuw: {new_test_ride_requests_count}
                            </span>
                        </div>

                        {test_ride_requests.length === 0 ? (
                            <p className="p-4 text-sm text-gray-400">Nog geen proefrit-aanvragen binnen.</p>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {test_ride_requests.slice(0, 8).map((request) => (
                                    <div key={request.id} className="p-4">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                            <div>
                                                <div className="font-semibold text-gray-900">{request.customer_name}</div>
                                                <div className="text-xs text-gray-500">
                                                    {request.customer_email}
                                                    {request.customer_phone ? ` • ${request.customer_phone}` : ''}
                                                    {request.created_at ? ` • ${request.created_at}` : ''}
                                                </div>
                                                <div className="text-sm text-gray-700 mt-1">
                                                    {request.scooter_id ? (
                                                        <Link href={`/admin/scooters/${request.scooter_id}/bewerken`} className="text-orange-600 hover:underline">
                                                            {request.scooter_name ?? 'Scooter'}
                                                        </Link>
                                                    ) : (
                                                        <span className="text-gray-400">Onbekende scooter</span>
                                                    )}
                                                </div>
                                            </div>
                                            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-medium self-start sm:self-auto">
                                                {request.status}
                                            </span>
                                        </div>

                                        <div className="mt-2 text-xs text-gray-600">
                                            Contact via: <span className="font-semibold">{contactPreferenceLabel(request.contact_preference)}</span>
                                            {request.preferred_date ? ` • Datum: ${request.preferred_date}` : ''}
                                            {request.preferred_time ? ` • Tijd: ${request.preferred_time}` : ''}
                                        </div>

                                        {request.notes && <p className="mt-2 text-sm text-gray-600">Notitie: {request.notes}</p>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="font-bold text-gray-900">Openstaande betalingen</h2>
                            <span className="text-xs text-gray-500">{open_payments.length} open</span>
                        </div>

                        {open_payments.length === 0 ? (
                            <p className="p-4 text-sm text-gray-400">Geen openstaande betalingen.</p>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {open_payments.map((item) => (
                                    <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="font-semibold text-gray-900 text-sm truncate">{item.description}</div>
                                            <div className="text-xs text-gray-500 flex flex-wrap gap-2 mt-1">
                                                <span>{categoryLabel[item.category]}</span>
                                                {item.scooter_name && <span>• {item.scooter_name}</span>}
                                                {item.due_date && <span>• Vervalt {item.due_date}</span>}
                                            </div>
                                        </div>
                                        <div className="text-right sm:min-w-32">
                                            <div className="font-bold text-amber-700">{euro(item.amount)}</div>
                                        </div>
                                        {can_manage_finance && (
                                            <button
                                                onClick={() => markPaid(item.id)}
                                                className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium px-3 py-2 rounded-lg transition-colors"
                                            >
                                                Markeer betaald
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-4 py-3 border-b border-gray-100">
                            <h2 className="font-bold text-gray-900">Recente inkopen & bonnetjes</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-xs text-gray-500 bg-gray-50">
                                        <th className="text-left px-4 py-2">Omschrijving</th>
                                        <th className="text-left px-4 py-2">Categorie</th>
                                        <th className="text-left px-4 py-2">Status</th>
                                        <th className="text-right px-4 py-2">Bedrag</th>
                                        <th className="text-left px-4 py-2">Bon</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {entries.map((entry) => (
                                        <tr key={entry.id}>
                                            <td className="px-4 py-2">
                                                <div className="font-medium text-gray-900">{entry.description}</div>
                                                {entry.scooter && (
                                                    <Link href={`/admin/scooters/${entry.scooter.id}/bewerken`} className="text-xs text-orange-600 hover:underline">
                                                        {entry.scooter.naam}
                                                    </Link>
                                                )}
                                            </td>
                                            <td className="px-4 py-2 text-gray-600">{categoryLabel[entry.category]}</td>
                                            <td className="px-4 py-2">
                                                <span className={`text-xs px-2 py-1 rounded-full ${entry.payment_status === 'open' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                                    {entry.payment_status === 'open' ? 'Open' : 'Betaald'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2 text-right font-semibold">{euro(entry.amount)}</td>
                                            <td className="px-4 py-2">
                                                {entry.receipt_url ? (
                                                    <a href={entry.receipt_url} target="_blank" rel="noreferrer" className="text-orange-600 hover:underline text-xs">Bekijk bon</a>
                                                ) : (
                                                    <span className="text-gray-300 text-xs">—</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="font-bold text-gray-900">Nieuwe inkoop</h2>
                            {can_manage_finance && (
                                <button type="button" onClick={() => setShowAdd((v) => !v)} className="text-xs text-orange-600 hover:text-orange-700">
                                    {showAdd ? 'Sluiten' : '+ Toevoegen'}
                                </button>
                            )}
                        </div>

                        {!can_manage_finance && (
                            <p className="text-xs text-gray-500">Alleen financieel beheer kan betalingen en inkoopregels wijzigen.</p>
                        )}

                        {can_manage_finance && showAdd && (
                            <form onSubmit={submitPurchase} className="space-y-3">
                                <div>
                                    <label className="text-xs text-gray-500">Categorie</label>
                                    <select
                                        value={purchaseForm.data.category}
                                        onChange={(e) => purchaseForm.setData('category', e.target.value as 'scooter' | 'onderdeel' | 'overig')}
                                        className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                    >
                                        <option value="scooter">Scooters</option>
                                        <option value="onderdeel">Onderdelen</option>
                                        <option value="overig">Overig</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500">Omschrijving</label>
                                    <input value={purchaseForm.data.description} onChange={(e) => purchaseForm.setData('description', e.target.value)} className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500">Bedrag (€)</label>
                                    <input type="number" step="0.01" min="0" value={purchaseForm.data.amount} onChange={(e) => purchaseForm.setData('amount', e.target.value)} className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    <div>
                                        <label className="text-xs text-gray-500">Aankoopdatum</label>
                                        <input type="date" value={purchaseForm.data.purchased_at} onChange={(e) => purchaseForm.setData('purchased_at', e.target.value)} className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500">Vervaldatum</label>
                                        <input type="date" value={purchaseForm.data.due_date} onChange={(e) => purchaseForm.setData('due_date', e.target.value)} className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500">Bon/Factuur</label>
                                    <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf" onChange={(e) => purchaseForm.setData('receipt', e.target.files?.[0] ?? null)} className="mt-1 w-full text-sm" />
                                </div>
                                <button type="submit" disabled={purchaseForm.processing} className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg text-sm font-medium">
                                    {purchaseForm.processing ? 'Opslaan...' : 'Inkoop opslaan'}
                                </button>
                            </form>
                        )}
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                        <h2 className="font-bold text-gray-900 mb-3">Meest bekeken scooters</h2>
                        {top_viewed_scooters.length === 0 ? (
                            <p className="text-sm text-gray-400">Nog geen weergaves geregistreerd.</p>
                        ) : (
                            <div className="space-y-2 mb-4">
                                {top_viewed_scooters.map((scooter) => (
                                    <div key={scooter.id} className="p-3 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-between gap-3">
                                        <Link href={`/admin/scooters/${scooter.id}/bewerken`} className="text-sm font-semibold text-indigo-900 hover:underline">
                                            {scooter.naam}
                                        </Link>
                                        <span className="text-xs font-bold text-indigo-700">{scooter.views_count.toLocaleString('nl-NL')}x</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        <h2 className="font-bold text-gray-900 mb-3">Voorraad waarschuwingen</h2>
                        {low_stock_parts.length === 0 ? (
                            <p className="text-sm text-gray-400">Geen onderdelen onder minimumvoorraad.</p>
                        ) : (
                            <div className="space-y-2">
                                {low_stock_parts.map((part) => (
                                    <div key={part.id} className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                                        <div className="text-sm font-semibold text-amber-900">{part.name}</div>
                                        <div className="text-xs text-amber-700 mt-0.5">
                                            Voorraad {part.quantity} / minimum {part.minimum_stock}
                                        </div>
                                        {part.scooter_id && (
                                            <Link href={`/admin/scooters/${part.scooter_id}/bewerken`} className="text-xs text-amber-700 underline">
                                                {part.scooter_name ?? 'Scooter bekijken'}
                                            </Link>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {can_manage_roles && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                            <h2 className="font-bold text-gray-900 mb-3">Rollen instellen</h2>
                            <p className="text-xs text-gray-500 mb-3">
                                Gebruik dit voor jullie verdeling: jij op operations, je vrouw op finance, of beide op both.
                            </p>
                            <form onSubmit={submitRole} className="space-y-3">
                                <div>
                                    <label className="text-xs text-gray-500">E-mailadres</label>
                                    <input
                                        type="email"
                                        value={roleForm.data.email}
                                        onChange={(e) => roleForm.setData('email', e.target.value)}
                                        className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500">Rol</label>
                                    <select
                                        value={roleForm.data.admin_role}
                                        onChange={(e) => roleForm.setData('admin_role', e.target.value as 'operations' | 'finance' | 'both')}
                                        className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                    >
                                        <option value="operations">Operations: scooters, onderdelen, operationeel</option>
                                        <option value="finance">Finance: betalingen, rapportages, financieel</option>
                                        <option value="both">Both: volledige toegang</option>
                                    </select>
                                </div>
                                <button
                                    type="submit"
                                    disabled={!can_manage_roles || roleForm.processing}
                                    className="w-full bg-gray-900 hover:bg-black text-white py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                                >
                                    {roleForm.processing ? 'Opslaan...' : 'Rol opslaan'}
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
