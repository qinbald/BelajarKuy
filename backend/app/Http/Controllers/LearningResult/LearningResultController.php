<?php

namespace App\Http\Controllers\LearningResult;

use App\Http\Controllers\Controller;
use App\Models\LearningResult;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class LearningResultController extends Controller
{
    public function index(Request $request)
    {
        $query = $request->user()->learningResults()
            ->select('id', 'user_id', 'subject_id', 'grade_id', 'title', 'file_name', 'file_size', 'file_type', 'visibility', 'created_at')
            ->with([
                'subject:id,name,color',
                'grade:id,name'
            ]);

        if ($request->filled('subject_id')) {
            $query->where('subject_id', $request->subject_id);
        }

        $results = $query->latest()->paginate(15);

        return response()->json([
            'success' => true,
            'message' => 'Daftar hasil belajar berhasil diambil',
            'data' => $results,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:150',
            'description' => 'nullable|string|max:500',
            'file' => 'required|file|max:10240|mimes:pdf,doc,docx,png,jpg,jpeg,webp,zip',
            'visibility' => 'nullable|in:private,public',
            'subject_id' => [
                'nullable',
                Rule::exists('subjects', 'id')->where('user_id', $request->user()->id),
            ],
            'grade_id' => [
                'nullable',
                Rule::exists('grades', 'id')->where('user_id', $request->user()->id),
            ],
        ]);

        $file = $request->file('file');
        $randomName = Str::random(40) . '.' . $file->extension();
        $path = $file->storeAs('learning_results/' . $request->user()->id, $randomName, 'public');

        $result = $request->user()->learningResults()->create([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'file_path' => $path,
            'file_name' => $file->getClientOriginalName(),
            'file_type' => $file->getClientMimeType(),
            'file_size' => $file->getSize(),
            'visibility' => $validated['visibility'] ?? 'private',
            'subject_id' => $validated['subject_id'] ?? null,
            'grade_id' => $validated['grade_id'] ?? null,
        ]);

        $result->load(['subject', 'grade']);

        return response()->json([
            'success' => true,
            'message' => 'Berkas hasil belajar berhasil diunggah',
            'data' => $result,
        ], 201);
    }

    public function show(Request $request, $id)
    {
        $result = $request->user()->learningResults()->with(['subject', 'grade'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'message' => 'Detail hasil belajar berhasil diambil',
            'data' => $result,
        ]);
    }

    public function update(Request $request, $id)
    {
        $result = $request->user()->learningResults()->findOrFail($id);

        $validated = $request->validate([
            'title' => 'required|string|max:150',
            'description' => 'nullable|string|max:500',
            'visibility' => 'nullable|in:private,public',
            'subject_id' => [
                'nullable',
                Rule::exists('subjects', 'id')->where('user_id', $request->user()->id),
            ],
            'grade_id' => [
                'nullable',
                Rule::exists('grades', 'id')->where('user_id', $request->user()->id),
            ],
        ]);

        $result->update($validated);
        $result->load(['subject', 'grade']);

        return response()->json([
            'success' => true,
            'message' => 'Hasil belajar berhasil diperbarui',
            'data' => $result,
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $result = $request->user()->learningResults()->findOrFail($id);

        // Delete file from storage
        if ($result->file_path && Storage::disk('public')->exists($result->file_path)) {
            Storage::disk('public')->delete($result->file_path);
        }

        $result->delete();

        return response()->json([
            'success' => true,
            'message' => 'Hasil belajar berhasil dihapus',
            'data' => null,
        ]);
    }
}
