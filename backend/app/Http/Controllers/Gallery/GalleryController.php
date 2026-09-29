<?php

namespace App\Http\Controllers\Gallery;

use App\Http\Controllers\Controller;
use App\Models\GalleryItem;
use App\Models\GalleryTag;
use App\Services\ImageAggregatorService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class GalleryController extends Controller
{
    /**
     * Search images from external sources via Aggregator.
     */
    public function search(Request $request, ImageAggregatorService $aggregator)
    {
        $validated = $request->validate([
            'q' => 'required|string|max:100',
            'source' => 'required|in:unsplash,history,anime,movies',
        ]);

        $results = $aggregator->searchImages($validated['q'], $validated['source']);

        return response()->json([
            'success' => true,
            'data' => $results,
            'query' => $validated['q'],
            'source' => $validated['source'],
        ]);
    }

    /**
     * Personal gallery — items owned by current user.
     */
    public function index(Request $request)
    {
        $items = $request->user()
            ->galleryItems()
            ->with('tags')
            ->latest()
            ->paginate(12);

        return response()->json([
            'success' => true,
            'data' => $items->items(),
            'meta' => [
                'current_page' => $items->currentPage(),
                'last_page' => $items->lastPage(),
                'total' => $items->total(),
            ]
        ]);
    }

    /**
     * Recommendation / Inspiration gallery.
     * Rule-based: match user preference tags against gallery item tags.
     * Only items with visibility='public' OR owned by admin users.
     */
    public function recommendations(Request $request)
    {
        $user = $request->user();
        $preference = $user->preference;

        // Collect all user tags from preferences
        $userTags = collect()
            ->merge($preference->tags ?? [])
            ->merge($preference->interests ?? [])
            ->merge($preference->favorite_visual_styles ?? [])
            ->merge($preference->favorite_topics ?? [])
            ->map(fn($t) => Str::slug(strtolower(trim($t))))
            ->unique()
            ->filter()
            ->values()
            ->toArray();

        // Get candidate items: public visibility OR owned by admin
        $query = GalleryItem::with(['tags', 'user:id,name,role,avatar'])
            ->where(function ($q) {
                $q->where('visibility', 'public')
                  ->orWhereHas('user', fn($u) => $u->where('role', 'admin'));
            });

        $items = $query->latest()->paginate(12);

        // Score each item by matching tags
        $scored = collect($items->items())->map(function ($item) use ($userTags) {
            $itemTagSlugs = $item->tags->pluck('slug')->toArray();
            $matchingTags = array_intersect($userTags, $itemTagSlugs);
            $item->match_score = count($matchingTags);
            $item->matching_tags = array_values($matchingTags);
            return $item;
        });

        // Sort: highest match_score first, then latest
        $sorted = $scored->sortByDesc('match_score')->sortByDesc(function ($item) {
            // Secondary sort: items with score > 0 first, then by created_at
            return [$item->match_score > 0 ? 1 : 0, $item->created_at->timestamp];
        })->values();

        return response()->json([
            'success' => true,
            'data' => $sorted,
            'user_tags' => $userTags,
            'meta' => [
                'current_page' => $items->currentPage(),
                'last_page' => $items->lastPage(),
                'total' => $items->total(),
            ]
        ]);
    }

    /**
     * Upload a new gallery item.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:150',
            'description' => 'nullable|string|max:500',
            'image' => 'required|image|mimes:jpeg,png,jpg,webp,gif|max:10240',
            'visibility' => 'required|in:private,public',
            'type' => 'nullable|in:personal,inspiration,public',
            'source' => 'nullable|string|max:255',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
        ]);

        $file = $request->file('image');
        $filename = Str::random(40) . '.' . $file->extension();
        $path = $file->storeAs('gallery/' . $request->user()->id, $filename);

        // Generate Thumbnail (WebP, max 400px)
        try {
            $imageContent = file_get_contents($file->getRealPath());
            $image = @imagecreatefromstring($imageContent);
            if ($image) {
                $width = imagesx($image);
                $height = imagesy($image);
                $maxWidth = 400;
                
                if ($width > $maxWidth) {
                    $newHeight = (int) ($height * ($maxWidth / $width));
                    $resized = imagecreatetruecolor($maxWidth, $newHeight);
                    imagealphablending($resized, false);
                    imagesavealpha($resized, true);
                    imagecopyresampled($resized, $image, 0, 0, 0, 0, $maxWidth, $newHeight, $width, $height);
                    imagedestroy($image);
                    $image = $resized;
                }
                
                $thumbFilename = preg_replace('/(\.[^.]+)$/', '_thumb.webp', $filename);
                $thumbPath = 'gallery/' . $request->user()->id . '/' . $thumbFilename;
                
                ob_start();
                imagewebp($image, null, 70);
                $thumbContent = ob_get_clean();
                imagedestroy($image);
                
                Storage::put($thumbPath, $thumbContent);
            }
        } catch (\Exception $e) {
            // Silently fail thumbnail generation, fallback to original
        }

        $item = $request->user()->galleryItems()->create([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'file_path' => $path,
            'type' => $validated['type'] ?? 'personal',
            'source' => $validated['source'] ?? null,
            'visibility' => $validated['visibility'],
        ]);

        // Sync tags
        if (!empty($validated['tags'])) {
            $tagIds = collect($validated['tags'])->map(function ($tagName) {
                $slug = Str::slug(strtolower(trim($tagName)));
                return GalleryTag::firstOrCreate(
                    ['slug' => $slug],
                    ['name' => trim($tagName)]
                )->id;
            })->toArray();

            $item->tags()->sync($tagIds);
        }

        return response()->json([
            'success' => true,
            'message' => 'Gambar berhasil diunggah.',
            'data' => $item->load('tags'),
        ], 201);
    }

    /**
     * Delete a gallery item.
     */
    public function destroy(Request $request, $id)
    {
        $item = $request->user()->galleryItems()->findOrFail($id);

        if ($item->file_path && Storage::exists($item->file_path)) {
            Storage::delete($item->file_path);
        }

        $item->delete();

        return response()->json([
            'success' => true,
            'message' => 'Item galeri berhasil dihapus.',
        ]);
    }

    /**
     * List available tags.
     */
    public function tags()
    {
        $tags = GalleryTag::orderBy('name')->get(['id', 'name', 'slug']);

        return response()->json([
            'success' => true,
            'data' => $tags,
        ]);
    }
}
