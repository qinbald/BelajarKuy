<?php

namespace App\Http\Controllers\Grade;

use App\Http\Controllers\Controller;
use App\Models\Grade;
use App\Services\PredictionService;
use App\Services\TacticalGamificationService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class GradeController extends Controller
{
    public function index(Request $request, \App\Services\GradeAnalyzerService $gradeAnalyzer)
    {
        $query = $request->user()->grades()->with('subject');

        $query->when($request->subject_id, function ($q, $subjectId) {
            return $q->where('subject_id', $subjectId);
        });

        $query->when($request->type, function ($q, $type) {
            return $q->where('type', $type);
        });

        $grades = $query->orderByDesc('date')->get();

        // Per-subject summary menggunakan GradeAnalyzerService
        $subjects = $request->user()->subjects()->with('grades')->get();
        $summary = $subjects->map(function ($subject) use ($gradeAnalyzer, $request) {
            $stats = $gradeAnalyzer->calculateWeightedScore($subject, $request->user()->id);
            return [
                'subject_id' => $subject->id,
                'subject' => [
                    'id' => $subject->id,
                    'name' => $subject->name,
                    'color' => $subject->color,
                ],
                'total' => $stats['grade_count'],
                'total_weight' => $stats['total_weight'],
                'raw_weighted_sum' => $stats['raw_score'],
                'avg_percentage' => $stats['current_score'],
                'category_breakdown' => $stats['category_breakdown'],
            ];
        })->filter(fn($item) => $item['total'] > 0)->values();

        return response()->json([
            'success' => true,
            'message' => 'Daftar nilai berhasil diambil',
            'data' => [
                'grades' => $grades,
                'summary' => $summary,
            ],
        ]);
    }

    public function store(Request $request, PredictionService $prediction, TacticalGamificationService $gamification)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:150',
            'type' => 'required|in:exam,quiz,assignment,project,other',
            'score' => 'required|numeric|min:0',
            'max_score' => 'required|numeric|min:1|max:10000',
            'weight_percentage' => 'required|numeric|min:0|max:100',
            'date' => 'required|date|before_or_equal:today',
            'subject_id' => [
                'required',
                Rule::exists('subjects', 'id')->where('user_id', $request->user()->id),
            ],
        ]);

        if ($validated['score'] > $validated['max_score']) {
            return response()->json([
                'success' => false,
                'message' => 'Nilai tidak boleh melebihi nilai maksimum',
                'errors' => ['score' => ['Nilai melebihi nilai maksimum.']],
            ], 422);
        }

        $grade = $request->user()->grades()->create($validated);
        $grade->load('subject');

        // Trigger Analitik & Gamifikasi
        $gamification->awardExp($request->user(), 50);
        $gamification->advanceConquest($grade->subject, 5);
        $prediction->calculatePassingProbability($grade->subject);

        return response()->json([
            'success' => true,
            'message' => 'Nilai berhasil ditambahkan',
            'data' => $grade,
        ], 201);
    }

    public function show(Request $request, $id)
    {
        $grade = $request->user()->grades()->with('subject')->findOrFail($id);

        return response()->json([
            'success' => true,
            'message' => 'Detail nilai berhasil diambil',
            'data' => $grade,
        ]);
    }

    public function update(Request $request, $id, PredictionService $prediction, TacticalGamificationService $gamification)
    {
        $grade = $request->user()->grades()->findOrFail($id);

        $validated = $request->validate([
            'title' => 'required|string|max:150',
            'type' => 'required|in:exam,quiz,assignment,project,other',
            'category' => 'required|string|max:50',
            'score' => 'required|numeric|min:0',
            'max_score' => 'required|numeric|min:1|max:10000',
            'date' => 'required|date|before_or_equal:today',
            'subject_id' => [
                'required',
                Rule::exists('subjects', 'id')->where('user_id', $request->user()->id),
            ],
        ]);

        if ($validated['score'] > $validated['max_score']) {
            return response()->json([
                'success' => false,
                'message' => 'Nilai tidak boleh melebihi nilai maksimum',
                'errors' => ['score' => ['Nilai melebihi nilai maksimum.']],
            ], 422);
        }

        $grade->update($validated);
        $grade->load('subject');

        // Trigger Analitik & Gamifikasi
        $gamification->awardExp($request->user(), 20);
        $gamification->advanceConquest($grade->subject, 2);
        $prediction->calculatePassingProbability($grade->subject);

        return response()->json([
            'success' => true,
            'message' => 'Nilai berhasil diperbarui',
            'data' => $grade,
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $grade = $request->user()->grades()->findOrFail($id);
        $grade->delete();

        return response()->json([
            'success' => true,
            'message' => 'Nilai berhasil dihapus',
            'data' => null,
        ]);
    }
}
