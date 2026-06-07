import { Head, Link } from '@inertiajs/react';
import AppLayout from '../../layouts/AppLayout';

interface BlogItem {
    id: number;
    title: string;
    slug: string;
    excerpt: string | null;
    published_at: string | null;
    cover: string | null;
}

interface Props {
    posts: BlogItem[];
}

export default function BlogIndex({ posts }: Props) {
    return (
        <AppLayout>
            <Head title="Blog" />

            <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-orange-900 text-white py-20">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="text-5xl mb-4">📰</div>
                    <h1 className="text-4xl font-bold mb-3">Blog</h1>
                    <p className="text-gray-300">Tips, onderhoud en updates van Goed Op Weg Nijkerk</p>
                </div>
            </section>

            <section className="py-12 bg-gray-50 min-h-[40vh]">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    {posts.length === 0 ? (
                        <div className="text-center py-20 text-gray-500">Er zijn nog geen blogs gepubliceerd.</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {posts.map((post) => (
                                <Link
                                    key={post.id}
                                    href={`/blog/${post.slug}`}
                                    className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                                >
                                    <div className="aspect-video bg-gray-100 overflow-hidden">
                                        {post.cover ? (
                                            <img src={post.cover} alt={post.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-4xl text-gray-300">📰</div>
                                        )}
                                    </div>
                                    <div className="p-5">
                                        <div className="text-xs text-gray-500 mb-2">{post.published_at ?? ''}</div>
                                        <h2 className="font-bold text-gray-900 text-lg leading-snug">{post.title}</h2>
                                        <p className="text-sm text-gray-600 mt-2">
                                            {post.excerpt ?? 'Lees verder op onze blog.'}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </AppLayout>
    );
}
