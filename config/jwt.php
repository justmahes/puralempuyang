<?php

return [
    'secret' => env('JWT_SECRET', 'secret'),
    'exp_minutes' => env('JWT_EXP_MINUTES', 120),
];
