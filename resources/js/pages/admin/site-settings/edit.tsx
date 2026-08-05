import { Head, router, useForm, usePage } from '@inertiajs/react';
import { type ChangeEvent, type FormEvent, useMemo, useState } from 'react';
import TipTapEditor from '../../../components/TipTapEditor';
import AdminLayout from '../../../layouts/AdminLayout';

interface RepeaterFieldDefinition {
    key: string;
    label: string;
    type: 'text' | 'textarea' | 'url' | 'image';
}

interface FieldDefinition {
    key: string;
    label: string;
    type: 'text' | 'textarea' | 'url' | 'image' | 'repeater';
    itemLabel?: string;
    fields?: RepeaterFieldDefinition[];
}

interface SectionNavItem {
    slug: string;
    title: string;
    description: string;
    preview_url: string | null;
    group: string;
    group_label: string;
}

interface SectionData {
    slug: string;
    title: string;
    description: string;
    preview_url: string | null;
    group: string;
    group_label: string;
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

function shouldUseTipTap(sectionSlug: string, fieldKey: string, subFieldKey: string): boolean {
    return sectionSlug === 'home-maintenance' && fieldKey === 'cards' && subFieldKey === 'items';
}

function shouldUseTipTapField(sectionSlug: string, fieldKey: string): boolean {
    return sectionSlug.startsWith('maintenance-') && (fieldKey === 'small_items' || fieldKey === 'large_items');
}

export default function SiteSettingsEdit({ sections, section }: Props) {
    const { props } = usePage<{ flash?: { success?: string } }>();
    const flash = props.flash;
    const [uploadingField, setUploadingField] = useState<string | null>(null);

    const { data, setData, put, processing } = useForm<{ values: Record<string, string | Array<Record<string, string>>> }>({
        values: section.values,
    });

    const groupedSections = useMemo(() => {
        const groups: Record<string, SectionNavItem[]> = {};

        sections.forEach((item) => {
            if (!groups[item.group]) {
                groups[item.group] = [];
            }

            groups[item.group].push(item);
        });

        return groups;
    }, [sections]);

    const groupOptions = useMemo(() => {
        return Object.entries(groupedSections).map(([group, items]) => ({
            group,
            label: items[0]?.group_label ?? group,
        }));
    }, [groupedSections]);

    const currentGroup = section.group;
    const currentGroupItems = groupedSections[currentGroup] ?? [];

    function handleGroupChange(event: ChangeEvent<HTMLSelectElement>) {
        const nextGroup = event.target.value;
        const firstInGroup = groupedSections[nextGroup]?.[0];

        if (firstInGroup) {
            router.get(`/admin/site-instellingen/${firstInGroup.slug}`);
        }
    }

    function handleSectionChange(event: ChangeEvent<HTMLSelectElement>) {
        const nextSlug = event.target.value;
        if (nextSlug) {
            router.get(`/admin/site-instellingen/${nextSlug}`);
        }
    }

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

    async function handleImageUpload(fieldKey: string, fileList: FileList | null) {
        const file = fileList?.[0];

        if (!file) {
            return;
        }

        const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

        if (!csrf) {
            return;
        }

        const formData = new FormData();
        formData.append('field', fieldKey);
        formData.append('image', file);

        setUploadingField(fieldKey);

        try {
            const response = await fetch(`/admin/site-instellingen/${section.slug}/afbeelding`, {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': csrf,
                    Accept: 'application/json',
                },
                body: formData,
                credentials: 'same-origin',
            });

            if (!response.ok) {
                throw new Error('Upload mislukt');
            }

            const payload = (await response.json()) as { url?: string };
            updateField(fieldKey, payload.url ?? '');
        } catch (error) {
            console.error(error);
            alert('Uploaden is niet gelukt. Probeer het opnieuw.');
        } finally {
            setUploadingField(null);
        }
    }

