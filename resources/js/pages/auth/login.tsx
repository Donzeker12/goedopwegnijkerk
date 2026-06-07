import { Head, useForm } from '@inertiajs/react';
import { type FormEvent } from 'react';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        post('/login');
    }

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
            <Head title="Inloggen" />

            <div className="w-full max-w-sm">
                <div className="text-center mb-8">
                    <div className="text-5xl mb-3">🛵</div>
                    <h1 className="text-white text-2xl font-bold">Goed Op Weg</h1>
                    <p className="text-gray-400 text-sm mt-1">Admin toegang</p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                E-mailadres
                            </label>
                            <input
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                placeholder="admin@example.nl"
                                autoComplete="email"
                                autoFocus
                            />
                            {errors.email && (
                                <p className="mt-1 text-red-500 text-xs">{errors.email}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Wachtwoord
                            </label>
                            <input
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                placeholder="••••••••"
                                autoComplete="current-password"
                            />
                            {errors.password && (
                                <p className="mt-1 text-red-500 text-xs">{errors.password}</p>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                id="remember"
                                type="checkbox"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                                className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                            />
                            <label htmlFor="remember" className="text-sm text-gray-600">
                                Onthoud mij
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors"
                        >
                            {processing ? 'Bezig...' : 'Inloggen'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
