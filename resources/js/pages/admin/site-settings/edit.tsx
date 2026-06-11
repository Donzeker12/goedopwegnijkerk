import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { type FormEvent } from 'react';
import AdminLayout from '../../../layouts/AdminLayout';

interface RepeaterFieldDefinition {
    key: string;
    label: string;
    type: 'text' | 'textarea' | 'url';
}

interface FieldDefinition {
    key: string;
    label: string;
    type: 'text' | 'textarea' | 'url' | 'repeater';
    itemLabel?: string;
    fields?: RepeaterFieldDefinition[];
}

interface SectionNavItem {
    slug: string;
    title: string;
    description: string;
    preview_url: string | null;
}

interface SectionData {
    slug: string;
    title: string;
    description: string;
    preview_url: string | null;
    fields: FieldDefinition[];
    values: Record<string, string | Array<Record<string, string>>>;
}

interface Props {
    sections: SectionNavItem[];
    section: SectionData;
}

function asString(value: unknown): string {
    return typeof value === 'string' ? value : '';
}

export default function SiteSettingsEdit({ sections, section }: Props) {
    const { props } = usePage<{ flash?: { success?: string } }>();
    const flash = props.flash;

    const { data, setData, put, processing } = useForm<{ values: Record<string, string | Array<Record<string, string>>> }>({
        values: section.values,
    });

    function handleSubmit(event: FormEvent) {
        event.preventDefault();
        put(`/admin/site-instellingen/${section.slug}`);
    }

    function updateField(key: string, value: string) {
        setData('values', {
            ...data.values,
            [key]: value,
        });
    }

    function updateRepeaterItem(fieldKey: string, index: number, itemKey: string, value: string) {
        const items = Array.isArray(data.values[fieldKey]) ? [...(data.values[fieldKey] as Array<Record<string, string>>)] : [];
        const currentItem = items[index] ?? {};
        items[index] = {
            ...currentItem,
            [itemKey]: value,
        };

        setData('values', {
            ...data.values,
            [fieldKey]: items,
        });
    }

    function addRepeaterItem(field: FieldDefinition) {
        const items = Array.isArray(data.values[field.key]) ? [...(data.values[field.key] as Array<Record<string, string>>)] : [];
        const emptyItem = Object.fromEntries((field.fields ?? []).map((subField) => [subField.key, '']));
        items.push(emptyItem);

        setData('values', {
            ...data.values,
            [field.key]: items,
        });
    }

    function removeRepeaterItem(fieldKey: string, index: number) {
        const items = Array.isArray(data.values[fieldKey]) ? [...(data.values[fieldKey] as Array<Record<string, string>>)] : [];
        items.splice(index, 1);

        setData('values', {
            ...data.values,
            [fieldKey]: items,
        });
    }

    return (
        <AdminLayout title="Site instellingen">
            <Head title={`Site instellingen - ${section.title}`} />

            {flash?.success && (
                <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    ✅ {flash.success}
                </div>
            )}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
                <aside className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-orange-600">☰</span>
                        Site instellingen
                    </div>
                    <div className="space-y-2">
                        {sections.map((item) => {
                            const active = item.slug === section.slug;

                            return (
                                <Link
                                    key={item.slug}
                                    href={`/admin/site-instellingen/${item.slug}`}
                                    className={`block rounded-xl border px-3 py-3 transition-colors ${
                                        active
                                            ? 'border-orange-200 bg-orange-50 text-orange-700'
                                            : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-orange-200 hover:bg-orange-50/60'
                                    }`}
                                >
                                    <div className="text-sm font-semibold">{item.title}</div>
                                    <div className="mt-1 text-xs text-gray-500">{item.description}</div>
                                </Link>
                            );
                        })}
                    </div>
                </aside>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">{section.title}</h2>
                                <p className="mt-2 text-sm text-gray-600">{section.description}</p>
                            </div>
                            {section.preview_url && (
                                <a
                                    href={section.preview_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
                                >
                                    Bekijk live
                                </a>
                            )}
                        </div>
                    </div>

                    {section.fields.map((field) => {
                        if (field.type === 'repeater') {
                            const items = Array.isArray(data.values[field.key]) ? (data.values[field.key] as Array<Record<string, string>>) : [];

                            return (
                                <div key={field.key} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                                    <div className="mb-4 flex items-center justify-between gap-3">
                                        <div>
                                            <h3 className="text-base font-bold text-gray-900">{field.label}</h3>
                                            <p className="text-xs text-gray-500">Voeg regels toe, verwijder ze of pas ze aan.</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => addRepeaterItem(field)}
                                            className="rounded-lg bg-orange-500 px-3 py-2 text-sm font-semibold text-white hover:bg-orange-600"
                                        >
                                            + {field.itemLabel ?? 'Item'}
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        {items.map((item, index) => (
                                            <div key={`${field.key}-${index}`} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                                                <div className="mb-3 flex items-center justify-between gap-3">
                                                    <div className="text-sm font-semibold text-gray-900">{field.itemLabel ?? 'Item'} {index + 1}</div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeRepeaterItem(field.key, index)}
                                                        className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                                                    >
                                                        Verwijderen
                                                    </button>
                                                </div>

                                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                    {(field.fields ?? []).map((subField) => (
                                                        <div key={subField.key} className={subField.type === 'textarea' ? 'md:col-span-2' : ''}>
                                                            <label className="mb-1.5 block text-sm font-medium text-gray-700">{subField.label}</label>
                                                            {subField.type === 'textarea' ? (
                                                                <textarea
                                                                    value={asString(item[subField.key])}
                                                                    onChange={(event) => updateRepeaterItem(field.key, index, subField.key, event.target.value)}
                                                                    rows={5}
                                                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                                />
                                                            ) : (
                                                                <input
                                                                    type="text"
                                                                    value={asString(item[subField.key])}
                                                                    onChange={(event) => updateRepeaterItem(field.key, index, subField.key, event.target.value)}
                                                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                                />
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <div key={field.key} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                                <label className="mb-1.5 block text-sm font-medium text-gray-700">{field.label}</label>
                                {field.type === 'textarea' ? (
                                    <textarea
                                        value={asString(data.values[field.key])}
                                        onChange={(event) => updateField(field.key, event.target.value)}
                                        rows={6}
                                        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                ) : (
                                    <input
                                        type="text"
                                        value={asString(data.values[field.key])}
                                        onChange={(event) => updateField(field.key, event.target.value)}
                                        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                )}
                            </div>
                        );
                    })}

                    <div className="flex items-center gap-3">
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
                        >
                            {processing ? 'Opslaan...' : 'Instellingen opslaan'}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
