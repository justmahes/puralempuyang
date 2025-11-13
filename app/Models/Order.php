<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_code',
        'user_id',
        'ticket_type_id',
        'visit_slot_id',
        'quantity',
        'amount',
        'status',
        'payment_type',
        'snap_token',
        'snap_redirect_url',
        'midtrans_order_id',
        'paid_at',
    ];

    protected $casts = [
        'amount' => 'float',
        'paid_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function ticketType()
    {
        return $this->belongsTo(TicketType::class);
    }

    public function slot()
    {
        return $this->belongsTo(VisitSlot::class, 'visit_slot_id');
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }
}
