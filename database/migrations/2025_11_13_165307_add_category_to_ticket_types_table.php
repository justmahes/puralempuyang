<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('ticket_types')) {
            return;
        }

        Schema::table('ticket_types', function (Blueprint $table) {
            if (!Schema::hasColumn('ticket_types', 'category')) {
                $table->enum('category', ['domestic', 'international'])->default('domestic')->after('description');
            }
        });
    }

    public function down(): void
    {
        if (!Schema::hasTable('ticket_types')) {
            return;
        }

        Schema::table('ticket_types', function (Blueprint $table) {
            if (Schema::hasColumn('ticket_types', 'category')) {
                $table->dropColumn('category');
            }
        });
    }
};