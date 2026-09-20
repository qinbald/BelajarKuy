<?php

namespace App\Http\Controllers\Gallery;

use App\Http\Controllers\Controller;
use App\Models\GalleryItem;
use App\Models\GalleryTag;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class GalleryController extends Controller
{
    /**
     * Personal gallery — items owned by current user.
     */
    public function index(Request $request)
    {
        $items = $request->user()
            ->galleryItems()
            ->with('tags')
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $items,
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

        $items = $query->latest()->get();

        // Score each item by matching tags
        $scored = $items->map(function ($item) use ($userTags) {
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
        $path = $file->storeAs('gallery/' . $request->user()->id, $filename, 'public');

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

        if ($item->file_path && Storage::disk('public')->exists($item->file_path)) {
            Storage::disk('public')->delete($item->file_path);
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
