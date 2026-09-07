<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class OperatorController extends Controller
{
    public function snapshot(Request $request)
    {
        // Snapshot tiket untuk hari ini; ringkas untuk offline cache
        $today = now()->toDateString();
        $items = OrderItem::select([
                'order_items.ticket_code',
                'order_items.status',
                'orders.status as order_status',
                'orders.order_code',
                'orders.quantity',
                'visit_slots.visit_date',
                'visit_slots.start_time',
                'visit_slots.end_time',
                'users.name as customer',
                'users.citizenship_type',
                'ticket_types.name as ticket_name',
                'ticket_types.category',
                'order_items.unit_price as price',
            ])
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->join('visit_slots', 'visit_slots.id', '=', 'orders.visit_slot_id')
            ->join('ticket_types', 'ticket_types.id', '=', 'order_items.ticket_type_id')
            ->join('users', 'users.id', '=', 'orders.user_id')
            ->whereDate('visit_slots.visit_date', $today)
            ->limit(2000)
            ->get();

        return response()->json(['data' => $items, 'date' => $today, 'generated_at' => now()->toIso8601String()]);
    }

    public function validateBatch(Request $request)
    {
        $data = Validator::make($request->all(), [
            'items' => 'required|array|min:1',
            'items.*.ticket_code' => 'required|string|exists:order_items,ticket_code',
            'items.*.validated_at_client' => 'nullable|date',
        ])->validate();

        $results = [
            'processed' => 0,
            'updated' => 0,
            'skipped' => 0,
            'conflicts' => [],
        ];

        foreach ($data['items'] as $entry) {
            $code = $entry['ticket_code'];
            $item = OrderItem::with(['order' => fn ($q) => $q->with('slot')])
                ->where('ticket_code', $code)
                ->first();

            $results['processed']++;
            if (!$item) {
                $results['skipped']++;
                continue;
            }

            if (!in_array($item->order->status, ['paid', 'used'], true)) {
                // belum paid; tidak bisa validasi
                $results['skipped']++;
                continue;
            }

            if ($item->status === 'used') {
                $results['skipped']++;
                continue;
            }

            // Tandai sebagai used
            $item->update([
                'status' => 'used',
                'validated_at' => now(),
            ]);
            $results['updated']++;
        }

        return response()->json(['message' => 'Batch processed', 'result' => $results]);
    }
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
                'orders.quantity',
                'users.name as customer',
                'users.citizenship_type',
                'ticket_types.name as ticket_name',
                'ticket_types.category',
                'order_items.unit_price as price',
            ])
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->join('visit_slots', 'visit_slots.id', '=', 'orders.visit_slot_id')
            ->join('ticket_types', 'ticket_types.id', '=', 'order_items.ticket_type_id')
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

        $item = OrderItem::with(['ticketType', 'order' => fn ($q) => $q->with(['slot', 'user', 'ticketType'])])
            ->where('ticket_code', $data['ticket_code'])
            ->firstOrFail();

        if ($item->status === 'used') {
            return response()->json([
                'message' => 'Tiket Sudah Dipakai',
                'ticket' => $item,
                'verification' => $this->verificationPayload($item),
            ], 409);
        }
        if (!in_array($item->order->status, ['paid', 'used'], true)) {
            return response()->json([
                'message' => 'Payment not settled',
                'ticket' => $item,
                'verification' => $this->verificationPayload($item),
            ], 422);
        }

        $item->update([
            'status' => 'used',
            'validated_at' => now(),
        ]);

        return response()->json([
            'message' => 'Ticket validated',
            'ticket' => $item->fresh(),
            'verification' => $this->verificationPayload($item),
        ]);
    }

    /**
     * Data identitas yang perlu dilihat petugas gerbang saat QR dipindai.
     * Tiket kategori domestik dijual lebih murah, jadi petugas harus
     * mencocokkan identitas pengunjung sebelum meloloskan.
     */
    private function verificationPayload(OrderItem $item): array
    {
        $order = $item->order;
        // Kategori melekat pada tiket, bukan pada order: satu order bisa
        // memuat rombongan campuran WNI dan WNA.
        $category = $item->ticketType?->category ?? $order?->ticketType?->category ?? 'domestic';
        $isDomestic = $category === 'domestic';

        return [
            'ticket_code' => $item->ticket_code,
            'order_code' => $order?->order_code,
            'visitor_name' => $order?->user?->name,
            'citizenship_type' => $order?->user?->citizenship_type,
            'category' => $category,
            'category_label' => $isDomestic ? 'Domestik (WNI)' : 'Mancanegara (WNA)',
            'ticket_name' => $item->ticketType?->name ?? $order?->ticketType?->name,
            'price' => $item->unit_price ?: $item->ticketType?->price,
            'quantity' => $order?->quantity,
            'visit_date' => optional($order?->slot?->visit_date)?->toDateString(),
            'start_time' => $order?->slot?->start_time,
            'requires_id_check' => $isDomestic,
            'id_check_hint' => $isDomestic
                ? 'Tarif domestik. Cocokkan KTP/identitas WNI sebelum meloloskan pengunjung.'
                : 'Tarif mancanegara. Tidak ada selisih harga yang perlu diperiksa.',
        ];
    }
}
