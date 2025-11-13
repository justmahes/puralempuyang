<?php

namespace App\Http\Controllers\Api;

use App\Exports\TransactionsExport;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use App\Models\VisitSlot;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;

class AdminController extends Controller
{
    private const EXCLUDED_CUSTOMERS = ['Oka Pradnya'];
    public function overview()
    {
        $summary = Order::selectRaw('SUM(CASE WHEN status = "paid" THEN amount ELSE 0 END) as revenue')
            ->selectRaw('SUM(CASE WHEN status = "paid" THEN quantity ELSE 0 END) as tickets_sold')
            ->selectRaw('SUM(CASE WHEN status = "awaiting_payment" THEN 1 ELSE 0 END) as pending_orders')
            ->whereDoesntHave('user', function ($query) {
                $query->whereIn('name', self::EXCLUDED_CUSTOMERS);
            })
            ->first();

        $visitors = OrderItem::whereIn('status', ['valid', 'used'])
            ->whereHas('order.user', function ($query) {
                $query->whereNotIn('name', self::EXCLUDED_CUSTOMERS);
            })
            ->count();

        $trend = Order::selectRaw('DATE(created_at) as label, SUM(amount) as total, SUM(quantity) as tickets')
            ->where('created_at', '>=', now()->subDays(14))
            ->whereDoesntHave('user', function ($query) {
                $query->whereIn('name', self::EXCLUDED_CUSTOMERS);
            })
            ->groupBy('label')
            ->orderBy('label')
            ->get();

        $utilization = VisitSlot::selectRaw('ticket_types.name as name, SUM(visit_slots.quota_total) as total, SUM(visit_slots.quota_total - visit_slots.quota_remaining) as used')
            ->join('ticket_types', 'ticket_types.id', '=', 'visit_slots.ticket_type_id')
            ->groupBy('ticket_types.name')
            ->get();

        return response()->json([
            'data' => [
                'revenue' => (float) ($summary->revenue ?? 0),
                'tickets_sold' => (int) ($summary->tickets_sold ?? 0),
                'pending_orders' => (int) ($summary->pending_orders ?? 0),
                'visitors' => $visitors,
                'trend' => $trend,
                'utilization' => $utilization,
            ],
        ]);
    }

    public function orders(Request $request)
    {
        $status = $request->query('status');
        $exclude = $request->query('exclude_user');
        $orders = Order::with(['user', 'ticketType', 'slot'])
            ->when($status, fn ($q) => $q->where('status', $status))
            ->when($exclude, function ($q) use ($exclude) {
                $q->whereDoesntHave('user', fn ($userQuery) => $userQuery->where('name', $exclude));
            })
            ->orderByDesc('created_at')
            ->limit(200)
            ->get();

        return response()->json(['data' => $orders]);
    }

    public function storeOperator(Request $request)
    {
        $data = Validator::make($request->all(), [
            'name' => 'required|string|min:3',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'phone' => 'nullable|string',
        ])->validate();

        $operator = User::create([
            'name' => $data['name'],
            'email' => strtolower($data['email']),
            'password' => Hash::make($data['password']),
            'phone' => $data['phone'] ?? null,
            'role' => 'operator',
        ]);

        return response()->json(['operator' => $operator], 201);
    }

    public function deleteOperator(Request $request)
    {
        $data = Validator::make($request->all(), [
            'id' => 'required|exists:users,id',
        ])->validate();

        $operator = User::where('id', $data['id'])->where('role', 'operator')->firstOrFail();
        $operator->delete();
        return response()->json(['message' => 'Operator removed']);
    }

    public function users()
    {
        $users = User::where('role', 'user')
            ->select('id', 'name', 'email', 'phone', 'citizenship_type', 'created_at')
            ->withCount('orders')
            ->orderByDesc('created_at')
            ->limit(200)
            ->get();

        return response()->json(['data' => $users]);
    }

    public function deleteUser(Request $request)
    {
        $data = Validator::make($request->all(), [
            'id' => 'required|exists:users,id',
        ])->validate();

        $user = User::where('id', $data['id'])->where('role', 'user')->firstOrFail();
        $user->delete();

        return response()->json(['message' => 'Pengguna dihapus']);
    }

    public function export(Request $request)
    {
        $from = $request->query('from', now()->startOfMonth()->toDateString());
        $to = $request->query('to', now()->toDateString());

        $rows = Order::with(['user', 'slot'])
            ->whereBetween(DB::raw('DATE(created_at)'), [$from, $to])
            ->orderBy('created_at')
            ->get()
            ->map(function ($order) {
                return [
                    $order->order_code,
                    $order->user?->name,
                    $order->status,
                    $order->amount,
                    $order->payment_type,
                    $order->quantity,
                    optional($order->slot?->visit_date)?->toDateString(),
                    $order->slot ? $order->slot->start_time . '-' . $order->slot->end_time : null,
                    $order->created_at->toDateTimeString(),
                    optional($order->paid_at)?->toDateTimeString(),
                ];
            });

        return Excel::download(new TransactionsExport($rows), "transactions-{$from}-{$to}.xlsx");
    }
}

