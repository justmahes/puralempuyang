<?php

namespace App\Services;

use App\Mail\TicketIssued;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\PaymentLog;
use App\Models\User;
use App\Models\VisitSlot;
use Illuminate\Contracts\Mail\Mailer;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use RuntimeException;

class OrderWorkflow
{
    public function __construct(private QrService $qrService, private Mailer $mailer)
    {
    }

    /**
     * @param array<int, array{category: string, quantity: int}> $lines
     *        Rincian pengunjung per tarif, mis. 3 WNI + 1 WNA dalam satu order.
     */
    public function create(User $user, int $slotId, array $lines): Order
    {
        $lines = $this->normaliseLines($lines);
        $quantity = array_sum(array_column($lines, 'quantity'));

        return DB::transaction(function () use ($user, $slotId, $lines, $quantity) {
            $slot = VisitSlot::with('ticketType')->lockForUpdate()->find($slotId);
            if (!$slot) {
                throw new RuntimeException('Slot not found', 404);
            }
            if ($slot->quota_remaining < $quantity) {
                throw new RuntimeException('Quota not available', 422);
            }

            // Tarif diambil dari sesi, bukan dari citizenship_type akun pemesan,
            // supaya satu akun bisa memesan untuk rombongan campuran.
            $tiers = $slot->tiers()->keyBy('category');
            $items = [];
            $amount = 0.0;

            foreach ($lines as $line) {
                $tier = $tiers->get($line['category']);
                if (!$tier) {
                    $label = $line['category'] === 'international' ? 'mancanegara' : 'domestik';
                    throw new RuntimeException("Sesi ini tidak menjual tarif {$label}.", 422);
                }

                for ($i = 0; $i < $line['quantity']; $i++) {
                    $items[] = [
                        'order_id' => null,
                        'ticket_type_id' => $tier->id,
                        'unit_price' => $tier->price,
                        'ticket_code' => strtoupper(Str::uuid()->toString()),
                        'status' => 'pending',
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                    $amount += $tier->price;
                }
            }

            $slot->decrement('quota_remaining', $quantity);

            $order = Order::create([
                'order_code' => $this->generateOrderCode(),
                'user_id' => $user->id,
                'ticket_type_id' => $items[0]['ticket_type_id'],
                'visit_slot_id' => $slot->id,
                'quantity' => $quantity,
                'amount' => $amount,
                'status' => 'pending',
            ]);

            foreach ($items as $index => $item) {
                $items[$index]['order_id'] = $order->id;
            }
            OrderItem::insert($items);

            return $order->load(['items', 'slot', 'ticketType', 'user']);
        });
    }

    /**
     * Buang baris kosong, gabungkan kategori yang sama, dan pastikan
     * setidaknya ada satu pengunjung.
     */
    private function normaliseLines(array $lines): array
    {
        $merged = [];
        foreach ($lines as $line) {
            $category = $line['category'] ?? null;
            $quantity = (int) ($line['quantity'] ?? 0);
            if (!in_array($category, ['domestic', 'international'], true) || $quantity < 1) {
                continue;
            }
            $merged[$category] = ($merged[$category] ?? 0) + $quantity;
        }

        if (!$merged) {
            throw new RuntimeException('Tentukan jumlah pengunjung terlebih dahulu', 422);
        }

        $total = array_sum($merged);
        if ($total > 10) {
            throw new RuntimeException('Maksimal 10 tiket per pesanan', 422);
        }

        return array_map(
            fn ($category, $quantity) => ['category' => $category, 'quantity' => $quantity],
            array_keys($merged),
            $merged
        );
    }

    public function attachSnap(Order $order, string $token, string $url): Order
    {
        $order->update([
            'snap_token' => $token,
            'snap_redirect_url' => $url,
            'status' => 'awaiting_payment',
        ]);
        return $order->fresh(['items', 'slot', 'ticketType', 'user']);
    }

    public function markPaid(Order $order, array $payload): Order
    {
        $order->update([
            'status' => 'paid',
            'payment_type' => $payload['payment_type'] ?? null,
            'midtrans_order_id' => $payload['transaction_id'] ?? null,
            'paid_at' => now(),
        ]);

        PaymentLog::create([
            'order_id' => $order->id,
            'payload' => $payload,
        ]);

        return $order->fresh(['items', 'slot', 'ticketType', 'user']);
    }

    public function releaseSlot(Order $order): void
    {
        $slot = VisitSlot::find($order->visit_slot_id);
        if ($slot) {
            $slot->update([
                'quota_remaining' => min($slot->quota_total, $slot->quota_remaining + $order->quantity),
            ]);
        }
    }

    public function fulfill(Order $order): array
    {
        $order->loadMissing(['items', 'slot', 'ticketType', 'user']);
        $tickets = [];
        foreach ($order->items as $item) {
            $path = $this->qrService->generate($item->ticket_code);
            $item->update([
                'qr_path' => $path,
                'status' => 'valid',
            ]);
            $tickets[] = $item->toArray();
        }

        if ($order->user) {
            $this->mailer->to($order->user->email)->send(
                new TicketIssued($order->user->toArray(), $this->orderPayload($order), $tickets)
            );
        }

        return $tickets;
    }

    public function expireIfTimedOut(Order $order): Order
    {
        $minutes = (int) config('payments.pending_window_minutes', 5);
        if ($order->status === 'awaiting_payment'
            && $order->created_at
            && $order->created_at->copy()->addMinutes($minutes)->isPast()) {
            $order->update(['status' => 'expired']);
            $this->releaseSlot($order);
            $order->items()->update(['status' => 'expired']);
            $order->refresh(['items', 'slot', 'ticketType', 'user']);
        }

        return $order;
    }

    public function pendingExpiresAt(Order $order): ?string
    {
        if ($order->status !== 'awaiting_payment' || !$order->created_at) {
            return null;
        }

        return $order->created_at
            ->copy()
            ->addMinutes((int) config('payments.pending_window_minutes', 5))
            ->toIso8601String();
    }

    private function generateOrderCode(): string
    {
        return 'PL-' . now()->format('Ymd') . '-' . strtoupper(Str::random(8));
    }

    private function orderPayload(Order $order): array
    {
        return [
            'order_code' => $order->order_code,
            'quantity' => $order->quantity,
            'visit_date' => optional($order->slot?->visit_date)?->toDateString(),
            'start_time' => $order->slot?->start_time,
            'end_time' => $order->slot?->end_time,
        ];
    }
}

