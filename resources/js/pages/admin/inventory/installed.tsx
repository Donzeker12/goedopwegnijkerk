import { Head, Link } from '@inertiajs/react';
import AdminLayout from '../../../layouts/AdminLayout';

interface InstalledPart {
    id: number;
    name: string;
    category: string;
    part_brand: string | null;
    quantity: number;
    unit_cost: number;
    total_cost: number;
    scooter_id: number | null;
    scooter_name: string | null;
    placed_at: string | null;
}

interface Props {
    parts: InstalledPart[];
}

const euro = (amount: number) => `EUR ${amount.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}`;

export default function InstalledInventoryIndex({ parts }: Props) {
    return (
        <AdminLayout title="Geplaatste onderdelen">
            <Head title="Geplaatste onderdelen" />

            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Geplaatste onderdelen</h1>
                    <p className="text-sm text-gray-500">Alles wat al op een scooter is geplaatst.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Link
                        href="/admin/voorraad/producten/nieuw"
                        className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100"
                    >
                        + Product toevoegen
                    </Link>
                    <Link
                        href="/admin/voorraad"
                        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                    >
                        Terug naar voorraad
                    </Link>
                </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 text-sm text-gray-500">
                    {parts.length} geplaatst
                </div>

                {parts.length === 0 ? (
                    <p className="p-4 text-sm text-gray-400">Nog geen geplaatste onderdelen gevonden.</p>
                ) : (
                    <>
                        <div className="divide-y divide-gray-100 md:hidden">
                            {parts.map((part) => (
                                <article key={part.id} className="p-4 space-y-3">
                                    <div>
                                        <div className="font-semibold text-gray-900">{part.name}</div>
                                        {part.part_brand && <div className="text-xs text-gray-500 mt-0.5">Winkel: {part.part_brand}</div>}
                                    </div>

                                    <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                                        <div>
                                            <dt className="text-gray-500">Categorie</dt>
                                            <dd className="text-gray-700">{part.category}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-gray-500">Datum geplaatst</dt>
                                            <dd className="text-gray-700">{part.placed_at ?? '-'}</dd>
                                        </div>
                                        <div className="col-span-2">
                                            <dt className="text-gray-500">Scooter</dt>
                                            <dd>
                                                {part.scooter_id ? (
                                                    <Link href={`/admin/scooters/${part.scooter_id}/bewerken`} className="text-orange-600 hover:underline">
                                                        {part.scooter_name}
                                                    </Link>
                                                ) : (
                                                    <span className="text-gray-400">Geen koppeling</span>
                                                )}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="text-gray-500">Aantal</dt>
                                            <dd className="font-semibold text-gray-800">{part.quantity}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-gray-500">Kosten</dt>
                                            <dd className="font-semibold text-gray-900">{euro(part.total_cost)}</dd>
                                        </div>
                                    </dl>
                                </article>
                            ))}
                        </div>

                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50 text-xs text-gray-500">
                                        <th className="px-4 py-3 text-left">Onderdeel</th>
                                        <th className="px-4 py-3 text-left">Categorie</th>
                                        <th className="px-4 py-3 text-left">Scooter</th>
                                        <th className="px-4 py-3 text-left">Datum geplaatst</th>
                                        <th className="px-4 py-3 text-right">Aantal</th>
                                        <th className="px-4 py-3 text-right">Kosten</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {parts.map((part) => (
                                        <tr key={part.id}>
                                            <td className="px-4 py-3">
                                                <div className="font-semibold text-gray-900">{part.name}</div>
                                                {part.part_brand && <div className="text-xs text-gray-500 mt-0.5">Winkel: {part.part_brand}</div>}
                                            </td>
                                            <td className="px-4 py-3 text-gray-600">{part.category}</td>
                                            <td className="px-4 py-3">
                                                {part.scooter_id ? (
                                                    <Link href={`/admin/scooters/${part.scooter_id}/bewerken`} className="text-orange-600 hover:underline">
                                                        {part.scooter_name}
                                                    </Link>
                                                ) : (
                                                    <span className="text-gray-400">Geen koppeling</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-gray-700">{part.placed_at ?? '-'}</td>
                                            <td className="px-4 py-3 text-right text-gray-700">{part.quantity}</td>
                                            <td className="px-4 py-3 text-right font-semibold text-gray-900">{euro(part.total_cost)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
        </AdminLayout>
    );
}
