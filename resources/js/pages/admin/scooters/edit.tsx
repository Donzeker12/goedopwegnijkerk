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
    minimum_stock: number;
    procurement_status: 'nodig' | 'besteld' | 'binnen' | 'geplaatst';
    category: string | null;
    cost: number;
    total_cost: number;
    purchased_at: string | null;
    notes: string | null;
    receipt_url: string | null;
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
    actual_sale_price: number | null;
    sold_at: string | null;
    description: string | null;
    year: number | null;
    mileage: number | null;
    color: string | null;
    kenteken: string | null;
    status: string;
    ready_for_sale: boolean;
    warranty_months: number | null;
    delivery_service_included: boolean;
    inspection_points: number | null;
    review_score: number | null;
    review_count: number | null;
    naam: string;
    onderdelen_kosten: number;
    totale_investering: number;
    netto_winst: number | null;
    netto_winst_echt: number | null;
    purchase_receipt_url: string | null;
    pricing_hint: {
        level: 'medium' | 'high';
        title: string;
        message: string;
    } | null;
    days_online: number | null;
    recent_views: number;
    recent_test_rides: number;
    parts: Part[];
    photos: Photo[];
}

interface Props {
    scooter: ScooterData;
    brands: BrandItem[];
    features?: {
        loyalty_pass_admin_preview?: boolean;
    };
    product_templates: {
        name: string;
        part_brand: string | null;
        specification: string | null;
        category: string | null;
        cost: number;
    }[];
}

const supplierOptions = ['Kparts', 'Zandri', 'Scootershop'];

