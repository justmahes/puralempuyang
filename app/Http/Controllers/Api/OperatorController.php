<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class OperatorController extends Controller
{
    public function tickets(Request $request)
    {
        $status = $request->query('status');
        $items = OrderItem::select([
                'order_items.ticket_code',
                'order_items.status',
                'order_items.validated_at',
                'orders.order_code',
                'orders.status as order_status',
                'visit_slots.visit_date',
                'visit_slots.start_time',
                'users.name as customer',
                'ticket_types.name as ticket_name',
            ])
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->join('visit_slots', 'visit_slots.id', '=', 'orders.visit_slot_id')
            ->join('ticket_types', 'ticket_types.id', '=', 'orders.ticket_type_id')
            ->join('users', 'users.id', '=', 'orders.user_id')
            ->when($status, fn ($q) => $q->where('order_items.status', $status))
            ->orderByDesc('visit_slots.visit_date')
            ->limit(200)
            ->get();

        return response()->json(['data' => $items]);
    }

    public function stats()
    {
        $today = OrderItem::whereDate('validated_at', now()->toDateString())->count();
        $recent = OrderItem::whereNotNull('validated_at')
            ->orderByDesc('validated_at')
            ->limit(10)
            ->get(['ticket_code', 'validated_at']);

        return response()->json(['data' => [
            'validated_today' => $today,
            'recent' => $recent,
        ]]);
    }

    public function validateTicket(Request $request)
    {
        $data = Validator::make($request->all(), [
            'ticket_code' => 'required|string|exists:order_items,ticket_code',
        ])->validate();

        $item = OrderItem::with(['order' => fn ($q) => $q->with('slot')])
            ->where('ticket_code', $data['ticket_code'])
            ->firstOrFail();

        if ($item->status === 'used') {
            return response()->json(['message' => 'Tiket Sudah Dipakai', 'ticket' => $item], 409);
        }
        if (!in_array($item->order->status, ['paid', 'used'], true)) {
            return response()->json(['message' => 'Payment not settled', 'ticket' => $item], 422);
        }

        $item->update([
            'status' => 'used',
            'validated_at' => now(),
        ]);

        return response()->json(['message' => 'Ticket validated', 'ticket' => $item->fresh()]);
    }
}
