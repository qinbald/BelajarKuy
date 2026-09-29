<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->integer('default_passing_grade')->default(70)->after('tactical_rank');
        });
        Schema::table('subjects', function (Blueprint $table) {
            $table->integer('target_grade')->nullable()->after('color');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('default_passing_grade');
        });
        Schema::table('subjects', function (Blueprint $table) {
            $table->dropColumn('target_grade');
        });
    }
};
