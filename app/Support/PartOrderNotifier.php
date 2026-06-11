<?php

namespace App\Support;

use App\Models\ScooterPart;
use Illuminate\Support\Facades\Mail;

class PartOrderNotifier
{
    private static function normalizeActorName(string $actorName): string
    {
        $name = trim($actorName);

        if ($name === '') {
            return 'Admin';
        }

        return in_array(strtolower($name), ['ik', 'me', 'mij'], true) ? 'Admin' : $name;
    }

    public static function send(ScooterPart $part, string $actorName = '', string $source = 'Systeem'): void
    {
        $part->loadMissing(['scooter.brand', 'scooter.scooterModel']);

        $businessName = (string) config('seo.business.name', config('app.name', 'Goed Op Weg Nijkerk'));
        $fromEmail = (string) (config('seo.business.email') ?: config('mail.from.address'));
        $recipient = 'infogoedopwegnijkerk@gmail.com';

        $data = [
            'businessName' => $businessName,
            'source' => $source,
            'orderedAt' => now()->format('d-m-Y H:i'),
            'requestedBy' => self::normalizeActorName($actorName),
            'scooterName' => $part->scooter?->display_name ?? 'Geen scooter gekoppeld',
            'scooterId' => $part->scooter_id,
            'partName' => $part->name,
            'partBrand' => $part->part_brand,
            'category' => $part->category,
            'quantity' => (int) $part->quantity,
            'unitCost' => (float) $part->cost,
            'totalCost' => (float) $part->total_cost,
            'notes' => $part->notes,
            'adminScooterUrl' => $part->scooter_id ? url('/admin/scooters/' . $part->scooter_id . '/bewerken') : null,
            'adminInventoryUrl' => url('/admin/voorraad'),
        ];

        $scooterLabel = $part->scooter?->display_name ? ' - ' . $part->scooter->display_name : '';

        Mail::send([
            'html' => 'emails.part-order-notification',
            'text' => 'emails.part-order-notification-text',
        ], $data, function ($mail) use ($recipient, $fromEmail, $businessName, $scooterLabel) {
            $mail->to($recipient)
                ->from($fromEmail, $businessName)
                ->subject('Onderdelen besteld' . $scooterLabel);
        });
    }
}
