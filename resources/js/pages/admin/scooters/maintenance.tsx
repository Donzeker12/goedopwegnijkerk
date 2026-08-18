import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AdminLayout from '../../../layouts/AdminLayout';

type InspectionLine = {
    category: string;
    label: string;
    checked: boolean;
    note: string;
};

interface Props {
    scooter: {
        id: number;
        naam: string;
        kenteken: string | null;
        year: number | null;
    };
    document: {
        certificate_title: string;
        customer_name: string;
        performed_at: string;
        mileage_at_service: string;
        general_note: string;
        last_completed_at: string;
        inspection_lines: InspectionLine[];
    };
}

function formatDate(value: string): string {
    if (!value) {
        return '-';
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return value;
    }

    return parsed.toLocaleDateString('nl-NL');
}

function formatDateTime(value: string): string {
    if (!value) {
        return '-';
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return value;
    }

    return parsed.toLocaleString('nl-NL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function ScooterMaintenance({ scooter, document }: Props) {
    const { props } = usePage<{ flash?: { success?: string } }>();

    const form = useForm({
        certificate_title: document.certificate_title,
        customer_name: document.customer_name,
        performed_at: document.performed_at,
        mileage_at_service: document.mileage_at_service,
        general_note: document.general_note,
        inspection_lines: document.inspection_lines,
    });

    function updateInspectionLine(index: number, key: keyof InspectionLine, value: string | boolean) {
        const next = [...form.data.inspection_lines];
        next[index] = {
            ...next[index],
            [key]: value,
        };
        form.setData('inspection_lines', next);
    }

    function addInspectionLine() {
        form.setData('inspection_lines', [
            ...form.data.inspection_lines,
            { category: 'Overig', label: '', checked: false, note: '' },
        ]);
    }

    function removeInspectionLine(index: number) {
        const next = [...form.data.inspection_lines];
        next.splice(index, 1);
        form.setData('inspection_lines', next.length > 0 ? next : [{ category: 'Overig', label: '', checked: false, note: '' }]);
    }

    function setAllInspectionLinesChecked(checked: boolean) {
        form.setData(
            'inspection_lines',
            form.data.inspection_lines.map((line) => ({
                ...line,
                checked,
            })),
        );
    }

    function save() {
        form.put(`/admin/scooters/${scooter.id}/onderhoudsformulier`, {
            preserveScroll: true,
        });
    }

    function printSheet() {
        window.print();
    }

    const completedCount = form.data.inspection_lines.filter((line) => line.checked).length;

    const groupedLines = form.data.inspection_lines.reduce<Record<string, InspectionLine[]>>((carry, line) => {
        const key = line.category?.trim() || 'Overig';
        if (!carry[key]) {
            carry[key] = [];
        }
        carry[key].push(line);
        return carry;
    }, {});

    return (
        <AdminLayout title={`Onderhoudsformulier: ${scooter.naam}`}>
            <Head title={`Onderhoudsformulier: ${scooter.naam}`} />

            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    body { background: white !important; }
                    .print-container {
                        display: block !important;
                        width: 100% !important;
                        max-width: none !important;
                        min-height: auto !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        box-shadow: none !important;
                        border: 0 !important;
                        border-radius: 0 !important;
                    }
                    @page {
                        size: A4;
                        margin: 6mm;
                    }
                }
            `}</style>

            {props.flash?.success && (
                <div className="no-print mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    {props.flash.success}
                </div>
            )}

            <div className="no-print mb-4 flex flex-wrap gap-2">
                <button
                    type="button"
                    onClick={save}
                    disabled={form.processing}
                    className="w-full rounded-xl bg-orange-500 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60 sm:w-auto"
                >
                    {form.processing ? 'Opslaan...' : 'Onderhoudsformulier opslaan'}
                </button>
                <button
                    type="button"
                    onClick={printSheet}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50 sm:w-auto"
                >
                    Download als PDF / Print
                </button>
                <Link
                    href={`/admin/scooters/${scooter.id}/bewerken`}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50 sm:w-auto"
                >
                    Terug naar scooter
                </Link>
            </div>

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2 no-print mb-6">
                <section className="rounded-2xl border border-gray-200 bg-white p-5">
                    <h2 className="mb-4 text-base font-bold text-gray-900">Formuliergegevens</h2>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">Titel</label>
                            <input
                                value={form.data.certificate_title}
                                onChange={(e) => form.setData('certificate_title', e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                                placeholder="Onderhoud & Service Checklist"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">Klantnaam (optioneel)</label>
                            <input
                                value={form.data.customer_name}
                                onChange={(e) => form.setData('customer_name', e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">Onderhoudsdatum</label>
                            <input
                                type="date"
                                value={form.data.performed_at}
                                onChange={(e) => form.setData('performed_at', e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">Km-stand</label>
                            <input
                                type="number"
                                value={form.data.mileage_at_service}
                                onChange={(e) => form.setData('mileage_at_service', e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                            />
                        </div>
                        <div className="sm:col-span-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-700">
                            <div className="font-semibold">Laatst opgeslagen:</div>
                            <div>{formatDateTime(document.last_completed_at)}</div>
                        </div>
                        <div className="sm:col-span-2">
                            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">Algemene notitie</label>
                            <textarea
                                value={form.data.general_note}
                                onChange={(e) => form.setData('general_note', e.target.value)}
                                className="min-h-20 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                            />
                        </div>
                    </div>
                </section>

                <section className="rounded-2xl border border-gray-200 bg-white p-5">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <div>
                            <h2 className="text-base font-bold text-gray-900">Onderhoud checklist</h2>
                            <p className="mt-1 text-xs text-gray-500">Vink punten af zodra ze zijn uitgevoerd en voeg notities toe waar nodig.</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setAllInspectionLinesChecked(true)}
                                className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                            >
                                Alles afvinken
                            </button>
                            <button
                                type="button"
                                onClick={() => setAllInspectionLinesChecked(false)}
                                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                            >
                                Alles resetten
                            </button>
                            <button
                                type="button"
                                onClick={addInspectionLine}
                                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                            >
                                + Punt toevoegen
                            </button>
                        </div>
                    </div>

                    <div className="mb-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
                        <div className="mb-2 flex items-center justify-between text-xs">
                            <span className="font-semibold uppercase tracking-wide text-gray-500">Voortgang</span>
                            <span className="font-semibold text-gray-700">{completedCount}/{form.data.inspection_lines.length} afgevinkt</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                            <div
                                className="h-full rounded-full bg-emerald-500 transition-all"
                                style={{ width: `${form.data.inspection_lines.length > 0 ? (completedCount / form.data.inspection_lines.length) * 100 : 0}%` }}
                            />
                        </div>
                    </div>

                    <div className="max-h-120 space-y-3 overflow-auto pr-1">
                        {form.data.inspection_lines.map((line, idx) => (
                            <div
                                key={`${idx}-${line.label}`}
                                className={`rounded-xl border p-3 shadow-sm transition-colors ${line.checked ? 'border-emerald-200 bg-emerald-50/50' : 'border-gray-200 bg-white'}`}
                            >
                                <div className="mb-2 flex flex-wrap items-center gap-2">
                                    <span className="inline-flex min-w-7 items-center justify-center rounded-full bg-gray-100 px-2 py-1 text-[11px] font-semibold text-gray-600">
                                        #{idx + 1}
                                    </span>
                                    <label className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs font-semibold text-gray-700">
                                        <input
                                            type="checkbox"
                                            checked={line.checked}
                                            onChange={(e) => updateInspectionLine(idx, 'checked', e.target.checked)}
                                            className="h-4 w-4 rounded border-gray-300 text-orange-500"
                                        />
                                        {line.checked ? 'Afgevinkt' : 'Open'}
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => removeInspectionLine(idx)}
                                        className="ml-auto rounded-md bg-red-50 px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-100"
                                    >
                                        Verwijder
                                    </button>
                                </div>

                                <input
                                    value={line.category}
                                    onChange={(e) => updateInspectionLine(idx, 'category', e.target.value)}
                                    className="mb-2 w-full rounded-lg border border-gray-300 px-2.5 py-2 text-xs"
                                    placeholder="Categorie"
                                />
                                <input
                                    value={line.label}
                                    onChange={(e) => updateInspectionLine(idx, 'label', e.target.value)}
                                    className="mb-2 w-full rounded-lg border border-gray-300 px-2.5 py-2 text-sm"
                                    placeholder="Controlepunt"
                                />
                                <input
                                    value={line.note}
                                    onChange={(e) => updateInspectionLine(idx, 'note', e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-2.5 py-2 text-xs"
                                    placeholder="Optionele notitie"
                                />
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            <section className="print-container mx-auto w-full max-w-4xl overflow-x-hidden rounded-2xl border border-gray-300 bg-white p-4 shadow-sm sm:p-8">
                <header className="border-b border-gray-200 pb-4 print:pb-2">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-600">Goed Op Weg Nijkerk</div>
                            <h1 className="mt-1 wrap-break-word text-xl font-black text-gray-900 sm:text-2xl">{form.data.certificate_title || 'Onderhoud & Service Checklist'}</h1>
                            <p className="mt-1 text-sm text-gray-600">Scooter: {scooter.naam}</p>
                        </div>
                        <img
                            src="/brand-logo.png"
                            alt="Goed Op Weg Nijkerk"
                            className="h-12 w-auto shrink-0 object-contain sm:h-14"
                        />
                    </div>
                </header>

                <div className="mt-5 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2 print:mt-3 print:gap-2 print:text-xs">
                    <div><span className="font-semibold text-gray-700">Klant:</span> {form.data.customer_name || '-'}</div>
                    <div><span className="font-semibold text-gray-700">Kenteken:</span> {scooter.kenteken || '-'}</div>
                    <div><span className="font-semibold text-gray-700">Onderhoudsdatum:</span> {formatDate(form.data.performed_at)}</div>
                    <div><span className="font-semibold text-gray-700">Km-stand bij onderhoud:</span> {form.data.mileage_at_service || '-'}</div>
                    <div><span className="font-semibold text-gray-700">Ingevuld op:</span> {formatDateTime(document.last_completed_at)}</div>
                </div>

                <div className="mt-6 print:mt-3">
                    <h2 className="text-base font-bold text-gray-900">Checklist ({completedCount}/{form.data.inspection_lines.length} afgevinkt)</h2>

                    <div className="mt-3 space-y-3">
                        {Object.entries(groupedLines).map(([category, lines]) => (
                            <div key={category} className="overflow-hidden rounded-lg border border-gray-200">
                                <div className="bg-gray-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-600">
                                    {category}
                                </div>
                                <table className="w-full table-fixed text-sm print:text-xs">
                                    <thead className="bg-white text-gray-500">
                                        <tr>
                                            <th className="w-12 px-3 py-2 text-left print:py-1">OK</th>
                                            <th className="px-3 py-2 text-left print:py-1">Punt</th>
                                            <th className="px-3 py-2 text-left print:py-1">Notitie</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {lines.map((line, idx) => (
                                            <tr key={`${category}-${idx}`} className="border-t border-gray-100">
                                                <td className="px-3 py-2 font-bold text-gray-800 print:py-1">{line.checked ? '✓' : '□'}</td>
                                                <td className="px-3 py-2 wrap-break-word text-gray-800 print:py-1">{line.label || '-'}</td>
                                                <td className="px-3 py-2 wrap-break-word text-gray-600 print:py-1">{line.note || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-6 rounded-lg bg-gray-50 p-3 text-sm text-gray-700 print:mt-3 print:p-2 print:text-xs">
                    <div className="font-semibold text-gray-800">Algemene notitie</div>
                    <p className="mt-1 whitespace-pre-line">{form.data.general_note || 'Geen extra notities.'}</p>
                </div>


            </section>
        </AdminLayout>
    );
}
