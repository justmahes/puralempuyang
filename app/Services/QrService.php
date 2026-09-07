<?php

namespace App\Services;

use Illuminate\Support\Facades\Storage;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class QrService
{
    /**
     * Menyimpan QR tiket dan mengembalikan path relatif pada disk "public".
     *
     * Formatnya SVG, bukan PNG: penyaji PNG pada simple-qrcode memakai
     * BaconQrCode dengan back end imagick, yang tidak selalu tersedia.
     * SVG murni PHP sehingga tidak menuntut ekstensi tambahan.
     */
    public function generate(string $ticketCode): string
    {
        $path = "qrcodes/{$ticketCode}.svg";

        // Isi QR hanya kode tiket, sama dengan yang dibaca pemindai gerbang
        // (OperatorController::validateTicket) dan yang ditampilkan dashboard.
        $svg = QrCode::format('svg')
            ->size(400)
            ->margin(2)
            ->errorCorrection('M')
            ->generate($ticketCode);

        Storage::disk('public')->put($path, $svg);

        return $path;
    }
}
