import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';

const appName = import.meta.env.VITE_APP_NAME || 'Goed Op Weg Nijkerk';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    setup({ el, App, props }) {
        createRoot(el!).render(<App {...props} />);
    },
    progress: {
        color: '#f97316',
    },
});
