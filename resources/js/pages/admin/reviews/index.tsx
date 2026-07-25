import { Head, useForm, usePage } from '@inertiajs/react';
import { type FormEvent } from 'react';
import AdminLayout from '../../../layouts/AdminLayout';

interface ReviewItem {
    name: string;
    city: string;
    rating: string;
    text: string;
}

interface ReviewSettings {
    eyebrow: string;
    title: string;
    description: string;
    items: ReviewItem[];
}

interface Props {
    reviews: ReviewSettings;
}

const emptyReview: ReviewItem = {
    name: '',
    city: '',
    rating: '5',
    text: '',
};

function toReviewItems(items: ReviewItem[]): ReviewItem[] {
    return items.length > 0 ? items : [];
}

export default function ReviewsIndex({ reviews }: Props) {
    const { props } = usePage<{ flash?: { success?: string } }>();
    const flash = props.flash;

    const { data, setData, put, processing } = useForm<ReviewSettings>({
        eyebrow: reviews.eyebrow ?? 'Reviews',
        title: reviews.title ?? 'Wat klanten over ons zeggen',
        description: reviews.description ?? '',
        items: toReviewItems(reviews.items ?? []),
    });

    function handleSubmit(event: FormEvent) {
        event.preventDefault();
        put('/admin/reviews');
    }

    function updateField(key: keyof Omit<ReviewSettings, 'items'>, value: string) {
        setData(key, value);
    }

    function updateItem(index: number, key: keyof ReviewItem, value: string) {
        const items = [...data.items];
        const current = items[index] ?? emptyReview;

        items[index] = {
            ...current,
            [key]: value,
        };

        setData('items', items);
    }

    function addItem() {
        setData('items', [...data.items, { ...emptyReview }]);
    }

    function removeItem(index: number) {
        const items = [...data.items];
        items.splice(index, 1);
        setData('items', items);
    }

    const visibleReviews = data.items.filter((item) => item.name.trim() !== '' || item.text.trim() !== '');
    const reviewStats = visibleReviews.reduce(
        (stats, item) => {
            const rating = Math.max(1, Math.min(5, Number.parseInt(item.rating || '5', 10) || 5));

            return {
                total: stats.total + 1,
                sum: stats.sum + rating,
            };
        },
        { total: 0, sum: 0 },
    );

    const averageRating = reviewStats.total > 0 ? Number((reviewStats.sum / reviewStats.total).toFixed(1)) : 0;
    const averageStars = reviewStats.total > 0
        ? '★'.repeat(Math.round(averageRating)) + '☆'.repeat(5 - Math.round(averageRating))
        : '';

    return (
        <AdminLayout title="Reviews beheren">
            <Head title="Reviews beheren" />

            {flash?.success && (
                <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    ✅ {flash.success}
                </div>
            )}

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="flex flex-col gap-1">
                            <h2 className="text-2xl font-bold text-gray-900">Homepage reviews</h2>
                            <p className="text-sm text-gray-600">
                                Deze sectie is losgekoppeld van site-instellingen en verschijnt alleen op de homepage als er reviews zijn ingevuld.
                            </p>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700">Bovenlabel</label>
                            <input
                                type="text"
                                value={data.eyebrow}
                                onChange={(event) => updateField('eyebrow', event.target.value)}
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                placeholder="Reviews"
                            />
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700">Titel</label>
                            <input
                                type="text"
                                value={data.title}
                                onChange={(event) => updateField('title', event.target.value)}
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                placeholder="Wat klanten over ons zeggen"
                            />
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700">Omschrijving</label>
                            <textarea
                                value={data.description}
                                onChange={(event) => updateField('description', event.target.value)}
                                rows={4}
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                placeholder="Korte intro bij de reviews sectie"
                            />
                        </div>
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Reviews</h3>
                                <p className="text-xs text-gray-500">Voeg zoveel reviews toe als je wilt. Lege items worden niet getoond op de homepage.</p>
                            </div>
                            <button
                                type="button"
                                onClick={addItem}
                                className="rounded-lg bg-orange-500 px-3 py-2 text-sm font-semibold text-white hover:bg-orange-600"
                            >
                                + Review
                            </button>
                        </div>

                        <div className="space-y-4">
                            {data.items.length === 0 ? (
                                <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-5 text-sm text-gray-500">
                                    Nog geen reviews toegevoegd. Klik op “Review” om te starten.
                                </div>
                            ) : (
                                data.items.map((item, index) => (
                                    <div key={`${index}-${item.name || 'review'}`} className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                                        <div className="mb-3 flex items-center justify-between gap-3">
                                            <div className="text-sm font-semibold text-gray-900">Review {index + 1}</div>
                                            <button
                                                type="button"
                                                onClick={() => removeItem(index)}
                                                className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                                            >
                                                Verwijderen
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <div>
                                                <label className="mb-1.5 block text-sm font-medium text-gray-700">Naam</label>
                                                <input
                                                    type="text"
                                                    value={item.name}
                                                    onChange={(event) => updateItem(index, 'name', event.target.value)}
                                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                    placeholder="Klantnaam"
                                                />
                                            </div>

                                            <div>
                                                <label className="mb-1.5 block text-sm font-medium text-gray-700">Plaats</label>
                                                <input
                                                    type="text"
                                                    value={item.city}
                                                    onChange={(event) => updateItem(index, 'city', event.target.value)}
                                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                    placeholder="Bijv. Nijkerk"
                                                />
                                            </div>

                                            <div>
                                                <label className="mb-1.5 block text-sm font-medium text-gray-700">Score</label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="5"
                                                    step="1"
                                                    value={item.rating}
                                                    onChange={(event) => updateItem(index, 'rating', event.target.value)}
                                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                />
                                            </div>

                                            <div className="md:col-span-2">
                                                <label className="mb-1.5 block text-sm font-medium text-gray-700">Review tekst</label>
                                                <textarea
                                                    value={item.text}
                                                    onChange={(event) => updateItem(index, 'text', event.target.value)}
                                                    rows={4}
                                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                    placeholder="Wat zei de klant precies?"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-600 disabled:opacity-60"
                        >
                            {processing ? 'Opslaan...' : 'Reviews opslaan'}
                        </button>
                    </div>
                </form>

                <aside className="space-y-5">
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900">Live preview</h3>
                        <p className="mt-1 text-sm text-gray-600">Zo komt de sectie op de homepage te staan.</p>

                        <div className="mt-5 space-y-4">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-orange-600">{data.eyebrow || 'Reviews'}</p>
                                <h4 className="mt-1 text-2xl font-black text-gray-900">{data.title || 'Wat klanten over ons zeggen'}</h4>
                                {data.description && <p className="mt-2 text-sm leading-relaxed text-gray-600">{data.description}</p>}
                                {reviewStats.total > 0 && (
                                    <div className="mt-3 inline-flex flex-wrap items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm">
                                        <span className="font-semibold text-amber-700">{averageStars}</span>
                                        <span className="font-bold text-gray-900">{averageRating.toLocaleString('nl-NL', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} / 5</span>
                                        <span className="text-gray-600">{reviewStats.total.toLocaleString('nl-NL')} review{reviewStats.total === 1 ? '' : 's'}</span>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {(visibleReviews.length > 0 ? visibleReviews : [{ ...emptyReview, name: 'Voorbeeld review', text: 'Voeg een review toe om de homepage sectie zichtbaar te maken.' }]).map((item, index) => {
                                    const rating = Math.max(1, Math.min(5, Number.parseInt(item.rating || '5', 10) || 5));
                                    const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);

                                    return (
                                        <article key={`${index}-${item.name}`} className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                                            <div className="text-amber-500 text-base tracking-wide">{stars}</div>
                                            <p className="mt-3 text-sm leading-relaxed text-gray-700">{item.text}</p>
                                            <div className="mt-4 pt-3 border-t border-gray-200">
                                                <p className="font-bold text-gray-900 text-sm">{item.name}</p>
                                                {item.city && <p className="text-xs text-gray-500">{item.city}</p>}
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
                        <h3 className="text-base font-bold text-amber-900">Tip</h3>
                        <p className="mt-2 leading-relaxed">
                            Laat de lijst leeg als je de homepage-sectie tijdelijk wilt verbergen. Zodra er minstens één review is, verschijnt de sectie automatisch.
                        </p>
                    </div>
                </aside>
            </div>
        </AdminLayout>
    );
}