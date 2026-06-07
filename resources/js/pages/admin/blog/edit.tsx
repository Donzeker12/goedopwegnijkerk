import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { type FormEvent, useRef, useState } from 'react';
import TipTapEditor from '../../../components/TipTapEditor';
import AdminLayout from '../../../layouts/AdminLayout';

interface BlogPhoto {
    id: number;
    url: string;
    is_cover: boolean;
    sort_order: number;
}

interface BlogPostData {
    id: number;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string;
    is_published: boolean;
    published_at: string | null;
    photos: BlogPhoto[];
}

interface Props {
    post: BlogPostData;
}

export default function BlogEdit({ post }: Props) {
    const { props } = usePage<{ flash?: { success?: string } }>();
    const [photoFiles, setPhotoFiles] = useState<FileList | null>(null);
    const [uploading, setUploading] = useState(false);
    const photoInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, put, processing, errors } = useForm({
        title: post.title,
        excerpt: post.excerpt ?? '',
        content: post.content ?? '<p></p>',
        is_published: post.is_published,
    });

    function savePost(e: FormEvent) {
        e.preventDefault();
        put(`/admin/blog/${post.slug}`);
    }

    function uploadPhotos(e: FormEvent) {
        e.preventDefault();
        if (!photoFiles || photoFiles.length === 0) return;

        const formData = new FormData();
        Array.from(photoFiles).forEach((file) => formData.append('photos[]', file));

        setUploading(true);
        router.post(`/admin/blog/${post.slug}/fotos`, formData, {
            forceFormData: true,
            onFinish: () => {
                setUploading(false);
                setPhotoFiles(null);
                if (photoInputRef.current) photoInputRef.current.value = '';
            },
        });
    }

    function setCover(photoId: number) {
        router.patch(`/admin/blog/${post.slug}/fotos/${photoId}/cover`);
    }

    function removePhoto(photoId: number) {
        if (confirm('Weet je zeker dat je deze foto wilt verwijderen?')) {
            router.delete(`/admin/blog/${post.slug}/fotos/${photoId}`);
        }
    }

    return (
        <AdminLayout title={`Blog bewerken: ${post.title}`}>
            <Head title={`Blog bewerken: ${post.title}`} />

            {props.flash?.success && (
                <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm">
                    ✅ {props.flash.success}
                </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
                <form onSubmit={savePost} className="space-y-5 xl:col-span-2">
                    <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Titel *</label>
                                <input
                                    type="text"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                                {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Slug</label>
                                <input
                                    type="text"
                                    value={post.slug}
                                    disabled
                                    className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-sm text-gray-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Korte intro</label>
                            <textarea
                                value={data.excerpt}
                                onChange={(e) => setData('excerpt', e.target.value)}
                                rows={3}
                                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                            Gepubliceerd
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
                                placeholder="Werk je bloginhoud bij..."
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
                            {processing ? 'Opslaan...' : 'Blog opslaan'}
                        </button>
                        <Link href={`/blog/${post.slug}`} className="text-sm text-orange-600 hover:underline">
                            Bekijk live
                        </Link>
                    </div>
                </form>

                <div className="bg-white rounded-2xl shadow-sm p-6 xl:sticky xl:top-24">
                    <h2 className="font-bold text-gray-900 mb-3">Foto's beheren</h2>
                    <form onSubmit={uploadPhotos} className="flex flex-col sm:flex-row gap-3 mb-4">
                        <input
                            ref={photoInputRef}
                            type="file"
                            multiple
                            accept="image/jpeg,image/png,image/jpg,image/webp"
                            onChange={(e) => setPhotoFiles(e.target.files)}
                            className="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-sm"
                        />
                        <button
                            type="submit"
                            disabled={uploading || !photoFiles || photoFiles.length === 0}
                            className="bg-gray-900 hover:bg-black disabled:opacity-60 text-white font-medium px-4 py-2 rounded-xl text-sm"
                        >
                            {uploading ? 'Uploaden...' : 'Foto(s) uploaden'}
                        </button>
                    </form>

                    <p className="text-xs text-gray-500 mb-4">
                        Upload meerdere foto's en kies daarna welke als cover moet worden gebruikt.
                    </p>

                    {post.photos.length === 0 ? (
                        <p className="text-sm text-gray-500">Nog geen foto's geüpload.</p>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {post.photos.map((photo) => (
                                <div key={photo.id} className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                                    <img src={photo.url} alt="Blog foto" className="w-full h-32 object-cover" />
                                    <div className="p-2 space-y-2">
                                        {photo.is_cover ? (
                                            <div className="text-xs font-medium text-emerald-700 bg-emerald-100 rounded px-2 py-1 text-center">Coverfoto</div>
                                        ) : (
                                            <button
                                                onClick={() => setCover(photo.id)}
                                                className="w-full text-xs bg-orange-100 text-orange-700 hover:bg-orange-200 rounded px-2 py-1"
                                            >
                                                Gebruik als cover
                                            </button>
                                        )}
                                        <button
                                            onClick={() => removePhoto(photo.id)}
                                            className="w-full text-xs bg-red-100 text-red-700 hover:bg-red-200 rounded px-2 py-1"
                                        >
                                            Verwijderen
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
