import { Head, Link, router, usePage } from '@inertiajs/react';
import AdminLayout from '../../../layouts/AdminLayout';

interface PostItem {
    id: number;
    title: string;
    slug: string;
    is_published: boolean;
    published_at: string | null;
    created_at: string | null;
    cover: string | null;
}

interface Props {
    posts: PostItem[];
}

export default function BlogAdminIndex({ posts }: Props) {
    const { props } = usePage<{ flash?: { success?: string } }>();

    function handleDelete(post: PostItem) {
        if (confirm(`Weet je zeker dat je blog \"${post.title}\" wilt verwijderen?`)) {
            router.delete(`/admin/blog/${post.slug}`);
        }
    }

    return (
        <AdminLayout title="Blog beheren">
            <Head title="Blog beheren" />

            {props.flash?.success && (
                <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm">
                    ✅ {props.flash.success}
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <p className="text-sm text-gray-500">{posts.length} blog(s)</p>
                    <div className="flex flex-wrap items-center gap-2">
                        <Link
                            href="/admin/blog/nieuw?mode=quick"
                            className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
                        >
                            + Snelle blog
                        </Link>
                        <Link
                            href="/admin/blog/nieuw?mode=normal"
                            className="border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 text-sm font-medium px-4 py-2 rounded-xl transition-colors"
                        >
                            + Normale blog
                        </Link>
                    </div>
                </div>

                {posts.length === 0 ? (
                    <div className="text-center py-16 text-gray-400">
                        <div className="text-5xl mb-3">📰</div>
                        <p>Nog geen blogs toegevoegd.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {posts.map((post) => (
                            <div key={post.id} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 px-4 sm:px-6 py-4 hover:bg-gray-50 transition-colors">
                                <div className="w-16 h-12 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                                    {post.cover ? (
                                        <img src={post.cover} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-xl text-gray-300">📰</div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0 w-full">
                                    <div className="font-semibold text-gray-900 truncate">{post.title}</div>
                                    <div className="text-xs text-gray-500 mt-0.5">/{post.slug}</div>
                                </div>

                                <div className="text-left sm:text-right text-xs text-gray-500 w-full sm:w-auto">
                                    <div>
                                        {post.is_published ? 'Gepubliceerd' : 'Concept'}
                                    </div>
                                    <div>{post.published_at ?? post.created_at ?? ''}</div>
                                </div>

                                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto sm:ml-4">
                                    <Link
                                        href={`/admin/blog/${post.slug}/preview`}
                                        className="text-sm text-gray-400 hover:text-orange-500 transition-colors px-3 py-1.5 rounded-lg hover:bg-orange-50"
                                    >
                                        Preview
                                    </Link>
                                    <Link
                                        href={`/admin/blog/${post.slug}/bewerken`}
                                        className="text-sm text-gray-500 hover:text-orange-500 transition-colors px-3 py-1.5 rounded-lg hover:bg-orange-50"
                                    >
                                        Bewerken
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(post)}
                                        className="text-sm text-gray-400 hover:text-red-500 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50"
                                    >
                                        Verwijderen
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
