import { Link, router, usePage } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { type ReactNode, useEffect, useMemo, useState } from 'react';

interface Props {
    children: ReactNode;
    title?: string;
}

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const navItems = [
    { href: '/admin', label: 'Dashboard', icon: '📊' },
    { href: '/admin/start', label: 'Mobiel', icon: '📱' },
    { href: '/admin/scooters', label: 'Scooters', icon: '🛵' },
    { href: '/admin/voorraad', label: 'Voorraad', icon: '📦' },
    { href: '/admin/financien', label: 'Financien', icon: '💶' },
    { href: '/admin/chat', label: 'Chat', icon: '💬' },
    { href: '/admin/push', label: 'Devices', icon: '🔔' },
    { href: '/admin/blog', label: 'Blog', icon: '📰' },
    { href: '/admin/paginas/over-ons', label: "Pagina's", icon: '📝' },
    { href: '/admin/site-instellingen', label: 'Site instellingen', icon: '⚙️' },
    { href: '/profiel', label: 'Profiel', icon: '👤' },
];

export default function AdminLayout({ children, title }: Props) {
    const page = usePage();
    const { url } = page;
    const pushConfig = (page.props as { push?: { enabled?: boolean; vapid_public_key?: string } }).push;
    const pushEnabled = Boolean(pushConfig?.enabled && pushConfig?.vapid_public_key);
    const [menuOpen, setMenuOpen] = useState(false);
    const [installPromptEvent, setInstallPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
    const [isStandalone, setIsStandalone] = useState(false);
    const [isOnline, setIsOnline] = useState(typeof navigator === 'undefined' ? true : navigator.onLine);
    const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(() => {
        if (typeof window === 'undefined' || !('Notification' in window)) {
            return 'default';
        }

        return Notification.permission;
    });
    const [lastNotificationState, setLastNotificationState] = useState<{ chatId: number; colorId: number; testRideId: number } | null>(null);
    const [isPushSubscribed, setIsPushSubscribed] = useState(false);
    const [pushBusy, setPushBusy] = useState(false);

    const canInstall = useMemo(() => !isStandalone && installPromptEvent !== null, [isStandalone, installPromptEvent]);

    const isSecureContext = typeof window !== 'undefined' ? window.isSecureContext : false;
    const isIos = typeof window !== 'undefined' && /iPad|iPhone|iPod/.test(window.navigator.userAgent);
    const installUnavailable = !isStandalone && !canInstall;
    const pushUnsupported = !('Notification' in window) || !('PushManager' in window);

    const mobileTabs = navItems.filter((item) =>
        ['/admin/start', '/admin/scooters', '/admin/voorraad', '/admin/financien'].includes(item.href)
    );
    const shouldUsePollingFallback = !pushEnabled || !isPushSubscribed;

    useEffect(() => {
        const mediaQuery = window.matchMedia('(display-mode: standalone)');

        const syncStandalone = () => {
            setIsStandalone(mediaQuery.matches || (window.navigator as Navigator & { standalone?: boolean }).standalone === true);
        };

        const onBeforeInstallPrompt = (event: Event) => {
            event.preventDefault();
            setInstallPromptEvent(event as BeforeInstallPromptEvent);
        };

        const onInstalled = () => {
            setInstallPromptEvent(null);
            setIsStandalone(true);
        };

        const onOnline = () => setIsOnline(true);
        const onOffline = () => setIsOnline(false);

        syncStandalone();
        window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
        window.addEventListener('appinstalled', onInstalled);
        window.addEventListener('online', onOnline);
        window.addEventListener('offline', onOffline);
        mediaQuery.addEventListener('change', syncStandalone);

        return () => {
            window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
            window.removeEventListener('appinstalled', onInstalled);
            window.removeEventListener('online', onOnline);
            window.removeEventListener('offline', onOffline);
            mediaQuery.removeEventListener('change', syncStandalone);
        };
    }, []);

    useEffect(() => {
        async function syncPushSubscriptionState() {
            if (!pushEnabled || !('serviceWorker' in navigator) || !('PushManager' in window)) {
                setIsPushSubscribed(false);
                return;
            }

            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();
            setIsPushSubscribed(subscription !== null);
        }

        void syncPushSubscriptionState();
    }, [pushEnabled]);

    useEffect(() => {
        let intervalId: number | null = null;

        async function fetchNotifications() {
            if (!isOnline) return;

            try {
                const response = await fetch('/admin/notifications', {
                    method: 'GET',
                    headers: {
                        Accept: 'application/json',
                    },
                    credentials: 'same-origin',
                });

                if (!response.ok) return;

                const payload = await response.json() as {
                    counts: {
                        new_chats: number;
                        new_color_requests: number;
                        new_test_ride_requests: number;
                        open_payments: number;
                    };
                    latest: {
                        chat_id: number;
                        color_request_id: number;
                        test_ride_request_id: number;
                    };
                };

                if (!lastNotificationState) {
                    setLastNotificationState({
                        chatId: payload.latest.chat_id,
                        colorId: payload.latest.color_request_id,
                        testRideId: payload.latest.test_ride_request_id,
                    });
                    return;
                }

                if ('Notification' in window && Notification.permission === 'granted' && shouldUsePollingFallback) {
                    if (payload.latest.chat_id > lastNotificationState.chatId && payload.counts.new_chats > 0) {
                        new Notification('Nieuwe chat ontvangen', {
                            body: `Er staan ${payload.counts.new_chats} nieuwe chat(s) klaar in de inbox.`,
                            icon: '/apple-touch-icon.png',
                            badge: '/apple-touch-icon.png',
                            tag: 'new-chat-notification',
                        });
                    }

                    if (payload.latest.color_request_id > lastNotificationState.colorId && payload.counts.new_color_requests > 0) {
                        new Notification('Nieuwe kleur-aanvraag', {
                            body: `Nieuwe aanvragen: ${payload.counts.new_color_requests}.`,
                            icon: '/apple-touch-icon.png',
                            badge: '/apple-touch-icon.png',
                            tag: 'new-color-request-notification',
                        });
                    }

                    if (payload.latest.test_ride_request_id > lastNotificationState.testRideId && payload.counts.new_test_ride_requests > 0) {
                        new Notification('Nieuwe proefrit-aanvraag', {
                            body: `Nieuwe proefritten: ${payload.counts.new_test_ride_requests}.`,
                            icon: '/apple-touch-icon.png',
                            badge: '/apple-touch-icon.png',
                            tag: 'new-test-ride-notification',
                        });
                    }
                }

                setLastNotificationState({
                    chatId: payload.latest.chat_id,
                    colorId: payload.latest.color_request_id,
                    testRideId: payload.latest.test_ride_request_id,
                });
            } catch (error) {
                console.error('Admin notification polling failed:', error);
            }
        }

        void fetchNotifications();
        intervalId = window.setInterval(fetchNotifications, 30000);

        return () => {
            if (intervalId) {
                window.clearInterval(intervalId);
            }
        };
    }, [isOnline, lastNotificationState, shouldUsePollingFallback]);

    async function handleInstallApp() {
        if (!installPromptEvent) return;

        await installPromptEvent.prompt();
        const choice = await installPromptEvent.userChoice;

        if (choice.outcome !== 'accepted') {
            return;
        }

        setInstallPromptEvent(null);
    }

    async function handleEnableNotifications() {
        if (!isSecureContext) {
            console.warn('Push notifications require HTTPS or localhost.');
            return;
        }

        if (!('Notification' in window)) {
            return;
        }

        const permission = await Notification.requestPermission();
        setNotificationPermission(permission);

        if (permission !== 'granted') {
            return;
        }

        if (!pushEnabled || !('serviceWorker' in navigator) || !('PushManager' in window)) {
            return;
        }

        const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        if (!csrf) return;

        const vapidKey = pushConfig?.vapid_public_key;
        if (!vapidKey) return;

        try {
            setPushBusy(true);
            const registration = await navigator.serviceWorker.ready;
            let subscription = await registration.pushManager.getSubscription();

            if (!subscription) {
                subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(vapidKey),
                });
            }

            const payload = subscription.toJSON();

            await fetch('/admin/push/subscriptions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrf,
                },
                credentials: 'same-origin',
                body: JSON.stringify(payload),
            });

            setIsPushSubscribed(true);
        } catch (error) {
            console.error('Push subscription failed:', error);
        } finally {
            setPushBusy(false);
        }
    }

    async function handleDisableNotifications() {
        if (!pushEnabled || !('serviceWorker' in navigator) || !('PushManager' in window)) {
            return;
        }

        const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        if (!csrf) return;

        try {
            setPushBusy(true);
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();

            if (!subscription) {
                setIsPushSubscribed(false);
                return;
            }

            await fetch('/admin/push/subscriptions', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrf,
                },
                credentials: 'same-origin',
                body: JSON.stringify({ endpoint: subscription.endpoint }),
            });

            await subscription.unsubscribe();
            setIsPushSubscribed(false);
        } catch (error) {
            console.error('Push unsubscribe failed:', error);
        } finally {
            setPushBusy(false);
        }
    }

    function handleLogout() {
        router.post('/logout');
    }

    function renderSidebarContent(closeMenuOnNavigate: boolean) {
        return (
            <>
                <div className="p-4 border-b border-gray-700">
                    <Link href="/" className="flex items-center gap-2">
                        <img src="/brand-logo.png" alt="Goed Op Weg logo" className="h-8 w-8 rounded-md object-contain bg-white" />
                        <div>
                            <div className="font-bold text-sm leading-tight">Goed Op Weg</div>
                            <div className="text-orange-400 text-xs">Nijkerk Admin</div>
                        </div>
                    </Link>

                    <div className="mt-3 flex items-center gap-2 text-xs">
                        <span className={`inline-flex h-2 w-2 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-red-400'}`} />
                        <span className="text-gray-300">{isOnline ? 'Online' : 'Offline modus'}</span>
                    </div>

                    {canInstall && (
                        <button
                            type="button"
                            onClick={handleInstallApp}
                            className="mt-3 w-full rounded-lg bg-orange-500 px-3 py-2 text-sm font-medium text-white hover:bg-orange-600 transition-colors"
                        >
                            Installeer app
                        </button>
                    )}

                    {installUnavailable && (
                        <div className="mt-2 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-xs text-gray-300">
                            {isIos ? (
                                <span>
                                    Installatie op iPhone/iPad: open in Safari, tik op Deel en kies Zet op beginscherm.
                                </span>
                            ) : (
                                <span>
                                    Installatieknop verschijnt alleen als browser PWA-install ondersteunt en de site voldoet aan alle eisen.
                                </span>
                            )}
                        </div>
                    )}

                    {notificationPermission !== 'granted' && (
                        <button
                            type="button"
                            onClick={handleEnableNotifications}
                            disabled={pushBusy}
                            className="mt-2 w-full rounded-lg border border-gray-600 px-3 py-2 text-sm font-medium text-gray-100 hover:bg-gray-800 transition-colors"
                        >
                            {pushBusy ? 'Bezig...' : 'Zet meldingen aan'}
                        </button>
                    )}

                    {(!isSecureContext || pushUnsupported) && (
                        <div className="mt-2 rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
                            {!isSecureContext
                                ? 'Meldingen werken alleen via HTTPS of localhost.'
                                : 'Deze browser ondersteunt pushmeldingen niet volledig.'}
                        </div>
                    )}

                    {notificationPermission === 'granted' && pushEnabled && isPushSubscribed && (
                        <button
                            type="button"
                            onClick={handleDisableNotifications}
                            disabled={pushBusy}
                            className="mt-2 w-full rounded-lg border border-gray-600 px-3 py-2 text-sm font-medium text-gray-100 hover:bg-gray-800 transition-colors"
                        >
                            {pushBusy ? 'Bezig...' : 'Zet meldingen uit'}
                        </button>
                    )}
                </div>

                <nav className="flex-1 p-3 space-y-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => closeMenuOnNavigate && setMenuOpen(false)}
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
                        onClick={() => closeMenuOnNavigate && setMenuOpen(false)}
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
            </>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 flex">
            <AnimatePresence>
                {menuOpen && (
                    <motion.button
                        type="button"
                        onClick={() => setMenuOpen(false)}
                        className="lg:hidden fixed inset-0 bg-black/40 z-40"
                        aria-label="Sluit menu"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    />
                )}
            </AnimatePresence>

            <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 pt-safe-top">
                <div className="h-14 px-4 flex items-center justify-between">
                    <Link href="/admin" className="font-bold text-gray-900">Goed Op Weg Admin</Link>
                    <button
                        type="button"
                        onClick={() => setMenuOpen((v) => !v)}
                        className="inline-flex items-center justify-center rounded-lg border border-gray-200 px-3 py-2 text-gray-700"
                        aria-label="Open admin menu"
                    >
                        {menuOpen ? '✕' : '☰'}
                    </button>
                </div>
            </header>

            {/* Mobile drawer */}
            <AnimatePresence>
                {menuOpen && (
                    <motion.aside
                        className="lg:hidden w-56 bg-gray-900 text-white flex flex-col min-h-screen fixed top-0 left-0 z-50"
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: 'spring', stiffness: 340, damping: 34, mass: 0.8 }}
                    >
                        {renderSidebarContent(true)}
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Desktop sidebar */}
            <aside className="hidden lg:flex w-56 bg-gray-900 text-white flex-col min-h-screen fixed top-0 left-0 z-30">
                {renderSidebarContent(false)}
            </aside>

            {/* Main content */}
            <div className="flex-1 lg:ml-56 pt-[calc(3.5rem+env(safe-area-inset-top))] lg:pt-0">
                {title && (
                    <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4">
                        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
                    </div>
                )}
                <div className="p-4 md:p-5 lg:p-6 pb-28 lg:pb-6">{children}</div>
            </div>

            <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/95 backdrop-blur supports-backdrop-filter:bg-white/80 pb-safe-bottom">
                <div className="grid grid-cols-4">
                    {mobileTabs.map((item) => {
                        const active = url === item.href || (item.href !== '/admin' && url.startsWith(item.href));
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex flex-col items-center justify-center gap-0.5 px-2 py-2 text-[11px] font-medium transition-colors ${
                                    active ? 'text-orange-600 bg-orange-50' : 'text-gray-500'
                                }`}
                            >
                                <span className="text-base leading-none">{item.icon}</span>
                                <span className="leading-none">{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; i += 1) {
        outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
}
