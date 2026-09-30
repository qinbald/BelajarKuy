<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class ImageAggregatorService
{
    /**
     * Search images across multiple sources with caching.
     */
    public function searchImages(string $query, string $source): array
    {
        $cacheKey = "gallery_{$source}_" . Str::slug($query);
        $cacheTtl = now()->addHours(24);

        if (Cache::has($cacheKey)) {
            $cachedData = Cache::get($cacheKey);
            if (!empty($cachedData)) {
                return $cachedData;
            }
        }

        $data = match ($source) {
            'unsplash' => $this->fetchUnsplash($query),
            'history'  => $this->fetchWikimedia($query),
            'anime'    => $this->fetchJikan($query),
            'movies'   => $this->fetchTmdb($query),
            default    => [],
        };

        if (!empty($data)) {
            Cache::put($cacheKey, $data, $cacheTtl);
        }

        return $data;
    }

    private function fetchUnsplash(string $query): array
    {
        $key = config('services.unsplash.access_key');
        if (!$key) return [];

        try {
            $response = Http::withoutVerifying()
                ->withHeaders(['Authorization' => "Client-ID {$key}"])
                ->timeout(5)
                ->get('https://api.unsplash.com/search/photos', [
                    'query' => $query,
                    'per_page' => 12,
                ]);

            if (!$response->successful()) return [];

            return collect($response->json('results', []))->map(fn($item) => [
                'id' => 'unsplash_' . $item['id'],
                'title' => $item['description'] ?? $item['alt_description'] ?? 'Unsplash Image',
                'image_url' => $item['urls']['regular'] ?? $item['urls']['small'],
                'thumbnail_url' => $item['urls']['thumb'] ?? $item['urls']['small'],
                'source' => 'unsplash'
            ])->toArray();
        } catch (\Exception $e) {
            return [];
        }
    }

    private function fetchWikimedia(string $query): array
    {
        try {
            $response = Http::withoutVerifying()
                ->withHeaders([
                    'User-Agent' => 'BelajarKuyLMS/1.0 (contact@belajarkuy.test)',
                ])
                ->timeout(5)
                ->get('https://en.wikipedia.org/w/api.php', [
                    'action' => 'query',
                    'format' => 'json',
                    'generator' => 'search',
                    'gsrsearch' => $query,
                    'gsrlimit' => 12,
                    'prop' => 'pageimages',
                    'piprop' => 'original|thumbnail',
                    'pithumbsize' => 400,
                ]);

            if (!$response->successful()) return [];

            $pages = $response->json('query.pages', []);
            
            return collect($pages)
                ->filter(fn($page) => isset($page['thumbnail']['source']) || isset($page['original']['source']))
                ->map(fn($page) => [
                    'id' => 'wiki_' . $page['pageid'],
                    'title' => $page['title'],
                    'image_url' => $page['original']['source'] ?? $page['thumbnail']['source'],
                    'thumbnail_url' => $page['thumbnail']['source'] ?? $page['original']['source'],
                    'source' => 'history'
                ])->values()->toArray();
        } catch (\Exception $e) {
            return [];
        }
    }

    private function fetchJikan(string $query): array
    {
        try {
            $response = Http::withoutVerifying()
                ->timeout(5)
                ->get('https://api.jikan.moe/v4/characters', [
                    'q' => $query,
                    'limit' => 12,
                ]);

            if (!$response->successful()) return [];

            return collect($response->json('data', []))->map(fn($item) => [
                'id' => 'jikan_' . $item['mal_id'],
                'title' => $item['name'],
                'image_url' => $item['images']['jpg']['image_url'] ?? null,
                'thumbnail_url' => $item['images']['jpg']['image_url'] ?? null,
                'source' => 'anime'
            ])->filter(fn($item) => $item['image_url'] !== null)->values()->toArray();
        } catch (\Exception $e) {
            return [];
        }
    }

    private function fetchTmdb(string $query): array
    {
        $key = config('services.tmdb.api_key');
        if (!$key) return [];

        try {
            $response = Http::withoutVerifying()
                ->withHeaders(['Authorization' => "Bearer {$key}"])
                ->timeout(5)
                ->get('https://api.themoviedb.org/3/search/person', [
                    'query' => $query,
                    'include_adult' => false,
                ]);

            if (!$response->successful()) return [];

            return collect($response->json('results', []))
                ->filter(fn($item) => !empty($item['profile_path']))
                ->map(fn($item) => [
                    'id' => 'tmdb_' . $item['id'],
                    'title' => $item['name'],
                    'image_url' => 'https://image.tmdb.org/t/p/original' . $item['profile_path'],
                    'thumbnail_url' => 'https://image.tmdb.org/t/p/w300' . $item['profile_path'],
                    'source' => 'movies'
                ])->values()->toArray();
        } catch (\Exception $e) {
            return [];
        }
    }
}
