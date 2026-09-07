<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'ticket_type_id',
        'unit_price',
        'ticket_code',
        'qr_path',
        'status',
        'validated_at',
    ];

    protected $casts = [
        'validated_at' => 'datetime',
        'unit_price' => 'float',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function ticketType()
    {
        return $this->belongsTo(TicketType::class);
    }
}
