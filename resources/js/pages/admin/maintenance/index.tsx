import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../../../layouts/AdminLayout';

interface JobRow {
    id: number;
    invoice_number: string;
    service_type: 'grote_beurt' | 'kleine_beurt' | 'reparatie';
    status: 'open' | 'bezig' | 'afgerond';
    customer_name: string;
    scooter_brand: string | null;
    scooter_model: string | null;
    license_plate: string | null;
    performed_at: string | null;
    total_amount: number;
    parts_cost: number;
    profit: number;
}

interface Summary {
    total: number;
    open: number;
    in_progress: number;
    done: number;
    revenue_total: number;
    costs_total: number;
    profit_total: number;
}

interface Props {
    jobs: JobRow[];
    summary: Summary;
}

const serviceLabel: Record<JobRow['service_type'], string> = {
    grote_beurt: 'Grote beurt',
    kleine_beurt: 'Kleine beurt',
    reparatie: 'Reparatie',
};

const statusLabel: Record<JobRow['status'], string> = {
    open: 'Open',
    bezig: 'Bezig',
    afgerond: 'Afgerond',
};

const statusBadgeClass: Record<JobRow['status'], string> = {
    open: 'bg-amber-100 text-amber-700',
    bezig: 'bg-blue-100 text-blue-700',
    afgerond: 'bg-emerald-100 text-emerald-700',
};

function euro(amount: number): string {
    return `€${amount.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function MaintenanceIndex({ jobs, summary }: Props) {
    function destroyJob(job: JobRow) {
        if (!window.confirm(`Onderhoudsopdracht ${job.invoice_number} verwijderen?`)) {
            return;
        }

        router.delete(`/admin/onderhoud/scooter/${job.id}`);
    }

    return (
        <AdminLayout title="Onderhoud: Scooter">
            <Head title="Onderhoud - Scooter" />

            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 flex-1">
                    <div className="rounded-2xl border border-gray-200 bg-white p-4">
                        <div className="text-xs text-gray-500">Totaal</div>
                        <div className="text-2xl font-black text-gray-900 mt-1">{summary.total}</div>
                    </div>
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                        <div className="text-xs text-amber-700">Open</div>
                        <div className="text-2xl font-black text-amber-800 mt-1">{summary.open}</div>
                    </div>
                    <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
                        <div className="text-xs text-blue-700">Bezig</div>
                        <div className="text-2xl font-black text-blue-800 mt-1">{summary.in_progress}</div>
                    </div>
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                        <div className="text-xs text-emerald-700">Omzet totaal</div>
                        <div className="text-2xl font-black text-emerald-800 mt-1">{euro(summary.revenue_total)}</div>
                    </div>
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                        <div className="text-xs text-red-700">Onderdelenkosten</div>
                        <div className="text-2xl font-black text-red-800 mt-1">{euro(summary.costs_total)}</div>
                    </div>
                    <div className="rounded-2xl border border-teal-200 bg-teal-50 p-4">
                        <div className="text-xs text-teal-700">Winst totaal</div>
                        <div className="text-2xl font-black text-teal-800 mt-1">{euro(summary.profit_total)}</div>
                    </div>
                </div>
            </div>

            <div className="mb-4">
                <Link
                    href="/admin/onderhoud/scooter/nieuw"
                    className="inline-flex items-center justify-center rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600"
                >
                    + Nieuwe onderhoudsopdracht
                </Link>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="px-4 sm:px-6 py-4 border-b border-gray-100">
                    <h2 className="font-bold text-gray-900">Onderhoudsopdrachten scooters</h2>
                </div>

                {jobs.length === 0 ? (
                    <p className="p-6 text-sm text-gray-500">Nog geen onderhoudsopdrachten aangemaakt.</p>
                ) : (
                    <>
                        <div className="md:hidden divide-y divide-gray-100">
                            {jobs.map((job) => (
                                <article key={job.id} className="p-4 space-y-2">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <div className="font-semibold text-gray-900">{job.customer_name}</div>
                                            <div className="text-xs text-gray-500">{job.invoice_number}</div>
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded-full font-semibold ${statusBadgeClass[job.status]}`}>
                                            {statusLabel[job.status]}
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-700">
                                        {serviceLabel[job.service_type]}
                                        {job.scooter_brand || job.scooter_model ? ` • ${job.scooter_brand ?? ''} ${job.scooter_model ?? ''}`.trim() : ''}
                                        {job.license_plate ? ` • ${job.license_plate}` : ''}
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-500">{job.performed_at ?? '-'}</span>
                                        <span className="font-bold text-gray-900">{euro(job.total_amount)}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-gray-500">Onderdelenkosten: {euro(job.parts_cost)}</span>
                                        <span className="font-semibold text-teal-700">Winst: {euro(job.profit)}</span>
                                    </div>
                                    <div className="flex gap-2 pt-1">
                                        <Link
                                            href={`/admin/onderhoud/scooter/${job.id}/bewerken`}
                                            className="flex-1 text-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                                        >
                                            Bewerken / Factuur
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={() => destroyJob(job)}
                                            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100"
                                        >
                                            Verwijder
                                        </button>
                                    </div>
                                </article>
                            ))}
                        </div>

                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 text-gray-600 text-xs">
                                    <tr>
                                        <th className="text-left px-4 py-2 font-semibold">Factuurnr.</th>
                                        <th className="text-left px-4 py-2 font-semibold">Klant</th>
                                        <th className="text-left px-4 py-2 font-semibold">Scooter</th>
                                        <th className="text-left px-4 py-2 font-semibold">Type</th>
                                        <th className="text-left px-4 py-2 font-semibold">Datum</th>
                                        <th className="text-left px-4 py-2 font-semibold">Status</th>
                                        <th className="text-right px-4 py-2 font-semibold">Totaal</th>
                                        <th className="text-right px-4 py-2 font-semibold">Winst</th>
                                        <th className="text-right px-4 py-2 font-semibold">Actie</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {jobs.map((job) => (
                                        <tr key={job.id}>
                                            <td className="px-4 py-2 text-gray-700">{job.invoice_number}</td>
                                            <td className="px-4 py-2 font-medium text-gray-900">{job.customer_name}</td>
                                            <td className="px-4 py-2 text-gray-700">
                                                {[job.scooter_brand, job.scooter_model].filter(Boolean).join(' ') || '-'}
                                                {job.license_plate ? ` (${job.license_plate})` : ''}
                                            </td>
                                            <td className="px-4 py-2 text-gray-700">{serviceLabel[job.service_type]}</td>
                                            <td className="px-4 py-2 text-gray-700">{job.performed_at ?? '-'}</td>
                                            <td className="px-4 py-2">
                                                <span className={`text-xs px-2 py-1 rounded-full font-semibold ${statusBadgeClass[job.status]}`}>
                                                    {statusLabel[job.status]}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2 text-right font-semibold text-gray-900">{euro(job.total_amount)}</td>
                                            <td className="px-4 py-2 text-right font-semibold text-teal-700">{euro(job.profit)}</td>
                                            <td className="px-4 py-2 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Link
                                                        href={`/admin/onderhoud/scooter/${job.id}/bewerken`}
                                                        className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                                                    >
                                                        Bewerken / Factuur
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        onClick={() => destroyJob(job)}
                                                        className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
                                                    >
                                                        Verwijder
                                                    </button>
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
        </AdminLayout>
    );
}
