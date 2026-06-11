import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../../../layouts/AdminLayout';

interface Scooter {
    id: number;
    naam: string;
    status: string;
    inkoopprijs: number;
    verwachte_verkoopprijs: number | null;
    echte_verkoopprijs: number | null;
    onderdelen_kosten: number;
    verwachte_winst: number | null;
    echte_winst: number | null;
    ready_for_sale: boolean;
    foto: string | null;
}

interface Props {
    scooters: Scooter[];
}

const statusLabels: Record<string, { label: string; color: string }> = {
    in_reparatie: { label: 'In reparatie', color: 'bg-yellow-100 text-yellow-700' },
    te_koop: { label: 'Te koop', color: 'bg-emerald-100 text-emerald-700' },
    verkocht: { label: 'Verkocht', color: 'bg-blue-100 text-blue-700' },
};

export default function ScooterIndex({ scooters }: Props) {
    function handleDelete(id: number, naam: string) {
        if (confirm(`Weet je zeker dat je "${naam}" wilt verwijderen?`)) {
            router.delete(`/admin/scooters/${id}`);
        }
    }

    return (
        <AdminLayout title="Scooters beheren">
            <Head title="Scooters beheren" />

            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <p className="text-sm text-gray-500">{scooters.length} scooter(s)</p>
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
                        <p>Nog geen scooters.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {scooters.map((s) => {
                            const st = statusLabels[s.status] ?? { label: s.status, color: 'bg-gray-100 text-gray-600' };
                            return (
                                <div key={s.id} className="px-4 py-4 md:px-6 hover:bg-gray-50 transition-colors">
                                    <div className="md:hidden space-y-3">
                                        <div className="flex items-start gap-3">
                                            <div className="w-16 h-12 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                                                {s.foto ? (
                                                    <img src={s.foto} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-2xl text-gray-300">🛵</div>
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="font-semibold text-gray-900 truncate">{s.naam}</div>
                                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${st.color}`}>
                                                        {st.label}
                                                    </span>
                                                    {s.ready_for_sale && (
                                                        <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-medium">
                                                            🌐 Online
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div className="rounded-lg bg-gray-50 px-3 py-2">
                                                <div className="text-xs text-gray-400">Inkoop</div>
                                                <div className="font-medium text-gray-800">€{s.inkoopprijs.toLocaleString('nl-NL', { minimumFractionDigits: 0 })}</div>
                                            </div>
                                            <div className="rounded-lg bg-gray-50 px-3 py-2">
                                                <div className="text-xs text-gray-400">Onderdelen</div>
                                                <div className="font-medium text-gray-800">€{s.onderdelen_kosten.toLocaleString('nl-NL', { minimumFractionDigits: 0 })}</div>
                                            </div>
                                            <div className="rounded-lg bg-gray-50 px-3 py-2">
                                                <div className="text-xs text-gray-400">Verkoop (verw/echt)</div>
                                                <div className="font-medium text-orange-500">
                                                    {s.verwachte_verkoopprijs
                                                        ? `€${s.verwachte_verkoopprijs.toLocaleString('nl-NL', { minimumFractionDigits: 0 })}`
                                                        : '—'}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {s.echte_verkoopprijs ? `€${s.echte_verkoopprijs.toLocaleString('nl-NL', { minimumFractionDigits: 0 })}` : '—'}
                                                </div>
                                            </div>
                                            <div className="rounded-lg bg-gray-50 px-3 py-2">
                                                <div className="text-xs text-gray-400">Winst (verw/echt)</div>
                                                <div className={`font-medium ${s.verwachte_winst !== null && s.verwachte_winst >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                                    {s.verwachte_winst !== null
                                                        ? `${s.verwachte_winst >= 0 ? '+' : ''}€${s.verwachte_winst.toLocaleString('nl-NL', { minimumFractionDigits: 0 })}`
                                                        : '—'}
                                                </div>
                                                <div className={`text-xs ${s.echte_winst !== null && s.echte_winst >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                                    {s.echte_winst !== null
                                                        ? `${s.echte_winst >= 0 ? '+' : ''}€${s.echte_winst.toLocaleString('nl-NL', { minimumFractionDigits: 0 })}`
                                                        : '—'}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Link
                                                href={`/admin/scooters/${s.id}/bewerken`}
                                                className="flex-1 text-center text-sm text-gray-600 border border-gray-200 hover:border-orange-200 hover:text-orange-600 transition-colors px-3 py-2 rounded-lg"
                                            >
                                                Bewerken
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(s.id, s.naam)}
                                                className="flex-1 text-center text-sm text-red-500 border border-red-100 hover:bg-red-50 transition-colors px-3 py-2 rounded-lg"
                                            >
                                                Verwijderen
                                            </button>
                                        </div>
                                    </div>

                                    <div className="hidden md:flex items-center gap-4">
                                        <div className="w-16 h-12 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                                            {s.foto ? (
                                                <img src={s.foto} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-2xl text-gray-300">🛵</div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-semibold text-gray-900 truncate">{s.naam}</div>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${st.color}`}>
                                                    {st.label}
                                                </span>
                                                {s.ready_for_sale && (
                                                    <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-medium">
                                                        🌐 Online
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="hidden lg:flex items-center gap-6 text-sm text-gray-600">
                                        <div className="text-right">
                                            <div className="text-xs text-gray-400">Inkoop</div>
                                            <div className="font-medium">€{s.inkoopprijs.toLocaleString('nl-NL', { minimumFractionDigits: 0 })}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs text-gray-400">Onderdelen</div>
                                            <div className="font-medium">€{s.onderdelen_kosten.toLocaleString('nl-NL', { minimumFractionDigits: 0 })}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs text-gray-400">Verkoop (verw/echt)</div>
                                            <div className="font-bold text-orange-500">
                                                {s.verwachte_verkoopprijs
                                                    ? `€${s.verwachte_verkoopprijs.toLocaleString('nl-NL', { minimumFractionDigits: 0 })}`
                                                    : '—'}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {s.echte_verkoopprijs ? `€${s.echte_verkoopprijs.toLocaleString('nl-NL', { minimumFractionDigits: 0 })}` : '—'}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs text-gray-400">Winst (verw/echt)</div>
                                            <div className={`font-medium ${s.verwachte_winst !== null && s.verwachte_winst >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                                {s.verwachte_winst !== null ? `${s.verwachte_winst >= 0 ? '+' : ''}€${s.verwachte_winst.toLocaleString('nl-NL', { minimumFractionDigits: 0 })}` : '—'}
                                            </div>
                                            <div className={`text-xs ${s.echte_winst !== null && s.echte_winst >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                                {s.echte_winst !== null ? `${s.echte_winst >= 0 ? '+' : ''}€${s.echte_winst.toLocaleString('nl-NL', { minimumFractionDigits: 0 })}` : '—'}
                                            </div>
                                        </div>
                                    </div>
                                        <div className="flex items-center gap-2 ml-4">
                                            <Link
                                                href={`/admin/scooters/${s.id}/bewerken`}
                                                className="text-sm text-gray-500 hover:text-orange-500 transition-colors px-3 py-1.5 rounded-lg hover:bg-orange-50"
                                            >
                                                Bewerken
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(s.id, s.naam)}
                                                className="text-sm text-gray-400 hover:text-red-500 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50"
                                            >
                                                Verwijderen
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
