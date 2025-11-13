<?php

namespace App\Services;

use Exception;
use Midtrans\Config as MidtransConfig;
use Midtrans\Snap;
use Midtrans\Transaction;

class MidtransService
{
    public function __construct()
    {
        MidtransConfig::$serverKey = config('midtrans.server_key');
        MidtransConfig::$isProduction = config('midtrans.is_production');
        MidtransConfig::$isSanitized = true;
        MidtransConfig::$is3ds = true;
    }

    public function createSnap(array $payload): array
    {
        $transaction = Snap::createTransaction($payload);
        return [
            'token' => $transaction->token,
            'redirect_url' => $transaction->redirect_url,
        ];
    }

    public function transactionStatus(string $orderId): ?array
    {
        try {
            $status = Transaction::status($orderId);
        } catch (Exception $e) {
            report($e);
            return null;
        }

        return json_decode(json_encode($status), true);
    }

    public function verifySignature(array $payload): bool
    {
        if (!isset($payload['signature_key'], $payload['order_id'], $payload['status_code'], $payload['gross_amount'])) {
            return false;
        }
        $expected = hash('sha512', $payload['order_id'] . $payload['status_code'] . $payload['gross_amount'] . config('midtrans.server_key'));
        return hash_equals($expected, $payload['signature_key']);
    }
}
