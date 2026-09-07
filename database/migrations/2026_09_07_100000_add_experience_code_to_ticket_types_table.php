<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

/**
 * Kategori (domestic/international) selama ini menempel pada ticket_types,
 * sehingga satu sesi kunjungan terpaksa digandakan menjadi dua baris tiket.
 * experience_code memisahkan "sesi apa" dari "tarif siapa", supaya satu sesi
 * bisa menjual kedua tarif sekaligus.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('ticket_types')) {
            return;
        }

        if (!Schema::hasColumn('ticket_types', 'experience_code')) {
            Schema::table('ticket_types', function (Blueprint $table) {
                $table->string('experience_code')->nullable()->after('name');
                $table->index('experience_code');
            });
        }

        // Tiket dengan nama sama adalah sesi yang sama, hanya beda tarif.
        DB::table('ticket_types')->select('id', 'name')->orderBy('id')->get()
            ->each(function ($type) {
                DB::table('ticket_types')
                    ->where('id', $type->id)
                    ->update(['experience_code' => Str::slug($type->name, '_')]);
            });
    }

    public function down(): void
    {
        if (!Schema::hasTable('ticket_types') || !Schema::hasColumn('ticket_types', 'experience_code')) {
            return;
        }

        Schema::table('ticket_types', function (Blueprint $table) {
            $table->dropIndex(['experience_code']);
            $table->dropColumn('experience_code');
        });
    }
};
