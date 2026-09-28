<?php

namespace App\Http\Controllers\Gallery;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class ExternalGalleryController extends Controller
{
    /**
     * Search study/aesthetic images from Unsplash and/or Pexels.
     */
    public function search(Request $request)
    {
        $query = $request->query('query', 'study aesthetic workspace');
        $source = $request->query('source', 'all'); // 'all', 'unsplash', 'pexels'
        $page = (int) $request->query('page', 1);
        $perPage = 12;

        $results = [];

        // 1. Unsplash
        if ($source === 'all' || $source === 'unsplash') {
            $unsplashKey = config('services.unsplash.access_key');
            if ($unsplashKey) {
                try {
                    $response = Http::withHeaders([
                        'Authorization' => "Client-ID {$unsplashKey}",
                    ])->timeout(5)->get('https://api.unsplash.com/search/photos', [
                        'query' => $query,
                        'page' => $page,
                        'per_page' => $source === 'all' ? 6 : $perPage,
                    ]);

                    if ($response->successful()) {
                        foreach ($response->json('results', []) as $item) {
                            $results[] = [
                                'id' => 'unsplash_' . $item['id'],
                                'title' => $item['description'] ?? $item['alt_description'] ?? 'Unsplash Image',
                                'author' => $item['user']['name'] ?? 'Unknown',
                                'image_url' => $item['urls']['regular'] ?? $item['urls']['small'],
                                'thumb_url' => $item['urls']['thumb'] ?? $item['urls']['small'],
                                'source' => 'Unsplash',
                                'source_url' => $item['links']['html'] ?? null,
                            ];
                        }
                    }
                } catch (\Exception $e) {
                    // Fail silently to let other sources or fallback run
                }
            }
        }

        // 2. Pexels
        if ($source === 'all' || $source === 'pexels') {
            $pexelsKey = config('services.pexels.api_key');
            if ($pexelsKey) {
                try {
                    $response = Http::withHeaders([
                        'Authorization' => $pexelsKey,
                    ])->timeout(5)->get('https://api.pexels.com/v1/search', [
                        'query' => $query,
                        'page' => $page,
                        'per_page' => $source === 'all' ? 6 : $perPage,
                    ]);

                    if ($response->successful()) {
                        foreach ($response->json('photos', []) as $item) {
                            $results[] = [
                                'id' => 'pexels_' . $item['id'],
                                'title' => $item['alt'] ?: 'Pexels Photo',
                                'author' => $item['photographer'] ?? 'Unknown',
                                'image_url' => $item['src']['large'] ?? $item['src']['medium'],
                                'thumb_url' => $item['src']['tiny'] ?? $item['src']['small'],
                                'source' => 'Pexels',
                                'source_url' => $item['url'] ?? null,
                            ];
                        }
                    }
                } catch (\Exception $e) {
                    // Fail silently
                }
            }
        }

        // Fallback dummy items if no keys configured or no results returned
        if (empty($results)) {
            $results = $this->getMockResults($query);
        }

        return response()->json([
            'success' => true,
            'data' => $results,
            'query' => $query,
            'source' => $source,
        ]);
    }

    private function getMockResults(string $query): array
    {
        return [
            [
                'id' => 'unsplash_mock_1',
                'title' => 'Minimalist Workspace Setup',
                'author' => 'Aesthetic Spaces',
                'image_url' => 'https://images.unsplash.com/photo-1517842645767-c639042777db?q=80&w=800&auto=format&fit=crop',
                'thumb_url' => 'https://images.unsplash.com/photo-1517842645767-c639042777db?q=80&w=300&auto=format&fit=crop',
                'source' => 'Unsplash',
                'source_url' => 'https://unsplash.com',
            ],
            [
                'id' => 'unsplash_mock_2',
                'title' => 'Study Notes & Pen',
                'author' => 'Studygram',
                'image_url' => 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=800&auto=format&fit=crop',
                'thumb_url' => 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=300&auto=format&fit=crop',
                'source' => 'Unsplash',
                'source_url' => 'https://unsplash.com',
            ],
            [
                'id' => 'pexels_mock_1',
                'title' => 'Warm Library Reading Corner',
                'author' => 'Booklover',
                'image_url' => 'https://images.unsplash.com/photo-1456406644174-8ddd4cd52a06?q=80&w=800&auto=format&fit=crop',
                'thumb_url' => 'https://images.unsplash.com/photo-1456406644174-8ddd4cd52a06?q=80&w=300&auto=format&fit=crop',
                'source' => 'Pexels',
                'source_url' => 'https://pexels.com',
            ],
            [
                'id' => 'pexels_mock_2',
                'title' => 'Group Discussion Desk',
                'author' => 'Creative Mind',
                'image_url' => 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800&auto=format&fit=crop',
                'thumb_url' => 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=300&auto=format&fit=crop',
                'source' => 'Pexels',
                'source_url' => 'https://pexels.com',
            ],
        ];
    }
}
