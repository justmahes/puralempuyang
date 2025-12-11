<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PhotoQueueEntry extends Model
{
    use HasFactory;

    protected $fillable = [
        'photo_point_id', 'order_id', 'queue_number', 'visit_date', 'status',
        'called_at', 'served_at', 'finished_at', 'notified_at', 'device_id'
    ];

    protected $casts = [
        'visit_date' => 'date',
        'called_at' => 'datetime',
        'served_at' => 'datetime',
        'finished_at' => 'datetime',
        'notified_at' => 'datetime',
    ];

    public function point()
    {
        return $this->belongsTo(PhotoPoint::class, 'photo_point_id');
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function assets()
    {
        return $this->hasMany(PhotoAsset::class, 'photo_queue_entry_id');
    }
}

