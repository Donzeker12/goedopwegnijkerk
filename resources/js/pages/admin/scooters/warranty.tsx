import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AdminLayout from '../../../layouts/AdminLayout';

type InspectionLine = {
    label: string;
    checked: boolean;
    note: string;
};

const FREE_CHECKUP_TEXT = 'Inclusief 1 gratis nacontrolebeurt. Adviesmoment: rond 3.000 tot 5.000 kilometer, of uiterlijk binnen 1 jaar na aflevering.';
const WARRANTY_MONTHS_LIMIT = 3;
const WARRANTY_KM_LIMIT = 2500;

const WARRANTY_STATUS_STYLES: Record<string, string> = {
    active: 'bg-emerald-100 text-emerald-700',
    checkup_planned: 'bg-sky-100 text-sky-700',
    checkup_done: 'bg-indigo-100 text-indigo-700',
    expired: 'bg-gray-200 text-gray-700',
};

interface Props {
    scooter: {
        id: number;
        naam: string;
        kenteken: string | null;
        year: number | null;
        warranty_months: number | null;
        delivery_service_included: boolean;
        inspection_points: number | null;
        warranty_status: {
            key: string;
            label: string;
        };
    };
    document: {
        certificate_title: string;
        customer_name: string;
        customer_phone: string;
        customer_email: string;
        delivery_date: string;
        mileage_at_delivery: string;
        free_checkup_included: boolean;
        first_checkup_planned: boolean;
        first_checkup_completed: boolean;
        general_note: string;
        inspection_lines: InspectionLine[];
    };
    placed_parts: {
        name: string;
        specification: string;
        quantity: number;
        placed_at: string | null;
    }[];
}

