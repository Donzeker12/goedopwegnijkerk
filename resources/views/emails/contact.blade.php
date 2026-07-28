<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Nieuw contactbericht</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
    <h2 style="margin-bottom: 16px;">Nieuw contactbericht</h2>

    <p><strong>Naam:</strong> {{ $data['name'] }}</p>
    <p><strong>E-mail:</strong> {{ $data['email'] }}</p>
    <p><strong>Telefoon:</strong> {{ $data['phone'] ?? '-' }}</p>
    <p><strong>Onderwerp:</strong> {{ $data['subject'] ?? '-' }}</p>

    <p><strong>Bericht:</strong></p>
    <p>{{ $data['message'] }}</p>
</body>
</html>
