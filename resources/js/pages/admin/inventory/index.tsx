import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../../../layouts/AdminLayout';

type InventoryTab = 'all' | 'nodig' | 'besteld' | 'binnen' | 'geplaatst';
const HIDDEN_PARTS_STORAGE_KEY = 'admin-inventory-hidden-parts';

interface PartRow {
    id: number;
    name: string;
    part_brand: string | null;
    category: string;
    quantity: number;
    requested_quantity: number;
    minimum_stock: number;
    procurement_status: 'nodig' | 'besteld' | 'binnen' | 'geplaatst';
    unit_cost: number;
    total_value: number;
    low_stock: boolean;
    scooter_id: number | null;
    scooter_name: string | null;
}

interface Summary {
    distinct_parts: number;
    total_units: number;
    low_stock_count: number;
    total_value: number;
    pending_needed_count: number;
    pending_ordered_count: number;
    pending_total_count: number;
    pending_needed_units: number;
    pending_ordered_units: number;
    pending_total_units: number;
    pending_needed_value: number;
    pending_ordered_value: number;
    pending_total_value: number;
    categories: {
        scooter_parts: number;
        overig: number;
    };
}

interface ScooterOption {
    id: number;
    naam: string;
}

interface EditablePart {
    name: string;
    part_brand: string;
    category: string;
    quantity: string;
    minimum_stock: string;
    cost: string;
    procurement_status: 'nodig' | 'besteld' | 'binnen' | 'geplaatst';
    scooter_id: string;
}

interface Props {
    parts: PartRow[];
    summary: Summary;
    scooters: ScooterOption[];
    installed_count: number;
    can_manage_finance: boolean;
}

const euro = (amount: number) => `€${amount.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}`;

const statusLabel: Record<PartRow['procurement_status'], string> = {
    nodig: 'Nodig',
    besteld: 'Besteld',
    binnen: 'Binnen',
    geplaatst: 'Geplaatst',
};

const statusBadgeClass: Record<PartRow['procurement_status'], string> = {
    nodig: 'bg-rose-100 text-rose-700',
    besteld: 'bg-blue-100 text-blue-700',
    binnen: 'bg-emerald-100 text-emerald-700',
    geplaatst: 'bg-violet-100 text-violet-700',
};

const categoryOptions = [
    'Motor',
    'Remmen',
    'Verlichting',
    'Wielen',
    'Banden',
    'Accu',
    'Controller',
    'Display',
    'Frame',
    'Ophanging',
    'Overig',
];

const supplierOptions = ['Kparts', 'Zandri', 'Scootershop'];

function parseDutchCurrency(value: string): number {
    const normalized = value.replace(',', '.').replace(/[^0-9.]/g, '');
    return Number.parseFloat(normalized || '0') || 0;
}

