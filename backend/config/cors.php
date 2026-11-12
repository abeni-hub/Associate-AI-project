<?php

declare(strict_types=1);

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Configured for first-party React Single Page Application (SPA) with
    | Sanctum cookie-based session authentication and CSRF protection.
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => ['*'],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => ['X-Socket-Id'],

    'max_age' => 0,

    'supports_credentials' => true,

];
