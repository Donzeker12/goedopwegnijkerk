Beste {{ $customerName }},

Bedankt voor je bericht. Hierbij bevestigen wij je afspraak:

Datum: {{ $dateLabel }}
Tijd: {{ $timeLabel }}
Locatie: {{ $location }}

@if (!empty($note))
Opmerking:
{{ $note }}

@endif
Heb je vragen of wil je de afspraak verzetten? Reageer op deze e-mail of ga direct verder in de chat.

Chat: {{ $chatUrl }}

Met vriendelijke groet,
{{ $businessName }}
