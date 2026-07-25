import { Head, router, useForm, usePage } from '@inertiajs/react';
import { type FormEvent } from 'react';
import AdminLayout from '../../../layouts/AdminLayout';

interface ReviewSectionSettings {
    eyebrow: string;
    title: string;
    description: string;
}

interface ReviewInvite {
    id: number;
    link: string;
    expires_at: string | null;
    used_at: string | null;
    created_at: string | null;
    is_expired: boolean;
    is_used: boolean;
    is_usable: boolean;
}

interface ReviewRecord {
    id: number;
    name: string;
    city: string | null;
    rating: number;
    text: string;
    status: 'pending' | 'approved' | 'rejected';
    submitted_at: string | null;
    approved_at: string | null;
}

interface Props {
    settings: ReviewSectionSettings;
    pendingReviews: ReviewRecord[];
    approvedReviews: ReviewRecord[];
    reviewInvites: ReviewInvite[];
}

export default function ReviewsIndex({ settings, pendingReviews, approvedReviews, reviewInvites }: Props) {
    const { props } = usePage<{ flash?: { success?: string; error?: string } }>();
    const flash = props.flash;

    const sectionForm = useForm<ReviewSectionSettings>({
        eyebrow: settings.eyebrow ?? 'Reviews',
        title: settings.title ?? 'Wat klanten over ons zeggen',
        description: settings.description ?? '',
    });

    const inviteForm = useForm({
        expires_in_days: '30',
    });

    function saveSectionSettings(event: FormEvent) {
        event.preventDefault();
        sectionForm.put('/admin/reviews');
    }

    function createInvite(event: FormEvent) {
        event.preventDefault();
        inviteForm.post('/admin/reviews/links', {
            onSuccess: () => {
                inviteForm.setData('expires_in_days', '30');
            },
        });
    }

    function updateStatus(reviewId: number, status: 'pending' | 'approved' | 'rejected') {
        router.patch(`/admin/reviews/${reviewId}/status`, { status });
    }

    function fallbackCopy(text: string): boolean {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.setAttribute('readonly', '');
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        textArea.style.pointerEvents = 'none';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        let copied = false;

        try {
            copied = document.execCommand('copy');
        } finally {
            document.body.removeChild(textArea);
        }

        return copied;
    }

    function buildInviteMessage(link: string): string {
        return [
            'Hoi! Wil je een korte review achterlaten over je ervaring bij Goed Op Weg Nijkerk?',
            '',
            'Zo werkt het:',
            '1. Open de link hieronder.',
            '2. Vul je naam, sterren en reviewtekst in.',
            '3. Klik op "Review versturen".',
            '',
            'Je review wordt eerst gecontroleerd en daarna geplaatst op de website.',
            '',
            link,
        ].join('\n');
    }

    async function copyLink(link: string) {
        try {
            if (window.isSecureContext && navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(link);
                window.alert('Link gekopieerd.');
                return;
            }

            if (fallbackCopy(link)) {
                window.alert('Link gekopieerd.');
                return;
            }

            throw new Error('Fallback copy failed');
        } catch {
            const manualField = prompt('Kopieer deze link handmatig:', link);

            if (manualField !== null) {
                return;
            }

            window.alert('Kopieren geannuleerd.');
        }
    }

    async function copyInviteMessage(link: string) {
        await copyLink(buildInviteMessage(link));
    }

    const approvedStats = approvedReviews.reduce(
        (stats, review) => ({
            total: stats.total + 1,
            sum: stats.sum + Math.max(1, Math.min(5, review.rating || 5)),
        }),
        { total: 0, sum: 0 },
    );

    const averageRating = approvedStats.total > 0 ? Number((approvedStats.sum / approvedStats.total).toFixed(1)) : 0;
    const averageStars = approvedStats.total > 0
        ? '★'.repeat(Math.round(averageRating)) + '☆'.repeat(5 - Math.round(averageRating))
        : '';

    return (
        <AdminLayout title="Reviews beheren">
            <Head title="Reviews beheren" />

            {flash?.success && (
                <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    {flash.success}
                </div>
            )}

            {flash?.error && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {flash.error}
                </div>
            )}

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                <section className="space-y-6">
                    <form onSubmit={saveSectionSettings} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Homepage review-sectie</h2>
                            <p className="text-sm text-gray-600 mt-1">Alleen goedgekeurde reviews worden zichtbaar op de homepage.</p>
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700">Bovenlabel</label>
                            <input
                                type="text"
                                value={sectionForm.data.eyebrow}
                                onChange={(event) => sectionForm.setData('eyebrow', event.target.value)}
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700">Titel</label>
                            <input
                                type="text"
                                value={sectionForm.data.title}
                                onChange={(event) => sectionForm.setData('title', event.target.value)}
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700">Omschrijving</label>
                            <textarea
                                value={sectionForm.data.description}
                                onChange={(event) => sectionForm.setData('description', event.target.value)}
                                rows={3}
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={sectionForm.processing}
                            className="rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
                        >
                            {sectionForm.processing ? 'Opslaan...' : 'Sectie opslaan'}
                        </button>
                    </form>

                    <form onSubmit={createInvite} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Beveiligde reviewlink maken</h2>
                            <p className="text-sm text-gray-600 mt-1">Stuur deze link via WhatsApp naar je klant. Elke link is eenmalig te gebruiken.</p>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[220px_auto] sm:items-end">
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700">Verloopt na (dagen)</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="365"
                                    value={inviteForm.data.expires_in_days}
                                    onChange={(event) => inviteForm.setData('expires_in_days', event.target.value)}
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={inviteForm.processing}
                                className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-black disabled:opacity-60"
                            >
                                {inviteForm.processing ? 'Aanmaken...' : 'Nieuwe link maken'}
                            </button>
                        </div>
                    </form>

                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900">Laatste links</h3>
                        <div className="mt-4 space-y-3">
                            {reviewInvites.length === 0 ? (
                                <p className="text-sm text-gray-500">Nog geen links gemaakt.</p>
                            ) : (
                                reviewInvites.map((invite) => (
                                    <div key={invite.id} className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                                        <div className="text-xs text-gray-600 mb-2">
                                            {invite.is_usable ? 'Actief' : invite.is_used ? 'Gebruikt' : invite.is_expired ? 'Verlopen' : 'Inactief'}
                                            {' • '}Aangemaakt: {invite.created_at ?? '-'}
                                            {invite.expires_at ? ` • Verloopt: ${invite.expires_at}` : ''}
                                            {invite.used_at ? ` • Gebruikt: ${invite.used_at}` : ''}
                                        </div>
                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                            <input
                                                readOnly
                                                value={invite.link}
                                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-700"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => copyLink(invite.link)}
                                                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100"
                                            >
                                                Kopieer link
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => copyInviteMessage(invite.link)}
                                                className="rounded-lg border border-orange-300 bg-orange-50 px-3 py-2 text-xs font-semibold text-orange-700 hover:bg-orange-100"
                                            >
                                                Kopieer bericht
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </section>

                <section className="space-y-6">
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
                        <h3 className="text-lg font-bold text-amber-900">Live statistiek (goedgekeurd)</h3>
                        <div className="mt-2 text-sm text-amber-900">
                            {approvedStats.total > 0 ? (
                                <>
                                    <span className="font-semibold">{averageStars}</span>
                                    {' '}
                                    <span className="font-bold">{averageRating.toLocaleString('nl-NL', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} / 5</span>
                                    {' op basis van '}
                                    <span className="font-bold">{approvedStats.total.toLocaleString('nl-NL')}</span>
                                    {' review'}{approvedStats.total === 1 ? '' : 's'}
                                </>
                            ) : (
                                <span>Nog geen goedgekeurde reviews.</span>
                            )}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900">In afwachting ({pendingReviews.length})</h3>
                        <div className="mt-4 space-y-4">
                            {pendingReviews.length === 0 ? (
                                <p className="text-sm text-gray-500">Geen wachtende reviews.</p>
                            ) : (
                                pendingReviews.map((review) => (
                                    <article key={review.id} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                                        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
                                            <span>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                                            <span>{review.name}</span>
                                            {review.city && <span>• {review.city}</span>}
                                            {review.submitted_at && <span>• {review.submitted_at}</span>}
                                        </div>
                                        <p className="mt-2 text-sm text-gray-700 leading-relaxed">{review.text}</p>
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            <button
                                                type="button"
                                                onClick={() => updateStatus(review.id, 'approved')}
                                                className="rounded-lg bg-emerald-500 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-600"
                                            >
                                                Goedkeuren
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => updateStatus(review.id, 'rejected')}
                                                className="rounded-lg border border-red-300 bg-white px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50"
                                            >
                                                Afkeuren
                                            </button>
                                        </div>
                                    </article>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900">Goedgekeurd ({approvedReviews.length})</h3>
                        <div className="mt-4 space-y-4 max-h-[560px] overflow-y-auto pr-1">
                            {approvedReviews.length === 0 ? (
                                <p className="text-sm text-gray-500">Nog geen goedgekeurde reviews.</p>
                            ) : (
                                approvedReviews.map((review) => (
                                    <article key={review.id} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                                        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
                                            <span>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                                            <span>{review.name}</span>
                                            {review.city && <span>• {review.city}</span>}
                                            {review.approved_at && <span>• Goedgekeurd: {review.approved_at}</span>}
                                        </div>
                                        <p className="mt-2 text-sm text-gray-700 leading-relaxed">{review.text}</p>
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            <button
                                                type="button"
                                                onClick={() => updateStatus(review.id, 'pending')}
                                                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100"
                                            >
                                                Terug naar wachtlijst
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => updateStatus(review.id, 'rejected')}
                                                className="rounded-lg border border-red-300 bg-white px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50"
                                            >
                                                Afkeuren
                                            </button>
                                        </div>
                                    </article>
                                ))
                            )}
                        </div>
                    </div>
                </section>
            </div>
        </AdminLayout>
    );
}
