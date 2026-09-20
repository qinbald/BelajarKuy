<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('subject_id')->nullable()->constrained()->nullOnDelete();
            $table->string('title', 150);
            $table->unsignedTinyInteger('day'); // 0: Senin, 1: Selasa, ..., 6: Minggu
            $table->time('start_time');
            $table->time('end_time');
            $table->enum('type', ['class', 'study'])->default('class');
            $table->string('location', 150)->nullable();
            $table->timestamps();

            $table->index(['user_id', 'day']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('schedules');
    }
};
