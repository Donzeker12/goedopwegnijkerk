import { Head, Link } from '@inertiajs/react';
import AdminLayout from '../../layouts/AdminLayout';

interface ScooterRow {
    id: number;
    naam: string;
    status: string;
    inkoopprijs: number;
    onderdelen_kosten: number;
    totale_investering: number;
    verwachte_verkoopprijs: number | null;
    echte_verkoopprijs: number | null;
    netto_winst: number | null;
    netto_winst_echt: number | null;
    ready_for_sale: boolean;
    views_count: number;
}

interface Totals {
    totale_investering: number;
    verwachte_omzet: number;
    verwachte_winst: number;
    aantal_te_koop: number;
    aantal_verkocht: number;
    aantal_in_reparatie: number;
    verwachte_winst_actuele_voorraad: number;
    open_betalingen_aantal: number;
    open_betalingen_totaal: number;
    inkoop_per_categorie: {
        scooter: number;
        onderdeel: number;
        overig: number;
    };
}

interface Props {
    scooters: ScooterRow[];
    totals: Totals;
    color_requests: {
        id: number;
        customer_name: string;
        customer_email: string;
        customer_phone: string | null;
        primary_color: string;
        accent_color: string;
        status: string;
        notes: string | null;
        created_at: string | null;
        scooter_id: number | null;
        scooter_name: string | null;
    }[];
    new_color_requests_count: number;
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
    total_scooter_views: number;
}

const statusLabels: Record<string, { label: string; color: string }> = {
    in_reparatie: { label: 'In reparatie', color: 'bg-yellow-100 text-yellow-700' },
    te_koop: { label: 'Te koop', color: 'bg-emerald-100 text-emerald-700' },
    verkocht: { label: 'Verkocht', color: 'bg-blue-100 text-blue-700' },
};

function euro(val: number | null) {
    if (val === null) return <span className="text-gray-400">—</span>;
    const fmt = val.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return <span>€{fmt}</span>;
}

