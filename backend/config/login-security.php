<?php

return [
    'max_attempts' => 5,
    'lockout_minutes' => min(15, max(1, (int) env('LOGIN_LOCKOUT_MINUTES', 5))),
];
