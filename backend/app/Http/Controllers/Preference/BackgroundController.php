<?php

namespace App\Http\Controllers\Preference;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class BackgroundController extends Controller
{
    /**
     * Get current background setting.
     */
    public function show(Request $request)
    {
        $pref = $request->user()->preference;

        return response()->json([
            'success' => true,
            'data' => [
                'background_type' => $pref?->background_type ?? 'color',
                'background_value' => $pref?->background_value,
            ],
        ]);
    }

    /**
     * Update background (color or preset_image).
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'background_type' => 'required|in:color,preset_image',
            'background_value' => 'required|string|max:255',
        ]);

        $pref = $request->user()->preference()->updateOrCreate(
            ['user_id' => $request->user()->id],
            $validated
        );

        return response()->json([
            'success' => true,
            'data' => [
                'background_type' => $pref->background_type,
                'background_value' => $pref->background_value,
            ],
        ]);
    }

    /**
     * Upload custom wallpaper image.
     * Compresses to WebP ≤1920px wide, quality 80%.
     */
    public function upload(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,webp|max:10240',
        ]);

        $user = $request->user();
        $file = $request->file('image');

        // Delete old custom background if exists
        $pref = $user->preference;
        if ($pref && $pref->background_type === 'custom_image' && $pref->background_value) {
            Storage::disk('public')->delete($pref->background_value);
        }

        // Compress with GD to WebP, max 1920px wide
        $image = $this->loadImage($file);
        if (!$image) {
            return response()->json(['success' => false, 'message' => 'Format gambar tidak didukung.'], 422);
        }

        $width = imagesx($image);
        $height = imagesy($image);
        $maxWidth = 1920;

        if ($width > $maxWidth) {
            $newHeight = (int) ($height * ($maxWidth / $width));
            $resized = imagecreatetruecolor($maxWidth, $newHeight);
            // Preserve transparency
            imagealphablending($resized, false);
            imagesavealpha($resized, true);
            imagecopyresampled($resized, $image, 0, 0, 0, 0, $maxWidth, $newHeight, $width, $height);
            imagedestroy($image);
            $image = $resized;
        }

        $filename = 'bg_' . $user->id . '_' . Str::random(12) . '.webp';
        $dir = storage_path('app/public/backgrounds');
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }
        $path = $dir . '/' . $filename;
        imagewebp($image, $path, 80);
        imagedestroy($image);

        $storagePath = 'backgrounds/' . $filename;

        $pref = $user->preference()->updateOrCreate(
            ['user_id' => $user->id],
            [
                'background_type' => 'custom_image',
                'background_value' => $storagePath,
            ]
        );

        return response()->json([
            'success' => true,
            'data' => [
                'background_type' => $pref->background_type,
                'background_value' => $pref->background_value,
                'background_url' => asset('storage/' . $storagePath),
            ],
        ]);
    }

    /**
     * Reset background to default.
     */
    public function reset(Request $request)
    {
        $user = $request->user();
        $pref = $user->preference;

        if ($pref && $pref->background_type === 'custom_image' && $pref->background_value) {
            Storage::disk('public')->delete($pref->background_value);
        }

        $pref?->update([
            'background_type' => 'color',
            'background_value' => null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Background direset ke default.',
        ]);
    }

    private function loadImage($file): \GdImage|false
    {
        $mime = $file->getMimeType();
        return match ($mime) {
            'image/jpeg' => imagecreatefromjpeg($file->getPathname()),
            'image/png' => imagecreatefrompng($file->getPathname()),
            'image/webp' => imagecreatefromwebp($file->getPathname()),
            default => false,
        };
    }
}
