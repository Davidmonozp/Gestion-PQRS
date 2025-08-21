<?php

return [

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'http://192.168.1.15:5173',
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'https://test-fpqrs.passus.cloud',
        'https://fpqrs.passus.cloud'
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];
