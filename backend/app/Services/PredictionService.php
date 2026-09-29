<?php

namespace App\Services;

use App\Models\Subject;

class PredictionService
{
    /**
     * Hitung probabilitas kelulusan (0 - 100) menggunakan Weighted Scoring
     */
    public function calculatePassingProbability(Subject $subject): int
    {
        // 1. Ambil Nilai Rata-rata (0 - 100)
        $grades = $subject->grades;
        $hasGrades = $grades->isNotEmpty();
        
        $avgGrade = 0;
        if ($hasGrades) {
            $avgGrade = $grades->avg(function ($grade) {
                return $grade->percentage; // Pakai accessor percentage
            }) ?? 0;
        }

        // 2. Progress Penaklukan (0 - 100)
        $conquestProgress = (float) ($subject->conquest_progress ?? 0);

        // 3. Konsistensi Waktu Belajar (Target: 10 Jam = 36.000 detik)
        $targetSeconds = 10 * 3600;
        $totalStudySeconds = $subject->studySessions()->sum('duration_seconds') ?? 0;
        $studyConsistencyScore = min(100, ($totalStudySeconds / $targetSeconds) * 100);

        // Weighted Scoring Logic
        if ($hasGrades) {
            // Bobot: Nilai 60%, Progress 30%, Waktu 10%
            $probability = ($avgGrade * 0.60) + ($conquestProgress * 0.30) + ($studyConsistencyScore * 0.10);
        } else {
            // Tanpa Nilai: Progress 70%, Waktu 30%
            $probability = ($conquestProgress * 0.70) + ($studyConsistencyScore * 0.30);
        }

        return (int) round(min(100, max(0, $probability)));
    }
}
