import { Head, Link } from '@inertiajs/react';
import AppLayout from '../../layouts/AppLayout';

interface BlogPhoto {
    id: number;
    url: string;
    is_cover: boolean;
}

interface BlogPost {
    id: number;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string;
    published_at: string | null;
    photos: BlogPhoto[];
}

interface Props {
    post: BlogPost;
}

export default function BlogShow({ post }: Props) {
    const cover = post.photos.find((photo) => photo.is_cover) ?? post.photos[0];
    const gallery = post.photos.filter((photo) => !cover || photo.id !== cover.id);

    return (
        <AppLayout>
            <Head title={post.title} />

            <article className="bg-gray-50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    <nav className="text-sm text-gray-500 mb-6">
                        <Link href="/" className="hover:text-orange-500">Home</Link>
                        <span className="mx-2">/</span>
                        <Link href="/blog" className="hover:text-orange-500">Blog</Link>
                        <span className="mx-2">/</span>
                        <span className="text-gray-900">{post.title}</span>
                    </nav>

                    <header className="mb-8">
                        <div className="text-xs uppercase tracking-wider text-orange-600 font-semibold mb-2">
                            {post.published_at ?? ''}
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">{post.title}</h1>
                        {post.excerpt && <p className="mt-4 text-lg text-gray-600">{post.excerpt}</p>}
                    </header>

                    {cover && (
                        <div className="rounded-2xl overflow-hidden mb-8 bg-gray-100">
                            <img src={cover.url} alt={post.title} className="w-full h-auto object-cover" />
                        </div>
                    )}

                    <div className="blog-content rounded-2xl bg-white p-6 sm:p-8 shadow-sm" dangerouslySetInnerHTML={{ __html: post.content }} />

                    {gallery.length > 0 && (
                        <section className="mt-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Foto's</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {gallery.map((photo) => (
                                    <a key={photo.id} href={photo.url} target="_blank" rel="noreferrer" className="rounded-xl overflow-hidden bg-gray-100">
                                        <img src={photo.url} alt="Blog foto" className="w-full h-40 object-cover hover:scale-105 transition-transform" />
                                    </a>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </article>

            <style>{`
                .blog-content h1 { font-size: 1.8rem; font-weight: 700; color: #111827; margin: 0 0 0.75rem; }
                .blog-content h2 { font-size: 1.5rem; font-weight: 700; color: #111827; margin: 1.25rem 0 0.75rem; }
                .blog-content h3 { font-size: 1.2rem; font-weight: 700; color: #111827; margin: 1rem 0 0.5rem; }
                .blog-content p { color: #374151; line-height: 1.8; margin-bottom: 0.9rem; }
                .blog-content ul { list-style: disc; padding-left: 1.4rem; margin-bottom: 0.9rem; color: #374151; }
                .blog-content ol { list-style: decimal; padding-left: 1.4rem; margin-bottom: 0.9rem; color: #374151; }
                .blog-content li { margin-bottom: 0.2rem; }
                .blog-content blockquote { border-left: 4px solid #f97316; padding-left: 1rem; color: #6b7280; font-style: italic; margin: 1rem 0; }
                .blog-content img { max-width: 100%; border-radius: 0.75rem; margin: 1rem 0; }
                .blog-content a { color: #ea580c; text-decoration: underline; }
            `}</style>
        </AppLayout>
    );
}
