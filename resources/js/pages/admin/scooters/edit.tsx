import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { type FormEvent, useRef, useState } from 'react';
import AdminLayout from '../../../layouts/AdminLayout';

interface GoogleImage {
    title: string;
    url: string;
    thumbnail: string;
    width: number | null;
    height: number | null;
    source: string;
}

interface Part {
    id: number;
    name: string;
    part_brand: string | null;
    specification: string | null;
    quantity: number;
    category: string | null;
    cost: number;
    total_cost: number;
    purchased_at: string | null;
    notes: string | null;
}

interface Photo {
    id: number;
    url: string;
    is_primary: boolean;
    sort_order: number;
}

interface ScooterModelItem {
    id: number;
    name: string;
}

interface BrandItem {
    id: number;
    name: string;
    scooter_models: ScooterModelItem[];
}

interface ScooterData {
    id: number;
    brand_id: number;
    scooter_model_id: number;
    purchase_price: number;
    expected_sale_price: number | null;
    description: string | null;
    year: number | null;
    mileage: number | null;
    color: string | null;
    kenteken: string | null;
    status: string;
    ready_for_sale: boolean;
    naam: string;
    onderdelen_kosten: number;
    totale_investering: number;
    netto_winst: number | null;
    parts: Part[];
    photos: Photo[];
}

interface Props {
    scooter: ScooterData;
    brands: BrandItem[];
}

