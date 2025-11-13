<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('visit_slots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ticket_type_id')->constrained('ticket_types')->cascadeOnDelete();
            $table->date('visit_date');
            $table->time('start_time');
            $table->time('end_time');
            $table->unsignedInteger('quota_total');
            $table->unsignedInteger('quota_remaining');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('visit_slots');
    }
};
