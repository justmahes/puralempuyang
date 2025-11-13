<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\OrderWorkflow;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use RuntimeException;
use Throwable;

class OrderController extends Controller
{
    public function __construct(private OrderWorkflow $workflow)
    {
    }

    public function index(Request $request)
    {
        $orders = Order::with(['items', 'slot', 'ticketType'])
            ->forUser($request->user()->id)
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($order) {
                $order = $this->workflow->expireIfTimedOut($order);
                return $this->transform($order);
            });

        return response()->json(['data' => $orders]);
    }

    public function store(Request $request)
    {
        $data = Validator::make($request->all(), [
            'slot_id' => 'required|exists:visit_slots,id',
            'quantity' => 'required|integer|min:1|max:10',
        ])->validate();

        try {
            $order = $this->workflow->create($request->user(), $data['slot_id'], $data['quantity']);
        } catch (Throwable $e) {
            $code = $e->getCode() >= 400 ? $e->getCode() : 500;
            return response()->json(['message' => $e->getMessage()], $code);
        }

        return response()->json(['order' => $this->transform($order)], 201);
    }

    public function show(Request $request)
    {
        $code = $request->query('code');
        if (!$code) {
            return response()->json(['message' => 'Order code is required'], 422);
        }
        $order = Order::with(['items', 'slot', 'ticketType'])
            ->where('order_code', $code)
            ->forUser($request->user()->id)
            ->first();

        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        $order = $this->workflow->expireIfTimedOut($order);

        return response()->json(['order' => $this->transform($order)]);
    }

    private function transform(Order $order): array
    {
        return [
            'id' => $order->id,
            'order_code' => $order->order_code,
            'amount' => $order->amount,
            'status' => $order->status,
            'quantity' => $order->quantity,
            'paid_at' => optional($order->paid_at)?->toDateTimeString(),
            'created_at' => $order->created_at->toDateTimeString(),
            'visit_date' => optional($order->slot?->visit_date)?->toDateString(),
            'start_time' => $order->slot?->start_time,
            'end_time' => $order->slot?->end_time,
            'ticket_name' => $order->ticketType?->name,
            'expires_at' => $this->workflow->pendingExpiresAt($order),
            'items' => $order->items->map(fn ($item) => [
                'ticket_code' => $item->ticket_code,
                'status' => $item->status,
                'qr_path' => $item->qr_path,
                'validated_at' => optional($item->validated_at)?->toDateTimeString(),
            ]),
        ];
    }
}
