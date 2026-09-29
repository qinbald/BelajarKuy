<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use App\Services\PredictionService;

class DashboardSummaryController extends Controller
{
    protected $predictionService;

    public function __construct(PredictionService $predictionService)
    {
        $this->predictionService = $predictionService;
    }

    public function index(Request $request)
    {
        $user = $request->user();
        $now = Carbon::now();
        $todayString = $now->toDateString();

        // Carbon: dayOfWeek 0=Sunday, 1=Monday ... 6=Saturday
        // DB: 0=Senin (Monday), 1=Selasa ... 6=Minggu (Sunday)
        $carbonDay = $now->dayOfWeek; // 0=Sun, 1=Mon, ..., 6=Sat
        $todayDbDay = $carbonDay === 0 ? 6 : $carbonDay - 1; // Map to 0=Mon..6=Sun

        // 1. Tasks (Pending, limit 5)
        $pendingTasks = $user->tasks()
            ->with('subject:id,name,color')
            ->where('status', 'pending')
            ->orderByRaw("due_date is null, due_date asc")
            ->limit(5)
            ->get();

        // 2. Subjects (Count & Conquest & Probability)
        $subjectsCount = $user->subjects()->count();
        $subjects = $user->subjects()->select('id', 'name', 'conquest_progress')->get();
        
        // Hitung probabilitas kelulusan untuk tiap subject
        $subjects->each(function ($subject) {
            $subject->passing_probability = $this->predictionService->calculatePassingProbability($subject);
        });

        // 3. Schedules (Today)
        $todaySchedules = $user->schedules()
            ->with('subject:id,name,color')
            ->where('day', $todayDbDay)
            ->orderBy('start_time')
            ->get();

        // 4. Analytics (Study Time Today, Streak, Tasks Completed, Study Chart 7 Days)
        $studyTimeToday = $user->studySessions()
            ->whereDate('start_time', $todayString)
            ->sum('duration_seconds');

        $tasksCompleted = $user->tasks()->where('status', 'completed')->count();

        // Calculate Streak
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
                if ($streak === 0 && $checkDate->isSameDay($now)) {
                    $checkDate->subDay();
                    $checkedDays++;
                    continue;
                }
                break;
            }
            $checkedDays++;
        }

        // Study Chart (Last 7 Days)
        $studyChart = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = $now->copy()->subDays($i);
            $seconds = $user->studySessions()
                ->whereDate('start_time', $date->toDateString())
                ->sum('duration_seconds');
                
            $studyChart[] = [
                'date' => $date->format('d M'),
                'minutes' => round($seconds / 60),
            ];
        }

        return response()->json([
            'success' => true,
            'data' => [
                'user' => [
                    'exp' => $user->exp,
                    'tactical_rank' => $user->tactical_rank,
                ],
                'tasks' => $pendingTasks,
                'subjects_count' => $subjectsCount,
                'subjects' => $subjects,
                'schedules' => $todaySchedules,
                'analytics' => [
                    'today_seconds' => (int) $studyTimeToday,
                    'streak' => $streak,
                    'tasks_completed' => $tasksCompleted,
                    'study_chart' => $studyChart,
                ]
            ]
        ]);
    }
}
