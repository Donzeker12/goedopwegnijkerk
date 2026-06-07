import { Link, usePage } from '@inertiajs/react';
import { type ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

export default function AppLayout({ children }: Props) {
    const { url } = usePage();

    const navLinks = [
        { href: '/', label: 'Home' },
        { href: '/scooters', label: 'Scooters' },
        { href: '/over-ons', label: 'Over Ons' },
        { href: '/faq', label: 'FAQ & Garantie' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="bg-white shadow-sm sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link href="/" className="flex items-center gap-2">
                            <span className="text-2xl">🛵</span>
                            <div>
                                <div className="font-bold text-gray-900 leading-tight text-sm sm:text-base">
                                    Goed Op Weg
                                </div>
                                <div className="text-orange-500 text-xs font-medium">Nijkerk</div>
                            </div>
                        </Link>

                        <nav className="flex items-center gap-1 sm:gap-2">
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
                    </div>
                </div>
            </header>

            <main className="flex-1">{children}</main>

            <footer className="bg-gray-900 text-gray-400 py-8 mt-auto">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-xl">🛵</span>
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
