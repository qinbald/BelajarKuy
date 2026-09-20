<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('user_preferences') && !Schema::hasColumn('user_preferences', 'tags')) {
            Schema::table('user_preferences', function (Blueprint $table) {
                $table->json('tags')->nullable()->after('study_preferences');
            });
        }

        if (!Schema::hasTable('gallery_tags')) {
            Schema::create('gallery_tags', function (Blueprint $table) {
                $table->id();
                $table->string('name', 50);
                $table->string('slug', 50)->unique();
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('gallery_items')) {
            Schema::create('gallery_items', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained()->cascadeOnDelete();
                $table->string('title', 150);
                $table->text('description')->nullable();
                $table->string('file_path');
                $table->enum('type', ['personal', 'inspiration', 'public'])->default('personal');
                $table->string('source')->nullable();
                $table->enum('visibility', ['private', 'public'])->default('private');
                $table->timestamps();

                $table->index(['user_id', 'visibility']);
                $table->index('visibility');
            });
        }

        if (!Schema::hasTable('gallery_item_tags')) {
            Schema::create('gallery_item_tags', function (Blueprint $table) {
                $table->id();
                $table->foreignId('gallery_item_id')->constrained('gallery_items')->cascadeOnDelete();
                $table->foreignId('gallery_tag_id')->constrained('gallery_tags')->cascadeOnDelete();
                $table->timestamps();

                $table->unique(['gallery_item_id', 'gallery_tag_id']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('gallery_item_tags');
        Schema::dropIfExists('gallery_items');
        Schema::dropIfExists('gallery_tags');

        if (Schema::hasTable('user_preferences') && Schema::hasColumn('user_preferences', 'tags')) {
            Schema::table('user_preferences', function (Blueprint $table) {
                $table->dropColumn('tags');
            });
        }
    }
};
