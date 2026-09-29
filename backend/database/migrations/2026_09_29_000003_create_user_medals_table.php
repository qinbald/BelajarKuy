<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Tabel untuk Season Reset
        Schema::create('user_medals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('season_name'); // cth: "Semester Ganjil 2026"
            $table->string('final_rank');
            $table->integer('territories_conquered')->default(0);
            $table->timestamps();
        });

        // Kolom penanda aktivitas terakhir untuk fitur Decay
        Schema::table('subjects', function (Blueprint $table) {
            $table->timestamp('last_activity_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_medals');
        Schema::table('subjects', function (Blueprint $table) {
            $table->dropColumn('last_activity_at');
        });
    }
};
