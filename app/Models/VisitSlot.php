<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VisitSlot extends Model
{
    use HasFactory;

    protected $fillable = [
        'ticket_type_id',
        'visit_date',
        'start_time',
        'end_time',
        'quota_total',
        'quota_remaining',
    ];

    protected $casts = [
        'visit_date' => 'date',
    ];

    public function ticketType()
    {
        return $this->belongsTo(TicketType::class);
    }

    public function scopeUpcoming($query)
    {
        return $query->whereDate('visit_date', '>=', now()->toDateString());
    }

    /**
     * Tarif yang dijual pada sesi ini (domestik & mancanegara). Satu sesi
     * memakai satu kuota bersama, tarif hanya menentukan harga per orang.
     */
    public function tiers()
    {
        $experience = $this->ticketType?->experience_code;
        if (!$experience) {
            return collect($this->ticketType ? [$this->ticketType] : []);
        }

        return TicketType::where('experience_code', $experience)
            ->where('is_active', true)
            ->orderBy('price')
            ->get();
    }
}