export default function Dashboard({ scooters, totals, color_requests, new_color_requests_count, test_ride_requests, new_test_ride_requests_count, total_scooter_views }: Props) {
    return (
        <AdminLayout title="Dashboard">
            <Head title="Admin Dashboard" />

            {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4 mb-8">
                {[
                    { label: 'Totale investering', value: `€${totals.totale_investering.toLocaleString('nl-NL', { maximumFractionDigits: 0 })}`, color: 'bg-red-50 text-red-700', icon: '💸' },
                    { label: 'Verwachte omzet', value: `€${totals.verwachte_omzet.toLocaleString('nl-NL', { maximumFractionDigits: 0 })}`, color: 'bg-blue-50 text-blue-700', icon: '📈' },
                    { label: 'Verwachte winst', value: `€${totals.verwachte_winst.toLocaleString('nl-NL', { maximumFractionDigits: 0 })}`, color: 'bg-emerald-50 text-emerald-700', icon: '💰' },
                    { label: 'Winst actuele voorraad', value: `€${totals.verwachte_winst_actuele_voorraad.toLocaleString('nl-NL', { maximumFractionDigits: 0 })}`, color: 'bg-emerald-50 text-emerald-700', icon: '📦' },
                    { label: 'Open betalingen', value: String(totals.open_betalingen_aantal), color: 'bg-amber-50 text-amber-700', icon: '🧾' },
                    { label: 'Open bedrag', value: `€${totals.open_betalingen_totaal.toLocaleString('nl-NL', { maximumFractionDigits: 0 })}`, color: 'bg-amber-50 text-amber-700', icon: '⏳' },
                    { label: 'Scooter weergaves', value: total_scooter_views.toLocaleString('nl-NL'), color: 'bg-indigo-50 text-indigo-700', icon: '👀' },
                    { label: 'In reparatie', value: String(totals.aantal_in_reparatie), color: 'bg-yellow-50 text-yellow-700', icon: '🔧' },
                    { label: 'Te koop', value: String(totals.aantal_te_koop), color: 'bg-orange-50 text-orange-700', icon: '🛵' },
                    { label: 'Verkocht', value: String(totals.aantal_verkocht), color: 'bg-gray-50 text-gray-700', icon: '✅' },
                ].map((card) => (
                    <div key={card.label} className={`${card.color} rounded-2xl p-4`}>
                        <div className="text-2xl mb-1">{card.icon}</div>
                        <div className="text-2xl font-bold">{card.value}</div>
                        <div className="text-xs font-medium mt-0.5 opacity-80">{card.label}</div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-8 border border-gray-100">
                <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="font-bold text-gray-900 text-lg">Proefrit-aanvragen</h2>
                    <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-semibold">
                        Nieuw: {new_test_ride_requests_count}
                    </span>
                </div>

                {test_ride_requests.length === 0 ? (
                    <p className="p-4 text-sm text-gray-400">Nog geen proefrit-aanvragen binnen.</p>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {test_ride_requests.slice(0, 8).map((request) => (
                            <div key={request.id} className="p-4 sm:px-6">
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
                                    Contact via: <span className="font-semibold">{request.contact_preference}</span>
                                    {request.preferred_date ? ` • Datum: ${request.preferred_date}` : ''}
                                    {request.preferred_time ? ` • Tijd: ${request.preferred_time}` : ''}
                                </div>

                                {request.notes && <p className="mt-2 text-sm text-gray-600">Notitie: {request.notes}</p>}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
                    <div className="text-xs text-gray-500 mb-1">Inkoop categorie: scooters</div>
                    <div className="text-2xl font-bold text-gray-900">€{totals.inkoop_per_categorie.scooter.toLocaleString('nl-NL', { maximumFractionDigits: 0 })}</div>
                </div>
                <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
                    <div className="text-xs text-gray-500 mb-1">Inkoop categorie: onderdelen</div>
                    <div className="text-2xl font-bold text-gray-900">€{totals.inkoop_per_categorie.onderdeel.toLocaleString('nl-NL', { maximumFractionDigits: 0 })}</div>
                </div>
                <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
                    <div className="text-xs text-gray-500 mb-1">Inkoop categorie: overig</div>
                    <div className="text-2xl font-bold text-gray-900">€{totals.inkoop_per_categorie.overig.toLocaleString('nl-NL', { maximumFractionDigits: 0 })}</div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-8 border border-gray-100">
                <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="font-bold text-gray-900 text-lg">Kleur-aanvragen van klanten</h2>
                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-semibold">
                        Nieuw: {new_color_requests_count}
                    </span>
                </div>

                {color_requests.length === 0 ? (
                    <p className="p-4 text-sm text-gray-400">Nog geen kleur-aanvragen binnen.</p>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {color_requests.slice(0, 8).map((request) => (
                            <div key={request.id} className="p-4 sm:px-6">
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

                                <div className="mt-3 flex items-center gap-4 text-xs text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <span>Basiskleur</span>
                                        <span className="w-5 h-5 rounded-full border border-gray-200" style={{ backgroundColor: request.primary_color }} />
                                        <span className="font-mono">{request.primary_color}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span>Accent</span>
                                        <span className="w-5 h-5 rounded-full border border-gray-200" style={{ backgroundColor: request.accent_color }} />
                                        <span className="font-mono">{request.accent_color}</span>
                                    </div>
                                </div>

                                {request.notes && <p className="mt-2 text-sm text-gray-600">Notitie: {request.notes}</p>}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Financial table */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 sm:px-6 py-4 border-b border-gray-100">
                    <h2 className="font-bold text-gray-900 text-lg">Financieel overzicht</h2>
                    <Link
                        href="/admin/financien"
                        className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors text-center"
                    >
                        Open financieel overzicht
                    </Link>
                </div>

                {scooters.length === 0 ? (
                    <div className="text-center py-16 text-gray-400">
                        <div className="text-5xl mb-3">🛵</div>
                        <p>Nog geen scooters. <Link href="/admin/scooters/nieuw" className="text-orange-500 hover:underline">Voeg de eerste toe!</Link></p>
                    </div>
                ) : (
                    <>
                    <div className="lg:hidden divide-y divide-gray-100">
                        {scooters.map((row) => {
                            const st = statusLabels[row.status] ?? { label: row.status, color: 'bg-gray-100 text-gray-600' };
                            return (
                                <div key={row.id} className="p-4">
                                    <div className="flex items-center justify-between gap-2">
                                        <Link href={`/admin/scooters/${row.id}/bewerken`} className="font-semibold text-gray-900 hover:text-orange-500">
                                            {row.naam}
                                        </Link>
                                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${st.color}`}>{st.label}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                                        <div className="bg-gray-50 rounded-lg p-2">
                                            <div className="text-gray-500">Inkoop</div>
                                            <div className="font-semibold text-gray-900">{euro(row.inkoopprijs)}</div>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-2">
                                            <div className="text-gray-500">Onderdelen</div>
                                            <div className="font-semibold text-gray-900">{euro(row.onderdelen_kosten)}</div>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-2">
                                            <div className="text-gray-500">Verwachte verkoop</div>
                                            <div className="font-semibold text-gray-900">{euro(row.verwachte_verkoopprijs)}</div>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-2">
                                            <div className="text-gray-500">Echte verkoop</div>
                                            <div className="font-semibold text-gray-900">{euro(row.echte_verkoopprijs)}</div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="hidden lg:block overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                                    <th className="text-left px-6 py-3 font-semibold">Scooter</th>
                                    <th className="text-left px-4 py-3 font-semibold">Status</th>
                                    <th className="text-right px-4 py-3 font-semibold">Inkoopprijs</th>
                                    <th className="text-right px-4 py-3 font-semibold">Onderdelen</th>
                                    <th className="text-right px-4 py-3 font-semibold">Totaal inv.</th>
                                    <th className="text-right px-4 py-3 font-semibold">Verwachte verkoop</th>
                                    <th className="text-right px-4 py-3 font-semibold">Echte verkoop</th>
                                    <th className="text-right px-4 py-3 font-semibold">Views</th>
                                    <th className="text-right px-6 py-3 font-semibold">Winst (verw/echt)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {scooters.map((row) => {
                                    const st = statusLabels[row.status] ?? { label: row.status, color: 'bg-gray-100 text-gray-600' };
                                    return (
                                        <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <Link
                                                    href={`/admin/scooters/${row.id}/bewerken`}
                                                    className="font-semibold text-gray-900 hover:text-orange-500 transition-colors"
                                                >
                                                    {row.naam}
                                                </Link>
                                                {row.ready_for_sale && (
                                                    <span className="ml-2 text-xs bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full">Online</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className={`text-xs font-medium px-2 py-1 rounded-full ${st.color}`}>
                                                    {st.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-right text-gray-700">{euro(row.inkoopprijs)}</td>
                                            <td className="px-4 py-4 text-right text-gray-700">{euro(row.onderdelen_kosten)}</td>
                                            <td className="px-4 py-4 text-right font-semibold text-gray-900">{euro(row.totale_investering)}</td>
                                            <td className="px-4 py-4 text-right text-gray-700">{euro(row.verwachte_verkoopprijs)}</td>
                                            <td className="px-4 py-4 text-right text-gray-700">{euro(row.echte_verkoopprijs)}</td>
                                            <td className="px-4 py-4 text-right text-gray-900 font-semibold">{row.views_count.toLocaleString('nl-NL')}</td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="text-xs text-gray-500">{row.netto_winst !== null ? `${row.netto_winst >= 0 ? '+' : ''}€${row.netto_winst.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}` : '—'}</div>
                                                <div className={`font-bold ${row.netto_winst_echt === null ? 'text-gray-400' : row.netto_winst_echt >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                                    {row.netto_winst_echt !== null
                                                        ? `${row.netto_winst_echt >= 0 ? '+' : ''}€${row.netto_winst_echt.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}`
                                                        : '—'}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            {/* Totals row */}
                            <tfoot>
                                <tr className="bg-gray-50 font-bold text-gray-900 border-t-2 border-gray-200">
                                    <td className="px-6 py-3" colSpan={2}>Totaal</td>
                                    <td className="px-4 py-3 text-right">
                                        €{scooters.reduce((s, r) => s + r.inkoopprijs, 0).toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        €{scooters.reduce((s, r) => s + r.onderdelen_kosten, 0).toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        €{scooters.reduce((s, r) => s + r.totale_investering, 0).toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        €{totals.verwachte_omzet.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className="px-4 py-3 text-right text-gray-400">—</td>
                                    <td className="px-4 py-3 text-right">{scooters.reduce((s, r) => s + r.views_count, 0).toLocaleString('nl-NL')}</td>
                                    <td className="px-6 py-3 text-right">
                                        <span className={totals.verwachte_winst >= 0 ? 'text-emerald-600' : 'text-red-500'}>
                                            {totals.verwachte_winst >= 0 ? '+' : ''}€{totals.verwachte_winst.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
                                        </span>
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                    </>
                )}
            </div>
        </AdminLayout>
    );
}
