<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\MidtransService;
use App\Services\OrderWorkflow;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use RuntimeException;

class PaymentController extends Controller
{
    public function __construct(private MidtransService $midtrans, private OrderWorkflow $workflow)
    {
    }

    public function snapToken(Request $request)
    {
        $data = Validator::make($request->all(), [
            'order_code' => 'nullable|string|exists:orders,order_code',
            'slot_id' => 'required_without:order_code|integer|exists:visit_slots,id',
            'quantity' => 'required_without:order_code|integer|min:1|max:10',
        ])->validate();

        $user = $request->user();
        if (!empty($data['order_code'])) {
            $order = Order::with(['items', 'slot', 'ticketType'])
                ->where('order_code', $data['order_code'])
                ->forUser($user->id)
                ->firstOrFail();

            $order = $this->workflow->expireIfTimedOut($order);

            if ($order->status !== 'awaiting_payment') {
                return response()->json(['message' => 'Pesanan sudah tidak dapat dilanjutkan'], 422);
            }

            if ($order->snap_token && $order->snap_redirect_url) {
                return response()->json([
                    'token' => $order->snap_token,
                    'redirect_url' => $order->snap_redirect_url,
                    'order_code' => $order->order_code,
                    'order' => $order,
                ]);
            }
        } else {
            $order = $this->workflow->create($user, $data['slot_id'], $data['quantity']);
        }

        $payload = [
            'transaction_details' => [
                'order_id' => $order->order_code,
                'gross_amount' => (int) round($order->amount),
            ],
            'customer_details' => [
                'first_name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
            ],
            'item_details' => [[
                'id' => $order->ticket_type_id,
                'price' => (int) round($order->amount / max(1, $order->quantity)),
                'quantity' => (int) $order->quantity,
                'name' => $order->ticketType->name ?? 'Tiket Pura Lempuyang',
            ]],
            'callbacks' => [
                'finish' => rtrim(config('app.frontend_url'), '/') . '/dashboard?order=' . $order->order_code,
            ],
            'custom_field1' => optional($order->slot?->visit_date)?->toDateString(),
            'custom_field2' => $order->slot?->start_time,
        ];

        $snap = $this->midtrans->createSnap($payload);
        $order = $this->workflow->attachSnap($order, $snap['token'], $snap['redirect_url']);

        return response()->json([
            'token' => $snap['token'],
            'redirect_url' => $snap['redirect_url'],
            'order_code' => $order->order_code,
            'order' => $order,
        ]);
    }

    public function verify(Request $request)
    {
        $data = Validator::make($request->all(), [
            'order_code' => 'required|string|exists:orders,order_code',
            'snap_payload' => 'nullable|array',
        ])->validate();

        $order = Order::with(['items', 'slot', 'ticketType'])
            ->where('order_code', $data['order_code'])
            ->forUser($request->user()->id)
            ->firstOrFail();

        $payload = null;
        if (!empty($data['snap_payload'])) {
            if ($this->midtrans->verifySignature($data['snap_payload'])) {
                $payload = $data['snap_payload'];
            } else {
                Log::warning('Snap payload signature mismatch', [
                    'order_code' => $order->order_code,
                    'status' => $data['snap_payload']['transaction_status'] ?? null,
                    'status_code' => $data['snap_payload']['status_code'] ?? null,
                ]);
            }
        }

        if (!$payload) {
            try {
                $payload = retry(5, function () use ($order) {
                    $status = $this->midtrans->transactionStatus($order->order_code);
                    if (!$status) {
                        throw new RuntimeException('Midtrans belum mengirim status terbaru');
                    }
                    return $status;
                }, 1000);
            } catch (RuntimeException $e) {
                Log::warning('Gagal menarik status Midtrans', [
                    'order_code' => $order->order_code,
                    'message' => $e->getMessage(),
                ]);
                $payload = null;
            }
        }

        if (!$payload) {
            return response()->json(['message' => 'Status transaksi belum tersedia'], 503);
        }

        $order = $this->applyMidtransStatus($order, $payload);

        return response()->json([
            'message' => 'Status pembayaran diperbarui',
            'transaction_status' => $payload['transaction_status'] ?? null,
            'order' => $order->fresh(['items', 'slot', 'ticketType']),
        ]);
    }

    public function callback(Request $request)
    {
        $secret = $request->header('X-Callback-Token');
        if ($secret !== config('midtrans.callback_token')) {
            return response()->json(['message' => 'Invalid callback token'], 403);
        }

        $payload = $request->all();
        if (!$this->midtrans->verifySignature($payload)) {
            return response()->json(['message' => 'Invalid signature'], 403);
        }

        $order = Order::where('order_code', $payload['order_id'])->first();
        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        $this->applyMidtransStatus($order, $payload);

        return response()->json(['message' => 'Callback processed']);
    }

    private function applyMidtransStatus(Order $order, array $payload): Order
    {
        $status = $payload['transaction_status'] ?? 'pending';

        if (in_array($status, ['capture', 'settlement'], true)) {
            $order = $this->workflow->markPaid($order, $payload);
            $this->workflow->fulfill($order);
        } elseif (in_array($status, ['deny', 'cancel', 'expire'], true)) {
            $order->update(['status' => 'expired']);
            $this->workflow->releaseSlot($order);
            $order->items()->update(['status' => 'expired']);
            $order->refresh(['items', 'slot', 'ticketType', 'user']);
        }

        return $order;
    }
}

