<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('grades', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('subject_id')->constrained()->cascadeOnDelete();
            $table->string('title', 150);
            $table->enum('type', ['exam', 'quiz', 'assignment', 'project', 'other'])->default('assignment');
            $table->decimal('score', 8, 2);
            $table->decimal('max_score', 8, 2)->default(100);
            $table->date('date');
            $table->timestamps();

            $table->index(['user_id', 'subject_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('grades');
    }
};
