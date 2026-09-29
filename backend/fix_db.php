<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

// Hapus duplikat Kapita Selekta (sisakan 1)
$duplicates = App\Models\Grade::where('subject_id', 5)->orderBy('id')->get();
if ($duplicates->count() > 1) {
    $duplicates->last()->delete();
    echo "Duplikat dihapus.\n";
}

// Recalculate semua subject
$gamification = new App\Services\TacticalGamificationService();
$prediction = new App\Services\PredictionService();

$users = App\Models\User::all();
foreach ($users as $user) {
    $user->exp = $user->grades()->count() * 50;
    $user->save();
    $gamification->awardExp($user, 0); // trigger rank update
}

$subjects = App\Models\Subject::all();
foreach ($subjects as $subject) {
    $gradeCount = $subject->grades()->count();
    $subject->conquest_progress = min(100, $gradeCount * 5);
    $subject->save();
}

echo "Data lama disinkronisasi.\n";
