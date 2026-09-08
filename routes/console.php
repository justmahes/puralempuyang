<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Kuota slot dipotong saat order dibuat, dan hanya kembali ketika order
// kedaluwarsa. Sapuan berkala menjaga kuota tetap kembali walau tidak ada yang
// membuka dashboard. Perlu `php artisan schedule:work` agar benar-benar jalan.
Schedule::command('orders:expire-stale')->everyMinute()->withoutOverlapping();
