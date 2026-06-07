import { Link, router, usePage } from '@inertiajs/react';
import { type ReactNode } from 'react';

interface Props {
    children: ReactNode;
    title?: string;
}

const navItems = [
    { href: '/admin', label: 'Dashboard', icon: '📊' },
    { href: '/admin/scooters', label: 'Scooters', icon: '🛵' },
    { href: '/admin/blog', label: 'Blog', icon: '📰' },
    { href: '/admin/paginas/over-ons', label: "Pagina's", icon: '📝' },
    { href: '/profiel', label: 'Profiel', icon: '👤' },
];

export default function AdminLayout({ children, title }: Props) {
    const { url } = usePage();

    function handleLogout() {
        router.post('/logout');
    }

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            <aside className="w-56 bg-gray-900 text-white flex flex-col min-h-screen fixed top-0 left-0 z-40">
                <div className="p-4 border-b border-gray-700">
                    <Link href="/" className="flex items-center gap-2">
                        <span className="text-xl">🛵</span>
                        <div>
                            <div className="font-bold text-sm leading-tight">Goed Op Weg</div>
                            <div className="text-orange-400 text-xs">Nijkerk Admin</div>
                        </div>
                    </Link>
                </div>

                <nav className="flex-1 p-3 space-y-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                url === item.href || (item.href !== '/admin' && url.startsWith(item.href))
                                    ? 'bg-orange-500 text-white'
                                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                            }`}
                        >
                            <span>{item.icon}</span>
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="p-3 border-t border-gray-700 space-y-2">
                    <Link
                        href="/"
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                    >
                        <span>🌐</span> Bekijk site
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-red-400 hover:bg-gray-800 transition-colors text-left"
                    >
                        <span>🚪</span> Uitloggen
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 ml-56">
                {title && (
                    <div className="bg-white border-b border-gray-200 px-6 py-4">
                        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
                    </div>
                )}
                <div className="p-6">{children}</div>
            </div>
        </div>
    );
}
