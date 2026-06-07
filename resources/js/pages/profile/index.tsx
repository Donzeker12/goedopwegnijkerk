import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { type FormEvent, useState } from 'react';

interface Props {
    user: {
        name: string;
        email: string;
    };
    flash?: {
        success?: string;
    };
}

export default function Profile({ user }: Props) {
    const page = usePage<Props>();
    const [localSuccess, setLocalSuccess] = useState<string | null>(null);

    const { data, setData, put, processing, errors, reset } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        setLocalSuccess(null);

        put('/profiel/wachtwoord', {
            onSuccess: () => {
                reset();
                setLocalSuccess('Wachtwoord is succesvol gewijzigd.');
            },
        });
    }

    const successMessage = localSuccess || page.props.flash?.success;

    return (
        <div className="min-h-screen bg-gray-100 px-4 py-10">
            <Head title="Profiel" />

            <div className="mx-auto max-w-2xl space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900">Mijn profiel</h1>
                    <Link
                        href="/admin"
                        className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-black"
                    >
                        Terug naar admin
                    </Link>
                </div>

                <div className="rounded-2xl bg-white p-6 shadow-sm">
                    <h2 className="mb-3 text-lg font-semibold text-gray-900">Account</h2>
                    <p className="text-sm text-gray-600">
                        <span className="font-medium text-gray-800">Naam:</span> {user.name}
                    </p>
                    <p className="mt-1 text-sm text-gray-600">
                        <span className="font-medium text-gray-800">E-mail:</span> {user.email}
                    </p>
                </div>

                <div className="rounded-2xl bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-lg font-semibold text-gray-900">Wachtwoord wijzigen</h2>

                    {successMessage && (
                        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                            {successMessage}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Huidig wachtwoord</label>
                            <input
                                type="password"
                                value={data.current_password}
                                onChange={(e) => setData('current_password', e.target.value)}
                                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                                autoComplete="current-password"
                            />
                            {errors.current_password && (
                                <p className="mt-1 text-xs text-red-600">{errors.current_password}</p>
                            )}
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Nieuw wachtwoord</label>
                            <input
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                                autoComplete="new-password"
                            />
                            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Bevestig nieuw wachtwoord</label>
                            <input
                                type="password"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                                autoComplete="new-password"
                            />
                            {errors.password_confirmation && (
                                <p className="mt-1 text-xs text-red-600">{errors.password_confirmation}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {processing ? 'Opslaan...' : 'Wachtwoord opslaan'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
