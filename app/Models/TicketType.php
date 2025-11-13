<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TicketType extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'category',
        'capacity',
        'price',
        'is_active',
    ];

    protected $casts = [
        'price' => 'float',
        'is_active' => 'boolean',
    ];

    public function slots()
    {
        return $this->hasMany(VisitSlot::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }
}

