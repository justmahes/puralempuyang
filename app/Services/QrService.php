<?php

namespace App\Services;

use Illuminate\Support\Facades\Storage;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class QrService
{
    public function generate(string $ticketCode, array $payload): string
    {
        $path = "qrcodes/{$ticketCode}.png";
        $svg = QrCode::format('png')
            ->size(400)
            ->margin(2)
            ->generate(json_encode($payload));

        Storage::disk('public')->put($path, $svg);
        return $path;
    }
}
