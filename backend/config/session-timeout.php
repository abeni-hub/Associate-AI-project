<?php

return [
    'default' => min(120, max(5, (int) env('SESSION_TIMEOUT_MINUTES', 30))),
    'minimum' => 5,
    'maximum' => 120,
    'warning_seconds' => 90,
    'absolute_lifetime' => max(1, (int) env('SESSION_ABSOLUTE_LIFETIME', 480)),
];
