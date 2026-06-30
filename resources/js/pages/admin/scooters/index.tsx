import { Head, Link, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';
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
    warranty_status: {
        key: string;
        label: string;
    };
}

interface Props {
    scooters: Scooter[];
}

const statusLabels: Record<string, { label: string; color: string }> = {
    in_reparatie: { label: 'In reparatie', color: 'bg-yellow-100 text-yellow-700' },
    te_koop: { label: 'Te koop', color: 'bg-emerald-100 text-emerald-700' },
    verkocht: { label: 'Verkocht', color: 'bg-blue-100 text-blue-700' },
};

const warrantyStatusStyles: Record<string, string> = {
    active: 'bg-emerald-100 text-emerald-700',
    checkup_planned: 'bg-sky-100 text-sky-700',
    checkup_done: 'bg-indigo-100 text-indigo-700',
    expired: 'bg-gray-200 text-gray-700',
};

export default function ScooterIndex({ scooters }: Props) {
    const [warrantyFilter, setWarrantyFilter] = useState<string>('all');
    const [salesFilter, setSalesFilter] = useState<string>('all');

    const warrantyFilterOptions = useMemo(() => {
        const counts = scooters.reduce<Record<string, number>>((acc, scooter) => {
            const key = scooter.warranty_status?.key ?? 'unknown';
            acc[key] = (acc[key] ?? 0) + 1;

            return acc;
        }, {});

        return [
            { key: 'all', label: 'Alle garanties', count: scooters.length },
            { key: 'active', label: 'Garantie actief', count: counts.active ?? 0 },
            { key: 'checkup_planned', label: 'Nacontrole gepland', count: counts.checkup_planned ?? 0 },
            { key: 'checkup_done', label: 'Nacontrole uitgevoerd', count: counts.checkup_done ?? 0 },
            { key: 'expired', label: 'Garantie verlopen', count: counts.expired ?? 0 },
        ];
    }, [scooters]);

    const salesFilterOptions = useMemo(() => {
        const counts = scooters.reduce<Record<string, number>>((acc, scooter) => {
            const key = scooter.status ?? 'unknown';
            acc[key] = (acc[key] ?? 0) + 1;

            return acc;
        }, {});

        return [
            { key: 'all', label: 'Alle verkoopstatussen', count: scooters.length },
            { key: 'in_reparatie', label: 'In reparatie', count: counts.in_reparatie ?? 0 },
            { key: 'te_koop', label: 'Te koop', count: counts.te_koop ?? 0 },
            { key: 'verkocht', label: 'Verkocht', count: counts.verkocht ?? 0 },
        ];
    }, [scooters]);

    const filteredScooters = useMemo(() => {
        return scooters.filter((scooter) => {
            const warrantyMatches = warrantyFilter === 'all' || scooter.warranty_status?.key === warrantyFilter;
            const salesMatches = salesFilter === 'all' || scooter.status === salesFilter;

            return warrantyMatches && salesMatches;
        });
    }, [scooters, warrantyFilter, salesFilter]);

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
                    <p className="text-sm text-gray-500">{filteredScooters.length} van {scooters.length} scooter(s)</p>
                    <Link
                        href="/admin/scooters/nieuw"
                        className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
                    >
                        + Scooter toevoegen
                    </Link>
                </div>

                <div className="px-6 py-3 border-b border-gray-100 bg-gray-50">
                    <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-2">Filter op garantie</div>
                    <div className="flex flex-wrap gap-2">
                        {warrantyFilterOptions.map((option) => {
                            const isActive = warrantyFilter === option.key;

                            return (
                                <button
                                    key={option.key}
                                    type="button"
                                    onClick={() => setWarrantyFilter(option.key)}
                                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                                        isActive
                                            ? 'bg-orange-500 text-white'
                                            : 'bg-white text-gray-700 border border-gray-200 hover:border-orange-200 hover:text-orange-700'
                                    }`}
                                >
                                    <span>{option.label}</span>
                                    <span className={`rounded-full px-1.5 py-0.5 text-[11px] ${isActive ? 'bg-orange-400 text-white' : 'bg-gray-100 text-gray-600'}`}>
                                        {option.count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 mt-4 mb-2">Filter op verkoopstatus</div>
                    <div className="flex flex-wrap gap-2">
                        {salesFilterOptions.map((option) => {
                            const isActive = salesFilter === option.key;

                            return (
                                <button
                                    key={option.key}
                                    type="button"
                                    onClick={() => setSalesFilter(option.key)}
                                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                                        isActive
                                            ? 'bg-gray-800 text-white'
                                            : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300 hover:text-gray-900'
                                    }`}
                                >
                                    <span>{option.label}</span>
                                    <span className={`rounded-full px-1.5 py-0.5 text-[11px] ${isActive ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-600'}`}>
                                        {option.count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {filteredScooters.length === 0 ? (
                    <div className="text-center py-16 text-gray-400">
                        <div className="text-5xl mb-3">🛵</div>
                        <p>{scooters.length === 0 ? 'Nog geen scooters.' : 'Geen scooters in deze garantiestatus.'}</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {filteredScooters.map((s) => {
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
                                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${warrantyStatusStyles[s.warranty_status.key] ?? 'bg-gray-100 text-gray-600'}`}>
                                                        {s.warranty_status.label}
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

                                        <div className="flex flex-wrap items-center gap-2">
                                            <Link
                                                href={`/admin/scooters/${s.id}/bewerken`}
                                                className="min-w-30 flex-1 text-center text-sm text-gray-600 border border-gray-200 hover:border-orange-200 hover:text-orange-600 transition-colors px-3 py-2 rounded-lg"
                                            >
                                                Bewerken
                                            </Link>
                                            <Link
                                                href={`/admin/scooters/${s.id}/onderhoudsformulier`}
                                                className="min-w-30 flex-1 text-center text-sm text-sky-700 border border-sky-200 hover:border-sky-300 hover:bg-sky-50 transition-colors px-3 py-2 rounded-lg"
                                            >
                                                Onderhoud
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(s.id, s.naam)}
                                                className="min-w-30 flex-1 text-center text-sm text-red-500 border border-red-100 hover:bg-red-50 transition-colors px-3 py-2 rounded-lg"
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
                                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${warrantyStatusStyles[s.warranty_status.key] ?? 'bg-gray-100 text-gray-600'}`}>
                                                    {s.warranty_status.label}
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
                                            <Link
                                                href={`/admin/scooters/${s.id}/onderhoudsformulier`}
                                                className="text-sm text-sky-700 hover:text-sky-800 transition-colors px-3 py-1.5 rounded-lg hover:bg-sky-50"
                                            >
                                                Onderhoud
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
