<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TicketType;
use App\Models\VisitSlot;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class TicketController extends Controller
{
    public function slots(): \Illuminate\Http\JsonResponse
    {
        $slots = VisitSlot::with('ticketType')
            ->upcoming()
            ->orderBy('visit_date')
            ->orderBy('start_time')
            ->get()
            ->map(function ($slot) {
                return [
                    'id' => $slot->id,
                    'visit_date' => $slot->visit_date->toDateString(),
                    'start_time' => $slot->start_time,
                    'end_time' => $slot->end_time,
                    'quota_total' => $slot->quota_total,
                    'quota_remaining' => $slot->quota_remaining,
                    'ticket_type_id' => $slot->ticket_type_id,
                    'ticket_name' => $slot->ticketType->name,
                    'description' => $slot->ticketType->description,
                    'price' => $slot->ticketType->price,
                    'ticket_category' => $slot->ticketType->category,
                ];
            });

        return response()->json(['data' => $slots]);
    }

    public function types(): \Illuminate\Http\JsonResponse
    {
        return response()->json(['data' => TicketType::orderByDesc('created_at')->get()]);
    }

    public function adminSlots(): \Illuminate\Http\JsonResponse
    {
        $slots = VisitSlot::with('ticketType')->orderByDesc('visit_date')->get();
        return response()->json(['data' => $slots]);
    }

    public function store(Request $request)
    {
        $data = Validator::make($request->all(), [
            'name' => 'required|string',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:1000',
            'capacity' => 'required|integer|min:1',
            'is_active' => 'boolean',
            'category' => 'required|in:domestic,international',
        ])->validate();

        $ticket = TicketType::create($data);
        return response()->json(['ticket' => $ticket], 201);
    }

    public function update(Request $request)
    {
        $data = Validator::make($request->all(), [
            'id' => 'required|exists:ticket_types,id',
            'name' => 'required|string',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:1000',
            'capacity' => 'required|integer|min:1',
            'is_active' => 'boolean',
            'category' => 'required|in:domestic,international',
        ])->validate();

        $ticket = TicketType::findOrFail($data['id']);
        $ticket->update($data);
        return response()->json(['ticket' => $ticket]);
    }

    public function destroy(Request $request)
    {
        $data = Validator::make($request->all(), [
            'id' => 'required|exists:ticket_types,id',
        ])->validate();

        TicketType::whereKey($data['id'])->delete();
        return response()->json(['message' => 'Deleted']);
    }

    public function createSlot(Request $request)
    {
        $data = Validator::make($request->all(), [
            'ticket_type_id' => 'required|exists:ticket_types,id',
            'visit_date' => 'required|date',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'quota_total' => 'required|integer|min:1',
        ])->validate();

        $slot = VisitSlot::create([
            ...$data,
            'quota_remaining' => $data['quota_total'],
        ]);

        return response()->json(['slot' => $slot], 201);
    }

    public function updateSlot(Request $request)
    {
        $data = Validator::make($request->all(), [
            'id' => 'required|exists:visit_slots,id',
            'ticket_type_id' => 'required|exists:ticket_types,id',
            'visit_date' => 'required|date',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'quota_total' => 'required|integer|min:1',
            'quota_remaining' => 'nullable|integer|min:0',
        ])->validate();

        $slot = VisitSlot::findOrFail($data['id']);
        $remaining = $data['quota_remaining'] ?? min($slot->quota_remaining, $data['quota_total']);
        $slot->update([
            ...$data,
            'quota_remaining' => min($data['quota_total'], $remaining),
        ]);

        return response()->json(['slot' => $slot]);
    }

    public function deleteSlot(Request $request)
    {
        $data = Validator::make($request->all(), [
            'id' => 'required|exists:visit_slots,id',
        ])->validate();

        VisitSlot::whereKey($data['id'])->delete();
        return response()->json(['message' => 'Slot deleted']);
    }
}