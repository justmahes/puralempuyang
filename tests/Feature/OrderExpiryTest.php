<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\User;
use App\Models\VisitSlot;
use App\Services\OrderWorkflow;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Kuota slot dipotong saat order dibuat dan hanya kembali ketika order
 * kedaluwarsa. Order berstatus 'pending' (Snap token tidak pernah didapat,
 * misalnya panggilan ke Midtrans gagal) dulu tidak pernah kedaluwarsa,
 * sehingga kuotanya hilang permanen.
 */
class OrderExpiryTest extends TestCase
{
    use RefreshDatabase;

    private function makeOrder(string $status): array
    {
        $this->seed();

        $slot = VisitSlot::query()->where('quota_remaining', '>', 0)->firstOrFail();
        $user = User::query()->create([
            'name' => 'Penguji',
            'email' => 'penguji@example.test',
            'password' => 'rahasia-penguji',
            'role' => 'user',
            'citizenship_type' => 'domestic',
        ]);

        $quotaBefore = $slot->quota_remaining;

        $order = app(OrderWorkflow::class)->create($user, $slot->id, [
            ['category' => 'domestic', 'quantity' => 2],
        ]);
        $order->update(['status' => $status]);

        return [$order->fresh(['items']), $slot, $quotaBefore];
    }

    public function test_membuat_order_memotong_kuota_slot(): void
    {
        [$order, $slot, $quotaBefore] = $this->makeOrder('pending');

        $this->assertSame($quotaBefore - 2, $slot->fresh()->quota_remaining);
        $this->assertSame(2, $order->items->count());
    }

    public function test_order_pending_yang_lewat_tenggang_kedaluwarsa_dan_kuotanya_kembali(): void
    {
        [$order, $slot, $quotaBefore] = $this->makeOrder('pending');

        // Mundurkan waktu pembuatan melewati tenggang pembayaran.
        $minutes = (int) config('payments.pending_window_minutes', 5);
        $order->forceFill(['created_at' => now()->subMinutes($minutes + 1)])->save();

        $result = app(OrderWorkflow::class)->expireIfTimedOut($order->fresh());

        $this->assertSame('expired', $result->status);
        $this->assertSame($quotaBefore, $slot->fresh()->quota_remaining, 'Kuota slot harus kembali utuh.');
        $this->assertTrue(
            $result->items()->where('status', '!=', 'expired')->doesntExist(),
            'Seluruh tiket dalam order harus ikut kedaluwarsa.'
        );
    }

    public function test_order_awaiting_payment_juga_kedaluwarsa(): void
    {
        [$order, $slot, $quotaBefore] = $this->makeOrder('awaiting_payment');

        $minutes = (int) config('payments.pending_window_minutes', 5);
        $order->forceFill(['created_at' => now()->subMinutes($minutes + 1)])->save();

        $result = app(OrderWorkflow::class)->expireIfTimedOut($order->fresh());

        $this->assertSame('expired', $result->status);
        $this->assertSame($quotaBefore, $slot->fresh()->quota_remaining);
    }

    public function test_order_yang_masih_dalam_tenggang_tidak_diganggu(): void
    {
        [$order, , $quotaBefore] = $this->makeOrder('pending');

        $result = app(OrderWorkflow::class)->expireIfTimedOut($order->fresh());

        $this->assertSame('pending', $result->status);
    }

    public function test_order_lunas_tidak_pernah_dikedaluwarsakan(): void
    {
        [$order, $slot] = $this->makeOrder('paid');

        $minutes = (int) config('payments.pending_window_minutes', 5);
        $order->forceFill(['created_at' => now()->subMinutes($minutes + 100)])->save();

        $result = app(OrderWorkflow::class)->expireIfTimedOut($order->fresh());

        $this->assertSame('paid', $result->status, 'Order yang sudah dibayar tidak boleh hangus.');
    }

    public function test_perintah_penyapu_mengembalikan_kuota_order_basi(): void
    {
        [$order, $slot, $quotaBefore] = $this->makeOrder('pending');

        $minutes = (int) config('payments.pending_window_minutes', 5);
        $order->forceFill(['created_at' => now()->subMinutes($minutes + 1)])->save();

        $this->artisan('orders:expire-stale')->assertSuccessful();

        $this->assertSame('expired', Order::find($order->id)->status);
        $this->assertSame($quotaBefore, $slot->fresh()->quota_remaining);
    }
}
