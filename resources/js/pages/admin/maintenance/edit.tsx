import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { type ChangeEvent, type KeyboardEvent } from 'react';
import AdminLayout from '../../../layouts/AdminLayout';

type ChecklistLine = {
    category: string;
    label: string;
    checked: boolean;
    note: string;
};

type PartLine = {
    description: string;
    quantity: number | string;
    unit_price: number | string;
};

interface Props {
    product_templates: {
        id: number;
        name: string;
        part_brand: string | null;
        specification: string | null;
        category: string | null;
        cost: number;
        stock_quantity: number;
    }[];
    job: {
        id: number;
        invoice_number: string;
        service_type: 'grote_beurt' | 'kleine_beurt';
        status: 'open' | 'bezig' | 'afgerond';
        customer_name: string;
        customer_phone: string;
        customer_email: string;
        customer_address: string;
        scooter_brand: string;
        scooter_model: string;
        license_plate: string;
        mileage: number | null;
        performed_at: string;
        checklist: ChecklistLine[];
        parts: PartLine[];
        labor_cost: number;
        vat_rate: number;
        notes: string;
        parts_total: number;
        subtotal: number;
        vat_amount: number;
        total_amount: number;
    };
}

const serviceLabel: Record<Props['job']['service_type'], string> = {
    grote_beurt: 'Grote beurt',
    kleine_beurt: 'Kleine beurt',
};