export default function ScooterEdit({ scooter, brands: initialBrands }: Props) {
    const { props } = usePage<{ flash?: { success?: string } }>();
    const flash = props.flash;

    const { data, setData, put, processing, errors } = useForm({
        brand_id: String(scooter.brand_id),
        scooter_model_id: String(scooter.scooter_model_id),
        purchase_price: String(scooter.purchase_price),
        expected_sale_price: scooter.expected_sale_price ? String(scooter.expected_sale_price) : '',
        description: scooter.description ?? '',
        year: scooter.year ? String(scooter.year) : '',
        mileage: scooter.mileage ? String(scooter.mileage) : '',
        color: scooter.color ?? '',
        kenteken: scooter.kenteken ?? '',
        status: scooter.status,
        ready_for_sale: scooter.ready_for_sale,
    });

    const [localBrands, setLocalBrands] = useState<BrandItem[]>(initialBrands);
    const [newBrand, setNewBrand] = useState('');
    const [newModel, setNewModel] = useState('');
    const [addingBrand, setAddingBrand] = useState(false);
    const [addingModel, setAddingModel] = useState(false);
    const [showBrandExtra, setShowBrandExtra] = useState(false);

    const partForm = useForm({
        name: '',
        part_brand: '',
        specification: '',
        quantity: '1',
        category: '',
        cost: '',
        purchased_at: '',
        notes: '',
    });

    const [photoFiles, setPhotoFiles] = useState<FileList | null>(null);
    const [photoUploading, setPhotoUploading] = useState(false);
    const photoInputRef = useRef<HTMLInputElement>(null);

    // Google image search state
    const [googleImages, setGoogleImages] = useState<GoogleImage[]>([]);
    const [googleSearching, setGoogleSearching] = useState(false);
    const [googleImporting, setGoogleImporting] = useState<string | null>(null);
    const [googleError, setGoogleError] = useState<string | null>(null);
    const [googleQuery, setGoogleQuery] = useState<string | null>(null);
    const [showGoogleSearch, setShowGoogleSearch] = useState(false);

    const selectedBrand = localBrands.find((b) => String(b.id) === data.brand_id);
    const availableModels = selectedBrand?.scooter_models ?? [];

    function getCsrf(): string {
        return (document.querySelector('meta[name=csrf-token]') as HTMLMetaElement)?.content ?? '';
    }

    async function addBrand() {
        if (!newBrand.trim()) return;
        setAddingBrand(true);
        try {
            const res = await fetch('/admin/merken', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': getCsrf(), 'Accept': 'application/json' },
                body: JSON.stringify({ name: newBrand.trim() }),
            });
            const json = await res.json();
            if (json.id) {
                setLocalBrands((prev) => [...prev, { id: json.id, name: json.name, scooter_models: [] }]);
                setData('brand_id', String(json.id));
                setData('scooter_model_id', '');
                setNewBrand('');
            }
        } finally {
            setAddingBrand(false);
        }
    }

    async function addModel() {
        if (!newModel.trim() || !data.brand_id) return;
        setAddingModel(true);
        try {
            const res = await fetch(`/admin/merken/${data.brand_id}/modellen`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': getCsrf(), 'Accept': 'application/json' },
                body: JSON.stringify({ name: newModel.trim() }),
            });
            const json = await res.json();
            if (json.id) {
                setLocalBrands((prev) =>
                    prev.map((b) =>
                        String(b.id) === data.brand_id
                            ? { ...b, scooter_models: [...b.scooter_models, { id: json.id, name: json.name }] }
                            : b
                    )
                );
                setData('scooter_model_id', String(json.id));
                setNewModel('');
            }
        } finally {
            setAddingModel(false);
        }
    }

    async function searchGoogleImages() {
        setGoogleSearching(true);
        setGoogleError(null);
        setGoogleImages([]);
        try {
            const res = await fetch(`/admin/scooters/${scooter.id}/google-fotos`, {
                credentials: 'include',
                headers: { 'Accept': 'application/json' },
            });
            const json = await res.json();
            if (!res.ok || json.error) {
                setGoogleError(json.error ?? 'Zoeken mislukt.');
            } else {
                setGoogleImages(json.images ?? []);
                setGoogleQuery(json.query ?? null);
            }
        } catch {
            setGoogleError('Verbinding mislukt.');
        } finally {
            setGoogleSearching(false);
        }
    }

    async function importGoogleImage(url: string) {
        setGoogleImporting(url);
        try {
            const res = await fetch(`/admin/scooters/${scooter.id}/google-fotos/importeer`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrf(),
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ url }),
            });
            const json = await res.json();
            if (!res.ok || json.error) {
                alert(json.error ?? 'Importeren mislukt.');
            } else {
                // Trigger Inertia reload to refresh photo list
                router.reload({ only: ['scooter'] });
                setGoogleImages([]);
                setShowGoogleSearch(false);
            }
        } finally {
            setGoogleImporting(null);
        }
    }

    function handleSave(e: FormEvent) {
        e.preventDefault();
        put(`/admin/scooters/${scooter.id}`);
    }

    function handleAddPart(e: FormEvent) {
        e.preventDefault();
        partForm.post(`/admin/scooters/${scooter.id}/onderdelen`, {
            onSuccess: () => partForm.reset(),
        });
    }

    function handleDeletePart(partId: number) {
        router.delete(`/admin/scooters/${scooter.id}/onderdelen/${partId}`);
    }

    function handleUploadPhotos(e: FormEvent) {
        e.preventDefault();
        if (!photoFiles || photoFiles.length === 0) return;

        const formData = new FormData();
        Array.from(photoFiles).forEach((f) => formData.append('photos[]', f));
        setPhotoUploading(true);
        router.post(`/admin/scooters/${scooter.id}/fotos`, formData, {
            forceFormData: true,
            onFinish: () => {
                setPhotoUploading(false);
                setPhotoFiles(null);
                if (photoInputRef.current) photoInputRef.current.value = '';
            },
        });
    }

    function handleSetPrimary(photoId: number) {
        router.patch(`/admin/scooters/${scooter.id}/fotos/${photoId}/primair`);
    }

    function handleDeletePhoto(photoId: number) {
        router.delete(`/admin/scooters/${scooter.id}/fotos/${photoId}`);
    }

    const totalInvestment = scooter.onderdelen_kosten + scooter.purchase_price;
    const profit = scooter.expected_sale_price !== null ? scooter.expected_sale_price - totalInvestment : null;

    return (
        <AdminLayout title={`Bewerken: ${scooter.naam}`}>
            <Head title={`Bewerken: ${scooter.naam}`} />

            {flash?.success && (
                <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm">
                    ✅ {flash.success}
                </div>
            )}

            {/* Financial summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {[
                    { label: 'Inkoopprijs', value: `€${scooter.purchase_price.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}`, color: 'text-gray-900' },
                    { label: 'Onderdeelkosten', value: `€${scooter.onderdelen_kosten.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}`, color: 'text-gray-900' },
                    { label: 'Totale investering', value: `€${totalInvestment.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}`, color: 'text-gray-900 font-bold' },
                    {
                        label: 'Netto winst',
                        value: profit !== null ? `${profit >= 0 ? '+' : ''}€${profit.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}` : '—',
                        color: profit === null ? 'text-gray-400' : profit >= 0 ? 'text-emerald-600 font-bold' : 'text-red-500 font-bold',
                    },
                ].map((item) => (
                    <div key={item.label} className="bg-white rounded-2xl shadow-sm p-4">
                        <div className="text-xs text-gray-500 mb-1">{item.label}</div>
                        <div className={`text-xl ${item.color}`}>{item.value}</div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Left: Scooter form */}
                <div className="xl:col-span-2 space-y-6">
                    <form onSubmit={handleSave} className="space-y-6">
                        {/* Merk & Model */}
                        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
                            <h2 className="font-bold text-gray-900">Merk & Model</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Merk *</label>
                                    <select
                                        value={data.brand_id}
                                        onChange={(e) => {
                                            setData('brand_id', e.target.value);
                                            setData('scooter_model_id', '');
                                        }}
                                        className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    >
                                        <option value="">Selecteer merk</option>
                                        {localBrands.map((b) => (
                                            <option key={b.id} value={b.id}>{b.name}</option>
                                        ))}
                                    </select>
                                    {errors.brand_id && <p className="mt-1 text-red-500 text-xs">{errors.brand_id}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Model *</label>
                                    <select
                                        value={data.scooter_model_id}
                                        onChange={(e) => setData('scooter_model_id', e.target.value)}
                                        disabled={!data.brand_id}
                                        className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
                                    >
                                        <option value="">Selecteer model</option>
                                        {availableModels.map((m) => (
                                            <option key={m.id} value={m.id}>{m.name}</option>
                                        ))}
                                    </select>
                                    {errors.scooter_model_id && <p className="mt-1 text-red-500 text-xs">{errors.scooter_model_id}</p>}
                                </div>
                            </div>

                            {/* Inline add brand / model */}
                            <div className="border border-dashed border-gray-200 rounded-xl p-4 space-y-3">
                                <button
                                    type="button"
                                    onClick={() => setShowBrandExtra((v) => !v)}
                                    className="text-xs text-orange-500 hover:text-orange-600 font-medium"
                                >
                                    {showBrandExtra ? '▲ Verbergen' : '+ Nieuw merk of model toevoegen'}
                                </button>

                                {showBrandExtra && (
                                    <div className="space-y-3 pt-1">
                                        <div>
                                            <p className="text-xs font-semibold text-gray-500 mb-1.5">Nieuw merk</p>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="Bijv. AGM, Vespa..."
                                                    value={newBrand}
                                                    onChange={(e) => setNewBrand(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addBrand())}
                                                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={addBrand}
                                                    disabled={!newBrand.trim() || addingBrand}
                                                    className="bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                                                >
                                                    {addingBrand ? '...' : 'Toevoegen'}
                                                </button>
                                            </div>
                                        </div>

                                        <div className={data.brand_id ? '' : 'opacity-40 pointer-events-none'}>
                                            <p className="text-xs font-semibold text-gray-500 mb-1.5">
                                                Nieuw model
                                                {selectedBrand && <span className="font-normal text-gray-400"> voor {selectedBrand.name}</span>}
                                            </p>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    placeholder={data.brand_id ? 'Bijv. VX50, City 50...' : 'Selecteer eerst een merk'}
                                                    value={newModel}
                                                    onChange={(e) => setNewModel(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addModel())}
                                                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={addModel}
                                                    disabled={!newModel.trim() || !data.brand_id || addingModel}
                                                    className="bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                                                >
                                                    {addingModel ? '...' : 'Toevoegen'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Financieel */}
                        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
                            <h2 className="font-bold text-gray-900">Financieel</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Inkoopprijs (€) *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.purchase_price}
                                        onChange={(e) => setData('purchase_price', e.target.value)}
                                        className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                    {errors.purchase_price && <p className="mt-1 text-red-500 text-xs">{errors.purchase_price}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Verwachte verkoopprijs (€)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.expected_sale_price}
                                        onChange={(e) => setData('expected_sale_price', e.target.value)}
                                        className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                    {errors.expected_sale_price && <p className="mt-1 text-red-500 text-xs">{errors.expected_sale_price}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Details */}
                        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
                            <h2 className="font-bold text-gray-900">Details</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Bouwjaar</label>
                                    <input type="number" min="1990" max="2030" value={data.year} onChange={(e) => setData('year', e.target.value)} className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder="2020" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Kilometerstand</label>
                                    <input type="number" min="0" value={data.mileage} onChange={(e) => setData('mileage', e.target.value)} className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder="12000" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Kleur</label>
                                    <input type="text" value={data.color} onChange={(e) => setData('color', e.target.value)} className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder="Zwart" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Kenteken</label>
                                    <input type="text" value={data.kenteken} onChange={(e) => setData('kenteken', e.target.value.toUpperCase())} className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder="AB-12-CD" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Omschrijving</label>
                                <textarea value={data.description} onChange={(e) => setData('description', e.target.value)} rows={4} className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none" placeholder="Beschrijf de scooter..." />
                            </div>
                        </div>

                        {/* Status */}
                        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
                            <h2 className="font-bold text-gray-900">Status & Publicatie</h2>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Status *</label>
                                <select value={data.status} onChange={(e) => setData('status', e.target.value)} className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
                                    <option value="in_reparatie">In reparatie</option>
                                    <option value="te_koop">Te koop</option>
                                    <option value="verkocht">Verkocht</option>
                                </select>
                            </div>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" checked={data.ready_for_sale} onChange={(e) => setData('ready_for_sale', e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500" />
                                <div>
                                    <div className="text-sm font-medium text-gray-900">Klaar voor verkoop (zichtbaar op website)</div>
                                    <div className="text-xs text-gray-500">Zichtbaar op de publieke verkoopsite.</div>
                                </div>
                            </label>
                        </div>

                        <div className="flex gap-3">
                            <button type="submit" disabled={processing} className="bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
                                {processing ? 'Opslaan...' : 'Wijzigingen opslaan'}
                            </button>
                            <Link href="/admin/scooters" className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-6 py-3 rounded-xl transition-colors">
                                Terug
                            </Link>
                        </div>
                    </form>

                    {/* Parts */}
                    <div className="bg-white rounded-2xl shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-bold text-gray-900">Onderdelen</h2>
                            {scooter.parts.length > 0 && (
                                <div className="text-right">
                                    <div className="text-xs text-gray-500">Totaal uitgegeven</div>
                                    <div className="text-lg font-bold text-orange-500">
                                        €{scooter.onderdelen_kosten.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {scooter.parts.length > 0 ? (
                            <div className="mb-5">
                                {/* Group by category */}
                                {(() => {
                                    const grouped: Record<string, Part[]> = {};
                                    scooter.parts.forEach((p) => {
                                        const cat = p.category || 'Overig';
                                        if (!grouped[cat]) grouped[cat] = [];
                                        grouped[cat].push(p);
                                    });
                                    return Object.entries(grouped).map(([cat, parts]) => (
                                        <div key={cat} className="mb-4">
                                            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 px-1">{cat}</div>
                                            <div className="divide-y divide-gray-50 border border-gray-100 rounded-xl overflow-hidden">
                                                {parts.map((part) => (
                                                    <div key={part.id} className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <span className="text-sm font-semibold text-gray-900">{part.name}</span>
                                                                {part.part_brand && (
                                                                    <span className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-medium">{part.part_brand}</span>
                                                                )}
                                                                {part.specification && (
                                                                    <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{part.specification}</span>
                                                                )}
                                                                {part.quantity > 1 && (
                                                                    <span className="text-xs bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded font-medium">×{part.quantity}</span>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-400">
                                                                {part.purchased_at && <span>📅 {part.purchased_at}</span>}
                                                                {part.notes && <span className="truncate">{part.notes}</span>}
                                                            </div>
                                                        </div>
                                                        <div className="text-right flex-shrink-0">
                                                            <div className="font-bold text-gray-900 text-sm">
                                                                €{part.total_cost.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
                                                            </div>
                                                            {part.quantity > 1 && (
                                                                <div className="text-xs text-gray-400">
                                                                    €{part.cost.toLocaleString('nl-NL', { minimumFractionDigits: 2 })} per stuk
                                                                </div>
                                                            )}
                                                        </div>
                                                        <button
                                                            onClick={() => handleDeletePart(part.id)}
                                                            className="text-gray-300 hover:text-red-500 transition-colors p-1 rounded hover:bg-red-50 flex-shrink-0"
                                                            title="Verwijderen"
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ));
                                })()}
                                {/* Grand total bar */}
                                <div className="flex justify-between items-center mt-3 px-4 py-3 bg-orange-50 border border-orange-200 rounded-xl">
                                    <div>
                                        <div className="text-xs text-orange-600 font-medium">Totaal onderdelen</div>
                                        <div className="text-xs text-gray-500">{scooter.parts.length} onderdeel{scooter.parts.length !== 1 ? 'en' : ''}</div>
                                    </div>
                                    <div className="text-xl font-bold text-orange-600">
                                        €{scooter.onderdelen_kosten.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400 mb-5">Nog geen onderdelen. Voeg hieronder je eerste onderdeel toe.</p>
                        )}

                        {/* Add part form */}
                        <form onSubmit={handleAddPart} className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-100">
                            <h3 className="text-sm font-bold text-gray-700">➕ Onderdeel toevoegen</h3>

                            {/* Row 1: naam + merk + specificatie */}
                            <div className="grid grid-cols-3 gap-2">
                                <div className="col-span-3 sm:col-span-1">
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Naam *</label>
                                    <input
                                        type="text"
                                        placeholder="Bijv. Band, Uitlaat, Lamp"
                                        value={partForm.data.name}
                                        onChange={(e) => partForm.setData('name', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                    {partForm.errors.name && <p className="mt-1 text-red-500 text-xs">{partForm.errors.name}</p>}
                                </div>
                                <div className="col-span-3 sm:col-span-1">
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Merk onderdeel</label>
                                    <input
                                        type="text"
                                        placeholder="Bijv. Cito Plus, Malossi"
                                        value={partForm.data.part_brand}
                                        onChange={(e) => partForm.setData('part_brand', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                </div>
                                <div className="col-span-3 sm:col-span-1">
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Specificatie / Maat</label>
                                    <input
                                        type="text"
                                        placeholder="Bijv. 10 inch, 230mm"
                                        value={partForm.data.specification}
                                        onChange={(e) => partForm.setData('specification', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                </div>
                            </div>

                            {/* Row 2: categorie + aantal + prijs per stuk */}
                            <div className="grid grid-cols-3 gap-2">
                                <div className="col-span-3 sm:col-span-1">
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Categorie</label>
                                    <select
                                        value={partForm.data.category}
                                        onChange={(e) => partForm.setData('category', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                                    >
                                        <option value="">— Kies categorie —</option>
                                        <option value="Motor">⚙️ Motor</option>
                                        <option value="Remmen">🛑 Remmen</option>
                                        <option value="Wielen & Banden">🔵 Wielen & Banden</option>
                                        <option value="Verlichting">💡 Verlichting</option>
                                        <option value="Carrosserie">🛵 Carrosserie</option>
                                        <option value="Uitlaat">💨 Uitlaat</option>
                                        <option value="Transmissie">🔩 Transmissie</option>
                                        <option value="Elektrisch">⚡ Elektrisch</option>
                                        <option value="Vloeistoffen">🧴 Vloeistoffen</option>
                                        <option value="Overig">📦 Overig</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Aantal</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="999"
                                        value={partForm.data.quantity}
                                        onChange={(e) => partForm.setData('quantity', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Prijs per stuk (€) *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="0.00"
                                        value={partForm.data.cost}
                                        onChange={(e) => partForm.setData('cost', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                    {partForm.errors.cost && <p className="mt-1 text-red-500 text-xs">{partForm.errors.cost}</p>}
                                </div>
                            </div>

                            {/* Live total preview */}
                            {partForm.data.cost && Number(partForm.data.cost) > 0 && (
                                <div className="flex items-center justify-between bg-white border border-orange-200 rounded-lg px-3 py-2 text-sm">
                                    <span className="text-gray-500">
                                        {partForm.data.quantity}× €{Number(partForm.data.cost).toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
                                    </span>
                                    <span className="font-bold text-orange-500">
                                        = €{(Number(partForm.data.cost) * Number(partForm.data.quantity || 1)).toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            )}

                            {/* Row 3: datum + notities */}
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Aankoopdatum</label>
                                    <input
                                        type="date"
                                        value={partForm.data.purchased_at}
                                        onChange={(e) => partForm.setData('purchased_at', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Notities</label>
                                    <input
                                        type="text"
                                        placeholder="Optionele opmerking"
                                        value={partForm.data.notes}
                                        onChange={(e) => partForm.setData('notes', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={partForm.processing}
                                className="w-full bg-gray-800 hover:bg-gray-700 disabled:opacity-60 text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
                            >
                                {partForm.processing ? 'Toevoegen...' : '+ Onderdeel toevoegen'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Right: Photos */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm p-6">
                        <h2 className="font-bold text-gray-900 mb-4">Foto's</h2>

                        {scooter.photos.length > 0 ? (
                            <div className="grid grid-cols-2 gap-2 mb-4">
                                {scooter.photos.map((photo) => (
                                    <div key={photo.id} className={`relative rounded-xl overflow-hidden border-2 ${photo.is_primary ? 'border-orange-500' : 'border-transparent'}`}>
                                        <img src={photo.url} alt="" className="w-full aspect-square object-cover" />
                                        {photo.is_primary && (
                                            <span className="absolute top-1.5 left-1.5 bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full font-medium">
                                                Hoofd
                                            </span>
                                        )}
                                        <div className="absolute bottom-1.5 right-1.5 flex gap-1">
                                            {!photo.is_primary && (
                                                <button
                                                    onClick={() => handleSetPrimary(photo.id)}
                                                    title="Maak hoofdfoto"
                                                    className="bg-white/90 hover:bg-white text-gray-700 text-xs px-1.5 py-1 rounded-lg shadow-sm transition-colors"
                                                >
                                                    ⭐
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDeletePhoto(photo.id)}
                                                title="Verwijderen"
                                                className="bg-white/90 hover:bg-red-500 hover:text-white text-gray-700 text-xs px-1.5 py-1 rounded-lg shadow-sm transition-colors"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400 mb-4">Nog geen foto's.</p>
                        )}

                        {/* Upload form */}
                        <form onSubmit={handleUploadPhotos} className="space-y-3">
                            <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-orange-300 transition-colors">
                                <input
                                    ref={photoInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/jpg,image/webp"
                                    multiple
                                    onChange={(e) => setPhotoFiles(e.target.files)}
                                    className="hidden"
                                    id="photo-upload"
                                />
                                <label htmlFor="photo-upload" className="cursor-pointer block">
                                    <div className="text-3xl mb-1">📷</div>
                                    <p className="text-sm text-gray-500">
                                        {photoFiles && photoFiles.length > 0
                                            ? `${photoFiles.length} foto(s) geselecteerd`
                                            : "Klik om foto's te selecteren"}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP — max. 20MB per foto</p>
                                    <p className="text-xs text-gray-400">Meerdere foto's tegelijk selecteren mogelijk</p>
                                </label>
                            </div>
                            {photoFiles && photoFiles.length > 0 && (
                                <div className="flex gap-1.5 flex-wrap">
                                    {Array.from(photoFiles).map((f, i) => (
                                        <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                            {f.name}
                                        </span>
                                    ))}
                                </div>
                            )}
                            <button
                                type="submit"
                                disabled={!photoFiles || photoFiles.length === 0 || photoUploading}
                                className="w-full bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-white text-sm font-medium py-2.5 rounded-xl transition-colors"
                            >
                                {photoUploading ? 'Uploaden...' : `Foto's uploaden${photoFiles && photoFiles.length > 0 ? ` (${photoFiles.length})` : ''}`}
                            </button>
                        </form>
                    </div>

                    {/* Quick view on site */}
                    {scooter.ready_for_sale && scooter.status === 'te_koop' && (
                        <a
                            href={`/scooters/${scooter.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="block bg-orange-50 border border-orange-200 text-orange-700 text-sm font-medium px-4 py-3 rounded-xl text-center hover:bg-orange-100 transition-colors"
                        >
                            🌐 Bekijk op website →
                        </a>
                    )}

                    {/* Google image search */}
                    <div className="bg-white rounded-2xl shadow-sm p-5">
                        <button
                            type="button"
                            onClick={() => {
                                setShowGoogleSearch((v) => !v);
                                if (!showGoogleSearch && googleImages.length === 0) {
                                    searchGoogleImages();
                                }
                            }}
                            className="w-full flex items-center justify-between text-sm font-medium text-gray-700 hover:text-gray-900"
                        >
                            <span className="flex items-center gap-2">
                                <span>🔍</span>
                                <span>Foto zoeken via Google</span>
                            </span>
                            <span className="text-gray-400 text-xs">{showGoogleSearch ? '▲' : '▼'}</span>
                        </button>

                        {showGoogleSearch && (
                            <div className="mt-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    {googleQuery && (
                                        <p className="text-xs text-gray-500">Zoekopdracht: <em>"{googleQuery}"</em></p>
                                    )}
                                    <button
                                        type="button"
                                        onClick={searchGoogleImages}
                                        disabled={googleSearching}
                                        className="text-xs text-orange-500 hover:text-orange-600 font-medium disabled:opacity-50 ml-auto"
                                    >
                                        {googleSearching ? '⏳ Bezig...' : '↻ Opnieuw zoeken'}
                                    </button>
                                </div>

                                {googleError && (
                                    <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl space-y-1">
                                        <p className="font-semibold">⚠️ {googleError}</p>
                                        {googleError.includes('GOOGLE_API_KEY') && (
                                            <p className="text-red-500">
                                                Voeg <code className="bg-red-100 px-1 rounded">GOOGLE_API_KEY</code> en{' '}
                                                <code className="bg-red-100 px-1 rounded">GOOGLE_SEARCH_ENGINE_ID</code> toe aan het .env bestand.{' '}
                                                <a
                                                    href="https://programmablesearch.google.com"
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="underline"
                                                >
                                                    Aanmaken →
                                                </a>
                                            </p>
                                        )}
                                    </div>
                                )}

                                {googleSearching && (
                                    <div className="grid grid-cols-2 gap-2">
                                        {[...Array(6)].map((_, i) => (
                                            <div key={i} className="aspect-video bg-gray-100 rounded-xl animate-pulse" />
                                        ))}
                                    </div>
                                )}

                                {googleImages.length > 0 && (
                                    <>
                                        <div className="grid grid-cols-2 gap-2">
                                            {googleImages.map((img) => (
                                                <div key={img.url} className="relative group rounded-xl overflow-hidden border border-gray-100">
                                                    <img
                                                        src={img.thumbnail}
                                                        alt={img.title}
                                                        className="w-full aspect-video object-cover"
                                                        onError={(e) => { (e.target as HTMLImageElement).src = ''; }}
                                                    />
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => importGoogleImage(img.url)}
                                                            disabled={googleImporting === img.url}
                                                            className="opacity-0 group-hover:opacity-100 transition-opacity bg-white text-gray-900 text-xs font-semibold px-3 py-1.5 rounded-lg shadow disabled:opacity-50"
                                                        >
                                                            {googleImporting === img.url ? '⏳ Laden...' : '✚ Gebruiken'}
                                                        </button>
                                                    </div>
                                                    <div className="absolute bottom-1 left-1 right-1">
                                                        <p className="text-white text-xs bg-black/50 rounded px-1 truncate">{img.source}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <p className="text-xs text-gray-400 text-center">
                                            Klik op een foto om hem te downloaden en toe te voegen. Controleer altijd of je de rechten hebt om de foto te gebruiken.
                                        </p>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
