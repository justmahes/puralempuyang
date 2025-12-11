<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\PhotoAsset;
use App\Models\PhotoPoint;
use App\Models\PhotoQueueEntry;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class PhotoQueueController extends Controller
{
    public function points()
    {
        return response()->json(['data' => PhotoPoint::where('is_active', true)->orderBy('id')->get()]);
    }

    // Admin CRUD for photo points
    public function adminPoints()
    {
        return response()->json(['data' => PhotoPoint::orderBy('id')->get()]);
    }

    public function createPoint(Request $request)
    {
        $data = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'location' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ])->validate();
        $point = PhotoPoint::create([
            'name' => $data['name'],
            'location' => $data['location'] ?? null,
            'is_active' => (bool) ($data['is_active'] ?? true),
        ]);
        return response()->json(['point' => $point], 201);
    }

    public function updatePoint(Request $request)
    {
        $data = Validator::make($request->all(), [
            'id' => 'required|exists:photo_points,id',
            'name' => 'required|string|max:255',
            'location' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ])->validate();
        $point = PhotoPoint::findOrFail($data['id']);
        $point->update([
            'name' => $data['name'],
            'location' => $data['location'] ?? null,
            'is_active' => (bool) ($data['is_active'] ?? $point->is_active),
        ]);
        return response()->json(['point' => $point]);
    }

    public function deletePoint(Request $request)
    {
        $data = Validator::make($request->all(), [
            'id' => 'required|exists:photo_points,id',
        ])->validate();
        PhotoPoint::whereKey($data['id'])->delete();
        return response()->json(['message' => 'Photo point deleted']);
    }

    public function enqueue(Request $request)
    {
        $data = Validator::make($request->all(), [
            'point_id' => 'required|exists:photo_points,id',
            'order_code' => 'required|string|exists:orders,order_code',
        ])->validate();

        $order = Order::where('order_code', $data['order_code'])->firstOrFail();
        if (!in_array($order->status, ['paid', 'used'], true)) {
            return response()->json(['message' => 'Order belum lunas'], 422);
        }

        $visitDate = optional($order->slot?->visit_date)?->toDateString() ?? now()->toDateString();
        $last = PhotoQueueEntry::where('photo_point_id', $data['point_id'])
            ->whereDate('visit_date', $visitDate)
            ->orderByDesc('queue_number')
            ->first();
        $next = ($last?->queue_number ?? 0) + 1;

        $entry = PhotoQueueEntry::create([
            'photo_point_id' => $data['point_id'],
            'order_id' => $order->id,
            'visit_date' => $visitDate,
            'queue_number' => $next,
            'status' => 'waiting',
        ]);

        return response()->json(['entry' => $entry], 201);
    }

    public function status(Request $request)
    {
        $code = $request->query('order_code');
        if (!$code) return response()->json(['message' => 'order_code required'], 422);
        $order = Order::where('order_code', $code)->first();
        if (!$order) return response()->json(['message' => 'Order not found'], 404);
        $today = optional($order->slot?->visit_date)?->toDateString() ?? now()->toDateString();
        $entry = PhotoQueueEntry::where('order_id', $order->id)
            ->whereDate('visit_date', $today)
            ->orderByDesc('id')
            ->first();
        if (!$entry) return response()->json(['message' => 'Not in queue'], 404);

        // position: jumlah waiting dengan nomor < entry
        $ahead = PhotoQueueEntry::where('photo_point_id', $entry->photo_point_id)
            ->whereDate('visit_date', $today)
            ->where('status', 'waiting')
            ->where('queue_number', '<', $entry->queue_number)
            ->count();

        return response()->json(['entry' => $entry, 'position' => $ahead]);
    }

    public function list(Request $request)
    {
        $point = (int) $request->query('point_id');
        $date = $request->query('date', now()->toDateString());
        // Auto-skip called entries older than configured minutes
        if ($point) {
            $minutes = (int) env('PHOTO_NO_SHOW_MINUTES', 3);
            if ($minutes > 0) {
                PhotoQueueEntry::where('photo_point_id', $point)
                    ->whereDate('visit_date', $date)
                    ->where('status', 'called')
                    ->where('called_at', '<', now()->subMinutes($minutes))
                    ->update(['status' => 'skipped']);
            }
        }
        $entries = PhotoQueueEntry::with(['order', 'assets'])
            ->when($point, fn($q) => $q->where('photo_point_id', $point))
            ->whereDate('visit_date', $date)
            ->orderBy('queue_number')
            ->get();
        return response()->json(['data' => $entries]);
    }

    public function callNext(Request $request)
    {
        $data = Validator::make($request->all(), [
            'point_id' => 'required|exists:photo_points,id',
            'date' => 'nullable|date',
        ])->validate();
        $date = $data['date'] ?? now()->toDateString();
        $entry = PhotoQueueEntry::where('photo_point_id', $data['point_id'])
            ->whereDate('visit_date', $date)
            ->where('status', 'waiting')
            ->orderBy('queue_number')
            ->first();
        if (!$entry) return response()->json(['message' => 'No waiting entries'], 404);
        $entry->update(['status' => 'called', 'called_at' => now()]);
        return response()->json(['entry' => $entry->fresh()]);
    }

    public function markShooting(Request $request)
    {
        $data = Validator::make($request->all(), [
            'entry_id' => 'required|exists:photo_queue_entries,id',
        ])->validate();
        $entry = PhotoQueueEntry::findOrFail($data['entry_id']);
        $entry->update(['status' => 'shooting', 'served_at' => now()]);
        return response()->json(['entry' => $entry->fresh()]);
    }

    public function complete(Request $request)
    {
        $data = Validator::make($request->all(), [
            'entry_id' => 'required|exists:photo_queue_entries,id',
        ])->validate();
        $entry = PhotoQueueEntry::findOrFail($data['entry_id']);
        $entry->update(['status' => 'done', 'finished_at' => now()]);
        return response()->json(['entry' => $entry->fresh()]);
    }

    public function skip(Request $request)
    {
        $data = Validator::make($request->all(), [
            'entry_id' => 'required|exists:photo_queue_entries,id',
        ])->validate();
        $entry = PhotoQueueEntry::findOrFail($data['entry_id']);
        $entry->update(['status' => 'skipped']);
        return response()->json(['entry' => $entry->fresh()]);
    }

    public function recall(Request $request)
    {
        $data = Validator::make($request->all(), [
            'entry_id' => 'required|exists:photo_queue_entries,id',
        ])->validate();
        $entry = PhotoQueueEntry::findOrFail($data['entry_id']);
        $last = PhotoQueueEntry::where('photo_point_id', $entry->photo_point_id)
            ->whereDate('visit_date', $entry->visit_date)
            ->orderByDesc('queue_number')
            ->first();
        $next = ($last?->queue_number ?? 0) + 1;
        $entry->update([
            'status' => 'waiting',
            'queue_number' => $next,
            'called_at' => null,
            'served_at' => null,
            'finished_at' => null,
        ]);
        return response()->json(['entry' => $entry->fresh()]);
    }

    public function upload(Request $request)
    {
        $data = Validator::make($request->all(), [
            'entry_id' => 'required|exists:photo_queue_entries,id',
            'files.*' => 'required|file|mimes:jpg,jpeg,png|max:5120',
        ])->validate();
        $entry = PhotoQueueEntry::findOrFail($data['entry_id']);

        $saved = [];
        foreach ($request->file('files', []) as $file) {
            $path = $file->store('photos/'.$entry->id, 'public');
            $asset = PhotoAsset::create([
                'photo_queue_entry_id' => $entry->id,
                'file_path' => $path,
                'mime' => $file->getClientMimeType(),
                'size' => $file->getSize(),
            ]);
            $saved[] = $asset;
        }
        return response()->json(['assets' => $saved]);
    }

    public function myAssets(Request $request)
    {
        $user = $request->user();
        $assets = PhotoAsset::select(['photo_assets.*'])
            ->join('photo_queue_entries', 'photo_queue_entries.id', '=', 'photo_assets.photo_queue_entry_id')
            ->join('orders', 'orders.id', '=', 'photo_queue_entries.order_id')
            ->where('orders.user_id', $user->id)
            ->orderByDesc('photo_assets.created_at')
            ->limit(100)
            ->get()
            ->map(function ($asset) {
                return [
                    'id' => $asset->id,
                    'url' => Storage::disk('public')->url($asset->file_path),
                    'mime' => $asset->mime,
                    'size' => $asset->size,
                    'created_at' => $asset->created_at?->toDateTimeString(),
                ];
            });

        return response()->json(['data' => $assets]);
    }
}
