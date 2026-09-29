<?php

namespace App\Services;

use App\Models\Subject;
use App\Models\User;

class GradeAnalyzerService
{
    /**
     * Hitung Skor Terbobot Berdasarkan Kategori untuk sebuah mata pelajaran.
     * 
     * Rumus:
     * - Kelompokkan nilai per kategori (Tugas, Kuis, UTS, UAS, dll).
     * - Hitung rata-rata persentase per kategori: avg_category = AVG((score / max_score) * 100)
     * - Bobot kategori diambil dari subject->category_weights: array {"Tugas": 20, "Kuis": 10, ...}
     * - Total Bobot Berjalan (running weight) = Sum(bobot_kategori_yang_sudah_memiliki_nilai)
     * - Jika running_weight > 0:
     *     Nilai Akumulasi Sementara (raw) = Sum(avg_category * (bobot_category / 100))
     *     Current Weighted Score = (Nilai Akumulasi Sementara / (running_weight / 100))
     *       atau ekuivalen: Sum(avg_category * bobot_category) / running_weight
     * - Jika tidak ada category_weights atau total running weight == 0:
     *     Fallback ke rata-rata biasa seluruh nilai.
     */
    public function calculateWeightedScore(Subject $subject, int $userId): array
    {
        $grades = $subject->grades()
            ->where('user_id', $userId)
            ->get();

        if ($grades->isEmpty()) {
            return [
                'current_score'       => 0.0,
                'total_weight'        => 0.0,
                'raw_score'           => 0.0,
                'is_weighted'         => false,
                'grade_count'         => 0,
                'category_breakdown'  => [],
            ];
        }

        $categoryWeights = is_array($subject->category_weights) ? $subject->category_weights : [];
        $hasWeights = !empty($categoryWeights);

        // Kelompokkan per kategori
        $grouped = $grades->groupBy(fn($g) => trim($g->category ?: 'Lainnya'));

        $runningWeight = 0.0;
        $rawScore = 0.0;
        $categoryBreakdown = [];

        foreach ($grouped as $catName => $catGrades) {
            $avgPct = (float) $catGrades->avg(function ($g) {
                return $g->max_score > 0 ? ($g->score / $g->max_score) * 100.0 : 0.0;
            });

            $weight = (float) ($categoryWeights[$catName] ?? 0.0);
            $runningWeight += $weight;
            $rawScore += $avgPct * ($weight / 100.0);

            $categoryBreakdown[$catName] = [
                'count'      => $catGrades->count(),
                'avg_score'  => round($avgPct, 2),
                'weight'     => round($weight, 2),
            ];
        }

        if ($hasWeights && $runningWeight > 0) {
            $currentScore = ($rawScore / ($runningWeight / 100.0));
            $isWeighted = true;
        } else {
            // Fallback unweighted average jika tanpa bobot kategori
            $currentScore = (float) $grades->avg(fn($g) => $g->max_score > 0 ? ($g->score / $g->max_score) * 100.0 : 0.0);
            $isWeighted = false;
        }

        return [
            'current_score'      => round($currentScore, 2),
            'total_weight'       => round($runningWeight, 2),
            'raw_score'          => round($rawScore, 2),
            'is_weighted'        => $isWeighted,
            'grade_count'        => $grades->count(),
            'category_breakdown' => $categoryBreakdown,
        ];
    }

    /**
     * Analisis Zona Kritis per subject untuk user.
     * Menggunakan Current Weighted Score vs threshold (target_grade ?? default_passing_grade ?? 70).
     */
    public function analyze(User $user): array
    {
        $defaultGrade = $user->default_passing_grade ?? 70;

        $subjects = $user->subjects()
            ->with(['grades' => fn($q) => $q->where('user_id', $user->id)])
            ->get();

        $critical = [];

        foreach ($subjects as $subject) {
            if ($subject->grades->isEmpty()) {
                continue;
            }

            $stats = $this->calculateWeightedScore($subject, $user->id);
            $currentScore = $stats['current_score'];
            $threshold = $subject->target_grade ?? $defaultGrade;

            if ($currentScore < $threshold) {
                $query = urlencode($subject->name . ' tutorial belajar');
                $critical[] = [
                    'subject_id'         => $subject->id,
                    'subject_name'       => $subject->name,
                    'color'              => $subject->color,
                    'current_score'      => $currentScore,
                    'threshold'          => $threshold,
                    'total_weight'       => $stats['total_weight'],
                    'gap'                => round($threshold - $currentScore, 2),
                    'is_weighted'        => $stats['is_weighted'],
                    'category_breakdown' => $stats['category_breakdown'],
                    'search_urls'        => [
                        'youtube' => "https://www.youtube.com/results?search_query={$query}",
                        'google'  => "https://www.google.com/search?q={$query}",
                    ],
                ];
            }
        }

        // Urutkan berdasarkan gap terbesar ke terkecil
        usort($critical, fn($a, $b) => $b['gap'] <=> $a['gap']);

        return $critical;
    }
}
