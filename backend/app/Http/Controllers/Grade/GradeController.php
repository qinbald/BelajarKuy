<?php

namespace App\Http\Controllers\Grade;

use App\Http\Controllers\Controller;
use App\Models\Grade;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class GradeController extends Controller
{
    public function index(Request $request)
    {
        $query = $request->user()->grades()->with('subject');

        if ($request->filled('subject_id')) {
            $query->where('subject_id', $request->subject_id);
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        $grades = $query->orderByDesc('date')->get();

        // Per-subject summary
        $summary = $request->user()->grades()
            ->selectRaw('subject_id, AVG(score / max_score * 100) as avg_percentage, COUNT(*) as total')
            ->groupBy('subject_id')
            ->with('subject:id,name,color')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar nilai berhasil diambil',
            'data' => [
                'grades' => $grades,
                'summary' => $summary,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:150',
            'type' => 'required|in:exam,quiz,assignment,project,other',
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

        $grade = $request->user()->grades()->create($validated);
        $grade->load('subject');

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

    public function update(Request $request, $id)
    {
        $grade = $request->user()->grades()->findOrFail($id);

        $validated = $request->validate([
            'title' => 'required|string|max:150',
            'type' => 'required|in:exam,quiz,assignment,project,other',
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
