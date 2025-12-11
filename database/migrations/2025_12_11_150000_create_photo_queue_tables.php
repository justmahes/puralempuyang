<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (!Schema::hasTable('photo_points')) {
            Schema::create('photo_points', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('location')->nullable();
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('photo_queue_entries')) {
            Schema::create('photo_queue_entries', function (Blueprint $table) {
                $table->id();
                $table->foreignId('photo_point_id')->constrained('photo_points')->cascadeOnDelete();
                $table->foreignId('order_id')->nullable()->constrained('orders')->nullOnDelete();
                $table->integer('queue_number');
                $table->date('visit_date')->index();
                $table->string('status')->default('waiting'); // waiting|called|shooting|done|skipped|expired
                $table->timestamp('called_at')->nullable();
                $table->timestamp('served_at')->nullable();
                $table->timestamp('finished_at')->nullable();
                $table->timestamp('notified_at')->nullable();
                $table->string('device_id')->nullable();
                $table->timestamps();
                // Short index name to avoid MySQL 64-char limit
                $table->unique(['photo_point_id','visit_date','queue_number'], 'pq_point_date_num_uq');
            });
        }

        if (!Schema::hasTable('photo_assets')) {
            Schema::create('photo_assets', function (Blueprint $table) {
                $table->id();
                $table->foreignId('photo_queue_entry_id')->constrained('photo_queue_entries')->cascadeOnDelete();
                $table->string('file_path');
                $table->string('mime')->nullable();
                $table->unsignedBigInteger('size')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('photo_assets');
        Schema::dropIfExists('photo_queue_entries');
        Schema::dropIfExists('photo_points');
    }
};
