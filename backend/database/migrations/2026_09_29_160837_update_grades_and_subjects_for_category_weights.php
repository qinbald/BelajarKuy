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
        Schema::table('subjects', function (Blueprint $table) {
            $table->json('category_weights')->nullable()->after('target_grade');
        });

        Schema::table('grades', function (Blueprint $table) {
            $table->dropColumn('weight_percentage');
            $table->string('category', 50)->default('Tugas')->after('type');
        });
    }

    public function down(): void
    {
        Schema::table('subjects', function (Blueprint $table) {
            $table->dropColumn('category_weights');
        });

        Schema::table('grades', function (Blueprint $table) {
            $table->decimal('weight_percentage', 5, 2)->default(0)->after('max_score');
            $table->dropColumn('category');
        });
    }
};
