<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->integer('exp')->default(0);
            $table->string('tactical_rank')->default('Prajurit');
        });

        Schema::table('subjects', function (Blueprint $table) {
            $table->integer('conquest_progress')->default(0);
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['exp', 'tactical_rank']);
        });

        Schema::table('subjects', function (Blueprint $table) {
            $table->dropColumn('conquest_progress');
        });
    }
};
