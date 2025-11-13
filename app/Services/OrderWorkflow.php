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

    public function create(User $user, int $slotId, int $quantity): Order
    {
        if (!$user->citizenship_type) {
            throw new RuntimeException('Lengkapi jenis pengunjung Anda pada profil sebelum memesan', 422);
        }

        return DB::transaction(function () use ($user, $slotId, $quantity) {
            $slot = VisitSlot::with('ticketType')->lockForUpdate()->find($slotId);
            if (!$slot) {
                throw new RuntimeException('Slot not found', 404);
            }
            if ($slot->quota_remaining < $quantity) {
                throw new RuntimeException('Quota not available', 422);
            }

            $slotCategory = $slot->ticketType?->category ?? 'domestic';
            if ($slotCategory !== $user->citizenship_type) {
                $targetLabel = $slotCategory === 'international' ? 'mancanegara' : 'domestik';
                $userLabel = $user->citizenship_type === 'international' ? 'mancanegara' : 'domestik';
                throw new RuntimeException("Slot ini khusus untuk wisatawan {$targetLabel}. Akun Anda terdaftar sebagai {$userLabel}.", 422);
            }

            $slot->decrement('quota_remaining', $quantity);

            $order = Order::create([
                'order_code' => $this->generateOrderCode(),
                'user_id' => $user->id,
                'ticket_type_id' => $slot->ticket_type_id,
                'visit_slot_id' => $slot->id,
                'quantity' => $quantity,
                'amount' => $slot->ticketType->price * $quantity,
                'status' => 'pending',
            ]);

            $items = [];
            for ($i = 0; $i < $quantity; $i++) {
                $items[] = [
                    'order_id' => $order->id,
                    'ticket_code' => strtoupper(Str::uuid()->toString()),
                    'status' => 'pending',
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
            OrderItem::insert($items);

            return $order->load(['items', 'slot', 'ticketType', 'user']);
        });
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
            $payload = [
                'ticket_code' => $item->ticket_code,
                'order_code' => $order->order_code,
                'visit_date' => optional($order->slot?->visit_date)?->toDateString(),
            ];
            $path = $this->qrService->generate($item->ticket_code, $payload);
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

