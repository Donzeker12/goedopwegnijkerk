import { Head, Link, router, usePage } from '@inertiajs/react';
import { useRef, useState, type FormEvent, type RefObject } from 'react';
import TipTapEditor from '../../../components/TipTapEditor';
import AdminLayout from '../../../layouts/AdminLayout';

type FieldType = 'text' | 'textarea' | 'url' | 'image';

interface FieldDefinition {
    key: string;
    label: string;
    type: FieldType;
}

interface SectionData {
    slug: string;
    title: string;
    description: string;
    preview_url: string | null;
    fields: FieldDefinition[];
    values: Record<string, string>;
}

interface CategoryLink {
    slug: string;
    label: string;
    icon: string;
}

interface Props {
    categories: CategoryLink[];
    category: CategoryLink;
    maintenanceSection: SectionData;
    salesSection: SectionData;
}

function asString(value: unknown): string {
    return typeof value === 'string' ? value : '';
}

function shouldUseTipTapField(fieldKey: string): boolean {
    return fieldKey === 'small_items' || fieldKey === 'large_items' || fieldKey === 'usp_items';
}

export default function CategoryEdit({ categories, category, maintenanceSection, salesSection }: Props) {
    const { props } = usePage<{ flash?: { success?: string } }>();
    const flash = props.flash;

    const [maintenanceValues, setMaintenanceValues] = useState<Record<string, string>>(maintenanceSection.values);
    const [salesValues, setSalesValues] = useState<Record<string, string>>(salesSection.values);
    const [savingSection, setSavingSection] = useState<'maintenance' | 'sales' | null>(null);
    const [uploadingField, setUploadingField] = useState<string | null>(null);
    const maintenanceFormRef = useRef<HTMLFormElement | null>(null);
    const salesFormRef = useRef<HTMLFormElement | null>(null);

    function submitSection(section: 'maintenance' | 'sales') {
        if (section === 'maintenance') {
            maintenanceFormRef.current?.requestSubmit();
            return;
        }

        salesFormRef.current?.requestSubmit();
    }

    function updateSectionValue(section: 'maintenance' | 'sales', key: string, value: string) {
        if (section === 'maintenance') {
            setMaintenanceValues((current) => ({ ...current, [key]: value }));
            return;
        }

        setSalesValues((current) => ({ ...current, [key]: value }));
    }

    function handleSave(section: 'maintenance' | 'sales', event: FormEvent) {
        event.preventDefault();
        setSavingSection(section);

        router.put(
            `/admin/categorieen/${category.slug}/${section}`,
            {
                values: section === 'maintenance' ? maintenanceValues : salesValues,
            },
            {
                preserveScroll: true,
                onFinish: () => setSavingSection(null),
            },
        );
    }

    async function handleImageUpload(section: 'maintenance' | 'sales', fieldKey: string, fileList: FileList | null) {
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

        setUploadingField(`${section}:${fieldKey}`);

        try {
            const response = await fetch(`/admin/categorieen/${category.slug}/${section}/afbeelding`, {
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
            updateSectionValue(section, fieldKey, payload.url ?? '');
        } catch (error) {
            console.error(error);
            alert('Uploaden is niet gelukt. Probeer het opnieuw.');
        } finally {
            setUploadingField(null);
        }
    }

    function renderSection(
        section: 'maintenance' | 'sales',
        sectionData: SectionData,
        values: Record<string, string>,
        formRef: RefObject<HTMLFormElement | null>,
    ) {
        return (
            <form ref={formRef} onSubmit={(event) => handleSave(section, event)} className="space-y-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">{sectionData.title}</h2>
                        <p className="mt-1.5 text-sm text-gray-600">{sectionData.description}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {sectionData.preview_url && (
                            <a
                                href={sectionData.preview_url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
                            >
                                Bekijk live
                            </a>
                        )}
                        <button
                            type="submit"
                            disabled={savingSection === section}
                            className="inline-flex items-center justify-center rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
                        >
                            {savingSection === section ? 'Opslaan...' : section === 'maintenance' ? 'Onderhoud opslaan' : 'Verkoop opslaan'}
                        </button>
                    </div>
                </div>

                {sectionData.fields.map((field) => {
                    const value = asString(values[field.key]);
                    const isTipTap = field.type === 'textarea' && shouldUseTipTapField(field.key);
                    const fieldUploading = uploadingField === `${section}:${field.key}`;

                    return (
                        <div key={`${section}-${field.key}`} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                            <label className="mb-1.5 block text-sm font-semibold text-gray-800">{field.label}</label>

                            {field.type === 'image' ? (
                                <div className="space-y-3">
                                    {value && (
                                        <img
                                            src={value}
                                            alt={field.label}
                                            className="h-44 w-full rounded-xl border border-gray-200 object-cover"
                                        />
                                    )}
                                    <input
                                        type="text"
                                        value={value}
                                        onChange={(event) => updateSectionValue(section, field.key, event.target.value)}
                                        placeholder="https://..."
                                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                    <label className="inline-flex cursor-pointer items-center rounded-lg bg-gray-800 px-3 py-2 text-xs font-semibold text-white hover:bg-gray-700">
                                        {fieldUploading ? 'Uploaden...' : 'Afbeelding uploaden'}
                                        <input
                                            type="file"
                                            accept="image/jpeg,image/png,image/jpg,image/webp"
                                            className="hidden"
                                            onChange={(event) => {
                                                void handleImageUpload(section, field.key, event.target.files);
                                                event.currentTarget.value = '';
                                            }}
                                        />
                                    </label>
                                </div>
                            ) : isTipTap ? (
                                <div className="rounded-xl border border-gray-300 bg-white p-3">
                                    <style>{`
                                        .category-editor-tiptap .prose ul { list-style: disc; padding-left: 1.5rem; margin-bottom: 0.75rem; }
                                        .category-editor-tiptap .prose ol { list-style: decimal; padding-left: 1.5rem; margin-bottom: 0.75rem; }
                                        .category-editor-tiptap .prose li { margin-bottom: 0.25rem; color: #374151; }
                                        .category-editor-tiptap .prose p { margin-bottom: 0.75rem; color: #374151; }
                                    `}</style>
                                    <div className="category-editor-tiptap">
                                        <TipTapEditor
                                            value={value}
                                            onChange={(html) => updateSectionValue(section, field.key, html)}
                                            placeholder="Gebruik bullet points om onderdelen toe te voegen..."
                                            spellCheck
                                            language="nl"
                                        />
                                    </div>
                                </div>
                            ) : field.type === 'textarea' ? (
                                <textarea
                                    rows={5}
                                    value={value}
                                    onChange={(event) => updateSectionValue(section, field.key, event.target.value)}
                                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            ) : (
                                <input
                                    type="text"
                                    value={value}
                                    onChange={(event) => updateSectionValue(section, field.key, event.target.value)}
                                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            )}
                        </div>
                    );
                })}

                <div className="pt-1">
                    <button
                        type="submit"
                        disabled={savingSection === section}
                        className="rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
                    >
                        {savingSection === section ? 'Opslaan...' : section === 'maintenance' ? 'Onderhoud opslaan' : 'Verkoop opslaan'}
                    </button>
                </div>
            </form>
        );
    }

    return (
        <AdminLayout title={`Categorie: ${category.label}`}>
            <Head title={`Categorie bewerken - ${category.label}`} />

            {flash?.success && (
                <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    ✅ {flash.success}
                </div>
            )}

            <div className="space-y-6">
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">Categorie</p>
                    <h1 className="mt-1 text-2xl font-black text-gray-900">{category.icon} {category.label}</h1>
                    <div className="mt-4 flex flex-wrap gap-2">
                        {categories.map((item) => (
                            <Link
                                key={item.slug}
                                href={`/admin/categorieen/${item.slug}`}
                                className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
                                    item.slug === category.slug
                                        ? 'bg-orange-500 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                {item.icon} {item.label}
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="sticky top-4 z-20 rounded-2xl border border-orange-200 bg-orange-50/95 p-3 backdrop-blur">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm font-semibold text-orange-900">
                            Snel opslaan zonder scrollen
                        </p>
                        <div className="flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={() => submitSection('maintenance')}
                                disabled={savingSection !== null}
                                className="rounded-lg bg-orange-500 px-3.5 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
                            >
                                {savingSection === 'maintenance' ? 'Onderhoud opslaan...' : 'Onderhoud opslaan'}
                            </button>
                            <button
                                type="button"
                                onClick={() => submitSection('sales')}
                                disabled={savingSection !== null}
                                className="rounded-lg border border-orange-300 bg-white px-3.5 py-2 text-sm font-semibold text-orange-800 hover:bg-orange-100 disabled:opacity-60"
                            >
                                {savingSection === 'sales' ? 'Verkoop opslaan...' : 'Verkoop opslaan'}
                            </button>
                        </div>
                    </div>
                </div>

                {renderSection('maintenance', maintenanceSection, maintenanceValues, maintenanceFormRef)}
                {renderSection('sales', salesSection, salesValues, salesFormRef)}
            </div>
        </AdminLayout>
    );
}
