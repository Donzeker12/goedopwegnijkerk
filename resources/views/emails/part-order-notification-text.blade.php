Automatische melding: onderdeel besteld

Scooter: {{ $scooterName }}
Onderdeel: {{ $partName }}
Merk / leverancier: {{ $partBrand ?: '-' }}
Categorie: {{ $category ?: '-' }}
Aantal: {{ $quantity }}
Prijs per stuk: EUR {{ number_format($unitCost, 2, ',', '.') }}
Totaal: EUR {{ number_format($totalCost, 2, ',', '.') }}

Bron: {{ $source }}
Door: {{ $requestedBy }}
Tijdstip: {{ $orderedAt }}

@if (!empty($notes))
Notitie: {{ $notes }}

@endif
Voorraad: {{ $adminInventoryUrl }}
@if ($adminScooterUrl)
Scooter: {{ $adminScooterUrl }}
@endif