function euro(amount: number): string {
    return `€${amount.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(value: string): string {
    if (!value) return '-';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toLocaleDateString('nl-NL');
}

function toNumber(value: number | string): number {
    const parsed = typeof value === 'number' ? value : parseFloat(value.replace(',', '.'));
    return Number.isFinite(parsed) ? parsed : 0;
}

export default function MaintenanceEdit({ job, product_templates }: Props) {
    const { props } = usePage<{ flash?: { success?: string } }>();

    const form = useForm({
        service_type: job.service_type,
        status: job.status,
        customer_name: job.customer_name,
        customer_phone: job.customer_phone,
        customer_email: job.customer_email,
        customer_address: job.customer_address,
        scooter_brand: job.scooter_brand,
        scooter_model: job.scooter_model,
        license_plate: job.license_plate,
        mileage: job.mileage !== null ? String(job.mileage) : '',
        performed_at: job.performed_at,
        checklist: job.checklist,
        parts: job.parts as PartLine[],
        labor_cost: String(job.labor_cost),
        vat_rate: String(job.vat_rate),
        notes: job.notes,
    });

    function updateChecklistLine(index: number, key: keyof ChecklistLine, value: string | boolean) {
        const next = [...form.data.checklist];
        next[index] = { ...next[index], [key]: value };
        form.setData('checklist', next);
    }

    function addChecklistLine() {
        form.setData('checklist', [...form.data.checklist, { category: 'Overig', label: '', checked: false, note: '' }]);
    }

    function removeChecklistLine(index: number) {
        const next = [...form.data.checklist];
        next.splice(index, 1);
        form.setData('checklist', next.length > 0 ? next : [{ category: 'Overig', label: '', checked: false, note: '' }]);
    }

    function updatePartLine(index: number, key: keyof PartLine, value: string) {
        const next = [...form.data.parts];
        next[index] = { ...next[index], [key]: value };
        form.setData('parts', next);
    }

    function addPartLine() {
        form.setData('parts', [...form.data.parts, { description: '', quantity: 1, unit_price: 0 }]);
    }

    function addPartFromStock(rawId: string) {
        const templateId = Number.parseInt(rawId, 10);
        if (Number.isNaN(templateId)) return;

        const tpl = product_templates.find((item) => item.id === templateId);
        if (!tpl) return;

        const description = [tpl.name, tpl.part_brand].filter(Boolean).join(' - ');

        form.setData('parts', [...form.data.parts, { description, quantity: 1, unit_price: tpl.cost }]);
    }

    function removePartLine(index: number) {
        const next = [...form.data.parts];
        next.splice(index, 1);
        form.setData('parts', next);
    }

    function handleNotesChange(event: ChangeEvent<HTMLTextAreaElement>) {
        const value = event.target.value;

        // Prefix the very first character typed with a dash to kick off the list
        if (value !== '' && form.data.notes === '' && !value.startsWith('- ')) {
            form.setData('notes', '- ' + value);
            return;
        }

        form.setData('notes', value);
    }

    function handleNotesKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
        if (event.key !== 'Enter') return;

        event.preventDefault();

        const textarea = event.currentTarget;
        const { selectionStart, selectionEnd, value } = textarea;
        const insertion = '\n- ';
        const newValue = value.slice(0, selectionStart) + insertion + value.slice(selectionEnd);

        form.setData('notes', newValue);

        requestAnimationFrame(() => {
            const cursor = selectionStart + insertion.length;
            textarea.setSelectionRange(cursor, cursor);
        });
    }

    function save() {
        form.put(`/admin/onderhoud/scooter/${job.id}`, { preserveScroll: true });
    }

    function printInvoice() {
        window.print();
    }

    const partsTotal = form.data.parts.reduce((sum, line) => sum + toNumber(line.quantity) * toNumber(line.unit_price), 0);
    const laborCost = toNumber(form.data.labor_cost);
    const vatRate = toNumber(form.data.vat_rate);
    const subtotal = partsTotal + laborCost;
    const vatAmount = subtotal * (vatRate / 100);
    const totalAmount = subtotal + vatAmount;

    const groupedChecklist = form.data.checklist.reduce<Record<string, ChecklistLine[]>>((carry, line) => {
        const key = line.category?.trim() || 'Overig';
        if (!carry[key]) carry[key] = [];
        carry[key].push(line);
        return carry;
    }, {});

    return (
        <AdminLayout title={`Onderhoud: ${job.customer_name}`}>
            <Head title={`Onderhoud - ${job.invoice_number}`} />

            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    body { background: white !important; }
                    .print-container {
                        display: block !important;
                        width: 100% !important;
                        max-width: none !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        box-shadow: none !important;
                        border: 0 !important;
                        border-radius: 0 !important;
                    }
                    @page { size: A4; margin: 12mm; }
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
                    {form.processing ? 'Opslaan...' : 'Opslaan'}
                </button>
                <button
                    type="button"
                    onClick={printInvoice}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50 sm:w-auto"
                >
                    Download als PDF / Print factuur
                </button>
                <Link
                    href="/admin/onderhoud/scooter"
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50 sm:w-auto"
                >
                    Terug naar overzicht
                </Link>
            </div>

            {/* Edit form (hidden on print) */}
            <div className="no-print grid grid-cols-1 gap-5 xl:grid-cols-2 mb-6">
                <section className="rounded-2xl border border-gray-200 bg-white p-5">
                    <h2 className="mb-4 text-base font-bold text-gray-900">Opdracht &amp; klant</h2>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">Type beurt</label>
                            <select
                                value={form.data.service_type}
                                onChange={(e) => form.setData('service_type', e.target.value as Props['job']['service_type'])}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                            >
                                <option value="kleine_beurt">Kleine beurt</option>
                                <option value="grote_beurt">Grote beurt</option>
                            </select>
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">Status</label>
                            <select
                                value={form.data.status}
                                onChange={(e) => form.setData('status', e.target.value as Props['job']['status'])}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                            >
                                <option value="open">Open</option>
                                <option value="bezig">Bezig</option>
                                <option value="afgerond">Afgerond</option>
                            </select>
                        </div>
                        <div className="sm:col-span-2">
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
                        <div className="sm:col-span-2">
                            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">Adres</label>
                            <input
                                value={form.data.customer_address}
                                onChange={(e) => form.setData('customer_address', e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                            />
                        </div>
                    </div>
                </section>

                <section className="rounded-2xl border border-gray-200 bg-white p-5">
                    <h2 className="mb-4 text-base font-bold text-gray-900">Scooter &amp; planning</h2>
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
                        <div className="sm:col-span-2">
                            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">Opmerkingen</label>
                            <textarea
                                value={form.data.notes}
                                onChange={handleNotesChange}
                                onKeyDown={handleNotesKeyDown}
                                placeholder="- Typ een opmerking, druk op Enter voor een nieuwe streepje..."
                                className="min-h-20 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                            />
                        </div>
                    </div>
                </section>
            </div>

            <section className="no-print mb-6 rounded-2xl border border-gray-200 bg-white p-5">
                <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-base font-bold text-gray-900">Checklist</h2>
                    <button type="button" onClick={addChecklistLine} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50">
                        + Regel toevoegen
                    </button>
                </div>

                {Object.entries(groupedChecklist).map(([category, lines]) => (
                    <div key={category} className="mb-4">
                        <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500">{category}</h3>
                        <div className="space-y-2">
                            {lines.map((line) => {
                                const index = form.data.checklist.indexOf(line);
                                return (
                                    <div key={index} className="flex flex-col gap-2 rounded-lg border border-gray-200 p-2.5 sm:flex-row sm:items-center">
                                        <label className="flex flex-1 items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={line.checked}
                                                onChange={(e) => updateChecklistLine(index, 'checked', e.target.checked)}
                                                className="h-4 w-4"
                                            />
                                            <input
                                                value={line.label}
                                                onChange={(e) => updateChecklistLine(index, 'label', e.target.value)}
                                                className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
                                            />
                                        </label>
                                        <input
                                            value={line.note}
                                            onChange={(e) => updateChecklistLine(index, 'note', e.target.value)}
                                            placeholder="Notitie"
                                            className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm sm:w-56"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeChecklistLine(index)}
                                            className="rounded-lg border border-red-200 bg-red-50 px-2 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
                                        >
                                            Verwijder
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </section>

            <section className="no-print mb-6 rounded-2xl border border-gray-200 bg-white p-5">
                <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-base font-bold text-gray-900">Onderdelen &amp; kosten</h2>
                    <button type="button" onClick={addPartLine} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50">
                        + Onderdeel toevoegen
                    </button>
                </div>

                {product_templates.length > 0 && (
                    <div className="mb-4">
                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">Kies onderdeel uit voorraad</label>
                        <select
                            value=""
                            onChange={(e) => addPartFromStock(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                        >
                            <option value="">Kies product uit voorraad...</option>
                            {product_templates.map((tpl) => (
                                <option key={tpl.id} value={tpl.id}>
                                    {tpl.name}
                                    {tpl.part_brand ? ` - ${tpl.part_brand}` : ''}
                                    {tpl.specification ? ` (${tpl.specification})` : ''}
                                    {` - voorraad ${tpl.stock_quantity}`}
                                    {` - €${tpl.cost.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                                </option>
                            ))}
                        </select>
                        <p className="mt-1 text-xs text-gray-500">Selecteren voegt automatisch een regel toe met prijs uit de voorraad. Je kunt de regel daarna nog aanpassen.</p>
                    </div>
                )}

                <div className="space-y-2">
                    {form.data.parts.map((line, index) => (
                        <div key={index} className="flex flex-col gap-2 rounded-lg border border-gray-200 p-2.5 sm:flex-row sm:items-center">
                            <input
                                value={line.description}
                                onChange={(e) => updatePartLine(index, 'description', e.target.value)}
                                placeholder="Omschrijving"
                                className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm sm:flex-1"
                            />
                            <input
                                type="number"
                                min="0"
                                step="1"
                                value={line.quantity}
                                onChange={(e) => updatePartLine(index, 'quantity', e.target.value)}
                                placeholder="Aantal"
                                className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm sm:w-24"
                            />
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={line.unit_price}
                                onChange={(e) => updatePartLine(index, 'unit_price', e.target.value)}
                                placeholder="Prijs per stuk"
                                className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm sm:w-32"
                            />
                            <button
                                type="button"
                                onClick={() => removePartLine(index)}
                                className="rounded-lg border border-red-200 bg-red-50 px-2 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
                            >
                                Verwijder
                            </button>
                        </div>
                    ))}
                    {form.data.parts.length === 0 && <p className="text-sm text-gray-500">Geen onderdelen toegevoegd.</p>}
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">Arbeidsloon</label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={form.data.labor_cost}
                            onChange={(e) => form.setData('labor_cost', e.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">BTW %</label>
                        <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={form.data.vat_rate}
                            onChange={(e) => form.setData('vat_rate', e.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                        />
                    </div>
                </div>

                <div className="mt-4 space-y-1 rounded-xl bg-gray-50 p-4 text-sm">
                    <div className="flex justify-between"><span className="text-gray-600">Onderdelen</span><span>{euro(partsTotal)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Arbeidsloon</span><span>{euro(laborCost)}</span></div>
                    <div className="flex justify-between font-semibold"><span>Subtotaal</span><span>{euro(subtotal)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">BTW ({vatRate}%)</span><span>{euro(vatAmount)}</span></div>
                    <div className="flex justify-between border-t border-gray-200 pt-1 text-base font-bold text-gray-900"><span>Totaal</span><span>{euro(totalAmount)}</span></div>
                </div>
            </section>

            {/* Printable invoice */}
            <div className="print-container mx-auto max-w-3xl rounded-2xl border border-gray-200 bg-white p-8">
                <div className="mb-8 flex items-start justify-between border-b border-gray-200 pb-6">
                    <div className="flex items-center gap-3">
                        <img src="/brand-logo.png" alt="Goed Op Weg logo" className="h-14 w-14 rounded-lg object-contain bg-white border border-gray-100" />
                        <div>
                            <div className="text-lg font-black text-gray-900">Goed Op Weg Nijkerk</div>
                            <div className="text-xs text-gray-500">Scooter onderhoud &amp; reparatie</div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-xl font-black text-gray-900">FACTUUR</div>
                        <div className="text-sm text-gray-600">{job.invoice_number}</div>
                        <div className="text-sm text-gray-600">{formatDate(form.data.performed_at)}</div>
                    </div>
                </div>

                <div className="mb-6 grid grid-cols-2 gap-6">
                    <div>
                        <div className="mb-1 text-xs font-bold uppercase tracking-wide text-gray-500">Klant</div>
                        <div className="text-sm font-semibold text-gray-900">{form.data.customer_name}</div>
                        {form.data.customer_address && <div className="text-sm text-gray-600">{form.data.customer_address}</div>}
                        {form.data.customer_phone && <div className="text-sm text-gray-600">{form.data.customer_phone}</div>}
                        {form.data.customer_email && <div className="text-sm text-gray-600">{form.data.customer_email}</div>}
                    </div>
                    <div>
                        <div className="mb-1 text-xs font-bold uppercase tracking-wide text-gray-500">Scooter</div>
                        <div className="text-sm text-gray-900">{[form.data.scooter_brand, form.data.scooter_model].filter(Boolean).join(' ') || '-'}</div>
                        {form.data.license_plate && <div className="text-sm text-gray-600">Kenteken: {form.data.license_plate}</div>}
                        {form.data.mileage && <div className="text-sm text-gray-600">Km-stand: {form.data.mileage}</div>}
                        <div className="text-sm text-gray-600">Type onderhoud: {serviceLabel[form.data.service_type]}</div>
                    </div>
                </div>

                <div className="mb-6">
                    <div className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500">Uitgevoerde werkzaamheden</div>
                    <ul className="space-y-1 text-sm text-gray-800">
                        {form.data.checklist.filter((line) => line.checked).map((line, index) => (
                            <li key={index} className="flex items-start gap-2">
                                <span>✓</span>
                                <span>
                                    {line.label}
                                    {line.note && <span className="text-gray-500"> — {line.note}</span>}
                                </span>
                            </li>
                        ))}
                        {form.data.checklist.filter((line) => line.checked).length === 0 && (
                            <li className="text-gray-400">Nog geen werkzaamheden afgevinkt.</li>
                        )}
                    </ul>
                </div>

                <table className="mb-6 w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-300 text-left text-xs uppercase tracking-wide text-gray-500">
                            <th className="py-2">Omschrijving</th>
                            <th className="py-2 text-right">Aantal</th>
                            <th className="py-2 text-right">Prijs</th>
                            <th className="py-2 text-right">Totaal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {form.data.parts.map((line, index) => (
                            <tr key={index} className="border-b border-gray-100">
                                <td className="py-1.5">{line.description}</td>
                                <td className="py-1.5 text-right">{toNumber(line.quantity)}</td>
                                <td className="py-1.5 text-right">{euro(toNumber(line.unit_price))}</td>
                                <td className="py-1.5 text-right">{euro(toNumber(line.quantity) * toNumber(line.unit_price))}</td>
                            </tr>
                        ))}
                        <tr className="border-b border-gray-100">
                            <td className="py-1.5">Arbeidsloon</td>
                            <td className="py-1.5 text-right">-</td>
                            <td className="py-1.5 text-right">-</td>
                            <td className="py-1.5 text-right">{euro(laborCost)}</td>
                        </tr>
                    </tbody>
                </table>

                <div className="mb-6 flex justify-end">
                    <div className="w-64 space-y-1 text-sm">
                        <div className="flex justify-between"><span className="text-gray-600">Subtotaal</span><span>{euro(subtotal)}</span></div>
                        <div className="flex justify-between"><span className="text-gray-600">BTW ({vatRate}%)</span><span>{euro(vatAmount)}</span></div>
                        <div className="flex justify-between border-t border-gray-300 pt-1 text-base font-bold text-gray-900"><span>Totaal</span><span>{euro(totalAmount)}</span></div>
                    </div>
                </div>

                {form.data.notes && (
                    <div className="mb-6">
                        <div className="mb-1 text-xs font-bold uppercase tracking-wide text-gray-500">Opmerkingen</div>
                        <p className="whitespace-pre-line text-sm text-gray-700">{form.data.notes}</p>
                    </div>
                )}

                <div className="border-t border-gray-200 pt-4 text-center text-xs text-gray-400">
                    Goed Op Weg Nijkerk — Bedankt voor uw vertrouwen.
                </div>
            </div>
        </AdminLayout>
    );
}
