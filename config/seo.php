<?php

return [
    'business' => [
        'name' => env('SEO_BUSINESS_NAME', 'Goed Op Weg Nijkerk'),
        'phone' => env('SEO_BUSINESS_PHONE', '+31600000000'),
        'email' => env('SEO_BUSINESS_EMAIL', 'info@goedopwegnijkerk.nl'),
        'street' => env('SEO_BUSINESS_STREET', ''),
        'postal_code' => env('SEO_BUSINESS_POSTAL_CODE', ''),
        'city' => env('SEO_BUSINESS_CITY', 'Nijkerk'),
        'region' => env('SEO_BUSINESS_REGION', 'Gelderland'),
        'country' => env('SEO_BUSINESS_COUNTRY', 'NL'),
    ],

    'city_pages' => [
        'amersfoort' => [
            'name' => 'Amersfoort',
            'distance' => 'circa 15 minuten',
            'keywords' => ['amersfoort', 'vathorst', 'hoogland'],
        ],
        'barneveld' => [
            'name' => 'Barneveld',
            'distance' => 'circa 20 minuten',
            'keywords' => ['barneveld', 'voorthuizen', 'kootwijkerbroek'],
        ],
        'harderwijk' => [
            'name' => 'Harderwijk',
            'distance' => 'circa 25 minuten',
            'keywords' => ['harderwijk', 'hierden'],
        ],
        'zeewolde' => [
            'name' => 'Zeewolde',
            'distance' => 'circa 20 minuten',
            'keywords' => ['zeewolde'],
        ],
    ],
];
