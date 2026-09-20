<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('learning_results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('subject_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('grade_id')->nullable()->constrained()->nullOnDelete();
            $table->string('title', 150);
            $table->text('description')->nullable();
            $table->string('file_path');
            $table->string('file_name');
            $table->string('file_type', 50); // MIME or extension
            $table->unsignedBigInteger('file_size'); // in bytes
            $table->enum('visibility', ['private', 'public'])->default('private');
            $table->timestamps();

            $table->index(['user_id', 'subject_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('learning_results');
    }
};
