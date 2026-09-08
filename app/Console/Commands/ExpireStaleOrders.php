<?php

namespace App\Console\Commands;

use App\Models\Order;
use App\Services\OrderWorkflow;
use Illuminate\Console\Command;

/**
 * Penyapu order basi.
 *
 * expireIfTimedOut() hanya berjalan saat order dibaca lewat API, sehingga order
 * yang tidak pernah dibuka pemiliknya akan terus menahan kuota slot. Perintah
 * ini menyapu seluruh order yang sudah lewat tenggang, tanpa menunggu ada yang
 * membuka dashboard.
 */
class ExpireStaleOrders extends Command
{
    protected $signature = 'orders:expire-stale {--dry-run : Tampilkan saja tanpa mengubah data}';

    protected $description = 'Kedaluwarsakan order yang melewati tenggang pembayaran dan kembalikan kuota slotnya';

    public function handle(OrderWorkflow $workflow): int
    {
        $minutes = (int) config('payments.pending_window_minutes', 5);
        $cutoff = now()->subMinutes($minutes);
        $dryRun = (bool) $this->option('dry-run');

        $orders = Order::with(['items', 'slot'])
            ->whereIn('status', OrderWorkflow::HOLDS_QUOTA)
            ->where('created_at', '<=', $cutoff)
            ->get();

        if ($orders->isEmpty()) {
            $this->info('Tidak ada order basi. Tenggang saat ini ' . $minutes . ' menit.');
            return self::SUCCESS;
        }

        $released = 0;
        foreach ($orders as $order) {
            $this->line(sprintf(
                '%s  %-16s  %d tiket  dibuat %s',
                $order->order_code,
                $order->status,
                $order->quantity,
                $order->created_at->diffForHumans()
            ));

            if (!$dryRun) {
                $workflow->expireIfTimedOut($order);
            }
            $released += $order->quantity;
        }

        $this->newLine();
        $this->info(sprintf(
            '%s%d order, %d kuota %s.',
            $dryRun ? '[dry-run] ' : '',
            $orders->count(),
            $released,
            $dryRun ? 'akan dikembalikan' : 'dikembalikan'
        ));

        return self::SUCCESS;
    }
}
