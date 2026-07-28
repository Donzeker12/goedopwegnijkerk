<?php

return [
    'sections' => [
        'home-hero' => [
            'title' => 'Homepage hero',
            'description' => 'Bewerk de bovenste hero-sectie van de homepage.',
            'preview_url' => '/',
            'fields' => [
                ['key' => 'badge', 'label' => 'Badge', 'type' => 'text'],
                ['key' => 'title_line_1', 'label' => 'Titel regel 1', 'type' => 'text'],
                ['key' => 'title_highlight', 'label' => 'Titel accentregel', 'type' => 'text'],
                ['key' => 'description', 'label' => 'Omschrijving', 'type' => 'textarea'],
                ['key' => 'tagline', 'label' => 'Korte extra regel', 'type' => 'text'],
                ['key' => 'primary_cta_label', 'label' => 'Primaire knop tekst', 'type' => 'text'],
                ['key' => 'primary_cta_href', 'label' => 'Primaire knop link', 'type' => 'url'],
                ['key' => 'secondary_cta_label', 'label' => 'Secundaire knop tekst', 'type' => 'text'],
                ['key' => 'secondary_cta_href', 'label' => 'Secundaire knop link', 'type' => 'url'],
                [
                    'key' => 'highlights',
                    'label' => 'USP blokken',
                    'type' => 'repeater',
                    'itemLabel' => 'USP',
                    'fields' => [
                        ['key' => 'eyebrow', 'label' => 'Bovenlabel', 'type' => 'text'],
                        ['key' => 'title', 'label' => 'Titel', 'type' => 'text'],
                        ['key' => 'description', 'label' => 'Omschrijving', 'type' => 'text'],
                    ],
                ],
            ],
            'defaults' => [
                'badge' => 'Premium occasions met garantie',
                'title_line_1' => 'Goed Op Weg',
                'title_highlight' => 'Nijkerk',
                'description' => 'Elke scooter wordt technisch nagelopen, rijklaar gemaakt en helder geprijsd. Geen verrassingen, wel vertrouwen vanaf de eerste rit.',
                'tagline' => 'Goed op weg begint met vertrouwen.',
                'primary_cta_label' => 'Bekijk direct aanbod',
                'primary_cta_href' => '/scooters',
                'secondary_cta_label' => 'Onze werkwijze',
                'secondary_cta_href' => '/over-ons',
                'highlights' => [
                    ['eyebrow' => 'Inspectie', 'title' => 'Punt voor punt', 'description' => 'Controle op remmen, elektra en aandrijving'],
                    ['eyebrow' => 'Levering', 'title' => 'Rijklaar', 'description' => 'Meteen klaar voor gebruik'],
                    ['eyebrow' => 'Prijsbeleid', 'title' => 'Transparant', 'description' => 'Heldere prijs zonder kleine lettertjes'],
                ],
            ],
        ],
        'home-quality' => [
            'title' => 'Homepage kwaliteit',
            'description' => 'Bewerk de drie kwaliteitskaarten op de homepage.',
            'preview_url' => '/',
            'fields' => [
                ['key' => 'eyebrow', 'label' => 'Bovenlabel', 'type' => 'text'],
                ['key' => 'title', 'label' => 'Titel', 'type' => 'text'],
                [
                    'key' => 'cards',
                    'label' => 'Kwaliteitskaarten',
                    'type' => 'repeater',
                    'itemLabel' => 'Kaart',
                    'fields' => [
                        ['key' => 'icon', 'label' => 'Icoon / afkorting', 'type' => 'text'],
                        ['key' => 'title', 'label' => 'Titel', 'type' => 'text'],
                        ['key' => 'description', 'label' => 'Omschrijving', 'type' => 'textarea'],
                    ],
                ],
            ],
            'defaults' => [
                'eyebrow' => 'Onze standaard',
                'title' => 'Kwaliteit eerst, verkoop daarna',
                'cards' => [
                    ['icon' => 'VK', 'title' => 'Vakkundig herstel', 'description' => 'Onderdelen worden waar nodig vervangen of gereviseerd voor duurzaam gebruik.'],
                    ['icon' => 'QC', 'title' => 'Technische eindcheck', 'description' => 'Voor aflevering doorloopt elke scooter een vaste kwaliteitscontrole.'],
                    ['icon' => '€', 'title' => 'Transparante prijs', 'description' => 'Wij communiceren duidelijk wat je krijgt en waarom de prijs klopt.'],
                ],
            ],
        ],
        'home-maintenance' => [
            'title' => 'Homepage onderhoud en reparatie',
            'description' => 'Bewerk de onderhoudssectie met kaarten en prijzen op de homepage.',
            'preview_url' => '/',
            'fields' => [
                ['key' => 'eyebrow', 'label' => 'Bovenlabel', 'type' => 'text'],
                ['key' => 'title', 'label' => 'Titel', 'type' => 'text'],
                ['key' => 'description', 'label' => 'Omschrijving', 'type' => 'textarea'],
                [
                    'key' => 'cards',
                    'label' => 'Onderhoudskaarten',
                    'type' => 'repeater',
                    'itemLabel' => 'Kaart',
                    'fields' => [
                        ['key' => 'badge', 'label' => 'Badge', 'type' => 'text'],
                        ['key' => 'title', 'label' => 'Titel', 'type' => 'text'],
                        ['key' => 'description', 'label' => 'Subtitel', 'type' => 'text'],
                        ['key' => 'items', 'label' => 'Onderdelen (1 per regel)', 'type' => 'textarea'],
                        ['key' => 'price_label', 'label' => 'Prijslabel', 'type' => 'text'],
                        ['key' => 'price', 'label' => 'Prijs', 'type' => 'text'],
                    ],
                ],
            ],
            'defaults' => [
                'eyebrow' => 'Nu beschikbaar',
                'title' => 'Scooter reparatie en onderhoudsbeurten',
                'description' => 'Naast verkoop kun je nu ook bij ons terecht voor scooter reparaties en onderhoud. Zo rijd je veilig, betrouwbaar en zonder verrassingen de weg op.',
                'cards' => [
                    [
                        'badge' => 'Kleine beurt',
                        'title' => 'Voor periodiek onderhoud',
                        'description' => 'Sterke basiscontrole voor dagelijks betrouwbaar gebruik.',
                        'items' => '<ul><li>Controle op remmen, verlichting en banden</li><li>Motorolie controleren en waar nodig verversen</li><li>Accucheck en algemene veiligheidscontrole</li><li>Ketting en aandrijving nalopen en afstellen</li></ul>',
                        'price_label' => 'Prijs',
                        'price' => 'Vanaf EUR 79',
                    ],
                    [
                        'badge' => 'Grote beurt',
                        'title' => 'Voor complete service en zekerheid',
                        'description' => 'Uitgebreide inspectie en onderhoud voor maximale zekerheid.',
                        'items' => '<ul><li>Alles van de kleine beurt</li><li>Bougie, filters en vloeistoffen controleren of vervangen</li><li>Remsysteem en variateur grondig nalopen</li><li>Uitgebreide proefrit en eindcontrole</li></ul>',
                        'price_label' => 'Prijs',
                        'price' => 'Vanaf EUR 159',
                    ],
                ],
            ],
        ],
        'home-featured' => [
            'title' => 'Homepage nieuwste aanbod',
            'description' => 'Bewerk kopteksten en link van het nieuwste aanbod op de homepage.',
            'preview_url' => '/',
            'fields' => [
                ['key' => 'eyebrow', 'label' => 'Bovenlabel', 'type' => 'text'],
                ['key' => 'title', 'label' => 'Titel', 'type' => 'text'],
                ['key' => 'description', 'label' => 'Omschrijving', 'type' => 'text'],
                ['key' => 'link_label', 'label' => 'Link tekst', 'type' => 'text'],
                ['key' => 'link_href', 'label' => 'Link URL', 'type' => 'url'],
            ],
            'defaults' => [
                'eyebrow' => 'Actueel',
                'title' => 'Nieuwste aanbod',
                'description' => 'Rijklaar geselecteerd en direct beschikbaar',
                'link_label' => 'Alle scooters →',
                'link_href' => '/scooters',
            ],
        ],
        'home-cta' => [
            'title' => 'Homepage CTA',
            'description' => 'Bewerk de oranje call-to-action op de homepage.',
            'preview_url' => '/',
            'fields' => [
                ['key' => 'title', 'label' => 'Titel', 'type' => 'text'],
                ['key' => 'description', 'label' => 'Omschrijving', 'type' => 'textarea'],
                ['key' => 'button_label', 'label' => 'Knop tekst', 'type' => 'text'],
                ['key' => 'button_href', 'label' => 'Knop URL', 'type' => 'url'],
            ],
            'defaults' => [
                'title' => 'Klaar voor jouw volgende scooter?',
                'description' => 'Bekijk het actuele aanbod en kies met vertrouwen. Liever eerst advies of een proefrit? Wij helpen je persoonlijk.',
                'button_label' => 'Bekijk alle scooters',
                'button_href' => '/scooters',
            ],
        ],
        'home-info' => [
            'title' => 'Homepage onderblok',
            'description' => 'Bewerk het tekstblok onderaan de homepage.',
            'preview_url' => '/',
            'fields' => [
                ['key' => 'title', 'label' => 'Titel', 'type' => 'text'],
                ['key' => 'description', 'label' => 'Omschrijving', 'type' => 'textarea'],
                [
                    'key' => 'links',
                    'label' => 'Snelkoppelingen',
                    'type' => 'repeater',
                    'itemLabel' => 'Link',
                    'fields' => [
                        ['key' => 'label', 'label' => 'Tekst', 'type' => 'text'],
                        ['key' => 'href', 'label' => 'URL', 'type' => 'url'],
                    ],
                ],
            ],
            'defaults' => [
                'title' => 'Tweedehands scooter kopen in Nijkerk',
                'description' => 'Zoek je een tweedehands scooter in Nijkerk die niet alleen mooi oogt, maar ook technisch goed is? Bij Goed Op Weg Nijkerk staat betrouwbaarheid voorop. Wij controleren, herstellen en leveren rijklaar met een eerlijke prijs en duidelijke informatie per scooter.',
                'links' => [
                    ['label' => 'Bekijk scooters te koop', 'href' => '/scooters'],
                    ['label' => 'Lees FAQ en afleverbelofte', 'href' => '/faq'],
                    ['label' => 'Ontdek onze werkwijze', 'href' => '/over-ons'],
                ],
            ],
        ],
        'shop-hero' => [
            'title' => 'Scooters pagina hero',
            'description' => 'Bewerk de kop van de scooters-pagina.',
            'preview_url' => '/scooters',
            'fields' => [
                ['key' => 'title', 'label' => 'Titel', 'type' => 'text'],
                ['key' => 'count_label_singular', 'label' => 'Tekst bij 1 scooter', 'type' => 'text'],
                ['key' => 'count_label_plural', 'label' => 'Tekst bij meerdere scooters', 'type' => 'text'],
            ],
            'defaults' => [
                'title' => 'Scooters te koop',
                'count_label_singular' => 'scooter beschikbaar',
                'count_label_plural' => 'scooters beschikbaar',
            ],
        ],
        'shop-info' => [
            'title' => 'Scooters pagina onderblok',
            'description' => 'Bewerk het informatieve blok onder de scooterlijst.',
            'preview_url' => '/scooters',
            'fields' => [
                ['key' => 'title', 'label' => 'Titel', 'type' => 'text'],
                ['key' => 'description', 'label' => 'Omschrijving', 'type' => 'textarea'],
                [
                    'key' => 'links',
                    'label' => 'Actielinks',
                    'type' => 'repeater',
                    'itemLabel' => 'Link',
                    'fields' => [
                        ['key' => 'label', 'label' => 'Tekst', 'type' => 'text'],
                        ['key' => 'href', 'label' => 'URL', 'type' => 'url'],
                    ],
                ],
            ],
            'defaults' => [
                'title' => 'Scooters te koop met duidelijke historie',
                'description' => 'In ons aanbod vind je tweedehands scooters die technisch zijn nagekeken en rijklaar worden geleverd. Per scooter laten we zien wat recent is gedaan, welke specificaties relevant zijn en hoe je een proefrit kunt plannen. Zo kun je nuchter vergelijken en met vertrouwen kiezen.',
                'links' => [
                    ['label' => 'Garantie en veelgestelde vragen', 'href' => '/faq'],
                    ['label' => 'Hoe wij scooters rijklaar maken', 'href' => '/over-ons'],
                    ['label' => 'Onderhoudstips en updates', 'href' => '/blog'],
                    ['label' => 'Terug naar homepage', 'href' => '/'],
                ],
            ],
        ],
        'faq-hero' => [
            'title' => 'FAQ hero',
            'description' => 'Bewerk de kop van de FAQ pagina.',
            'preview_url' => '/faq',
            'fields' => [
                ['key' => 'icon', 'label' => 'Icoon', 'type' => 'text'],
                ['key' => 'title', 'label' => 'Titel', 'type' => 'text'],
                ['key' => 'description', 'label' => 'Omschrijving', 'type' => 'textarea'],
            ],
            'defaults' => [
                'icon' => '❓',
                'title' => 'Veelgestelde vragen',
                'description' => 'Alles wat je moet weten over onze garantie, onderhoud en service.',
            ],
        ],
        'faq-questions' => [
            'title' => 'FAQ vragen',
            'description' => 'Beheer de vragen en antwoorden op de FAQ pagina.',
            'preview_url' => '/faq',
            'fields' => [
                [
                    'key' => 'items',
                    'label' => 'Vragen',
                    'type' => 'repeater',
                    'itemLabel' => 'Vraag',
                    'fields' => [
                        ['key' => 'question', 'label' => 'Vraag', 'type' => 'text'],
                        ['key' => 'answer', 'label' => 'Antwoord', 'type' => 'textarea'],
                    ],
                ],
            ],
            'defaults' => [
                'items' => [
                    ['question' => 'Zit er garantie op de scooters van Goed op Weg Nijkerk?', 'answer' => "Ja, absoluut. Wij staan achter de kwaliteit van de scooters die wij opknappen. Daarom leveren wij al onze scooters standaard met een vaste garantieregeling op het motorblok en de accu.\n\nVraag bij de aankoop naar de exacte garantietermijn van jouw scooter."],
                    ['question' => 'Wat houdt de gratis eerste onderhoudsbeurt in?', 'answer' => "Bij de all-in prijs van je scooter zit een gratis controle- en onderhoudsbeurt inbegrepen. We adviseren om hiervoor een afspraak te maken zodra je 1.500 kilometer hebt gereden of na 6 maanden.\n\nTijdens deze beurt lopen we de scooter volledig na: we verversen de motorolie, controleren de bougie en filters en stellen de remmen en bandenspanning af."],
                    ['question' => 'Wat valt er buiten de garantie?', 'answer' => "De garantie dekt vitale onderdelen zoals het motorblok en de elektronica. Slijtageonderdelen die door gebruik minder worden of kapot kunnen gaan, vallen hierbuiten.\n\nDenk hierbij aan banden, remblokken, lampjes en schade die is ontstaan door vallen of een ongeluk."],
                    ['question' => 'Kan ik ook mijn oude scooter aan jullie verkopen?', 'answer' => "Zeker. Heb je nog een scooter in de schuur staan die niet meer start, schade heeft of waar je simpelweg vanaf wilt? Wij kopen ook opknappers in.\n\nNeem contact met ons op, stuur een paar foto's en de details door, en we kijken of we een mooie deal kunnen maken."],
                    ['question' => 'Kan ik langskomen voor een proefrit?', 'answer' => "Natuurlijk. Als je een mooie scooter op onze website hebt gezien, ben je van harte welkom om hem in het echt te komen bekijken en een proefrit te maken.\n\nNeem vooraf even contact met ons op om een moment af te spreken."],
                ],
            ],
        ],
        'faq-cta' => [
            'title' => 'FAQ CTA',
            'description' => 'Bewerk de call-to-action onderaan de FAQ pagina.',
            'preview_url' => '/faq',
            'fields' => [
                ['key' => 'title', 'label' => 'Titel', 'type' => 'text'],
                ['key' => 'description', 'label' => 'Omschrijving', 'type' => 'textarea'],
                ['key' => 'button_label', 'label' => 'Knop tekst', 'type' => 'text'],
                ['key' => 'button_href', 'label' => 'Knop URL', 'type' => 'url'],
            ],
            'defaults' => [
                'title' => 'Nog vragen?',
                'description' => 'Neem gerust contact met ons op. We helpen je graag verder met alles wat je wilt weten.',
                'button_label' => '💬 Neem contact op',
                'button_href' => '/chat',
            ],
        ],
        'admin-whatsapp' => [
            'title' => 'WhatsApp contactnummer',
            'description' => 'Stel het WhatsApp nummer in dat wordt weergegeven in de WhatsApp knop.',
            'fields' => [
                ['key' => 'whatsapp_number', 'label' => 'WhatsApp nummer', 'type' => 'text', 'help' => 'Gebruik international format (bijv. 31683575477)'],
            ],
            'defaults' => [
                'whatsapp_number' => '31683575477',
            ],
        ],
    ],
];
