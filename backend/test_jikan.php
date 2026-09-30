<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Http;

echo "Fetching Jikan...\n";
$response = Http::withoutVerifying()
    ->timeout(10)
    ->get('https://api.jikan.moe/v4/characters', [
        'q' => 'naruto',
        'limit' => 2,
    ]);

echo "Status: " . $response->status() . "\n";
if ($response->successful()) {
    echo "Body length: " . strlen($response->body()) . "\n";
    $data = $response->json('data', []);
    echo "Items: " . count($data) . "\n";
    if (count($data) > 0) {
        echo "First item name: " . $data[0]['name'] . "\n";
        echo "First item image: " . ($data[0]['images']['jpg']['image_url'] ?? 'null') . "\n";
    }
} else {
    echo "Error: " . $response->body() . "\n";
}
