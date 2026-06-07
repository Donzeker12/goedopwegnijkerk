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
    netto_winst: number | null;
    ready_for_sale: boolean;
}

interface Totals {
    totale_investering: number;
    verwachte_omzet: number;
    verwachte_winst: number;
    aantal_te_koop: number;
    aantal_verkocht: number;
    aantal_in_reparatie: number;
}

interface Props {
    scooters: ScooterRow[];
    totals: Totals;
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

export default function Dashboard({ scooters, totals }: Props) {
    return (
        <AdminLayout title="Dashboard">
            <Head title="Admin Dashboard" />

            {/* Summary cards */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
                {[
                    { label: 'Totale investering', value: `€${totals.totale_investering.toLocaleString('nl-NL', { maximumFractionDigits: 0 })}`, color: 'bg-red-50 text-red-700', icon: '💸' },
                    { label: 'Verwachte omzet', value: `€${totals.verwachte_omzet.toLocaleString('nl-NL', { maximumFractionDigits: 0 })}`, color: 'bg-blue-50 text-blue-700', icon: '📈' },
                    { label: 'Verwachte winst', value: `€${totals.verwachte_winst.toLocaleString('nl-NL', { maximumFractionDigits: 0 })}`, color: 'bg-emerald-50 text-emerald-700', icon: '💰' },
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

            {/* Financial table */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="font-bold text-gray-900 text-lg">Financieel overzicht</h2>
                    <Link
                        href="/admin/scooters/nieuw"
                        className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
                    >
                        + Scooter toevoegen
                    </Link>
                </div>

                {scooters.length === 0 ? (
                    <div className="text-center py-16 text-gray-400">
                        <div className="text-5xl mb-3">🛵</div>
                        <p>Nog geen scooters. <Link href="/admin/scooters/nieuw" className="text-orange-500 hover:underline">Voeg de eerste toe!</Link></p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                                    <th className="text-left px-6 py-3 font-semibold">Scooter</th>
                                    <th className="text-left px-4 py-3 font-semibold">Status</th>
                                    <th className="text-right px-4 py-3 font-semibold">Inkoopprijs</th>
                                    <th className="text-right px-4 py-3 font-semibold">Onderdelen</th>
                                    <th className="text-right px-4 py-3 font-semibold">Totaal inv.</th>
                                    <th className="text-right px-4 py-3 font-semibold">Verkoopprijs</th>
                                    <th className="text-right px-6 py-3 font-semibold">Netto winst</th>
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
                                            <td className="px-6 py-4 text-right">
                                                {row.netto_winst !== null ? (
                                                    <span className={`font-bold ${row.netto_winst >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                                        {row.netto_winst >= 0 ? '+' : ''}€{row.netto_winst.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400">—</span>
                                                )}
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
                                    <td className="px-6 py-3 text-right">
                                        <span className={totals.verwachte_winst >= 0 ? 'text-emerald-600' : 'text-red-500'}>
                                            {totals.verwachte_winst >= 0 ? '+' : ''}€{totals.verwachte_winst.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
                                        </span>
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
