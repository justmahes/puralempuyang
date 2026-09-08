<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Harga dipindahkan ke tiap tiket, bukan lagi ke order. Dengan begitu satu
 * order bisa memuat rombongan campuran WNI + WNA, dan tarif ditentukan per
 * orang yang datang, bukan dari citizenship_type akun pemesan.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('order_items')) {
            return;
        }

        Schema::table('order_items', function (Blueprint $table) {
            if (!Schema::hasColumn('order_items', 'ticket_type_id')) {
                $table->foreignId('ticket_type_id')->nullable()->after('order_id')->constrained()->nullOnDelete();
            }
            if (!Schema::hasColumn('order_items', 'unit_price')) {
                $table->decimal('unit_price', 12, 2)->default(0)->after('ticket_type_id');
            }
        });

        // Tiket lama: seluruh order memakai satu tarif, jadi bisa disalin apa adanya.
        // Ditulis sebagai sub-query berkorelasi, bukan UPDATE ... JOIN, supaya
        // migrasi ini juga jalan di SQLite yang dipakai test suite.
        DB::statement('
            UPDATE order_items
            SET ticket_type_id = (
                    SELECT orders.ticket_type_id
                    FROM orders
                    WHERE orders.id = order_items.order_id
                ),
                unit_price = (
                    SELECT ticket_types.price
                    FROM orders
                    INNER JOIN ticket_types ON ticket_types.id = orders.ticket_type_id
                    WHERE orders.id = order_items.order_id
                )
            WHERE order_items.ticket_type_id IS NULL
              AND EXISTS (
                    SELECT 1
                    FROM orders
                    INNER JOIN ticket_types ON ticket_types.id = orders.ticket_type_id
                    WHERE orders.id = order_items.order_id
                )
        ');
    }

    public function down(): void
    {
        if (!Schema::hasTable('order_items')) {
            return;
        }

        Schema::table('order_items', function (Blueprint $table) {
            if (Schema::hasColumn('order_items', 'ticket_type_id')) {
                $table->dropForeign(['ticket_type_id']);
                $table->dropColumn('ticket_type_id');
            }
            if (Schema::hasColumn('order_items', 'unit_price')) {
                $table->dropColumn('unit_price');
            }
        });
    }
};
