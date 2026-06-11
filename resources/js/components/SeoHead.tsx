import { Head } from '@inertiajs/react';

interface Props {
    title: string;
    description: string;
    path?: string;
    image?: string;
    type?: 'website' | 'article' | 'product';
    noindex?: boolean;
    jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>;
    breadcrumbs?: Array<{ name: string; url?: string }>;
}

const SITE_NAME = 'Goed Op Weg Nijkerk';
const DEFAULT_IMAGE = '/apple-touch-icon.png';

function absoluteUrl(path?: string): string {
    const base = (import.meta.env.VITE_APP_URL as string | undefined)?.replace(/\/$/, '');
    const normalizedPath = path?.startsWith('/') ? path : path ? `/${path}` : '';

    if (base) {
        return `${base}${normalizedPath}`;
    }

    if (typeof window !== 'undefined') {
        return `${window.location.origin}${normalizedPath || window.location.pathname}`;
    }

    return normalizedPath || '/';
}

export default function SeoHead({
    title,
    description,
    path,
    image,
    type = 'website',
    noindex = false,
    jsonLd,
    breadcrumbs,
}: Props) {
    const fullTitle = `${title} | ${SITE_NAME}`;
    const canonical = absoluteUrl(path);
    const imageUrl = image ? absoluteUrl(image) : absoluteUrl(DEFAULT_IMAGE);

    const autoBreadcrumbs = !breadcrumbs && path
        ? [{ name: 'Home', url: '/' }, ...path.split('/').filter(Boolean).map((segment, idx, arr) => ({
            name: segment.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
            url: idx === arr.length - 1 ? undefined : `/${arr.slice(0, idx + 1).join('/')}`,
        }))]
        : null;

    const breadcrumbItems = breadcrumbs ?? autoBreadcrumbs;

    const breadcrumbSchema = breadcrumbItems ? {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbItems.map((crumb, idx) => ({
            '@type': 'ListItem',
            position: idx + 1,
            name: crumb.name,
            ...(crumb.url ? { item: absoluteUrl(crumb.url) } : {}),
        })),
    } : null;

    return (
        <Head>
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <meta name="robots" content={noindex ? 'noindex,nofollow' : 'index,follow'} />
            <link rel="canonical" href={canonical} />

            <meta property="og:site_name" content={SITE_NAME} />
            <meta property="og:type" content={type} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:url" content={canonical} />
            <meta property="og:image" content={imageUrl} />

            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={imageUrl} />

            {jsonLd && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            )}
            {breadcrumbSchema && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
                />
            )}
        </Head>
    );
}