export default function InventoryIndex({ parts, summary, scooters, installed_count, can_manage_finance }: Props) {
    const { props } = usePage<{ flash?: { success?: string } }>();
    const [activeTab, setActiveTab] = useState<InventoryTab>('all');
    const [searchFilter, setSearchFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [supplierFilter, setSupplierFilter] = useState('all');
    const [scooterFilter, setScooterFilter] = useState('all');
    const [showHidden, setShowHidden] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<PartRow | null>(null);
    const [hiddenPartIds, setHiddenPartIds] = useState<number[]>(() => {
        if (typeof window === 'undefined') {
            return [];
        }

        const raw = window.localStorage.getItem(HIDDEN_PARTS_STORAGE_KEY);

        if (!raw) {
            return [];
        }

        try {
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed.filter((value) => Number.isInteger(value)) : [];
        } catch {
            return [];
        }
    });
    const [selectedPartId, setSelectedPartId] = useState<number | null>(parts[0]?.id ?? null);
    const [editByPart, setEditByPart] = useState<Record<number, EditablePart>>(() =>
        parts.reduce((acc, part) => {
            acc[part.id] = {
                name: part.name,
                part_brand: part.part_brand ?? '',
                category: part.category || 'Overig',
                quantity: String(part.requested_quantity ?? 0),
                minimum_stock: String(part.minimum_stock ?? 0),
                cost: String(part.unit_cost ?? 0),
                procurement_status: part.procurement_status,
                scooter_id: part.scooter_id ? String(part.scooter_id) : '',
            };

            return acc;
        }, {} as Record<number, EditablePart>)
    );

    function setPartField(partId: number, field: keyof EditablePart, value: string) {
        setEditByPart((prev) => ({
            ...prev,
            [partId]: {
                ...prev[partId],
                [field]: value,
            },
        }));
    }

    function updatePart(partId: number, action: 'save' | 'besteld' | 'binnen' | 'geplaatst') {
        const current = editByPart[partId];
        const status = action === 'save' ? current.procurement_status : action;

        // Wanneer we naar "geplaatst" gaan en het was in "binnen", trek 1 stuk af
        // maar laat quantity nooit op 0 eindigen (anders wordt totaalprijs €0,00 op scooterpagina)
        let newQuantity = Number.parseInt(current.quantity || '0', 10) || 0;
        if (action === 'geplaatst' && current.procurement_status === 'binnen' && newQuantity > 1) {
            newQuantity = newQuantity - 1;
        }

        if (action === 'geplaatst' && newQuantity < 1) {
            newQuantity = 1;
        }

        router.patch(
            `/admin/voorraad/onderdelen/${partId}`,
            {
                name: current.name,
                part_brand: current.part_brand || null,
                category: current.category === 'Overig' ? null : current.category || null,
                quantity: newQuantity,
                minimum_stock: Number.parseInt(current.minimum_stock || '0', 10) || 0,
                cost: parseDutchCurrency(current.cost || '0'),
                procurement_status: status,
                scooter_id: current.scooter_id ? Number.parseInt(current.scooter_id, 10) : null,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    // Update het item in parts zodat het verdwijnt als het status verandert
                    setParts((prev) =>
                        prev.map((p) =>
                            p.id === partId ? { ...p, procurement_status: status, quantity: newQuantity } : p
                        )
                    );
                    // Clean up edit state
                    if (action !== 'save') {
                        setEditByPart((prev) => {
                            const updated = { ...prev };
                            delete updated[partId];
                            return updated;
                        });
                    }
                },
            }
        );

        if (action !== 'save') {
            setPartField(partId, 'procurement_status', status);
        }
    }

    function toggleHiddenPart(partId: number) {
        setHiddenPartIds((prev) => {
            if (prev.includes(partId)) {
                return prev.filter((id) => id !== partId);
            }

            return [...prev, partId];
        });
    }

    function deletePart(part: PartRow) {
        setDeleteTarget(part);
    }

    function confirmDelete() {
        if (!deleteTarget) {
            return;
        }

        router.delete(`/admin/voorraad/onderdelen/${deleteTarget.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setHiddenPartIds((prev) => prev.filter((id) => id !== deleteTarget.id));
                setDeleteTarget(null);
            },
        });
    }

    const tabCounts = useMemo(
        () => ({
            all: parts.length,
            nodig: parts.filter((part) => part.procurement_status === 'nodig').length,
            besteld: parts.filter((part) => part.procurement_status === 'besteld').length,
            binnen: parts.filter((part) => part.procurement_status === 'binnen').length,
            geplaatst: parts.filter((part) => part.procurement_status === 'geplaatst').length,
        }),
        [parts]
    );

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        window.localStorage.setItem(HIDDEN_PARTS_STORAGE_KEY, JSON.stringify(hiddenPartIds));
    }, [hiddenPartIds]);

    const categoryFilterOptions = useMemo(() => {
        return ['all', ...Array.from(new Set(parts.map((part) => part.category || 'Overig'))).sort((a, b) => a.localeCompare(b))];
    }, [parts]);

    const supplierFilterOptions = useMemo(() => {
        return [
            'all',
            ...Array.from(new Set(parts.map((part) => part.part_brand).filter((brand): brand is string => Boolean(brand)))).sort((a, b) =>
                a.localeCompare(b)
            ),
        ];
    }, [parts]);

    const filteredParts = useMemo(() => {
        const needle = searchFilter.trim().toLowerCase();

        return parts.filter((part) => {
            if (activeTab === 'nodig' && part.procurement_status !== 'nodig') {
                return false;
            }

            if (activeTab === 'binnen' && part.procurement_status !== 'binnen') {
                return false;
            }

            if (activeTab === 'besteld' && part.procurement_status !== 'besteld') {
                return false;
            }

            if (activeTab === 'geplaatst' && part.procurement_status !== 'geplaatst') {
                return false;
            }

            if (!showHidden && hiddenPartIds.includes(part.id)) {
                return false;
            }

            if (categoryFilter !== 'all' && part.category !== categoryFilter) {
                return false;
            }

            if (supplierFilter !== 'all' && part.part_brand !== supplierFilter) {
                return false;
            }

            if (scooterFilter === 'gekoppeld' && !part.scooter_id) {
                return false;
            }

            if (scooterFilter === 'los' && part.scooter_id) {
                return false;
            }

            if (!needle) {
                return true;
            }

            return [part.name, part.category, part.part_brand ?? '', part.scooter_name ?? '', statusLabel[part.procurement_status]]
                .join(' ')
                .toLowerCase()
                .includes(needle);
        });
    }, [parts, activeTab, searchFilter, categoryFilter, supplierFilter, scooterFilter, hiddenPartIds, showHidden]);

    useEffect(() => {
        if (filteredParts.length === 0) {
            setSelectedPartId(null);
            return;
        }

        if (!selectedPartId || !filteredParts.some((part) => part.id === selectedPartId)) {
            setSelectedPartId(filteredParts[0].id);
        }
    }, [filteredParts, selectedPartId]);

    const selectedPart = filteredParts.find((part) => part.id === selectedPartId) ?? null;
    const selectedDraft = selectedPart ? editByPart[selectedPart.id] : null;

    return (
        <AdminLayout title="Voorraad">
            <Head title="Voorraad" />

            {props.flash?.success && (
                <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 shadow-sm">
                    ✅ {props.flash.success}
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                    <div className="text-xs text-gray-500">Unieke onderdelen</div>
                    <div className="text-2xl font-bold text-gray-900">{summary.distinct_parts}</div>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                    <div className="text-xs text-gray-500">Totale stuks voorraad</div>
                    <div className="text-2xl font-bold text-gray-900">{summary.total_units}</div>
                </div>
                <div className="rounded-2xl shadow-sm border border-amber-100 bg-amber-50 p-4">
                    <div className="text-xs text-amber-700">Onder minimumvoorraad</div>
                    <div className="text-2xl font-bold text-amber-800">{summary.low_stock_count}</div>
                </div>
                <div className="rounded-2xl shadow-sm border border-emerald-100 bg-emerald-50 p-4">
                    <div className="text-xs text-emerald-700">Totale voorraadwaarde</div>
                    <div className="text-2xl font-bold text-emerald-800">{euro(summary.total_value)}</div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                    <div className="text-xs text-gray-500 mb-1">Waarde onderdelen categorieen</div>
                    <div className="text-lg font-semibold text-gray-900">Actieve categorieen: {euro(summary.categories.scooter_parts)}</div>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                    <div className="text-xs text-gray-500 mb-1">Waarde overig</div>
                    <div className="text-lg font-semibold text-gray-900">Overig: {euro(summary.categories.overig)}</div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="rounded-2xl shadow-sm border border-amber-200 bg-amber-50 p-4">
                    <div className="text-xs text-amber-700 mb-1">Nog nodig</div>
                    <div className="text-lg font-bold text-amber-800">{summary.pending_needed_count} producten</div>
                    <div className="text-sm text-amber-700">{summary.pending_needed_units} stuks</div>
                    <div className="text-sm text-amber-700 mt-1">Kosten: {euro(summary.pending_needed_value)}</div>
                </div>
                <div className="rounded-2xl shadow-sm border border-blue-200 bg-blue-50 p-4">
                    <div className="text-xs text-blue-700 mb-1">Besteld (nog niet binnen)</div>
                    <div className="text-lg font-bold text-blue-800">{summary.pending_ordered_count} producten</div>
                    <div className="text-sm text-blue-700">{summary.pending_ordered_units} stuks</div>
                    <div className="text-sm text-blue-700 mt-1">Kosten: {euro(summary.pending_ordered_value)}</div>
                </div>
                <div className="rounded-2xl shadow-sm border border-red-200 bg-red-50 p-4">
                    <div className="text-xs text-red-700 mb-1">Totaal nog te betalen</div>
                    <div className="text-lg font-bold text-red-800">{summary.pending_total_count} producten</div>
                    <div className="text-sm text-red-700">{summary.pending_total_units} stuks</div>
                    <div className="text-sm text-red-700 mt-1">Kosten: {euro(summary.pending_total_value)}</div>
                </div>
            </div>

            <div className="mb-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setActiveTab('all')}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                            activeTab === 'all' ? 'bg-gray-900 text-white' : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                        Alles ({tabCounts.all})
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('nodig')}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                            activeTab === 'nodig' ? 'bg-rose-600 text-white' : 'border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
                        }`}
                    >
                        Nodig ({tabCounts.nodig})
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('binnen')}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                            activeTab === 'binnen' ? 'bg-emerald-600 text-white' : 'border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                    >
                        Binnen ({tabCounts.binnen})
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('besteld')}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                            activeTab === 'besteld' ? 'bg-blue-600 text-white' : 'border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100'
                        }`}
                    >
                        Besteld ({tabCounts.besteld})
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('geplaatst')}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                            activeTab === 'geplaatst' ? 'bg-violet-600 text-white' : 'border border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100'
                        }`}
                    >
                        Geplaatst ({tabCounts.geplaatst})
                    </button>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
                    <input
                        type="text"
                        value={searchFilter}
                        onChange={(e) => setSearchFilter(e.target.value)}
                        placeholder="Zoek op naam, categorie, status..."
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    />

                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    >
                        <option value="all">Alle categorieen</option>
                        {categoryFilterOptions
                            .filter((category) => category !== 'all')
                            .map((category) => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                    </select>

                    <select
                        value={supplierFilter}
                        onChange={(e) => setSupplierFilter(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    >
                        <option value="all">Alle winkels</option>
                        {supplierFilterOptions
                            .filter((supplier) => supplier !== 'all')
                            .map((supplier) => (
                                <option key={supplier} value={supplier}>
                                    {supplier}
                                </option>
                            ))}
                    </select>

                    <select
                        value={scooterFilter}
                        onChange={(e) => setScooterFilter(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    >
                        <option value="all">Alle koppelingen</option>
                        <option value="gekoppeld">Alleen gekoppeld</option>
                        <option value="los">Alleen los product</option>
                    </select>

                    <button
                        type="button"
                        onClick={() => setShowHidden((value) => !value)}
                        className={`w-full rounded-lg border px-3 py-2 text-sm font-semibold ${
                            showHidden
                                ? 'border-indigo-300 bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                        {showHidden ? 'Verborgen zichtbaar' : `Verborgen (${hiddenPartIds.length})`}
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="font-bold text-gray-900">Voorraadoverzicht onderdelen</h2>
                        <p className="text-xs text-gray-500">Geplaatste onderdelen staan op een aparte pagina.</p>
                    </div>
                    <div className="flex w-full flex-wrap items-center gap-2 md:w-auto md:justify-end">
                        <button
                            type="button"
                            onClick={() => setActiveTab('nodig')}
                            className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                                activeTab === 'nodig' ? 'bg-rose-600 text-white' : 'border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
                            }`}
                        >
                            Nodig ({tabCounts.nodig})
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('binnen')}
                            className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                                activeTab === 'binnen' ? 'bg-emerald-600 text-white' : 'border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            }`}
                        >
                            Voorraad ({tabCounts.binnen})
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('besteld')}
                            className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                                activeTab === 'besteld' ? 'bg-blue-600 text-white' : 'border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100'
                            }`}
                        >
                            Besteld ({tabCounts.besteld})
                        </button>
                        <Link
                            href="/admin/voorraad/geplaatst"
                            className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700 hover:bg-violet-100 whitespace-nowrap"
                        >
                            Geplaatst ({installed_count})
                        </Link>
                        <span className="text-xs text-gray-500">{filteredParts.length} van {parts.length} regels</span>
                    </div>
                </div>

                {filteredParts.length === 0 ? (
                    <p className="p-4 text-sm text-gray-400">Geen onderdelen gevonden met deze tab/filter combinatie.</p>
                ) : (
                    <>
                        <div className="md:hidden divide-y divide-gray-100">
                            {filteredParts.map((part) => (
                                <div key={part.id} className={`p-4 space-y-2 ${part.low_stock ? 'bg-amber-50/60' : ''}`}>
                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                                        <div className="min-w-0 font-medium text-gray-900 wrap-break-word">{part.name}</div>
                                        <div className="flex flex-wrap items-center gap-1.5 sm:justify-end">
                                            <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${statusBadgeClass[part.procurement_status]}`}>
                                                {statusLabel[part.procurement_status]}
                                            </span>
                                            {part.low_stock && (
                                                <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">
                                                    Lage voorraad
                                                </span>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => toggleHiddenPart(part.id)}
                                                className="text-[11px] px-2 py-0.5 rounded-full border border-gray-300 bg-white text-gray-600"
                                            >
                                                {hiddenPartIds.includes(part.id) ? 'Tonen' : 'Verberg'}
                                            </button>
                                            {can_manage_finance && (
                                                <button
                                                    type="button"
                                                    onClick={() => deletePart(part)}
                                                    className="text-[11px] px-2 py-0.5 rounded-full border border-rose-200 bg-rose-50 text-rose-700"
                                                >
                                                    Verwijder
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-500">Categorie: {part.category}</div>
                                    {part.part_brand && <div className="text-xs text-gray-500">Winkel: {part.part_brand}</div>}
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div className="rounded-lg bg-gray-50 px-3 py-2">
                                            <div className="text-xs text-gray-400">In voorraad</div>
                                            <div className={`font-semibold ${part.low_stock ? 'text-amber-700' : 'text-gray-800'}`}>{part.quantity}</div>
                                        </div>
                                        <div className="rounded-lg bg-gray-50 px-3 py-2">
                                            <div className="text-xs text-gray-400">Min</div>
                                            <div className="font-semibold text-gray-800">{part.minimum_stock}</div>
                                        </div>
                                        <div className="rounded-lg bg-gray-50 px-3 py-2">
                                            <div className="text-xs text-gray-400">Besteld</div>
                                            <div className="font-semibold text-blue-700">{part.procurement_status === 'besteld' ? part.requested_quantity : 0}</div>
                                        </div>
                                        <div className="rounded-lg bg-gray-50 px-3 py-2">
                                            <div className="text-xs text-gray-400">Prijs/stuk</div>
                                            <div className="font-semibold text-gray-800">{euro(part.unit_cost)}</div>
                                        </div>
                                        <div className="rounded-lg bg-gray-50 px-3 py-2">
                                            <div className="text-xs text-gray-400">Waarde</div>
                                            <div className="font-semibold text-gray-900">{euro(part.total_value)}</div>
                                        </div>
                                    </div>
                                    <div className="text-sm">
                                        {part.scooter_id ? (
                                            <Link
                                                href={`/admin/scooters/${part.scooter_id}/bewerken`}
                                                className="text-orange-600 hover:underline"
                                            >
                                                {part.scooter_name}
                                            </Link>
                                        ) : (
                                            <span className="text-gray-300">Geen scooter gekoppeld</span>
                                        )}
                                    </div>

                                    {can_manage_finance && editByPart[part.id] && (
                                        <details className="pt-1 rounded-xl border border-gray-200 bg-gray-50">
                                            <summary className="cursor-pointer list-none px-3 py-2 text-sm font-semibold text-gray-700">
                                                Bewerk onderdeel
                                            </summary>
                                            <div className="grid grid-cols-2 gap-2 border-t border-gray-200 px-3 py-3">
                                                <div className="col-span-2">
                                                    <label className="text-xs text-gray-500">Productnaam</label>
                                                    <input
                                                        type="text"
                                                        value={editByPart[part.id].name}
                                                        onChange={(e) => setPartField(part.id, 'name', e.target.value)}
                                                        className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs text-gray-500">Winkel</label>
                                                    <select
                                                        value={supplierOptions.includes(editByPart[part.id].part_brand) ? editByPart[part.id].part_brand : editByPart[part.id].part_brand ? '__custom__' : ''}
                                                        onChange={(e) => {
                                                            if (e.target.value === '__custom__') {
                                                                setPartField(part.id, 'part_brand', '');
                                                                return;
                                                            }

                                                            setPartField(part.id, 'part_brand', e.target.value);
                                                        }}
                                                        className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                                                    >
                                                        <option value="">— Kies winkel —</option>
                                                        {supplierOptions.map((supplier) => (
                                                            <option key={supplier} value={supplier}>{supplier}</option>
                                                        ))}
                                                        <option value="__custom__">Anders...</option>
                                                    </select>
                                                    {(supplierOptions.includes(editByPart[part.id].part_brand) ? editByPart[part.id].part_brand : editByPart[part.id].part_brand ? '__custom__' : '') === '__custom__' && (
                                                        <input
                                                            type="text"
                                                            value={editByPart[part.id].part_brand}
                                                            onChange={(e) => setPartField(part.id, 'part_brand', e.target.value)}
                                                            className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                                                            placeholder="Typ winkelnaam"
                                                        />
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="text-xs text-gray-500">Categorie</label>
                                                    <select
                                                        value={editByPart[part.id].category}
                                                        onChange={(e) => setPartField(part.id, 'category', e.target.value)}
                                                        className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                                                    >
                                                        {categoryOptions.map((category) => (
                                                            <option key={category} value={category}>
                                                                {category}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-xs text-gray-500">Prijs/stuk</label>
                                                    <input
                                                        type="text"
                                                        inputMode="decimal"
                                                        value={editByPart[part.id].cost}
                                                        onChange={(e) => setPartField(part.id, 'cost', e.target.value)}
                                                        className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                                                        placeholder="Bijv. 24,95"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs text-gray-500">Aantal</label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="1"
                                                        value={editByPart[part.id].quantity}
                                                        onChange={(e) => setPartField(part.id, 'quantity', e.target.value)}
                                                        className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs text-gray-500">Minimum</label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="1"
                                                        value={editByPart[part.id].minimum_stock}
                                                        onChange={(e) => setPartField(part.id, 'minimum_stock', e.target.value)}
                                                        className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                                                    />
                                                </div>
                                                <div className="col-span-2">
                                                    <label className="text-xs text-gray-500">Gekoppelde scooter (optioneel)</label>
                                                    <select
                                                        value={editByPart[part.id].scooter_id}
                                                        onChange={(e) => setPartField(part.id, 'scooter_id', e.target.value)}
                                                        className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                                                    >
                                                        <option value="">Geen koppeling (pure voorraad)</option>
                                                        {scooters.map((scooter) => (
                                                            <option key={scooter.id} value={scooter.id}>
                                                                {scooter.naam}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => updatePart(part.id, 'save')}
                                                    className="col-span-2 rounded-lg border border-gray-300 text-gray-700 px-3 py-2 text-sm font-semibold"
                                                >
                                                    Product bijwerken
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => updatePart(part.id, 'besteld')}
                                                    className="rounded-lg bg-blue-600 text-white px-3 py-2 text-sm font-bold"
                                                >
                                                    BESTELD
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => updatePart(part.id, 'binnen')}
                                                    className="rounded-lg bg-emerald-600 text-white px-3 py-2 text-sm font-bold"
                                                >
                                                    VOORRAAD
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => updatePart(part.id, 'geplaatst')}
                                                    className="col-span-2 rounded-lg bg-violet-600 text-white px-3 py-2 text-sm font-bold"
                                                >
                                                    GEPLAATST
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => deletePart(part.id, part.name)}
                                                    className="col-span-2 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 px-3 py-2 text-sm font-bold hover:bg-rose-100"
                                                >
                                                    Product verwijderen
                                                </button>
                                                <p className="col-span-2 text-[11px] text-gray-500">
                                                    Tip: prijs ondersteunt komma (bijv. 24,95) en wordt onthouden voor volgende bestellingen.
                                                </p>
                                            </div>
                                        </details>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="hidden md:grid grid-cols-12 gap-6 p-4">
                            <div className="col-span-7 xl:col-span-8">
                                <div className="overflow-hidden rounded-xl border border-gray-100">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="text-xs text-gray-500 bg-gray-50">
                                                <th className="text-left px-4 py-3">Onderdeel</th>
                                                <th className="text-left px-4 py-3">Status</th>
                                                <th className="text-right px-4 py-3">Voorraad</th>
                                                <th className="text-right px-4 py-3">Besteld</th>
                                                <th className="text-right px-4 py-3">Prijs</th>
                                                <th className="text-right px-4 py-3">Waarde</th>
                                                <th className="text-right px-4 py-3">Actie</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {filteredParts.map((part) => {
                                                const isSelected = part.id === selectedPartId;
                                                return (
                                                    <tr
                                                        key={part.id}
                                                        onClick={() => setSelectedPartId(part.id)}
                                                        className={`cursor-pointer transition-colors ${
                                                            isSelected ? 'bg-orange-50' : part.low_stock ? 'bg-amber-50/50 hover:bg-amber-50' : 'hover:bg-gray-50'
                                                        }`}
                                                    >
                                                        <td className="px-4 py-3">
                                                            <div className="font-semibold text-gray-900">{part.name}</div>
                                                            <div className="text-xs text-gray-500 mt-0.5">
                                                                {part.category}
                                                                {part.part_brand ? ` • ${part.part_brand}` : ''}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusBadgeClass[part.procurement_status]}`}>
                                                                {statusLabel[part.procurement_status]}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-right font-medium text-gray-800">
                                                            {part.quantity}
                                                            <div className="text-[11px] text-gray-500">min {part.minimum_stock}</div>
                                                        </td>
                                                        <td className="px-4 py-3 text-right font-semibold text-blue-700">
                                                            {part.procurement_status === 'besteld' ? part.requested_quantity : 0}
                                                        </td>
                                                        <td className="px-4 py-3 text-right text-gray-600">{euro(part.unit_cost)}</td>
                                                        <td className="px-4 py-3 text-right font-semibold text-gray-900">{euro(part.total_value)}</td>
                                                        <td className="px-4 py-3 text-right">
                                                            <div className="flex justify-end gap-1">
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        toggleHiddenPart(part.id);
                                                                    }}
                                                                    className="rounded-md border border-gray-300 bg-white px-2 py-1 text-[11px] font-semibold text-gray-700 hover:bg-gray-50"
                                                                >
                                                                    {hiddenPartIds.includes(part.id) ? 'Tonen' : 'Verberg'}
                                                                </button>
                                                                {can_manage_finance && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            deletePart(part);
                                                                        }}
                                                                        className="rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] font-semibold text-rose-700 hover:bg-rose-100"
                                                                    >
                                                                        Verwijder
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="col-span-5 xl:col-span-4">
                                <div className="sticky top-4 rounded-2xl border border-gray-200 bg-gray-50 p-4">
                                    {!selectedPart || !selectedDraft ? (
                                        <p className="text-sm text-gray-500">Selecteer een onderdeel om te bewerken.</p>
                                    ) : (
                                        <div className="space-y-3">
                                            <div className="pb-1 border-b border-gray-200">
                                                <h3 className="text-sm font-bold text-gray-900">Onderdeel bewerken</h3>
                                                <p className="text-xs text-gray-500">{selectedPart.name}</p>
                                            </div>

                                            {can_manage_finance && (
                                                <>
                                                    <div>
                                                        <label className="text-xs text-gray-500">Productnaam</label>
                                                        <input
                                                            type="text"
                                                            value={selectedDraft.name}
                                                            onChange={(e) => setPartField(selectedPart.id, 'name', e.target.value)}
                                                            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs text-gray-500">Winkel</label>
                                                        <select
                                                            value={supplierOptions.includes(selectedDraft.part_brand) ? selectedDraft.part_brand : selectedDraft.part_brand ? '__custom__' : ''}
                                                            onChange={(e) => {
                                                                if (e.target.value === '__custom__') {
                                                                    setPartField(selectedPart.id, 'part_brand', '');
                                                                    return;
                                                                }
                                                                setPartField(selectedPart.id, 'part_brand', e.target.value);
                                                            }}
                                                            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                                                        >
                                                            <option value="">— Kies winkel —</option>
                                                            {supplierOptions.map((supplier) => (
                                                                <option key={supplier} value={supplier}>{supplier}</option>
                                                            ))}
                                                            <option value="__custom__">Anders...</option>
                                                        </select>
                                                        {(supplierOptions.includes(selectedDraft.part_brand) ? selectedDraft.part_brand : selectedDraft.part_brand ? '__custom__' : '') === '__custom__' && (
                                                            <input
                                                                type="text"
                                                                value={selectedDraft.part_brand}
                                                                onChange={(e) => setPartField(selectedPart.id, 'part_brand', e.target.value)}
                                                                className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                                                                placeholder="Typ winkelnaam"
                                                            />
                                                        )}
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div>
                                                            <label className="text-xs text-gray-500">Prijs/stuk</label>
                                                            <input
                                                                type="text"
                                                                inputMode="decimal"
                                                                value={selectedDraft.cost}
                                                                onChange={(e) => setPartField(selectedPart.id, 'cost', e.target.value)}
                                                                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-xs text-gray-500">Categorie</label>
                                                            <select
                                                                value={selectedDraft.category}
                                                                onChange={(e) => setPartField(selectedPart.id, 'category', e.target.value)}
                                                                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                                                            >
                                                                {categoryOptions.map((category) => (
                                                                    <option key={category} value={category}>{category}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div>
                                                            <label className="text-xs text-gray-500">Aantal</label>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                step="1"
                                                                value={selectedDraft.quantity}
                                                                onChange={(e) => setPartField(selectedPart.id, 'quantity', e.target.value)}
                                                                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-xs text-gray-500">Minimum</label>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                step="1"
                                                                value={selectedDraft.minimum_stock}
                                                                onChange={(e) => setPartField(selectedPart.id, 'minimum_stock', e.target.value)}
                                                                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="text-xs text-gray-500">Scooter koppeling (optioneel)</label>
                                                        <select
                                                            value={selectedDraft.scooter_id}
                                                            onChange={(e) => setPartField(selectedPart.id, 'scooter_id', e.target.value)}
                                                            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                                                        >
                                                            <option value="">Geen koppeling (pure voorraad)</option>
                                                            {scooters.map((scooter) => (
                                                                <option key={scooter.id} value={scooter.id}>{scooter.naam}</option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() => updatePart(selectedPart.id, 'save')}
                                                        className="w-full rounded-lg border border-gray-300 bg-white text-gray-700 px-3 py-2 text-sm font-semibold"
                                                    >
                                                        Product bijwerken
                                                    </button>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => updatePart(selectedPart.id, 'besteld')}
                                                            className="rounded-lg bg-blue-600 text-white px-3 py-2 text-sm font-bold"
                                                        >
                                                            BESTELD
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => updatePart(selectedPart.id, 'binnen')}
                                                            className="rounded-lg bg-emerald-600 text-white px-3 py-2 text-sm font-bold"
                                                        >
                                                            VOORRAAD
                                                        </button>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => updatePart(selectedPart.id, 'geplaatst')}
                                                        className="w-full rounded-lg bg-violet-600 text-white px-3 py-2 text-sm font-bold"
                                                    >
                                                        GEPLAATST
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => deletePart(selectedPart)}
                                                        className="w-full rounded-lg border border-rose-200 bg-rose-50 text-rose-700 px-3 py-2 text-sm font-bold hover:bg-rose-100"
                                                    >
                                                        Product verwijderen
                                                    </button>
                                                    <p className="text-[11px] text-gray-500">
                                                        Tip: klik links een ander onderdeel om snel te wisselen.
                                                    </p>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteTarget(null)} />
                    <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-black/5">
                        <div className="mb-4 flex items-start gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-2xl">
                                🗑️
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Onderdeel verwijderen?</h3>
                                <p className="mt-1 text-sm text-gray-600">
                                    Je staat op het punt <span className="font-semibold text-gray-900">{deleteTarget.name}</span> te verwijderen uit de voorraad.
                                    Deze actie kan niet ongedaan worden gemaakt.
                                </p>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                            Na verwijderen verschijnt het product niet meer in deze voorraadlijst.
                        </div>

                        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={() => setDeleteTarget(null)}
                                className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                            >
                                Annuleren
                            </button>
                            <button
                                type="button"
                                onClick={confirmDelete}
                                className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-700"
                            >
                                Ja, verwijderen
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
