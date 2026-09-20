<?php

namespace App\Http\Controllers\Timer;

use App\Http\Controllers\Controller;
use App\Models\StudySession;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
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

    public function store(Request $request)
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

        return response()->json([
            'success' => true,
            'message' => 'Sesi belajar berhasil disimpan',
            'data' => $session,
        ], 201);
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