export default function ScooterWarranty({ scooter, document, placed_parts }: Props) {
    const { props } = usePage<{ flash?: { success?: string } }>();

    const form = useForm({
        certificate_title: document.certificate_title,
        customer_name: document.customer_name,
        customer_phone: document.customer_phone,
        customer_email: document.customer_email,
        delivery_date: document.delivery_date,
        mileage_at_delivery: document.mileage_at_delivery,
        free_checkup_included: document.free_checkup_included,
        first_checkup_planned: document.first_checkup_planned,
        first_checkup_completed: document.first_checkup_completed,
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
            { label: '', checked: false, note: '' },
        ]);
    }

    function removeInspectionLine(index: number) {
        const next = [...form.data.inspection_lines];
        next.splice(index, 1);
        form.setData('inspection_lines', next.length > 0 ? next : [{ label: '', checked: false, note: '' }]);
    }

    function setAllInspectionLinesChecked(checked: boolean) {
        const next = form.data.inspection_lines.map((line) => ({
            ...line,
            checked,
        }));
        form.setData('inspection_lines', next);
    }

    function save() {
        form.put(`/admin/scooters/${scooter.id}/garantieblad`, {
            preserveScroll: true,
        });
    }

    function printSheet() {
        window.print();
    }

    function formatDate(value: Date) {
        return value.toLocaleDateString('nl-NL');
    }

    const completedCount = form.data.inspection_lines.filter((line) => line.checked).length;
    const mileageAtDelivery = Number.parseInt(form.data.mileage_at_delivery, 10);
    const mileageLimitEnd = Number.isFinite(mileageAtDelivery) ? mileageAtDelivery + WARRANTY_KM_LIMIT : null;

    const dateLimitEnd = (() => {
        if (!form.data.delivery_date) {
            return null;
        }

        const baseDate = new Date(`${form.data.delivery_date}T00:00:00`);
        if (Number.isNaN(baseDate.getTime())) {
            return null;
        }

        const expiry = new Date(baseDate);
        expiry.setMonth(expiry.getMonth() + WARRANTY_MONTHS_LIMIT);

        return formatDate(expiry);
    })();

    return (
        <AdminLayout title={`Garantieblad: ${scooter.naam}`}>
            <Head title={`Garantieblad: ${scooter.naam}`} />

            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    body { background: white !important; }
                    .print-container {
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
                    {form.processing ? 'Opslaan...' : 'Garantieblad opslaan'}
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

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 no-print mb-6">
                <section className="rounded-2xl border border-gray-200 bg-white p-5">
                    <h2 className="mb-4 text-base font-bold text-gray-900">In te vullen gegevens</h2>

                    <div className="mb-4 flex flex-wrap items-center gap-2">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${WARRANTY_STATUS_STYLES[scooter.warranty_status.key] ?? 'bg-gray-100 text-gray-700'}`}>
                            {scooter.warranty_status.label}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="sm:col-span-2">
                            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">Titel</label>
                            <input
                                value={form.data.certificate_title}
                                onChange={(e) => form.setData('certificate_title', e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                                placeholder="Garantie & Service Controleblad"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">Klantnaam</label>
                            <input
                                value={form.data.customer_name}
                                onChange={(e) => form.setData('customer_name', e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                            />
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
                                value={form.data.customer_email}
                                onChange={(e) => form.setData('customer_email', e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">Afleverdatum</label>
                            <input
                                type="date"
                                value={form.data.delivery_date}
                                onChange={(e) => form.setData('delivery_date', e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">Km-stand bij aflevering</label>
                            <input
                                type="number"
                                value={form.data.mileage_at_delivery}
                                onChange={(e) => form.setData('mileage_at_delivery', e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                            />
                        </div>
                        <div className="rounded-lg border border-orange-200 bg-orange-50 px-3 py-2.5 text-sm text-orange-900">
                            <div className="font-semibold">Garantiegrens (vast)</div>
                            <div className="mt-1">{WARRANTY_MONTHS_LIMIT} maanden of {WARRANTY_KM_LIMIT} km, afhankelijk van wat het eerst wordt bereikt.</div>
                            <div className="mt-1 text-xs text-orange-800">Start op afleverdatum van dit document.</div>
                        </div>
                        <div className="sm:col-span-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5">
                            <label className="flex items-start gap-2 text-sm text-gray-800">
                                <input
                                    type="checkbox"
                                    checked={form.data.free_checkup_included}
                                    onChange={(e) => form.setData('free_checkup_included', e.target.checked)}
                                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-orange-500"
                                />
                                <span>Gratis nacontrole opnemen op dit formulier</span>
                            </label>
                            <p className="mt-2 text-xs text-gray-600">{FREE_CHECKUP_TEXT}</p>
                        </div>
                        <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <label className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800">
                                <input
                                    type="checkbox"
                                    checked={form.data.first_checkup_planned}
                                    onChange={(e) => {
                                        const checked = e.target.checked;
                                        form.setData('first_checkup_planned', checked);
                                        if (!checked) {
                                            form.setData('first_checkup_completed', false);
                                        }
                                    }}
                                    className="h-4 w-4 rounded border-gray-300 text-orange-500"
                                />
                                <span>Eerste nacontrole gepland</span>
                            </label>
                            <label className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800">
                                <input
                                    type="checkbox"
                                    checked={form.data.first_checkup_completed}
                                    onChange={(e) => {
                                        const checked = e.target.checked;
                                        form.setData('first_checkup_completed', checked);
                                        if (checked) {
                                            form.setData('first_checkup_planned', true);
                                        }
                                    }}
                                    className="h-4 w-4 rounded border-gray-300 text-orange-500"
                                />
                                <span>Nacontrole uitgevoerd</span>
                            </label>
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
                            <h2 className="text-base font-bold text-gray-900">Checklist punten</h2>
                            <p className="mt-1 text-xs text-gray-500">Tik op een kaart om snel punt, status en notitie bij te werken.</p>
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

                    <div className="space-y-3 max-h-105 overflow-auto pr-1">
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
                            <h1 className="mt-1 wrap-break-word text-xl font-black text-gray-900 sm:text-2xl">{form.data.certificate_title || 'Garantie & Service Controleblad'}</h1>
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
                    <div><span className="font-semibold text-gray-700">Telefoon:</span> {form.data.customer_phone || '-'}</div>
                    <div><span className="font-semibold text-gray-700">E-mail:</span> {form.data.customer_email || '-'}</div>
                    <div><span className="font-semibold text-gray-700">Kenteken:</span> {scooter.kenteken || '-'}</div>
                    <div><span className="font-semibold text-gray-700">Afleverdatum:</span> {form.data.delivery_date || '-'}</div>
                    <div><span className="font-semibold text-gray-700">Km-stand bij aflevering:</span> {form.data.mileage_at_delivery || '-'}</div>
                    <div><span className="font-semibold text-gray-700">Garantie:</span> {WARRANTY_MONTHS_LIMIT} maanden of {WARRANTY_KM_LIMIT} km (eerst bereikt)</div>
                    <div><span className="font-semibold text-gray-700">Geldig tot datum:</span> {dateLimitEnd || '-'}</div>
                    <div><span className="font-semibold text-gray-700">Geldig tot km-stand:</span> {mileageLimitEnd !== null ? `${mileageLimitEnd} km` : '-'}</div>
                </div>

                <div className="mt-4 rounded-lg border border-sky-200 bg-sky-50 px-3 py-3 text-sm text-sky-900 print:mt-2 print:py-2 print:text-xs">
                    <div className="font-semibold">Geplaatste onderdelen bij aflevering</div>
                    {placed_parts.length === 0 ? (
                        <p className="mt-1 text-sky-800">Geen extra onderdelen geregistreerd als geplaatst.</p>
                    ) : (
                        <ul className="mt-2 list-disc space-y-1 pl-5 text-sky-800">
                            {placed_parts.map((part, idx) => (
                                <li key={`${part.name}-${idx}`}>
                                    {part.quantity}x {part.name}
                                    {part.specification ? ` (${part.specification})` : ''}
                                    {part.placed_at ? ` - geplaatst op ${part.placed_at}` : ''}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {form.data.free_checkup_included && (
                    <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 print:mt-2 print:py-1.5 print:text-xs">
                        <span className="font-semibold">✓ Gratis nacontrole:</span>{' '}
                        {FREE_CHECKUP_TEXT}
                    </div>
                )}

                <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-900 print:mt-2 print:py-2 print:text-xs">
                    <div className="font-semibold">Wat valt niet onder garantie</div>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-amber-800">
                        <li>Normale slijtage van verbruiksdelen.</li>
                        <li>Schade door vallen, aanrijding of waterschade.</li>
                        <li>Schade door onjuist gebruik of achterstallig onderhoud.</li>
                    </ul>
                </div>

                <div className="mt-6 print:mt-3">
                    <h2 className="text-base font-bold text-gray-900">Controlepunten ({completedCount}/{form.data.inspection_lines.length} afgevinkt)</h2>
                    <div className="mt-2 space-y-2 sm:hidden">
                        {form.data.inspection_lines.map((line, idx) => (
                            <div
                                key={`mobile-print-${idx}`}
                                className={`rounded-lg border px-3 py-2 ${line.checked ? 'border-emerald-200 bg-emerald-50/60' : 'border-gray-200 bg-white'}`}
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Controlepunt</div>
                                    <div className={`text-sm font-bold ${line.checked ? 'text-emerald-700' : 'text-gray-800'}`}>{line.checked ? '✓' : '□'}</div>
                                </div>
                                <div className="mt-1 wrap-break-word text-sm text-gray-800">{line.label || '-'}</div>
                                <div className="mt-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Notitie</div>
                                <div className="mt-1 wrap-break-word text-xs text-gray-600">{line.note || '-'}</div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-2 hidden overflow-hidden rounded-lg border border-gray-200 sm:block">
                        <table className="w-full table-fixed text-sm print:text-xs">
                            <thead className="bg-gray-50 text-gray-600">
                                <tr>
                                    <th className="px-3 py-2 text-left w-12 print:py-1">OK</th>
                                    <th className="px-3 py-2 text-left print:py-1">Punt</th>
                                    <th className="px-3 py-2 text-left print:py-1">Notitie</th>
                                </tr>
                            </thead>
                            <tbody>
                                {form.data.inspection_lines.map((line, idx) => (
                                    <tr key={`print-${idx}`} className="border-t border-gray-100">
                                        <td className="px-3 py-2 font-bold text-gray-800 print:py-1">{line.checked ? '✓' : '□'}</td>
                                        <td className="px-3 py-2 wrap-break-word text-gray-800 print:py-1">{line.label || '-'}</td>
                                        <td className="px-3 py-2 wrap-break-word text-gray-600 print:py-1">{line.note || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
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
