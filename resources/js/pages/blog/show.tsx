import { Link } from '@inertiajs/react';
import SeoHead from '../../components/SeoHead';
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

interface RelatedScooter {
    id: number;
    naam: string;
    prijs: number;
    foto: string | null;
    year: number | null;
    mileage: number | null;
}

interface Props {
    post: BlogPost;
    related_scooters: RelatedScooter[];
}

export default function BlogShow({ post, related_scooters }: Props) {
    const cover = post.photos.find((photo) => photo.is_cover) ?? post.photos[0];
    const gallery = post.photos.filter((photo) => !cover || photo.id !== cover.id);

    const articleSchema = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.excerpt,
        image: cover?.url ? absoluteUrl(cover.url) : undefined,
        datePublished: post.published_at,
        dateModified: post.published_at,
        author: {
            '@type': 'Organization',
            name: 'Goed Op Weg Nijkerk',
        },
        publisher: {
            '@type': 'Organization',
            name: 'Goed Op Weg Nijkerk',
            logo: { '@type': 'ImageObject', url: absoluteUrl('/apple-touch-icon.png') },
        },
    };

    function absoluteUrl(p: string): string {
        if (p.startsWith('http')) return p;
        return (import.meta.env.VITE_APP_URL as string || window.location.origin) + (p.startsWith('/') ? p : '/' + p);
    }

    return (
        <AppLayout>
            <SeoHead
                title={post.title}
                description={post.excerpt ?? 'Lees dit artikel op de blog van Goed Op Weg Nijkerk.'}
                path={`/blog/${post.slug}`}
                type="article"
                image={cover?.url}
                breadcrumbs={[
                    { name: 'Home', url: '/' },
                    { name: 'Blog', url: '/blog' },
                    { name: post.title },
                ]}
                jsonLd={articleSchema}
            />

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
                                        <img src={photo.url} alt="Blog foto" className="w-full h-40 object-cover hover:scale-105 transition-transform" loading="lazy" />
                                    </a>
                                ))}
                            </div>
                        </section>
                    )}

                    <section className="mt-12 pt-8 border-t border-gray-200 bg-white rounded-2xl p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Meer informatie</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <Link href="/scooters" className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-100 transition-colors text-center">
                                Bekijk scooters
                            </Link>
                            <Link href="/faq" className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-100 transition-colors text-center">
                                Veelgestelde vragen
                            </Link>
                            <Link href="/over-ons" className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-100 transition-colors text-center">
                                Onze werkwijze
                            </Link>
                        </div>
                    </section>

                    {related_scooters.length > 0 && (
                        <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-6">
                            <h2 className="text-xl font-bold text-gray-900">Relevante scooters bij dit artikel</h2>
                            <p className="text-sm text-gray-600 mt-1">Direct uit ons actuele aanbod in Nijkerk.</p>
                            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {related_scooters.map((scooter) => (
                                    <Link
                                        key={scooter.id}
                                        href={`/scooters/${scooter.id}`}
                                        className="rounded-xl border border-gray-200 bg-gray-50 overflow-hidden hover:shadow-sm transition-shadow"
                                    >
                                        <div className="aspect-video bg-gray-200 overflow-hidden">
                                            {scooter.foto ? (
                                                <img src={scooter.foto} alt={scooter.naam} className="w-full h-full object-cover" loading="lazy" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-4xl text-gray-300">🛵</div>
                                            )}
                                        </div>
                                        <div className="p-3.5">
                                            <h3 className="font-semibold text-gray-900 text-sm leading-snug">{scooter.naam}</h3>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {scooter.year ? `${scooter.year}` : ''}
                                                {scooter.mileage ? ` • ${scooter.mileage.toLocaleString('nl-NL')} km` : ''}
                                            </p>
                                            <div className="text-orange-600 font-bold mt-2">€{scooter.prijs.toLocaleString('nl-NL')}</div>
                                        </div>
                                    </Link>
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
