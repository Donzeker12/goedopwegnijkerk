import { Head, useForm } from '@inertiajs/react';
import { type FormEvent } from 'react';
import TipTapEditor from '../../../components/TipTapEditor';
import AdminLayout from '../../../layouts/AdminLayout';

export default function BlogCreate() {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        excerpt: '',
        content: '<p></p>',
        is_published: false,
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        post('/admin/blog');
    }

    return (
        <AdminLayout title="Blog toevoegen">
            <Head title="Blog toevoegen" />

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
                <form onSubmit={submit} className="xl:col-span-2 space-y-5">
                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-orange-100">
                        <div className="text-xs font-semibold text-orange-600 uppercase tracking-wide mb-2">Stap 1</div>
                        <h2 className="text-lg font-bold text-gray-900">Basis en inhoud</h2>
                        <p className="text-sm text-gray-500 mt-1">Vul titel, intro en blogtekst in met de editor.</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Titel *</label>
                        <input
                            type="text"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                            placeholder="Bijv. 5 onderhoudstips voor je scooter"
                        />
                        {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Korte intro</label>
                        <textarea
                            value={data.excerpt}
                            onChange={(e) => setData('excerpt', e.target.value)}
                            rows={3}
                            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                            placeholder="Korte samenvatting voor de blog-overzichtspagina"
                        />
                        {errors.excerpt && <p className="mt-1 text-xs text-red-600">{errors.excerpt}</p>}
                    </div>

                    <label className="flex items-center gap-2 text-sm text-gray-700">
                        <input
                            type="checkbox"
                            checked={data.is_published}
                            onChange={(e) => setData('is_published', e.target.checked)}
                            className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                        />
                        Direct publiceren
                    </label>
                </div>

                    <div className="bg-white rounded-2xl shadow-sm p-6">
                        <label className="block text-sm font-medium text-gray-700 mb-3">Bloginhoud *</label>
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
                        `}</style>
                        <div className="tiptap-content">
                            <TipTapEditor
                                value={data.content}
                                onChange={(html) => setData('content', html)}
                                placeholder="Schrijf hier je blogtekst..."
                            />
                        </div>
                        {errors.content && <p className="mt-2 text-xs text-red-600">{errors.content}</p>}
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="submit"
                            disabled={processing}
                            className="bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
                        >
                            {processing ? 'Opslaan...' : 'Blog opslaan en verder naar foto\'s'}
                        </button>
                    </div>
                </form>

                <aside className="bg-white rounded-2xl shadow-sm p-6 xl:sticky xl:top-24">
                    <div className="text-xs font-semibold text-orange-600 uppercase tracking-wide mb-2">Stap 2</div>
                    <h2 className="text-lg font-bold text-gray-900">Foto's uploaden</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Na opslaan kom je op de bewerkpagina waar de foto-upload direct naast de editor staat.
                    </p>

                    <div className="mt-4 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4">
                        <div className="text-sm font-medium text-gray-700 mb-2">Wat je daarna kunt doen</div>
                        <ul className="text-sm text-gray-600 list-disc pl-4 space-y-1">
                            <li>Meerdere foto's tegelijk uploaden</li>
                            <li>Een coverfoto selecteren</li>
                            <li>Foto's verwijderen en opnieuw kiezen</li>
                        </ul>
                    </div>
                </aside>
            </div>
        </AdminLayout>
    );
}
