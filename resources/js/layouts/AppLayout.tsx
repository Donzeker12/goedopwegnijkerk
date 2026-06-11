import { Link, usePage } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { type ReactNode, useEffect, useState } from 'react';
import { type User } from '../types/auth';

interface Props {
    children: ReactNode;
}

export default function AppLayout({ children }: Props) {
    const { url, props } = usePage<{ auth?: { user?: User | null } }>();
    const [menuOpen, setMenuOpen] = useState(false);
    const authUser = props.auth?.user;

    const showFloatingChat = !url.startsWith('/chat');

    const chatSource = (() => {
        if (url.startsWith('/scooters/')) return 'floating-scooter';
        if (url.startsWith('/scooters')) return 'floating-scooters';
        if (url.startsWith('/faq')) return 'floating-faq';
        if (url.startsWith('/over-ons')) return 'floating-over-ons';
        if (url.startsWith('/blog')) return 'floating-blog';
        return 'floating-home';
    })();

    const selectedScooterId = (() => {
        const match = url.match(/^\/scooters\/(\d+)/);
        return match ? match[1] : null;
    })();

    const chatHref = `/chat?bron=${chatSource}${selectedScooterId ? `&scooter_id=${selectedScooterId}` : ''}`;

    const navLinks = [
        { href: '/', label: 'Home', icon: '🏠' },
        { href: '/scooters', label: 'Scooters', icon: '🛵' },
        { href: '/blog', label: 'Blog', icon: '📰' },
        { href: '/over-ons', label: 'Over Ons', icon: '🙋' },
        { href: '/faq', label: 'FAQ & Garantie', icon: '🛠️' },
        ...((authUser?.is_admin) ? [{ href: '/admin', label: 'Dashboard', icon: '📊' }] : []),
    ];

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setMenuOpen(false);
            }
        };

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="bg-white shadow-sm sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link href="/" className="flex items-center gap-2">
                            <img src="/brand-logo.png" alt="Goed Op Weg logo" className="h-9 w-9 rounded-md object-contain bg-white" />
                            <div>
                                <div className="font-bold text-gray-900 leading-tight text-sm sm:text-base">
                                    Goed Op Weg
                                </div>
                                <div className="text-orange-500 text-xs font-medium">Nijkerk</div>
                                <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide hidden sm:block">Begint met vertrouwen</div>
                            </div>
                        </Link>

                        <nav className="hidden md:flex items-center gap-1 sm:gap-2">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                        url === link.href
                                            ? 'bg-orange-500 text-white'
                                            : 'text-gray-600 hover:text-orange-500 hover:bg-orange-50'
                                    }`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>

                        <button
                            type="button"
                            onClick={() => setMenuOpen((v) => !v)}
                            className={`md:hidden inline-flex items-center gap-2 justify-center rounded-xl border px-3.5 py-2 text-sm font-semibold transition-colors ${
                                menuOpen
                                    ? 'border-orange-500 bg-orange-50 text-orange-600'
                                    : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                            }`}
                            aria-expanded={menuOpen}
                            aria-controls="mobile-navigation"
                            aria-label="Open mobiel menu"
                        >
                            <span>{menuOpen ? '✕' : '☰'}</span>
                            <span>Menu</span>
                        </button>
                    </div>

                    <AnimatePresence initial={false}>
                        {menuOpen && (
                            <motion.div
                                id="mobile-navigation"
                                className="md:hidden pb-3"
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                            >
                                <motion.div
                                    className="rounded-2xl border border-orange-100 bg-white/95 backdrop-blur shadow-lg p-2.5"
                                    initial={{ y: -10, scale: 0.98, opacity: 0 }}
                                    animate={{ y: 0, scale: 1, opacity: 1 }}
                                    exit={{ y: -8, scale: 0.98, opacity: 0 }}
                                    transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                                >
                                    <div className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-orange-500">
                                        Snel naar
                                    </div>
                                    <motion.div
                                        className="space-y-1"
                                        initial="hidden"
                                        animate="visible"
                                        exit="hidden"
                                        variants={{
                                            hidden: { transition: { staggerChildren: 0.025, staggerDirection: -1 } },
                                            visible: { transition: { staggerChildren: 0.045, delayChildren: 0.03 } },
                                        }}
                                    >
                                        {navLinks.map((link) => (
                                            <motion.div
                                                key={link.href}
                                                variants={{
                                                    hidden: { y: 6, opacity: 0 },
                                                    visible: { y: 0, opacity: 1 },
                                                }}
                                                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                                            >
                                                <Link
                                                    href={link.href}
                                                    onClick={() => setMenuOpen(false)}
                                                    className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-[color,background-color] duration-200 ${
                                                        url === link.href
                                                            ? 'bg-orange-500 text-white shadow-sm'
                                                            : 'text-gray-700 hover:text-orange-600 hover:bg-orange-50'
                                                    }`}
                                                >
                                                    <span className="inline-flex items-center gap-2">
                                                        <span aria-hidden="true">{link.icon}</span>
                                                        <span>{link.label}</span>
                                                    </span>
                                                    <span aria-hidden="true" className={url === link.href ? 'text-white/90' : 'text-gray-300'}>→</span>
                                                </Link>
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </header>

            <main className="flex-1">{children}</main>

            {showFloatingChat && (
                <div className="fixed right-4 bottom-4 sm:right-6 sm:bottom-6 z-50">
                    <Link
                        href={chatHref}
                        className="group inline-flex items-center gap-2.5 rounded-full bg-orange-500 hover:bg-orange-600 text-white shadow-xl shadow-orange-500/35 px-4 py-3 sm:px-5 sm:py-3.5 transition-all"
                        aria-label="Start chat"
                    >
                        <span className="relative flex h-3 w-3">
                            <span className="absolute inline-flex h-full w-full rounded-full bg-white/70 animate-ping" />
                            <span className="relative inline-flex h-3 w-3 rounded-full bg-white" />
                        </span>
                        <span className="text-lg leading-none">💬</span>
                        <span className="font-semibold text-sm sm:text-base">Start chat</span>
                    </Link>
                </div>
            )}

            <footer className="bg-gray-900 text-gray-400 py-8 mt-auto">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-2">
                            <img src="/brand-logo.png" alt="Goed Op Weg logo" className="h-8 w-8 rounded-md object-contain bg-white" />
                            <div>
                                <div className="text-white font-bold text-sm">Goed Op Weg Nijkerk</div>
                                <div className="text-xs">Scooter reparatie &amp; verkoop</div>
                            </div>
                        </div>
                        <div className="text-xs text-center">
                            © {new Date().getFullYear()} Goed Op Weg Nijkerk. Alle rechten voorbehouden.
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
