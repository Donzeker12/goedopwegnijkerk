import { Head, router, useForm, usePage } from '@inertiajs/react';
import { type FormEvent } from 'react';
import TipTapEditor from '../../../components/TipTapEditor';
import AdminLayout from '../../../layouts/AdminLayout';

interface PageData {
    slug: string;
    title: string | null;
    content: string;
}

interface Props {
    page: PageData;
}

const slugLabels: Record<string, string> = {
    'over-ons': 'Over Ons',
};

export default function PageEdit({ page }: Props) {
    const { props } = usePage<{ flash?: { success?: string } }>();
    const flash = props.flash;

    const { data, setData, put, processing } = useForm({
        title: page.title ?? '',
        content: page.content ?? '',
    });

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        put(`/admin/paginas/${page.slug}`);
    }

    const pageLabel = slugLabels[page.slug] ?? page.slug;

    return (
        <AdminLayout title={`Pagina bewerken: ${pageLabel}`}>
            <Head title={`${pageLabel} bewerken`} />

            {flash?.success && (
                <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                    ✅ {flash.success}
                </div>
            )}

            <form onSubmit={handleSubmit} className="max-w-4xl space-y-5">
                {/* Page title */}
                <div className="bg-white rounded-2xl shadow-sm p-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Paginatitel
                    </label>
                    <input
                        type="text"
                        value={data.title}
                        onChange={(e) => setData('title', e.target.value)}
                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Bijv. Over Goed Op Weg Nijkerk"
                    />
                </div>

                {/* Content editor */}
                <div className="bg-white rounded-2xl shadow-sm p-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        Pagina-inhoud
                    </label>

                    {/* TipTap styles scoped inside this container */}
                    <style>{`
                        .tiptap-content .prose h1 { font-size: 1.75rem; font-weight: 700; margin-bottom: 0.75rem; color: #111827; }
                        .tiptap-content .prose h2 { font-size: 1.35rem; font-weight: 700; margin-bottom: 0.5rem; color: #111827; }
                        .tiptap-content .prose h3 { font-size: 1.1rem; font-weight: 600; margin-bottom: 0.4rem; color: #111827; }
                        .tiptap-content .prose p { margin-bottom: 0.75rem; color: #374151; line-height: 1.75; }
                        .tiptap-content .prose ul { list-style: disc; padding-left: 1.5rem; margin-bottom: 0.75rem; }
                        .tiptap-content .prose ol { list-style: decimal; padding-left: 1.5rem; margin-bottom: 0.75rem; }
                        .tiptap-content .prose li { margin-bottom: 0.25rem; color: #374151; }
                        .tiptap-content .prose blockquote { border-left: 3px solid #f97316; padding-left: 1rem; color: #6b7280; font-style: italic; margin: 1rem 0; }
                        .tiptap-content .prose hr { border-color: #e5e7eb; margin: 1.5rem 0; }
                        .tiptap-content .prose strong { font-weight: 700; }
                        .tiptap-content .prose em { font-style: italic; }
                        .tiptap-content .prose u { text-decoration: underline; }
                        .tiptap-content .prose s { text-decoration: line-through; }
                        .tiptap-content .tiptap p.is-editor-empty:first-child::before {
                            content: attr(data-placeholder);
                            color: #9ca3af;
                            pointer-events: none;
                            float: left;
                            height: 0;
                        }
                    `}</style>

                    <div className="tiptap-content">
                        <TipTapEditor
                            value={data.content}
                            onChange={(html) => setData('content', html)}
                            placeholder="Schrijf hier je 'Over Ons' tekst. Gebruik de opmaakbalk voor titels, vet, cursief, enz."
                            imageUploadUrl="/admin/blog/editor/afbeelding"
                        />
                    </div>

                    <p className="text-xs text-gray-400 mt-2">
                        Tip: Enter maakt een nieuwe alinea. Shift+Enter maakt een zachte regelafstand binnen dezelfde alinea.
                    </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    <button
                        type="submit"
                        disabled={processing}
                        className="bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
                    >
                        {processing ? 'Opslaan...' : '💾 Pagina opslaan'}
                    </button>
                    <a
                        href="/over-ons"
                        target="_blank"
                        rel="noreferrer"
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-5 py-3 rounded-xl transition-colors text-sm"
                    >
                        🌐 Bekijk live →
                    </a>
                </div>
            </form>
        </AdminLayout>
    );
}
