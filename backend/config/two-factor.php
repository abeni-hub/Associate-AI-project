<?php

return [
    'issuer' => env('TWO_FACTOR_ISSUER', env('APP_NAME', 'CivicLink')),
    'required_roles' => array_values(array_filter(array_map(
        'trim',
        explode(',', (string) env('TWO_FACTOR_REQUIRED_ROLES', 'super_admin,sub_city_admin,woreda_admin,bureau_admin'))
    ))),
    'challenge_ttl' => 5,
    'challenge_attempts' => 5,
    'code_window' => 1,
];
