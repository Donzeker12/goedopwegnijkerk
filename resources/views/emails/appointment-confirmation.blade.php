<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Afspraakbevestiging</title>
</head>
<body style="margin:0;padding:0;background:#f3f6fb;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f6fb;padding:24px 12px;">
    <tr>
        <td align="center">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;">
                <tr>
                    <td style="background:#f3f4f6;padding:18px 24px;color:#111827;border-bottom:1px solid #e5e7eb;">
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                            <tr>
                                <td style="vertical-align:middle;">
                                    <img src="{{ $logoUrl }}" alt="{{ $businessName }} scooter logo" width="56" height="56" style="display:block;border-radius:12px;border:1px solid #e5e7eb;background:#fff;">
                                </td>
                                <td style="padding-left:14px;vertical-align:middle;">
                                    <div style="font-size:20px;font-weight:700;line-height:1.2;color:#111827;">{{ $businessName }}</div>
                                    <div style="font-size:13px;color:#6b7280;padding-top:3px;">Afspraakbevestiging</div>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>

                <tr>
                    <td style="padding:24px;">
                        <p style="margin:0 0 14px 0;font-size:16px;line-height:1.5;">Beste {{ $customerName }},</p>
                        <p style="margin:0 0 20px 0;font-size:15px;line-height:1.6;color:#374151;">Bedankt voor je bericht. Hierbij bevestigen wij je afspraak:</p>

                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;margin-bottom:18px;">
                            <tr>
                                <td style="padding:16px;">
                                    <p style="margin:0 0 8px 0;font-size:14px;"><strong>Datum:</strong> {{ $dateLabel }}</p>
                                    <p style="margin:0 0 8px 0;font-size:14px;"><strong>Tijd:</strong> {{ $timeLabel }}</p>
                                    <p style="margin:0;font-size:14px;"><strong>Locatie:</strong> {{ $location }}</p>
                                </td>
                            </tr>
                        </table>

                        @if (!empty($note))
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;margin-bottom:18px;">
                                <tr>
                                    <td style="padding:14px 16px;">
                                        <div style="font-size:13px;font-weight:700;color:#9a3412;margin-bottom:6px;">Opmerking</div>
                                        <div style="font-size:14px;line-height:1.6;color:#7c2d12;white-space:pre-line;">{{ $note }}</div>
                                    </td>
                                </tr>
                            </table>
                        @endif

                        <p style="margin:0 0 12px 0;font-size:14px;line-height:1.6;color:#4b5563;">Heb je vragen of wil je de afspraak verzetten? Reageer op deze e-mail of ga direct verder in de chat.</p>

                        <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 0 18px 0;">
                            <tr>
                                <td style="border-radius:10px;background:#f97316;">
                                    <a href="{{ $chatUrl }}" style="display:inline-block;padding:12px 18px;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;">Open je chatgesprek</a>
                                </td>
                            </tr>
                        </table>

                        <p style="margin:0;font-size:14px;line-height:1.6;color:#374151;">Met vriendelijke groet,<br><strong>{{ $businessName }}</strong></p>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>
</body>
</html>
