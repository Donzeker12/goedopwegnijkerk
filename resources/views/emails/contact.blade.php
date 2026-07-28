<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Nieuw contactbericht</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: Arial, sans-serif;">

    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 16px;">
        <tr>
            <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 580px;">

                    {{-- Header --}}
                    <tr>
                        <td style="background-color: #f97316; border-radius: 12px 12px 0 0; padding: 28px 32px; text-align: center;">
                            <p style="margin: 0 0 4px 0; color: #fff; font-size: 22px; font-weight: bold;">
                                Goed op Weg Nijkerk
                            </p>
                            <p style="margin: 0; color: #fed7aa; font-size: 13px; letter-spacing: 1px; text-transform: uppercase;">
                                Contactformulier
                            </p>
                        </td>
                    </tr>

                    {{-- Body --}}
                    <tr>
                        <td style="background-color: #ffffff; padding: 32px; border-left: 1px solid #e5e7eb; border-right: 1px solid #e5e7eb;">
                            <p style="margin: 0 0 24px 0; color: #374151; font-size: 15px;">
                                Je hebt een nieuw bericht ontvangen via het contactformulier.
                            </p>

                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6;">
                                        <span style="color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 3px;">Naam</span>
                                        <span style="color: #111827; font-size: 15px; font-weight: 600;">{{ $data['name'] }}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6;">
                                        <span style="color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 3px;">E-mailadres</span>
                                        <span style="color: #111827; font-size: 15px; font-weight: 600;">
                                            <a href="mailto:{{ $data['email'] }}" style="color: #f97316; text-decoration: none;">{{ $data['email'] }}</a>
                                        </span>
                                    </td>
                                </tr>
                                @if(!empty($data['phone']))
                                <tr>
                                    <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6;">
                                        <span style="color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 3px;">Telefoonnummer</span>
                                        <span style="color: #111827; font-size: 15px; font-weight: 600;">
                                            <a href="tel:{{ $data['phone'] }}" style="color: #f97316; text-decoration: none;">{{ $data['phone'] }}</a>
                                        </span>
                                    </td>
                                </tr>
                                @endif
                                @if(!empty($data['subject']))
                                <tr>
                                    <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6;">
                                        <span style="color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 3px;">Onderwerp</span>
                                        <span style="color: #111827; font-size: 15px; font-weight: 600;">{{ $data['subject'] }}</span>
                                    </td>
                                </tr>
                                @endif
                                <tr>
                                    <td style="padding: 10px 0;">
                                        <span style="color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 8px;">Bericht</span>
                                        <div style="background-color: #f9fafb; border-left: 3px solid #f97316; border-radius: 4px; padding: 14px 16px; color: #374151; font-size: 15px; line-height: 1.7; white-space: pre-line;">{{ $data['message'] }}</div>
                                    </td>
                                </tr>
                            </table>

                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 28px;">
                                <tr>
                                    <td align="center">
                                        <a href="mailto:{{ $data['email'] }}" style="display: inline-block; background-color: #f97316; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 14px; padding: 12px 28px; border-radius: 8px;">
                                            Beantwoord dit bericht
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    {{-- Footer --}}
                    <tr>
                        <td style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; padding: 20px 32px; text-align: center;">
                            <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                                Goed op Weg Nijkerk &mdash; info@goedopwegnijkerk.nl
                            </p>
                            <p style="margin: 6px 0 0 0; color: #d1d5db; font-size: 11px;">
                                Dit bericht is automatisch verstuurd via het contactformulier op de website.
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>

</body>
</html>

