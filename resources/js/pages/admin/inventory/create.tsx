import { Head, Link, useForm } from '@inertiajs/react';
import { type FormEvent } from 'react';
import AdminLayout from '../../../layouts/AdminLayout';

interface ScooterOption {
    id: number;
    naam: string;
}

interface Props {
    scooters: ScooterOption[];
}

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

export default function InventoryCreate({ scooters }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        part_brand: '',
        category: 'Overig',
        quantity: '1',
        minimum_stock: '0',
        cost: '',
        procurement_status: 'binnen' as 'nodig' | 'besteld' | 'binnen' | 'geplaatst',
        scooter_id: '',
    });

    function submit(e: FormEvent) {
        e.preventDefault();

        post('/admin/voorraad/producten');
    }

    const supplierValue = supplierOptions.includes(data.part_brand) ? data.part_brand : data.part_brand ? '__custom__' : '';

    return (
        <AdminLayout title="Product toevoegen aan voorraad">
            <Head title="Product toevoegen aan voorraad" />

            <form onSubmit={submit} className="mx-auto max-w-3xl space-y-5">
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <h2 className="mb-4 text-base font-bold text-gray-900">Nieuw voorraadproduct</h2>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">Productnaam *</label>
                            <input
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                                placeholder="Bijv. Bougie NGK C7HSA"
                            />
                            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">Winkel / leverancier</label>
                            <select
                                value={supplierValue}
                                onChange={(e) => {
                                    if (e.target.value === '__custom__') {
                                        setData('part_brand', '');
                                        return;
                                    }

                                    setData('part_brand', e.target.value);
                                }}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                            >
                                <option value="">— Kies winkel —</option>
                                {supplierOptions.map((supplier) => (
                                    <option key={supplier} value={supplier}>{supplier}</option>
                                ))}
                                <option value="__custom__">Anders...</option>
                            </select>
                            {supplierValue === '__custom__' && (
                                <input
                                    value={data.part_brand}
                                    onChange={(e) => setData('part_brand', e.target.value)}
                                    className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                                    placeholder="Typ winkelnaam"
                                />
                            )}
                            {errors.part_brand && <p className="mt-1 text-xs text-red-600">{errors.part_brand}</p>}
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">Categorie</label>
                            <select
                                value={data.category}
                                onChange={(e) => setData('category', e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                            >
                                {categoryOptions.map((category) => (
                                    <option key={category} value={category}>{category}</option>
                                ))}
                            </select>
                            {errors.category && <p className="mt-1 text-xs text-red-600">{errors.category}</p>}
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">Aantal *</label>
                            <input
                                type="number"
                                min="0"
                                step="1"
                                value={data.quantity}
                                onChange={(e) => setData('quantity', e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                            />
                            {errors.quantity && <p className="mt-1 text-xs text-red-600">{errors.quantity}</p>}
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">Minimumvoorraad</label>
                            <input
                                type="number"
                                min="0"
                                step="1"
                                value={data.minimum_stock}
                                onChange={(e) => setData('minimum_stock', e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                            />
                            {errors.minimum_stock && <p className="mt-1 text-xs text-red-600">{errors.minimum_stock}</p>}
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">Prijs per stuk (€) *</label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={data.cost}
                                onChange={(e) => setData('cost', e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                                placeholder="Bijv. 24.95"
                            />
                            {errors.cost && <p className="mt-1 text-xs text-red-600">{errors.cost}</p>}
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">Status *</label>
                            <select
                                value={data.procurement_status}
                                onChange={(e) => setData('procurement_status', e.target.value as 'nodig' | 'besteld' | 'binnen' | 'geplaatst')}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                            >
                                <option value="nodig">Nodig</option>
                                <option value="besteld">Besteld</option>
                                <option value="binnen">Binnen (op voorraad)</option>
                                <option value="geplaatst">Geplaatst</option>
                            </select>
                            {errors.procurement_status && <p className="mt-1 text-xs text-red-600">{errors.procurement_status}</p>}
                        </div>

                        <div className="sm:col-span-2">
                            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">Scooter koppeling (optioneel)</label>
                            <select
                                value={data.scooter_id}
                                onChange={(e) => setData('scooter_id', e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                            >
                                <option value="">Geen koppeling (pure voorraad)</option>
                                {scooters.map((scooter) => (
                                    <option key={scooter.id} value={scooter.id}>{scooter.naam}</option>
                                ))}
                            </select>
                            {errors.scooter_id && <p className="mt-1 text-xs text-red-600">{errors.scooter_id}</p>}
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="submit"
                        disabled={processing}
                        className="rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
                    >
                        {processing ? 'Opslaan...' : 'Product toevoegen'}
                    </button>
                    <Link
                        href="/admin/voorraad"
                        className="rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                    >
                        Terug naar voorraad
                    </Link>
                </div>
            </form>
        </AdminLayout>
    );
}
