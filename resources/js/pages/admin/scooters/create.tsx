import { Head, Link, useForm } from '@inertiajs/react';
import { type FormEvent, useState } from 'react';
import TipTapEditor from '../../../components/TipTapEditor';
import AdminLayout from '../../../layouts/AdminLayout';

interface ScooterModelItem {
    id: number;
    name: string;
}

interface BrandItem {
    id: number;
    name: string;
    scooter_models: ScooterModelItem[];
}

interface Props {
    brands: BrandItem[];
}

function getCsrf(): string {
    return (document.querySelector('meta[name=csrf-token]') as HTMLMetaElement)?.content ?? '';
}

export default function ScooterCreate({ brands: initialBrands }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        brand_id: '',
        scooter_model_id: '',
        custom_title: '',
        purchase_price: '',
        expected_sale_price: '',
        actual_sale_price: '',
        sold_at: '',
        purchase_receipt: null as File | null,
        description: '',
        year: '',
        mileage: '',
        color: '',
        kenteken: '',
        status: 'in_reparatie',
        ready_for_sale: false,
        warranty_months: '',
        delivery_service_included: false,
        inspection_points: '',
        review_score: '',
        review_count: '',
    });

    const [localBrands, setLocalBrands] = useState<BrandItem[]>(initialBrands);
    const [newBrand, setNewBrand] = useState('');
    const [newModel, setNewModel] = useState('');
    const [addingBrand, setAddingBrand] = useState(false);
    const [addingModel, setAddingModel] = useState(false);
    const [showExtra, setShowExtra] = useState(false);

    const selectedBrand = localBrands.find((b) => String(b.id) === data.brand_id);
    const availableModels = selectedBrand?.scooter_models ?? [];

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        post('/admin/scooters', { forceFormData: true });
    }

    async function addBrand() {
        if (!newBrand.trim()) return;
        setAddingBrand(true);
        try {
            const res = await fetch('/admin/merken', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrf(),
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ name: newBrand.trim() }),
            });
            const json = await res.json();
            if (json.id) {
                const newEntry: BrandItem = { id: json.id, name: json.name, scooter_models: [] };
                setLocalBrands((prev) => [...prev, newEntry]);
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
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrf(),
                    'Accept': 'application/json',
                },
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

    return (
        <AdminLayout title="Nieuwe scooter toevoegen">
            <Head title="Nieuwe scooter" />

            <div className="max-w-2xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Merk & Model */}
                    <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
                        <h2 className="font-bold text-gray-900 text-lg">Merk & Model</h2>

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
                                    className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100 disabled:text-gray-400"
                                >
                                    <option value="">Selecteer model</option>
                                    {availableModels.map((m) => (
                                        <option key={m.id} value={m.id}>{m.name}</option>
                                    ))}
                                </select>
                                {errors.scooter_model_id && <p className="mt-1 text-red-500 text-xs">{errors.scooter_model_id}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Aparte titel (optioneel)</label>
                            <input
                                type="text"
                                value={data.custom_title}
                                onChange={(e) => setData('custom_title', e.target.value)}
                                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                placeholder="Bijv. BTC Cruise - Technisch top, kapschade"
                            />
                            <p className="mt-1 text-xs text-gray-500">Laat leeg om automatisch merk + model + bouwjaar te tonen.</p>
                            {errors.custom_title && <p className="mt-1 text-red-500 text-xs">{errors.custom_title}</p>}
                        </div>

                        {/* Inline add brand / add model */}
                        <div className="border border-dashed border-gray-200 rounded-xl p-4 space-y-3">
                            <button
                                type="button"
                                onClick={() => setShowExtra((v) => !v)}
                                className="text-xs text-orange-500 hover:text-orange-600 font-medium"
                            >
                                {showExtra ? '▲ Verbergen' : '+ Nieuw merk of model toevoegen'}
                            </button>

                            {showExtra && (
                                <div className="space-y-3 pt-1">
                                    {/* Add brand */}
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
                                        <p className="text-xs text-gray-400 mt-1">Merk wordt direct toegevoegd en geselecteerd.</p>
                                    </div>

                                    {/* Add model — only when a brand is selected */}
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
                                        <p className="text-xs text-gray-400 mt-1">Model wordt direct toegevoegd en geselecteerd.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Financieel */}
                    <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
                        <h2 className="font-bold text-gray-900 text-lg">Financieel</h2>
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
                                    placeholder="75.00"
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
                                    placeholder="250.00"
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
                                    placeholder="(optioneel bij directe verkoop)"
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
                            {errors.purchase_receipt && <p className="mt-1 text-red-500 text-xs">{errors.purchase_receipt}</p>}
                        </div>
                    </div>

                    {/* Details */}
                    <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
                        <h2 className="font-bold text-gray-900 text-lg">Details</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Bouwjaar</label>
                                <input
                                    type="number"
                                    min="1990"
                                    max="2030"
                                    value={data.year}
                                    onChange={(e) => setData('year', e.target.value)}
                                    className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    placeholder="2020"
                                />
                                {errors.year && <p className="mt-1 text-red-500 text-xs">{errors.year}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Kilometerstand</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={data.mileage}
                                    onChange={(e) => setData('mileage', e.target.value)}
                                    className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    placeholder="12000"
                                />
                                {errors.mileage && <p className="mt-1 text-red-500 text-xs">{errors.mileage}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Kleur</label>
                                <input
                                    type="text"
                                    value={data.color}
                                    onChange={(e) => setData('color', e.target.value)}
                                    className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    placeholder="Zwart"
                                />
                                {errors.color && <p className="mt-1 text-red-500 text-xs">{errors.color}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Kenteken</label>
                                <input
                                    type="text"
                                    value={data.kenteken}
                                    onChange={(e) => setData('kenteken', e.target.value.toUpperCase())}
                                    className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    placeholder="AB-12-CD"
                                />
                                {errors.kenteken && <p className="mt-1 text-red-500 text-xs">{errors.kenteken}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Omschrijving</label>
                            <style>{`
                                .scooter-description-editor .prose ul { list-style: disc; padding-left: 1.5rem; margin-bottom: 0.75rem; }
                                .scooter-description-editor .prose ol { list-style: decimal; padding-left: 1.5rem; margin-bottom: 0.75rem; }
                                .scooter-description-editor .prose li { margin-bottom: 0.25rem; color: #374151; }
                                .scooter-description-editor .prose p { margin-bottom: 0.75rem; color: #374151; }
                            `}</style>
                            <div className="scooter-description-editor">
                                <TipTapEditor
                                    value={data.description}
                                    onChange={(html) => setData('description', html)}
                                    placeholder="Beschrijf de scooter met tekst en bullet points..."
                                    spellCheck
                                    language="nl"
                                />
                            </div>
                            {errors.description && <p className="mt-1 text-red-500 text-xs">{errors.description}</p>}
                        </div>
                    </div>

                    {/* Vertrouwen op shop */}
                    <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
                        <h2 className="font-bold text-gray-900 text-lg">Vertrouwen op shop</h2>
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
                                    placeholder="Bijv. 3"
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
                                    placeholder="Bijv. 25"
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
                                    placeholder="Bijv. 4.8"
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
                                    placeholder="Bijv. 42"
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
                                <div className="text-xs text-gray-500">Wordt getoond als trust-signaal op de webshop.</div>
                            </div>
                        </label>
                    </div>

                    {/* Status */}
                    <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
                        <h2 className="font-bold text-gray-900 text-lg">Status & Publicatie</h2>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Status *</label>
                            <select
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value)}
                                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                            >
                                <option value="in_reparatie">In reparatie</option>
                                <option value="te_koop">Te koop</option>
                                <option value="verkocht">Verkocht</option>
                            </select>
                            {errors.status && <p className="mt-1 text-red-500 text-xs">{errors.status}</p>}
                        </div>

                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={data.ready_for_sale}
                                onChange={(e) => setData('ready_for_sale', e.target.checked)}
                                className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                            />
                            <div>
                                <div className="text-sm font-medium text-gray-900">Klaar voor verkoop (zichtbaar op website)</div>
                                <div className="text-xs text-gray-500">Zet dit aan om de scooter op de publieke verkoopsite te tonen.</div>
                            </div>
                        </label>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            type="submit"
                            disabled={processing}
                            className="bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
                        >
                            {processing ? 'Bezig...' : 'Scooter opslaan'}
                        </button>
                        <Link
                            href="/admin/scooters"
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-6 py-3 rounded-xl transition-colors"
                        >
                            Annuleren
                        </Link>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
