<?php

namespace App\Http\Controllers\Analytics;

use App\Http\Controllers\Controller;
use App\Services\GradeAnalyzerService;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends Controller
{
    public function index(Request $request, GradeAnalyzerService $gradeAnalyzer)
    {
        $user = $request->user();
        $now = Carbon::now();

        // 1. Total waktu belajar (hari ini, minggu ini, bulan ini)
        $studyTimeToday = $user->studySessions()
            ->whereDate('start_time', $now->toDateString())
            ->sum('duration_seconds');

        $studyTimeWeek = $user->studySessions()
            ->whereBetween('start_time', [$now->copy()->startOfWeek(), $now->copy()->endOfWeek()])
            ->sum('duration_seconds');

        $studyTimeMonth = $user->studySessions()
            ->whereBetween('start_time', [$now->copy()->startOfMonth(), $now->copy()->endOfMonth()])
            ->sum('duration_seconds');

        // 2. Rata-rata nilai per subject (weighted by category)
        $subjects = $user->subjects()->with('grades')->get();
        $gradesPerSubject = $subjects->map(function ($subject) use ($gradeAnalyzer, $user) {
            $stats = $gradeAnalyzer->calculateWeightedScore($subject, $user->id);
            return [
                'subject_id' => $subject->id,
                'subject_name' => $subject->name,
                'color' => $subject->color,
                'avg_percentage' => $stats['current_score'],
                'grade_count' => $stats['grade_count'],
            ];
        })->filter(fn($item) => $item['grade_count'] > 0)->values();

        // 3. Jumlah task selesai vs pending
        $tasksCompleted = $user->tasks()->where('status', 'completed')->count();
        $tasksPending = $user->tasks()->where('status', 'pending')->count();

        // 4. Streak belajar (hari berturut-turut ada study session)
        $streak = 0;
        $checkDate = $now->copy();
        $maxDays = 365;
        $checkedDays = 0;
        
        while ($checkedDays < $maxDays) {
            $hasSession = $user->studySessions()
                ->whereDate('start_time', $checkDate->toDateString())
                ->exists();
                
            if ($hasSession) {
                $streak++;
                $checkDate->subDay();
            } else {
                // Jika hari ini belum ada, cek kemarin (mungkin streak belum putus)
                if ($streak === 0 && $checkDate->isSameDay($now)) {
                    $checkDate->subDay();
                    $checkedDays++;
                    continue;
                }
                break;
            }
            $checkedDays++;
        }

        // 5. Data grafik waktu belajar 7 hari terakhir
        $last7Days = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = $now->copy()->subDays($i);
            $seconds = $user->studySessions()
                ->whereDate('start_time', $date->toDateString())
                ->sum('duration_seconds');
                
            $last7Days[] = [
                'date' => $date->format('d M'),
                'minutes' => round($seconds / 60),
            ];
        }

        return response()->json([
            'success' => true,
            'data' => [
                'study_time' => [
                    'today_seconds' => (int) $studyTimeToday,
                    'week_seconds'  => (int) $studyTimeWeek,
                    'month_seconds' => (int) $studyTimeMonth,
                ],
                'grades_chart'     => $gradesPerSubject,
                'tasks' => [
                    'completed' => $tasksCompleted,
                    'pending'   => $tasksPending,
                ],
                'streak'           => $streak,
                'study_chart'      => $last7Days,
                'critical_subjects'=> $gradeAnalyzer->analyze($user),
            ]
        ]);
    }
}