export default function ScooterEdit({ scooter, brands: initialBrands, features, product_templates }: Props) {
    const { props } = usePage<{ flash?: { success?: string } }>();
    const flash = props.flash;

    const { data, setData, put, processing, errors } = useForm({
        brand_id: String(scooter.brand_id),
        scooter_model_id: String(scooter.scooter_model_id),
        purchase_price: String(scooter.purchase_price),
        expected_sale_price: scooter.expected_sale_price ? String(scooter.expected_sale_price) : '',
        actual_sale_price: scooter.actual_sale_price ? String(scooter.actual_sale_price) : '',
        sold_at: scooter.sold_at ?? '',
        purchase_receipt: null as File | null,
        description: scooter.description ?? '',
        year: scooter.year ? String(scooter.year) : '',
        mileage: scooter.mileage ? String(scooter.mileage) : '',
        color: scooter.color ?? '',
        kenteken: scooter.kenteken ?? '',
        status: scooter.status,
        ready_for_sale: scooter.ready_for_sale,
        warranty_months: scooter.warranty_months ? String(scooter.warranty_months) : '',
        delivery_service_included: scooter.delivery_service_included,
        inspection_points: scooter.inspection_points ? String(scooter.inspection_points) : '',
        review_score: scooter.review_score ? String(scooter.review_score) : '',
        review_count: scooter.review_count ? String(scooter.review_count) : '',
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
        minimum_stock: '0',
        procurement_status: 'binnen' as 'nodig' | 'besteld' | 'binnen' | 'geplaatst',
        category: '',
        cost: '',
        purchased_at: '',
        notes: '',
        receipt: null as File | null,
    });

    const quickNeedForm = useForm({
        name: '',
        part_brand: '',
        cost: '',
    });
    const quickNeedFormRef = useRef<HTMLFormElement>(null);
    const quickNeedInputRef = useRef<HTMLInputElement>(null);

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
    const [selectedTemplateKey, setSelectedTemplateKey] = useState('');
    const selectedSupplierValue = supplierOptions.includes(partForm.data.part_brand) ? partForm.data.part_brand : partForm.data.part_brand ? '__custom__' : '';
    const quickSupplierValue = supplierOptions.includes(quickNeedForm.data.part_brand) ? quickNeedForm.data.part_brand : quickNeedForm.data.part_brand ? '__custom__' : '';

    function parseMoneyInput(value: string): number {
        const normalized = value.replace(',', '.').replace(/[^0-9.]/g, '');

        return Number.parseFloat(normalized || '0') || 0;
    }

    function applyProductTemplate(rawKey: string) {
        setSelectedTemplateKey(rawKey);
        const idx = Number.parseInt(rawKey, 10);
        if (Number.isNaN(idx)) return;

        const tpl = product_templates[idx];
        if (!tpl) return;

        partForm.setData((prev) => ({
            ...prev,
            name: tpl.name,
            part_brand: tpl.part_brand ?? '',
            specification: tpl.specification ?? '',
            category: tpl.category ?? prev.category,
            cost: String(tpl.cost),
            quantity: prev.quantity || '1',
        }));
    }

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
        put(`/admin/scooters/${scooter.id}`, { forceFormData: true });
    }

    function handleAddPart(e: FormEvent) {
        e.preventDefault();
        partForm.post(`/admin/scooters/${scooter.id}/onderdelen`, {
            forceFormData: true,
            onSuccess: () => partForm.reset(),
        });
    }

    function handleDeletePart(partId: number) {
        router.delete(`/admin/scooters/${scooter.id}/onderdelen/${partId}`);
    }

    function handleUpdatePartStatus(partId: number, status: 'nodig' | 'besteld' | 'binnen' | 'geplaatst') {
        router.patch(`/admin/scooters/${scooter.id}/onderdelen/${partId}/status`, {
            procurement_status: status,
        });
    }

    function handleQuickNeedSubmit(e: FormEvent) {
        e.preventDefault();
        if (!quickNeedForm.data.name.trim()) return;

        quickNeedForm.transform(() => ({
            name: quickNeedForm.data.name,
            part_brand: quickNeedForm.data.part_brand || null,
            quantity: 1,
            minimum_stock: 0,
            procurement_status: 'nodig',
            cost: parseMoneyInput(quickNeedForm.data.cost),
        }));

        quickNeedForm.post(`/admin/scooters/${scooter.id}/onderdelen`, {
            forceFormData: true,
            onSuccess: () => quickNeedForm.reset(),
        });
    }

    function jumpToQuickNeed() {
        quickNeedFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => quickNeedInputRef.current?.focus(), 250);
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
    const expectedProfit = scooter.expected_sale_price !== null ? scooter.expected_sale_price - totalInvestment : null;
    const actualProfit = scooter.actual_sale_price !== null ? scooter.actual_sale_price - totalInvestment : null;
    const neededParts = scooter.parts.filter((part) => part.procurement_status === 'nodig');
    const orderedParts = scooter.parts.filter((part) => part.procurement_status === 'besteld');
    const pendingParts = scooter.parts.filter((part) => !['binnen', 'geplaatst'].includes(part.procurement_status));
    const neededTotal = neededParts.reduce((sum, part) => sum + part.total_cost, 0);
    const orderedTotal = orderedParts.reduce((sum, part) => sum + part.total_cost, 0);
    const pendingTotal = pendingParts.reduce((sum, part) => sum + part.total_cost, 0);

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
                        label: 'Verwachte winst',
                        value: expectedProfit !== null ? `${expectedProfit >= 0 ? '+' : ''}€${expectedProfit.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}` : '—',
                        color: expectedProfit === null ? 'text-gray-400' : expectedProfit >= 0 ? 'text-emerald-600 font-bold' : 'text-red-500 font-bold',
                    },
                ].map((item) => (
                    <div key={item.label} className="bg-white rounded-2xl shadow-sm p-4">
                        <div className="text-xs text-gray-500 mb-1">{item.label}</div>
                        <div className={`text-xl ${item.color}`}>{item.value}</div>
                    </div>
                ))}
            </div>

            {scooter.pricing_hint && (
                <div className={`mb-6 rounded-2xl border p-4 ${scooter.pricing_hint.level === 'high' ? 'border-rose-200 bg-rose-50' : 'border-amber-200 bg-amber-50'}`}>
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <h2 className={`font-bold ${scooter.pricing_hint.level === 'high' ? 'text-rose-900' : 'text-amber-900'}`}>{scooter.pricing_hint.title}</h2>
                            <p className={`text-sm mt-1 ${scooter.pricing_hint.level === 'high' ? 'text-rose-700' : 'text-amber-700'}`}>{scooter.pricing_hint.message}</p>
                        </div>
                        <div className="text-right text-xs text-gray-600 shrink-0">
                            <div>{scooter.days_online ?? 0} dagen online</div>
                            <div>{scooter.recent_views} views (14d)</div>
                            <div>{scooter.recent_test_rides} proefritten (14d)</div>
                        </div>
                    </div>
                </div>
            )}

            {scooter.status === 'verkocht' && scooter.actual_sale_price !== null && (
                <div className="mb-6 bg-blue-50 border border-blue-200 rounded-2xl p-4">
                    <h2 className="font-bold text-blue-900 mb-2">Verkocht: directe samenvatting</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                        <div>
                            <div className="text-blue-700">Totale investering</div>
                            <div className="font-bold text-blue-900">€{totalInvestment.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}</div>
                        </div>
                        <div>
                            <div className="text-blue-700">Echte verkoopprijs</div>
                            <div className="font-bold text-blue-900">€{scooter.actual_sale_price.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}</div>
                        </div>
                        <div>
                            <div className="text-blue-700">Echte netto winst</div>
                            <div className={`font-bold ${actualProfit !== null && actualProfit >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                                {actualProfit !== null ? `${actualProfit >= 0 ? '+' : ''}€${actualProfit.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}` : '—'}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 pb-24 md:pb-0">
                {/* Left: Scooter form */}
                <div className="xl:col-span-2 space-y-6">
                    <form onSubmit={handleSave} className="space-y-6">
                        {/* Merk & Model */}
                        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
                            <h2 className="font-bold text-gray-900">Merk & Model</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Echte verkoopprijs (€)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.actual_sale_price}
                                        onChange={(e) => setData('actual_sale_price', e.target.value)}
                                        className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                    {errors.actual_sale_price && <p className="mt-1 text-red-500 text-xs">{errors.actual_sale_price}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Verkocht op</label>
                                    <input
                                        type="date"
                                        value={data.sold_at}
                                        onChange={(e) => setData('sold_at', e.target.value)}
                                        className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                    {errors.sold_at && <p className="mt-1 text-red-500 text-xs">{errors.sold_at}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Inkoopbon / factuur</label>
                                <input
                                    type="file"
                                    accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
                                    onChange={(e) => setData('purchase_receipt', e.target.files?.[0] ?? null)}
                                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm"
                                />
                                {scooter.purchase_receipt_url && (
                                    <a href={scooter.purchase_receipt_url} target="_blank" rel="noreferrer" className="text-xs text-orange-600 hover:underline mt-1 inline-block">
                                        Huidige bon bekijken
                                    </a>
                                )}
                                {errors.purchase_receipt && <p className="mt-1 text-red-500 text-xs">{errors.purchase_receipt}</p>}
                            </div>
                        </div>

                        {/* Details */}
                        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
                            <h2 className="font-bold text-gray-900">Details</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
                            <h2 className="font-bold text-gray-900">Vertrouwen op shop</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Garantie (maanden)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="24"
                                        value={data.warranty_months}
                                        onChange={(e) => setData('warranty_months', e.target.value)}
                                        className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                    {errors.warranty_months && <p className="mt-1 text-red-500 text-xs">{errors.warranty_months}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Keuringspunten</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={data.inspection_points}
                                        onChange={(e) => setData('inspection_points', e.target.value)}
                                        className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                    {errors.inspection_points && <p className="mt-1 text-red-500 text-xs">{errors.inspection_points}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Reviewscore (0-5)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        max="5"
                                        value={data.review_score}
                                        onChange={(e) => setData('review_score', e.target.value)}
                                        className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                    {errors.review_score && <p className="mt-1 text-red-500 text-xs">{errors.review_score}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Aantal reviews</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="9999"
                                        value={data.review_count}
                                        onChange={(e) => setData('review_count', e.target.value)}
                                        className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                    {errors.review_count && <p className="mt-1 text-red-500 text-xs">{errors.review_count}</p>}
                                </div>
                            </div>

                            <label className="flex items-center gap-3 cursor-pointer rounded-xl border border-gray-200 px-3 py-2">
                                <input
                                    type="checkbox"
                                    checked={data.delivery_service_included}
                                    onChange={(e) => setData('delivery_service_included', e.target.checked)}
                                    className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                                />
                                <div>
                                    <div className="text-sm font-medium text-gray-900">Afleverbeurt inbegrepen</div>
                                    <div className="text-xs text-gray-500">Wordt zichtbaar als trust-element op de productpagina.</div>
                                </div>
                            </label>

                            {features?.loyalty_pass_admin_preview && (
                                <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
                                    <div className="text-xs font-semibold uppercase tracking-wide text-blue-700">Testfase - nog niet live</div>
                                    <h3 className="text-sm font-bold text-blue-900 mt-1">Goed Op Weg Vertrouwenspas</h3>
                                    <p className="text-xs text-blue-800 mt-1">Concept voordelen: gratis check na 30 dagen en mogelijk €25 service-tegoed bij doorverwijzing.</p>
                                </div>
                            )}
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

                        <form ref={quickNeedFormRef} onSubmit={handleQuickNeedSubmit} className="mb-4 bg-orange-50 border border-orange-200 rounded-xl p-3">
                            <div className="text-xs font-semibold text-orange-700 mb-2">Snel toevoegen op mobiel: nodig onderdeel</div>
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                                <input
                                    ref={quickNeedInputRef}
                                    type="text"
                                    value={quickNeedForm.data.name}
                                    onChange={(e) => quickNeedForm.setData('name', e.target.value)}
                                    placeholder="Bijv. Achterband 10 inch"
                                    className="sm:col-span-2 border border-orange-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                                <div>
                                    <select
                                        value={quickSupplierValue}
                                        onChange={(e) => {
                                            if (e.target.value === '__custom__') {
                                                quickNeedForm.setData('part_brand', '');
                                                return;
                                            }

                                            quickNeedForm.setData('part_brand', e.target.value);
                                        }}
                                        className="w-full border border-orange-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                                    >
                                        <option value="">Winkel</option>
                                        {supplierOptions.map((supplier) => (
                                            <option key={supplier} value={supplier}>{supplier}</option>
                                        ))}
                                        <option value="__custom__">Anders...</option>
                                    </select>
                                    {quickSupplierValue === '__custom__' && (
                                        <input
                                            type="text"
                                            value={quickNeedForm.data.part_brand}
                                            onChange={(e) => quickNeedForm.setData('part_brand', e.target.value)}
                                            className="mt-2 w-full border border-orange-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                            placeholder="Typ winkelnaam"
                                        />
                                    )}
                                </div>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={quickNeedForm.data.cost}
                                    onChange={(e) => quickNeedForm.setData('cost', e.target.value)}
                                    placeholder="Prijs €"
                                    className="border border-orange-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                                <button
                                    type="submit"
                                    disabled={quickNeedForm.processing || !quickNeedForm.data.name.trim() || parseMoneyInput(quickNeedForm.data.cost) <= 0}
                                    className="sm:col-span-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium"
                                >
                                    {quickNeedForm.processing ? 'Opslaan...' : '+ Nodig'}
                                </button>
                            </div>
                        </form>

                        {pendingParts.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                                <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2">
                                    <div className="text-xs text-amber-700">Nog nodig</div>
                                    <div className="text-sm font-bold text-amber-800">{neededParts.length} items</div>
                                    <div className="text-sm text-amber-700">€{neededTotal.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}</div>
                                </div>
                                <div className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2">
                                    <div className="text-xs text-blue-700">Besteld</div>
                                    <div className="text-sm font-bold text-blue-800">{orderedParts.length} items</div>
                                    <div className="text-sm text-blue-700">€{orderedTotal.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}</div>
                                </div>
                                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2">
                                    <div className="text-xs text-red-700">Totaal nog te inkopen</div>
                                    <div className="text-sm font-bold text-red-800">{pendingParts.length} items</div>
                                    <div className="text-sm text-red-700">€{pendingTotal.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}</div>
                                </div>
                            </div>
                        )}

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
                                                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                                                    part.procurement_status === 'nodig'
                                                                        ? 'bg-amber-100 text-amber-700'
                                                                        : part.procurement_status === 'besteld'
                                                                            ? 'bg-blue-100 text-blue-700'
                                                                            : part.procurement_status === 'geplaatst'
                                                                                ? 'bg-violet-100 text-violet-700'
                                                                                : 'bg-emerald-100 text-emerald-700'
                                                                }`}>
                                                                    {part.procurement_status === 'nodig' ? 'Nodig' : part.procurement_status === 'besteld' ? 'Besteld' : part.procurement_status === 'geplaatst' ? 'Geplaatst' : 'Binnen'}
                                                                </span>
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
                                                                {part.receipt_url && (
                                                                    <a href={part.receipt_url} target="_blank" rel="noreferrer" className="text-orange-600 hover:underline">Bon</a>
                                                                )}
                                                                {part.minimum_stock > 0 && (
                                                                    <span className={part.quantity <= part.minimum_stock ? 'text-amber-600 font-semibold' : ''}>
                                                                        Voorraad {part.quantity}/{part.minimum_stock}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-2 mt-2">
                                                                {part.procurement_status === 'nodig' && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleUpdatePartStatus(part.id, 'besteld')}
                                                                        className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 px-2 py-1 rounded-md"
                                                                    >
                                                                        Markeer als besteld
                                                                    </button>
                                                                )}
                                                                {part.procurement_status !== 'binnen' && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleUpdatePartStatus(part.id, 'binnen')}
                                                                        className="text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-2 py-1 rounded-md"
                                                                    >
                                                                        Markeer als binnen
                                                                    </button>
                                                                )}
                                                                {part.procurement_status === 'binnen' && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleUpdatePartStatus(part.id, 'geplaatst')}
                                                                        className="text-xs bg-violet-50 text-violet-700 hover:bg-violet-100 px-2 py-1 rounded-md"
                                                                    >
                                                                        Markeer als geplaatst
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="text-right shrink-0">
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
                                                            className="text-gray-300 hover:text-red-500 transition-colors p-1 rounded hover:bg-red-50 shrink-0"
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

                            {product_templates.length > 0 && (
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Productenlijst</label>
                                    <select
                                        value={selectedTemplateKey}
                                        onChange={(e) => applyProductTemplate(e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                                    >
                                        <option value="">Kies bestaand product om velden te vullen...</option>
                                        {product_templates.map((tpl, idx) => (
                                            <option key={`${tpl.name}-${tpl.part_brand ?? ''}-${tpl.specification ?? ''}-${idx}`} value={idx}>
                                                {tpl.name}
                                                {tpl.part_brand ? ` - ${tpl.part_brand}` : ''}
                                                {tpl.specification ? ` (${tpl.specification})` : ''}
                                                {` - €${tpl.cost.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

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
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Winkel / Leverancier</label>
                                    <select
                                        value={selectedSupplierValue}
                                        onChange={(e) => {
                                            if (e.target.value === '__custom__') {
                                                partForm.setData('part_brand', '');
                                                return;
                                            }

                                            partForm.setData('part_brand', e.target.value);
                                        }}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                                    >
                                        <option value="">— Kies winkel —</option>
                                        {supplierOptions.map((supplier) => (
                                            <option key={supplier} value={supplier}>{supplier}</option>
                                        ))}
                                        <option value="__custom__">Anders...</option>
                                    </select>
                                    {selectedSupplierValue === '__custom__' && (
                                        <input
                                            type="text"
                                            placeholder="Typ winkelnaam"
                                            value={partForm.data.part_brand}
                                            onChange={(e) => partForm.setData('part_brand', e.target.value)}
                                            className="mt-2 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        />
                                    )}
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
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Minimumvoorraad</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="999"
                                        value={partForm.data.minimum_stock}
                                        onChange={(e) => partForm.setData('minimum_stock', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                                    <select
                                        value={partForm.data.procurement_status}
                                        onChange={(e) => partForm.setData('procurement_status', e.target.value as 'nodig' | 'besteld' | 'binnen' | 'geplaatst')}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                                    >
                                        <option value="nodig">Nodig</option>
                                        <option value="besteld">Besteld</option>
                                        <option value="binnen">Binnen</option>
                                        <option value="geplaatst">Geplaatst</option>
                                    </select>
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

                            {partForm.data.cost && Number(partForm.data.cost) > 0 && (
                                <div className="text-xs text-gray-500">
                                    Deze prijs wordt direct meegenomen in totale investering en winstberekening.
                                </div>
                            )}

                            {/* Row 3: datum + notities */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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

                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Bon / Factuur</label>
                                <input
                                    type="file"
                                    accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
                                    onChange={(e) => partForm.setData('receipt', e.target.files?.[0] ?? null)}
                                    className="w-full text-sm"
                                />
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
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
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
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {[...Array(6)].map((_, i) => (
                                            <div key={i} className="aspect-video bg-gray-100 rounded-xl animate-pulse" />
                                        ))}
                                    </div>
                                )}

                                {googleImages.length > 0 && (
                                    <>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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

            <button
                type="button"
                onClick={jumpToQuickNeed}
                className="fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-70 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-3 rounded-full shadow-lg"
            >
                + Nodig onderdeel
            </button>
        </AdminLayout>
    );
}
