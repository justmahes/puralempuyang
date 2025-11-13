<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('ticket_types')
            ->where('category', 'domestic')
            ->update(['price' => 30000]);

        DB::table('ticket_types')
            ->where('category', 'international')
            ->update(['price' => 55000]);
    }

    public function down(): void
    {
        DB::table('ticket_types')
            ->where('name', 'Sunrise Spiritual Journey')
            ->where('category', 'domestic')
            ->update(['price' => 45000]);

        DB::table('ticket_types')
            ->where('name', 'Sunrise Spiritual Journey')
            ->where('category', 'international')
            ->update(['price' => 90000]);

        DB::table('ticket_types')
            ->where('name', 'Golden Hour Experience')
            ->where('category', 'domestic')
            ->update(['price' => 50000]);

        DB::table('ticket_types')
            ->where('name', 'Golden Hour Experience')
            ->where('category', 'international')
            ->update(['price' => 100000]);
    }
};
