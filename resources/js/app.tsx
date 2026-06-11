import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';

const appName = import.meta.env.VITE_APP_NAME || 'Goed Op Weg Nijkerk';

const isLocalhost = ['localhost', '127.0.0.1'].includes(window.location.hostname);
const canUseServiceWorker = 'serviceWorker' in navigator && (window.isSecureContext || isLocalhost);

if (canUseServiceWorker) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch((error) => {
            console.error('Service worker registration failed:', error);
        });
    });

    window.addEventListener('online', () => {
        navigator.serviceWorker.controller?.postMessage({ type: 'REPLAY_OFFLINE_QUEUE' });
    });
}

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    setup({ el, App, props }) {
        createRoot(el!).render(<App {...props} />);
    },
    progress: {
        color: '#f97316',
    },
});
