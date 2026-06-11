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

            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Geplaatste onderdelen</h1>
                    <p className="text-sm text-gray-500">Alles wat al op een scooter is geplaatst.</p>
                </div>
                <Link
                    href="/admin/voorraad"
                    className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                    Terug naar voorraad
                </Link>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 text-sm text-gray-500">
                    {parts.length} geplaatst
                </div>

                {parts.length === 0 ? (
                    <p className="p-4 text-sm text-gray-400">Nog geen geplaatste onderdelen gevonden.</p>
                ) : (
                    <div className="overflow-x-auto">
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
                )}
            </div>
        </AdminLayout>
    );
}
