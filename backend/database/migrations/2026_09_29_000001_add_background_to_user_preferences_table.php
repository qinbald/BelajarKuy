<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('user_preferences', function (Blueprint $table) {
            $table->string('background_type', 20)->default('color'); // 'color', 'preset_image', 'custom_image'
            $table->text('background_value')->nullable(); // hex/css class, URL preset, atau path custom file
        });
    }

    public function down(): void
    {
        Schema::table('user_preferences', function (Blueprint $table) {
            $table->dropColumn(['background_type', 'background_value']);
        });
    }
};
