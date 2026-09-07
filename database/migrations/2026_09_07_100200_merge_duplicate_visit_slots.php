<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Sesi yang sama sebelumnya tersimpan dua kali (satu untuk tarif domestik,
 * satu untuk mancanegara), masing-masing dengan kuota penuh. Akibatnya sistem
 * menjual dua kali lipat kapasitas fisik satu sesi. Migrasi ini menggabungkan
 * pasangan tersebut menjadi satu slot dengan satu kuota.
 */
return new class extends Migration
{
    /** Order dengan status ini masih memegang kuota. */
    private const HOLDS_QUOTA = ['pending', 'awaiting_payment', 'paid', 'used'];

    public function up(): void
    {
        if (!Schema::hasTable('visit_slots') || !Schema::hasColumn('ticket_types', 'experience_code')) {
            return;
        }

        $slots = DB::table('visit_slots')
            ->join('ticket_types', 'ticket_types.id', '=', 'visit_slots.ticket_type_id')
            ->select([
                'visit_slots.id',
                'visit_slots.visit_date',
                'visit_slots.start_time',
                'visit_slots.end_time',
                'visit_slots.quota_total',
                'ticket_types.experience_code',
                'ticket_types.category',
            ])
            ->orderBy('visit_slots.id')
            ->get()
            ->groupBy(fn ($slot) => implode('|', [
                $slot->visit_date,
                $slot->start_time,
                $slot->end_time,
                $slot->experience_code,
            ]));

        foreach ($slots as $group) {
            // Slot domestik dipakai sebagai kanonik agar tampilan tetap konsisten.
            $keep = $group->firstWhere('category', 'domestic') ?? $group->first();
            $duplicates = $group->where('id', '!=', $keep->id)->pluck('id')->all();

            if ($duplicates) {
                DB::table('orders')->whereIn('visit_slot_id', $duplicates)
                    ->update(['visit_slot_id' => $keep->id]);
                DB::table('visit_slots')->whereIn('id', $duplicates)->delete();
            }

            // Kuota tidak dijumlahkan: kapasitas fisik satu sesi tetap satu angka.
            $taken = (int) DB::table('orders')
                ->where('visit_slot_id', $keep->id)
                ->whereIn('status', self::HOLDS_QUOTA)
                ->sum('quantity');

            $canonicalTypeId = DB::table('ticket_types')
                ->where('experience_code', $keep->experience_code)
                ->where('category', 'domestic')
                ->value('id');

            DB::table('visit_slots')->where('id', $keep->id)->update([
                'ticket_type_id' => $canonicalTypeId ?: DB::table('visit_slots')->where('id', $keep->id)->value('ticket_type_id'),
                'quota_remaining' => max(0, $keep->quota_total - $taken),
            ]);
        }
    }

    public function down(): void
    {
        // Penggabungan data tidak dapat dipulihkan otomatis: slot duplikat yang
        // dihapus tidak menyimpan jejak order aslinya.
    }
};
