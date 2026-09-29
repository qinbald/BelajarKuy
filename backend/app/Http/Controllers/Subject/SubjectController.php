<?php

namespace App\Http\Controllers\Subject;

use App\Http\Controllers\Controller;
use App\Models\Subject;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SubjectController extends Controller
{
    public function index(Request $request)
    {
        $subjects = $request->user()->subjects()
            ->withCount(['tasks' => function ($q) {
                $q->where('status', '!=', 'completed');
            }])
            ->orderBy('name', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar mata kuliah/pelajaran berhasil dimuat',
            'data' => $subjects
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name'        => 'required|string|max:100',
            'code'        => 'nullable|string|max:30',
            'teacher'     => 'nullable|string|max:100',
            'description' => 'nullable|string',
            'color'       => 'nullable|string|max:7',
            'target_grade'=> 'nullable|integer|min:0|max:100',
            'category_weights' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors'  => $validator->errors()
            ], 422);
        }

        $subject = $request->user()->subjects()->create([
            'name'        => $request->name,
            'code'        => $request->code,
            'teacher'     => $request->teacher,
            'description' => $request->description,
            'color'       => $request->color ?? '#3B82F6',
            'target_grade'=> $request->target_grade,
            'category_weights' => $request->category_weights,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Mata pelajaran berhasil ditambahkan',
            'data'    => $subject
        ], 201);
    }

    public function show(Request $request, $id)
    {
        $subject = $request->user()->subjects()->with('tasks')->find($id);

        if (!$subject) {
            return response()->json([
                'success' => false,
                'message' => 'Mata pelajaran tidak ditemukan',
                'errors'  => null
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail mata pelajaran berhasil diambil',
            'data'    => $subject
        ]);
    }

    public function update(Request $request, $id)
    {
        $subject = $request->user()->subjects()->find($id);

        if (!$subject) {
            return response()->json([
                'success' => false,
                'message' => 'Mata pelajaran tidak ditemukan'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name'        => 'sometimes|required|string|max:100',
            'code'        => 'nullable|string|max:30',
            'teacher'     => 'nullable|string|max:100',
            'description' => 'nullable|string',
            'color'       => 'nullable|string|max:7',
            'target_grade'=> 'nullable|integer|min:0|max:100',
            'category_weights' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors'  => $validator->errors()
            ], 422);
        }

        $subject->update($request->only(['name', 'code', 'teacher', 'description', 'color', 'target_grade', 'category_weights']));

        return response()->json([
            'success' => true,
            'message' => 'Mata pelajaran berhasil diperbarui',
            'data'    => $subject
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $subject = $request->user()->subjects()->find($id);

        if (!$subject) {
            return response()->json([
                'success' => false,
                'message' => 'Mata pelajaran tidak ditemukan'
            ], 404);
        }

        $subject->delete();

        return response()->json([
            'success' => true,
            'message' => 'Mata pelajaran berhasil dihapus'
        ]);
    }
}
