<?php

namespace App\Http\Controllers\Timer;

use App\Http\Controllers\Controller;
use App\Models\StudySession;
use App\Models\Subject;
use App\Services\TacticalGamificationService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;

class StudySessionController extends Controller
{
    public function index(Request $request)
    {
        $sessions = $request->user()
            ->studySessions()
            ->with('subject')
            ->latest()
            ->paginate(15);

        return response()->json([
            'success' => true,
            'message' => 'Riwayat sesi belajar berhasil diambil',
            'data' => $sessions,
        ]);
    }

    public function store(Request $request, TacticalGamificationService $gamification)
    {
        $validated = $request->validate([
            'start_time' => 'required|date',
            'end_time' => 'required|date|after:start_time',
            'duration_seconds' => 'required|integer|min:10|max:86400',
            'completed' => 'nullable|boolean',
            'subject_id' => [
                'nullable',
                Rule::exists('subjects', 'id')->where('user_id', $request->user()->id),
            ],
        ]);

        // Validasi ketat keselarasan durasi waktu (toleransi max 10 detik network latency / pause)
        $start = Carbon::parse($validated['start_time']);
        $end = Carbon::parse($validated['end_time']);
        $calculatedDiff = $end->diffInSeconds($start);

        // Durasi yang dicatat tidak boleh melebihi rentang end - start secara tidak wajar
        if ($validated['duration_seconds'] > ($calculatedDiff + 10)) {
            return response()->json([
                'success' => false,
                'message' => 'Durasi belajar tidak valid dan tidak sesuai dengan rentang waktu.',
                'errors' => ['duration_seconds' => ['Durasi melebihi rentang waktu awal dan akhir.']],
            ], 422);
        }

        $session = $request->user()->studySessions()->create([
            'subject_id' => $validated['subject_id'] ?? null,
            'start_time' => $start,
            'end_time' => $end,
            'duration_seconds' => $validated['duration_seconds'],
            'completed' => $validated['completed'] ?? true,
        ]);

        $session->load('subject');

        // Gamification
        $expGained = floor($validated['duration_seconds'] / 60) * 10;
        $gamification->awardExp($request->user(), $expGained);

        if ($validated['subject_id']) {
            // +1% per 10 menit (600 detik)
            $progress = floor($validated['duration_seconds'] / 600);
            if ($progress > 0) {
                $subject = Subject::find($validated['subject_id']);
                $gamification->advanceConquest($subject, $progress);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Sesi belajar berhasil disimpan',
            'data' => $session,
        ], 201);
    }

    public function pomodoroStart(Request $request)
    {
        Cache::put('pomodoro_start_' . $request->user()->id, Carbon::now()->timestamp, now()->addDay());
        return response()->json(['success' => true]);
    }

    public function pomodoroComplete(Request $request, TacticalGamificationService $gamification)
    {
        $user = $request->user();
        $cacheKey = 'pomodoro_start_' . $user->id;
        $startTimestamp = Cache::get($cacheKey);

        if (!$startTimestamp) {
            return response()->json(['success' => false, 'message' => 'Sesi tidak valid atau belum dimulai.'], 400);
        }

        // Anti-spam: minimal 1 menit jeda antar klaim sesi
        if ($user->studySessions()->where('created_at', '>=', Carbon::now()->subMinute())->exists()) {
            return response()->json(['success' => false, 'message' => 'Cooldown aktif, silakan tunggu sejenak.'], 429);
        }

        $validated = $request->validate([
            'duration_seconds' => 'nullable|integer|min:60|max:86400',
        ]);
        $duration = $validated['duration_seconds'] ?? 1500;
        $now = Carbon::now();

        // Validasi durasi vs waktu nyata (toleransi 15 detik)
        $elapsed = $now->timestamp - $startTimestamp;
        if ($duration > ($elapsed + 15)) {
            return response()->json(['success' => false, 'message' => 'Durasi tidak wajar terdeteksi.'], 422);
        }

        Cache::forget($cacheKey);

        $user->studySessions()->create([
            'start_time' => $now->copy()->subSeconds($duration),
            'end_time' => $now,
            'duration_seconds' => $duration,
            'completed' => true,
        ]);

        $expGained = 15;
        $gamification->awardExp($user, $expGained);

        return response()->json([
            'success' => true,
            'message' => 'Misi Selesai! +15 EXP ditambahkan ke markas.',
            'data' => ['exp_gained' => $expGained, 'duration_seconds' => $duration]
        ]);
    }

    public function summary(Request $request)
    {
        $user = $request->user();
        $today = Carbon::today();
        $startOfWeek = Carbon::now()->startOfWeek();

        $todaySeconds = $user->studySessions()
            ->whereDate('start_time', $today)
            ->sum('duration_seconds');

        $weekSeconds = $user->studySessions()
            ->where('start_time', '>=', $startOfWeek)
            ->sum('duration_seconds');

        $totalSeconds = $user->studySessions()->sum('duration_seconds');
        $totalSessions = $user->studySessions()->count();

        return response()->json([
            'success' => true,
            'message' => 'Ringkasan belajar berhasil diambil',
            'data' => [
                'today_seconds' => (int) $todaySeconds,
                'week_seconds' => (int) $weekSeconds,
                'total_seconds' => (int) $totalSeconds,
                'total_sessions' => (int) $totalSessions,
            ],
        ]);
    }
}
