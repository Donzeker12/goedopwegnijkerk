import { Head, Link, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import AdminLayout from '../../../layouts/AdminLayout';

type InventoryTab = 'all' | 'nodig' | 'besteld' | 'binnen' | 'geplaatst';

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

const euro = (amount: number) => `EUR ${amount.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}`;

const statusLabel: Record<PartRow['procurement_status'], string> = {
    nodig: 'Nodig / Inkopen',
    besteld: 'Besteld',
    binnen: 'In voorraad',
    geplaatst: 'Gebruikt',
};

const statusButtonClass: Record<PartRow['procurement_status'], string> = {
    nodig: 'border-rose-300 text-rose-700 hover:bg-rose-50',
    besteld: 'border-blue-300 text-blue-700 hover:bg-blue-50',
    binnen: 'border-emerald-300 text-emerald-700 hover:bg-emerald-50',
    geplaatst: 'border-violet-300 text-violet-700 hover:bg-violet-50',
};

const statusActiveClass: Record<PartRow['procurement_status'], string> = {
    nodig: 'bg-rose-600 border-rose-600 text-white',
    besteld: 'bg-blue-600 border-blue-600 text-white',
    binnen: 'bg-emerald-600 border-emerald-600 text-white',
    geplaatst: 'bg-violet-600 border-violet-600 text-white',
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

function parseDutchCurrency(value: string): number | null {
    const trimmed = value.trim();
    if (!trimmed) {
        return null;
    }

    const normalized = trimmed.replace(',', '.').replace(/[^0-9.]/g, '');
    if (!normalized) {
        return null;
    }

    const parsed = Number.parseFloat(normalized);
    return Number.isFinite(parsed) ? parsed : null;
}

function draftFromPart(part: PartRow): EditablePart {
    return {
        name: part.name,
        part_brand: part.part_brand ?? '',
        category: part.category || 'Overig',
        quantity: String(part.requested_quantity ?? 0),
        minimum_stock: String(part.minimum_stock ?? 0),
        cost: String(part.unit_cost ?? 0),
        procurement_status: part.procurement_status,
        scooter_id: part.scooter_id ? String(part.scooter_id) : '',
    };
}

export default function InventoryIndex({ parts, summary, scooters, installed_count, can_manage_finance }: Props) {
    const { props } = usePage<{ flash?: { success?: string } }>();

    const [partRows, setPartRows] = useState<PartRow[]>(parts);
    const [activeTab, setActiveTab] = useState<InventoryTab>('all');
    const [searchFilter, setSearchFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [supplierFilter, setSupplierFilter] = useState('all');
    const [scooterFilter, setScooterFilter] = useState('all');
    const [showArchived, setShowArchived] = useState(false);
    const [actionMenuPartId, setActionMenuPartId] = useState<number | null>(null);
    const [editorPartId, setEditorPartId] = useState<number | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<PartRow | null>(null);

    const [editByPart, setEditByPart] = useState<Record<number, EditablePart>>(() =>
        parts.reduce((acc, part) => {
            acc[part.id] = draftFromPart(part);
            return acc;
        }, {} as Record<number, EditablePart>)
    );

    function ensureDraft(partId: number) {
        if (editByPart[partId]) {
            return;
        }

        const row = partRows.find((part) => part.id === partId);
        if (!row) {
            return;
        }

        setEditByPart((prev) => ({
            ...prev,
            [partId]: draftFromPart(row),
        }));
    }

    function setPartField(partId: number, field: keyof EditablePart, value: string) {
        setEditByPart((prev) => ({
            ...prev,
            [partId]: {
                ...prev[partId],
                [field]: value,
            },
        }));
    }

    function openEditor(partId: number) {
        ensureDraft(partId);
        setEditorPartId(partId);
        setActionMenuPartId(null);
    }

    function closeEditor() {
        setEditorPartId(null);
    }

    function updatePart(partId: number) {
        const current = editByPart[partId];
        if (!current) {
            return;
        }

        const normalizedStatus = !current.cost.trim() && current.procurement_status !== 'nodig'
            ? 'nodig'
            : current.procurement_status;

        const nextQuantity = Number.parseInt(current.quantity || '0', 10) || 0;
        const nextMinimumStock = Number.parseInt(current.minimum_stock || '0', 10) || 0;
        const nextCost = parseDutchCurrency(current.cost || '');

        router.patch(
            `/admin/voorraad/onderdelen/${partId}`,
            {
                name: current.name,
                part_brand: current.part_brand || null,
                category: current.category === 'Overig' ? null : current.category || null,
                quantity: nextQuantity,
                minimum_stock: nextMinimumStock,
                cost: nextCost,
                procurement_status: normalizedStatus,
                scooter_id: current.scooter_id ? Number.parseInt(current.scooter_id, 10) : null,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    const resolvedCost = nextCost ?? 0;
                    setPartRows((prev) =>
                        prev.map((row) => {
                            if (row.id !== partId) {
                                return row;
                            }

                            const nextTotalValue = normalizedStatus === 'binnen' ? resolvedCost * nextQuantity : 0;

                            return {
                                ...row,
                                name: current.name || row.name,
                                part_brand: current.part_brand || null,
                                category: current.category || 'Overig',
                                quantity: normalizedStatus === 'binnen' ? nextQuantity : 0,
                                requested_quantity: nextQuantity,
                                minimum_stock: nextMinimumStock,
                                unit_cost: resolvedCost,
                                total_value: nextTotalValue,
                                procurement_status: normalizedStatus,
                                scooter_id: current.scooter_id ? Number.parseInt(current.scooter_id, 10) : null,
                                scooter_name: current.scooter_id
                                    ? scooters.find((scooter) => scooter.id === Number.parseInt(current.scooter_id, 10))?.naam ?? row.scooter_name
                                    : null,
                                low_stock: normalizedStatus === 'binnen' && nextMinimumStock > 0 && nextQuantity <= nextMinimumStock,
                            };
                        })
                    );

                    setEditByPart((prev) => ({
                        ...prev,
                        [partId]: {
                            ...prev[partId],
                            procurement_status: normalizedStatus,
                        },
                    }));

                    setActionMenuPartId(null);
                },
            }
        );
    }

    function deletePart(part: PartRow) {
        setDeleteTarget(part);
        setActionMenuPartId(null);
    }

    function confirmDelete() {
        if (!deleteTarget) {
            return;
        }

        const targetId = deleteTarget.id;

        router.delete(`/admin/voorraad/onderdelen/${targetId}`, {
            preserveScroll: true,
            onSuccess: () => {
                setPartRows((prev) => prev.filter((part) => part.id !== targetId));
                setEditByPart((prev) => {
                    const next = { ...prev };
                    delete next[targetId];
                    return next;
                });

                if (editorPartId === targetId) {
                    setEditorPartId(null);
                }

                setDeleteTarget(null);
            },
        });
    }

    const tabCounts = useMemo(
        () => ({
            all: partRows.length,
            nodig: partRows.filter((part) => part.procurement_status === 'nodig').length,
            besteld: partRows.filter((part) => part.procurement_status === 'besteld').length,
            binnen: partRows.filter((part) => part.procurement_status === 'binnen').length,
            geplaatst: partRows.filter((part) => part.procurement_status === 'geplaatst').length,
        }),
        [partRows]
    );

    const archivedCount = useMemo(
        () => partRows.filter((part) => part.procurement_status === 'geplaatst' && part.quantity === 0).length,
        [partRows]
    );

    const categoryFilterOptions = useMemo(
        () => ['all', ...Array.from(new Set(partRows.map((part) => part.category || 'Overig'))).sort((a, b) => a.localeCompare(b))],
        [partRows]
    );

    const supplierFilterOptions = useMemo(
        () => [
            'all',
            ...Array.from(new Set(partRows.map((part) => part.part_brand).filter((brand): brand is string => Boolean(brand)))).sort((a, b) =>
                a.localeCompare(b)
            ),
        ],
        [partRows]
    );

    const filteredParts = useMemo(() => {
        const needle = searchFilter.trim().toLowerCase();

        return partRows.filter((part) => {
            const isArchived = part.procurement_status === 'geplaatst' && part.quantity === 0;

            if (!showArchived && isArchived) {
                return false;
            }

            if (activeTab !== 'all' && part.procurement_status !== activeTab) {
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
    }, [partRows, activeTab, showArchived, searchFilter, categoryFilter, supplierFilter, scooterFilter]);

    const editorPart = editorPartId ? partRows.find((part) => part.id === editorPartId) ?? null : null;
    const editorDraft = editorPart ? editByPart[editorPart.id] : null;

    return (
        <AdminLayout title="Voorraad">
            <Head title="Voorraad" />

            {props.flash?.success && (
                <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 shadow-sm">
                    {props.flash.success}
                </div>
            )}

            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                    <div className="text-xs text-gray-500">Unieke onderdelen</div>
                    <div className="text-2xl font-bold text-gray-900">{summary.distinct_parts}</div>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                    <div className="text-xs text-gray-500">Totale stuks voorraad</div>
                    <div className="text-2xl font-bold text-gray-900">{summary.total_units}</div>
                </div>
                <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 shadow-sm">
                    <div className="text-xs text-amber-700">Onder minimumvoorraad</div>
                    <div className="text-2xl font-bold text-amber-800">{summary.low_stock_count}</div>
                </div>
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 shadow-sm">
                    <div className="text-xs text-emerald-700">Totale voorraadwaarde</div>
                    <div className="text-2xl font-bold text-emerald-800">{euro(summary.total_value)}</div>
                </div>
            </div>

            <div className="mb-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setActiveTab('all')}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                            activeTab === 'all'
                                ? 'border-gray-900 bg-gray-900 text-white'
                                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                        Alles ({tabCounts.all})
                    </button>
                    {(['nodig', 'besteld', 'binnen', 'geplaatst'] as const).map((status) => (
                        <button
                            key={status}
                            type="button"
                            onClick={() => setActiveTab(status)}
                            className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                                activeTab === status ? statusActiveClass[status] : statusButtonClass[status]
                            }`}
                        >
                            {statusLabel[status]} ({tabCounts[status]})
                        </button>
                    ))}
                    <Link
                        href="/admin/voorraad/geplaatst"
                        className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700 hover:bg-violet-100"
                    >
                        Archief gebruikt ({installed_count})
                    </Link>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
                    <input
                        type="text"
                        value={searchFilter}
                        onChange={(e) => setSearchFilter(e.target.value)}
                        placeholder="Zoek op onderdeel, categorie, scooter..."
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
                        <option value="all">Alle leveranciers</option>
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
                        onClick={() => setShowArchived((prev) => !prev)}
                        className={`w-full rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                            showArchived
                                ? 'border-violet-300 bg-violet-50 text-violet-700'
                                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                        {showArchived ? 'Archief zichtbaar' : `Archief verborgen (${archivedCount})`}
                    </button>
                </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
                <div className="border-b border-gray-100 px-4 py-3">
                    <h2 className="font-bold text-gray-900">Voorraadoverzicht onderdelen</h2>
                    <p className="text-xs text-gray-500">Klik op een regel om te bewerken. Acties staan achter het menu met drie puntjes.</p>
                </div>

                {filteredParts.length === 0 ? (
                    <p className="p-4 text-sm text-gray-400">Geen onderdelen gevonden met deze filters.</p>
                ) : (
                    <>
                        <div className="divide-y divide-gray-100 md:hidden">
                            {filteredParts.map((part) => (
                                <div
                                    key={part.id}
                                    className={`p-4 ${part.low_stock ? 'bg-amber-50/60' : ''}`}
                                    onClick={() => can_manage_finance && openEditor(part.id)}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <div className="font-medium text-gray-900">{part.name}</div>
                                            <div className="text-xs text-gray-500">{part.category}{part.part_brand ? ` • ${part.part_brand}` : ''}</div>
                                        </div>
                                        <div className="relative">
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setActionMenuPartId((prev) => (prev === part.id ? null : part.id));
                                                }}
                                                className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm font-bold text-gray-700"
                                            >
                                                ...
                                            </button>
                                            {actionMenuPartId === part.id && (
                                                <div className="absolute right-0 z-10 mt-1 w-40 rounded-lg border border-gray-200 bg-white p-1 shadow-lg">
                                                    {can_manage_finance && (
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                openEditor(part.id);
                                                            }}
                                                            className="block w-full rounded-md px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                                                        >
                                                            Bewerken
                                                        </button>
                                                    )}
                                                    {can_manage_finance && (
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                deletePart(part);
                                                            }}
                                                            className="block w-full rounded-md px-3 py-2 text-left text-sm text-rose-700 hover:bg-rose-50"
                                                        >
                                                            Verwijderen
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-2 flex flex-wrap items-center gap-2">
                                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${statusBadgeClass[part.procurement_status]}`}>
                                            {statusLabel[part.procurement_status]}
                                        </span>
                                        {part.low_stock && (
                                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                                                Lage voorraad
                                            </span>
                                        )}
                                    </div>

                                    <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                                        <div className="rounded-lg bg-gray-50 px-3 py-2">
                                            <div className="text-xs text-gray-400">In voorraad</div>
                                            <div className="font-semibold text-gray-800">{part.quantity}</div>
                                        </div>
                                        <div className="rounded-lg bg-gray-50 px-3 py-2">
                                            <div className="text-xs text-gray-400">Prijs/stuk</div>
                                            <div className="font-semibold text-gray-800">{euro(part.unit_cost)}</div>
                                        </div>
                                        <div className="rounded-lg bg-gray-50 px-3 py-2">
                                            <div className="text-xs text-gray-400">Waarde</div>
                                            <div className="font-semibold text-gray-900">{euro(part.total_value)}</div>
                                        </div>
                                        <div className="rounded-lg bg-gray-50 px-3 py-2">
                                            <div className="text-xs text-gray-400">Besteld</div>
                                            <div className="font-semibold text-blue-700">{part.procurement_status === 'besteld' ? part.requested_quantity : 0}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="hidden overflow-x-auto md:block">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50 text-xs text-gray-500">
                                        <th className="px-4 py-3 text-left">Onderdeel</th>
                                        <th className="px-4 py-3 text-left">Status</th>
                                        <th className="px-4 py-3 text-right">In voorraad</th>
                                        <th className="px-4 py-3 text-right">Besteld</th>
                                        <th className="px-4 py-3 text-right">Prijs</th>
                                        <th className="px-4 py-3 text-right">Waarde</th>
                                        <th className="px-4 py-3 text-left">Scooter</th>
                                        <th className="px-4 py-3 text-right">Acties</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredParts.map((part) => (
                                        <tr
                                            key={part.id}
                                            className={`cursor-pointer transition-colors hover:bg-gray-50 ${part.low_stock ? 'bg-amber-50/40' : ''}`}
                                            onClick={() => can_manage_finance && openEditor(part.id)}
                                        >
                                            <td className="px-4 py-3">
                                                <div className="font-semibold text-gray-900">{part.name}</div>
                                                <div className="text-xs text-gray-500">{part.category}{part.part_brand ? ` • ${part.part_brand}` : ''}</div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusBadgeClass[part.procurement_status]}`}>
                                                    {statusLabel[part.procurement_status]}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right font-medium text-gray-800">{part.quantity}</td>
                                            <td className="px-4 py-3 text-right font-semibold text-blue-700">{part.procurement_status === 'besteld' ? part.requested_quantity : 0}</td>
                                            <td className="px-4 py-3 text-right text-gray-700">{euro(part.unit_cost)}</td>
                                            <td className="px-4 py-3 text-right font-semibold text-gray-900">{euro(part.total_value)}</td>
                                            <td className="px-4 py-3 text-gray-700">
                                                {part.scooter_id ? (
                                                    <Link href={`/admin/scooters/${part.scooter_id}/bewerken`} className="text-orange-600 hover:underline" onClick={(e) => e.stopPropagation()}>
                                                        {part.scooter_name}
                                                    </Link>
                                                ) : (
                                                    <span className="text-gray-400">Geen koppeling</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="relative inline-block text-left" onClick={(e) => e.stopPropagation()}>
                                                    <button
                                                        type="button"
                                                        onClick={() => setActionMenuPartId((prev) => (prev === part.id ? null : part.id))}
                                                        className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm font-bold text-gray-700 hover:bg-gray-50"
                                                    >
                                                        ...
                                                    </button>
                                                    {actionMenuPartId === part.id && (
                                                        <div className="absolute right-0 z-10 mt-1 w-40 rounded-lg border border-gray-200 bg-white p-1 shadow-lg">
                                                            {can_manage_finance && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => openEditor(part.id)}
                                                                    className="block w-full rounded-md px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                                                                >
                                                                    Bewerken
                                                                </button>
                                                            )}
                                                            {can_manage_finance && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => deletePart(part)}
                                                                    className="block w-full rounded-md px-3 py-2 text-left text-sm text-rose-700 hover:bg-rose-50"
                                                                >
                                                                    Verwijderen
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>

            {can_manage_finance && editorPart && editorDraft && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <button type="button" className="absolute inset-0 bg-black/40" onClick={closeEditor} aria-label="Sluiten" />
                    <div className="relative h-full w-full max-w-xl overflow-y-auto bg-white p-6 shadow-2xl">
                        <div className="mb-5 flex items-center justify-between border-b border-gray-100 pb-3">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Onderdeel bewerken</h3>
                                <p className="text-xs text-gray-500">{editorPart.name}</p>
                            </div>
                            <button
                                type="button"
                                onClick={closeEditor}
                                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                            >
                                Sluiten
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-gray-500">Productnaam</label>
                                <input
                                    type="text"
                                    value={editorDraft.name}
                                    onChange={(e) => setPartField(editorPart.id, 'name', e.target.value)}
                                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                                />
                            </div>

                            <div>
                                <label className="text-xs text-gray-500">Winkel</label>
                                <select
                                    value={supplierOptions.includes(editorDraft.part_brand) ? editorDraft.part_brand : editorDraft.part_brand ? '__custom__' : ''}
                                    onChange={(e) => {
                                        if (e.target.value === '__custom__') {
                                            setPartField(editorPart.id, 'part_brand', '');
                                            return;
                                        }

                                        setPartField(editorPart.id, 'part_brand', e.target.value);
                                    }}
                                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                                >
                                    <option value="">- Kies winkel -</option>
                                    {supplierOptions.map((supplier) => (
                                        <option key={supplier} value={supplier}>{supplier}</option>
                                    ))}
                                    <option value="__custom__">Anders...</option>
                                </select>
                                {(supplierOptions.includes(editorDraft.part_brand) ? editorDraft.part_brand : editorDraft.part_brand ? '__custom__' : '') === '__custom__' && (
                                    <input
                                        type="text"
                                        value={editorDraft.part_brand}
                                        onChange={(e) => setPartField(editorPart.id, 'part_brand', e.target.value)}
                                        className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                                        placeholder="Typ winkelnaam"
                                    />
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-gray-500">Prijs per stuk</label>
                                    <input
                                        type="text"
                                        inputMode="decimal"
                                        value={editorDraft.cost}
                                        onChange={(e) => {
                                            const nextCost = e.target.value;
                                            setPartField(editorPart.id, 'cost', nextCost);
                                            if (!nextCost.trim() && editorDraft.procurement_status !== 'nodig') {
                                                setPartField(editorPart.id, 'procurement_status', 'nodig');
                                            }
                                        }}
                                        className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                                        placeholder="Bijv. 24,95"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500">Status</label>
                                    <select
                                        value={editorDraft.procurement_status}
                                        onChange={(e) => {
                                            const nextStatus = e.target.value as EditablePart['procurement_status'];
                                            if (!editorDraft.cost.trim() && nextStatus !== 'nodig') {
                                                setPartField(editorPart.id, 'procurement_status', 'nodig');
                                                return;
                                            }
                                            setPartField(editorPart.id, 'procurement_status', nextStatus);
                                        }}
                                        className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                                    >
                                        <option value="nodig">Nodig / Inkopen</option>
                                        <option value="besteld">Besteld</option>
                                        <option value="binnen">In voorraad</option>
                                        <option value="geplaatst">Gebruikt</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-gray-500">Aantal</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="1"
                                        value={editorDraft.quantity}
                                        onChange={(e) => setPartField(editorPart.id, 'quantity', e.target.value)}
                                        className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500">Minimumvoorraad</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="1"
                                        value={editorDraft.minimum_stock}
                                        onChange={(e) => setPartField(editorPart.id, 'minimum_stock', e.target.value)}
                                        className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs text-gray-500">Categorie</label>
                                <select
                                    value={editorDraft.category}
                                    onChange={(e) => setPartField(editorPart.id, 'category', e.target.value)}
                                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                                >
                                    {categoryOptions.map((category) => (
                                        <option key={category} value={category}>{category}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-xs text-gray-500">Scooter koppeling (optioneel)</label>
                                <select
                                    value={editorDraft.scooter_id}
                                    onChange={(e) => setPartField(editorPart.id, 'scooter_id', e.target.value)}
                                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                                >
                                    <option value="">Geen koppeling (pure voorraad)</option>
                                    {scooters.map((scooter) => (
                                        <option key={scooter.id} value={scooter.id}>{scooter.naam}</option>
                                    ))}
                                </select>
                            </div>

                            {!editorDraft.cost.trim() && (
                                <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                                    Zonder prijs blijft status automatisch op Nodig / Inkopen.
                                </p>
                            )}
                        </div>

                        <div className="mt-6 space-y-2">
                            <button
                                type="button"
                                onClick={() => updatePart(editorPart.id)}
                                className="w-full rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600"
                            >
                                Wijzigingen opslaan
                            </button>
                            <button
                                type="button"
                                onClick={() => deletePart(editorPart)}
                                className="w-full rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 hover:bg-rose-100"
                            >
                                Product verwijderen
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    <button type="button" className="absolute inset-0 bg-black/50" onClick={() => setDeleteTarget(null)} aria-label="Sluiten" />
                    <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-black/5">
                        <h3 className="text-lg font-bold text-gray-900">Onderdeel verwijderen?</h3>
                        <p className="mt-2 text-sm text-gray-600">
                            Je staat op het punt <span className="font-semibold text-gray-900">{deleteTarget.name}</span> te verwijderen uit de voorraad.
                        </p>
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