    return (
        <AdminLayout title="Site instellingen">
            <Head title={`Site instellingen - ${section.title}`} />

            {flash?.success && (
                <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    ✅ {flash.success}
                </div>
            )}

            <div className="space-y-6">
                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
                        <div>
                            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">Groep</label>
                            <select
                                value={currentGroup}
                                onChange={handleGroupChange}
                                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                            >
                                {groupOptions.map((group) => (
                                    <option key={group.group} value={group.group}>{group.label}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">Pagina/sectie</label>
                            <select
                                value={section.slug}
                                onChange={handleSectionChange}
                                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                            >
                                {currentGroupItems.map((item) => (
                                    <option key={item.slug} value={item.slug}>{item.title}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <p className="mt-3 text-xs text-gray-500">
                        Kies eerst een groep en daarna de pagina. Zo blijft er ruimte voor extra pagina’s en instellingen.
                    </p>
                </div>

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

                <form onSubmit={handleSubmit} className="space-y-5">

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
                                                            {subField.type === 'textarea' && shouldUseTipTap(section.slug, field.key, subField.key) ? (
                                                                <div className="rounded-xl border border-gray-300 bg-white p-3">
                                                                    <style>{`
                                                                        .site-settings-tiptap .prose ul { list-style: disc; padding-left: 1.5rem; margin-bottom: 0.75rem; }
                                                                        .site-settings-tiptap .prose ol { list-style: decimal; padding-left: 1.5rem; margin-bottom: 0.75rem; }
                                                                        .site-settings-tiptap .prose li { margin-bottom: 0.25rem; color: #374151; }
                                                                        .site-settings-tiptap .prose p { margin-bottom: 0.75rem; color: #374151; }
                                                                    `}</style>
                                                                    <div className="site-settings-tiptap">
                                                                        <TipTapEditor
                                                                            value={asString(item[subField.key])}
                                                                            onChange={(html) => updateRepeaterItem(field.key, index, subField.key, html)}
                                                                            placeholder="Gebruik bullet points om onderdelen toe te voegen..."
                                                                            spellCheck
                                                                            language="nl"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            ) : subField.type === 'textarea' ? (
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
                                {field.type === 'textarea' && shouldUseTipTapField(section.slug, field.key) ? (
                                    <div className="rounded-xl border border-gray-300 bg-white p-3">
                                        <style>{`
                                            .site-settings-tiptap .prose ul { list-style: disc; padding-left: 1.5rem; margin-bottom: 0.75rem; }
                                            .site-settings-tiptap .prose ol { list-style: decimal; padding-left: 1.5rem; margin-bottom: 0.75rem; }
                                            .site-settings-tiptap .prose li { margin-bottom: 0.25rem; color: #374151; }
                                            .site-settings-tiptap .prose p { margin-bottom: 0.75rem; color: #374151; }
                                        `}</style>
                                        <div className="site-settings-tiptap">
                                            <TipTapEditor
                                                value={asString(data.values[field.key])}
                                                onChange={(html) => updateField(field.key, html)}
                                                placeholder="Gebruik bullet points om onderdelen toe te voegen..."
                                                spellCheck
                                                language="nl"
                                            />
                                        </div>
                                    </div>
                                ) : field.type === 'textarea' ? (
                                    <textarea
                                        value={asString(data.values[field.key])}
                                        onChange={(event) => updateField(field.key, event.target.value)}
                                        rows={6}
                                        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                ) : field.type === 'image' ? (
                                    <div className="space-y-3">
                                        {asString(data.values[field.key]) && (
                                            <img
                                                src={asString(data.values[field.key])}
                                                alt={field.label}
                                                className="h-44 w-full rounded-xl border border-gray-200 object-cover"
                                            />
                                        )}
                                        <input
                                            type="text"
                                            value={asString(data.values[field.key])}
                                            onChange={(event) => updateField(field.key, event.target.value)}
                                            placeholder="https://..."
                                            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        />
                                        <label className="inline-flex cursor-pointer items-center rounded-lg bg-gray-800 px-3 py-2 text-xs font-semibold text-white hover:bg-gray-700">
                                            {uploadingField === field.key ? 'Uploaden...' : 'Afbeelding uploaden'}
                                            <input
                                                type="file"
                                                accept="image/jpeg,image/png,image/jpg,image/webp"
                                                className="hidden"
                                                onChange={(event) => {
                                                    void handleImageUpload(field.key, event.target.files);
                                                    event.currentTarget.value = '';
                                                }}
                                            />
                                        </label>
                                    </div>
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
