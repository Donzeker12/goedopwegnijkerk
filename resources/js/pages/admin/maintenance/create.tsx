import { Head, Link, useForm } from '@inertiajs/react';
import { type FormEvent } from 'react';
import AdminLayout from '../../../layouts/AdminLayout';

export default function MaintenanceCreate() {
    const form = useForm({
        service_type: 'kleine_beurt' as 'grote_beurt' | 'kleine_beurt' | 'reparatie',
        customer_name: '',
        customer_phone: '',
        customer_email: '',
        customer_address: '',
        scooter_brand: '',
        scooter_model: '',
        license_plate: '',
        mileage: '',
        performed_at: new Date().toISOString().slice(0, 10),
        complaint: '',
    });

    function submit(event: FormEvent) {
        event.preventDefault();
        form.post('/admin/onderhoud/scooter');
    }

    return (
        <AdminLayout title="Nieuwe onderhoudsopdracht">
            <Head title="Nieuwe onderhoudsopdracht" />

            <form onSubmit={submit} className="max-w-2xl space-y-5">
                <div className="rounded-2xl border border-gray-200 bg-white p-5">
                    <h2 className="mb-3 text-base font-bold text-gray-900">Type opdracht</h2>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <button
                            type="button"
                            onClick={() => form.setData('service_type', 'kleine_beurt')}
                            className={`rounded-xl border-2 px-4 py-4 text-left transition-colors ${
                                form.data.service_type === 'kleine_beurt'
                                    ? 'border-orange-500 bg-orange-50'
                                    : 'border-gray-200 bg-white hover:border-gray-300'
                            }`}
                        >
                            <div className="font-bold text-gray-900">Kleine beurt</div>
                            <div className="mt-1 text-xs text-gray-600">Basis onderhoud: olie, remmen, banden, verlichting.</div>
                        </button>
                        <button
                            type="button"
                            onClick={() => form.setData('service_type', 'grote_beurt')}
                            className={`rounded-xl border-2 px-4 py-4 text-left transition-colors ${
                                form.data.service_type === 'grote_beurt'
                                    ? 'border-orange-500 bg-orange-50'
                                    : 'border-gray-200 bg-white hover:border-gray-300'
                            }`}
                        >
                            <div className="font-bold text-gray-900">Grote beurt</div>
                            <div className="mt-1 text-xs text-gray-600">Volledige servicebeurt: motor, transmissie, elektronica.</div>
                        </button>
                        <button
                            type="button"
                            onClick={() => form.setData('service_type', 'reparatie')}
                            className={`rounded-xl border-2 px-4 py-4 text-left transition-colors ${
                                form.data.service_type === 'reparatie'
                                    ? 'border-orange-500 bg-orange-50'
                                    : 'border-gray-200 bg-white hover:border-gray-300'
                            }`}
                        >
                            <div className="font-bold text-gray-900">Reparatie</div>
                            <div className="mt-1 text-xs text-gray-600">Scooter werkt niet goed of is stuk, geen standaard beurt.</div>
                        </button>
                    </div>
                    {form.errors.service_type && <p className="mt-2 text-xs text-red-600">{form.errors.service_type}</p>}

                    {form.data.service_type === 'reparatie' && (
                        <div className="mt-4">
                            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">Klacht van klant</label>
                            <textarea
                                value={form.data.complaint}
                                onChange={(e) => form.setData('complaint', e.target.value)}
                                placeholder="Bijv. scooter start niet meer, remt slecht, knippert..."
                                className="min-h-20 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                            />
                        </div>
                    )}
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-5">
                    <h2 className="mb-3 text-base font-bold text-gray-900">Klantgegevens</h2>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">Naam klant *</label>
                            <input
                                value={form.data.customer_name}
                                onChange={(e) => form.setData('customer_name', e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                                required
                            />
                            {form.errors.customer_name && <p className="mt-1 text-xs text-red-600">{form.errors.customer_name}</p>}
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">Telefoon</label>
                            <input
                                value={form.data.customer_phone}
                                onChange={(e) => form.setData('customer_phone', e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">E-mail</label>
                            <input
                                type="email"
                                value={form.data.customer_email}
                                onChange={(e) => form.setData('customer_email', e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">Adres</label>
                            <input
                                value={form.data.customer_address}
                                onChange={(e) => form.setData('customer_address', e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                            />
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-5">
                    <h2 className="mb-3 text-base font-bold text-gray-900">Scootergegevens</h2>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">Merk</label>
                            <input
                                value={form.data.scooter_brand}
                                onChange={(e) => form.setData('scooter_brand', e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">Model</label>
                            <input
                                value={form.data.scooter_model}
                                onChange={(e) => form.setData('scooter_model', e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">Kenteken</label>
                            <input
                                value={form.data.license_plate}
                                onChange={(e) => form.setData('license_plate', e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">Km-stand</label>
                            <input
                                type="number"
                                value={form.data.mileage}
                                onChange={(e) => form.setData('mileage', e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">Datum onderhoud</label>
                            <input
                                type="date"
                                value={form.data.performed_at}
                                onChange={(e) => form.setData('performed_at', e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    <button
                        type="submit"
                        disabled={form.processing}
                        className="rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
                    >
                        {form.processing ? 'Aanmaken...' : 'Aanmaken en checklist openen'}
                    </button>
                    <Link
                        href="/admin/onderhoud/scooter"
                        className="rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                    >
                        Annuleren
                    </Link>
                </div>
            </form>
        </AdminLayout>
    );
}
