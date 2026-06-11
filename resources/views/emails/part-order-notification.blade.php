<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Onderdeel besteld</title>
</head>
<body style="margin:0;padding:0;background:#f3f6fb;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f6fb;padding:24px 12px;">
    <tr>
        <td align="center">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px;background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;">
                <tr>
                    <td style="background:#f3f4f6;padding:18px 24px;color:#111827;border-bottom:1px solid #e5e7eb;">
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                            <tr>
                                <td style="vertical-align:middle;">
                                    <img src="{{ url('/mail-logo.png?v=20260611-2') }}" alt="{{ $businessName }} logo" width="56" height="56" style="display:block;border-radius:12px;border:1px solid #e5e7eb;background:#fff;">
                                </td>
                                <td style="padding-left:14px;vertical-align:middle;">
                                    <div style="font-size:20px;font-weight:700;line-height:1.2;color:#111827;">{{ $businessName }}</div>
                                    <div style="font-size:13px;color:#6b7280;padding-top:3px;">Automatische melding: onderdeel besteld</div>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>

                <tr>
                    <td style="padding:24px;">
                        <p style="margin:0 0 14px 0;font-size:15px;line-height:1.6;color:#374151;">
                            Er is zojuist een onderdeel op <strong>Besteld</strong> gezet.
                        </p>

                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;margin-bottom:18px;">
                            <tr>
                                <td style="padding:16px;">
                                    <p style="margin:0 0 8px 0;font-size:14px;"><strong>Scooter:</strong> {{ $scooterName }}</p>
                                    <p style="margin:0 0 8px 0;font-size:14px;"><strong>Onderdeel:</strong> {{ $partName }}</p>
                                    <p style="margin:0 0 8px 0;font-size:14px;"><strong>Merk / leverancier:</strong> {{ $partBrand ?: '-' }}</p>
                                    <p style="margin:0 0 8px 0;font-size:14px;"><strong>Categorie:</strong> {{ $category ?: '-' }}</p>
                                    <p style="margin:0 0 8px 0;font-size:14px;"><strong>Aantal:</strong> {{ $quantity }}</p>
                                    <p style="margin:0 0 8px 0;font-size:14px;"><strong>Prijs per stuk:</strong> &euro;{{ number_format($unitCost, 2, ',', '.') }}</p>
                                    <p style="margin:0;font-size:14px;"><strong>Totaal:</strong> &euro;{{ number_format($totalCost, 2, ',', '.') }}</p>
                                </td>
                            </tr>
                        </table>

                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;margin-bottom:18px;">
                            <tr>
                                <td style="padding:14px 16px;">
                                    <p style="margin:0 0 6px 0;font-size:13px;"><strong>Bron:</strong> {{ $source }}</p>
                                    <p style="margin:0 0 6px 0;font-size:13px;"><strong>Door:</strong> {{ $requestedBy }}</p>
                                    <p style="margin:0;font-size:13px;"><strong>Tijdstip:</strong> {{ $orderedAt }}</p>
                                </td>
                            </tr>
                        </table>

                        @if (!empty($notes))
                            <p style="margin:0 0 10px 0;font-size:13px;color:#6b7280;"><strong>Notitie:</strong> {{ $notes }}</p>
                        @endif

                        <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 0 8px 0;">
                            <tr>
                                <td style="border-radius:10px;background:#f97316;padding:0;">
                                    <a href="{{ $adminInventoryUrl }}" style="display:inline-block;padding:12px 18px;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;">Open voorraad</a>
                                </td>
                                @if ($adminScooterUrl)
                                    <td style="width:10px;"></td>
                                    <td style="border-radius:10px;background:#111827;padding:0;">
                                        <a href="{{ $adminScooterUrl }}" style="display:inline-block;padding:12px 18px;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;">Open scooter</a>
                                    </td>
                                @endif
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>
</body>
</html>
