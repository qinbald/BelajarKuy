<?php

namespace App\Http\Controllers\Todo;

use App\Http\Controllers\Controller;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class TaskController extends Controller
{
    public function index(Request $request)
    {
        $query = $request->user()->tasks()->with('subject');

        // Filter status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter priority
        if ($request->filled('priority')) {
            $query->where('priority', $request->priority);
        }

        // Filter subject
        if ($request->filled('subject_id')) {
            $query->where('subject_id', $request->subject_id);
        }

        // Search title or description
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Sorting
        $sortBy = in_array($request->sort_by, ['due_date', 'priority', 'created_at', 'title']) ? $request->sort_by : 'due_date';
        $order = strtolower($request->order) === 'desc' ? 'desc' : 'asc';
        $query->orderByRaw("$sortBy is null, $sortBy $order");

        $tasks = $query->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar tugas berhasil dimuat',
            'data' => $tasks
        ]);
    }

    public function store(Request $request)
    {
        $userId = $request->user()->id;

        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:200',
            'description' => 'nullable|string',
            'subject_id' => [
                'nullable',
                Rule::exists('subjects', 'id')->where(function ($query) use ($userId) {
                    return $query->where('user_id', $userId);
                }),
            ],
            'priority' => 'nullable|in:low,medium,high',
            'status' => 'nullable|in:pending,in_progress,completed',
            'due_date' => 'nullable|date',
            'due_time' => 'nullable|date_format:H:i',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $status = $request->status ?? 'pending';
        $completedAt = $status === 'completed' ? now() : null;

        $task = $request->user()->tasks()->create([
            'title' => $request->title,
            'description' => $request->description,
            'subject_id' => $request->subject_id,
            'priority' => $request->priority ?? 'medium',
            'status' => $status,
            'due_date' => $request->due_date,
            'due_time' => $request->due_time,
            'completed_at' => $completedAt,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Tugas berhasil dibuat',
            'data' => $task->load('subject')
        ], 201);
    }

    public function show(Request $request, $id)
    {
        $task = $request->user()->tasks()->with('subject')->find($id);

        if (!$task) {
            return response()->json([
                'success' => false,
                'message' => 'Tugas tidak ditemukan',
                'errors' => null
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail tugas berhasil diambil',
            'data' => $task
        ]);
    }

    public function update(Request $request, $id)
    {
        $task = $request->user()->tasks()->find($id);

        if (!$task) {
            return response()->json([
                'success' => false,
                'message' => 'Tugas tidak ditemukan',
                'errors' => null
            ], 404);
        }

        $userId = $request->user()->id;

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:200',
            'description' => 'nullable|string',
            'subject_id' => [
                'nullable',
                Rule::exists('subjects', 'id')->where(function ($query) use ($userId) {
                    return $query->where('user_id', $userId);
                }),
            ],
            'priority' => 'nullable|in:low,medium,high',
            'status' => 'nullable|in:pending,in_progress,completed',
            'due_date' => 'nullable|date',
            'due_time' => 'nullable|date_format:H:i',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->only(['title', 'description', 'subject_id', 'priority', 'status', 'due_date', 'due_time']);

        if (isset($data['status'])) {
            if ($data['status'] === 'completed' && $task->status !== 'completed') {
                $data['completed_at'] = now();
            } elseif ($data['status'] !== 'completed') {
                $data['completed_at'] = null;
            }
        }

        $task->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Tugas berhasil diperbarui',
            'data' => $task->load('subject')
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $task = $request->user()->tasks()->find($id);

        if (!$task) {
            return response()->json([
                'success' => false,
                'message' => 'Tugas tidak ditemukan',
                'errors' => null
            ], 404);
        }

        $task->delete();

        return response()->json([
            'success' => true,
            'message' => 'Tugas berhasil dihapus',
            'data' => null
        ]);
    }

    public function toggleComplete(Request $request, $id)
    {
        $task = $request->user()->tasks()->find($id);

        if (!$task) {
            return response()->json([
                'success' => false,
                'message' => 'Tugas tidak ditemukan',
                'errors' => null
            ], 404);
        }

        if ($task->status === 'completed') {
            $task->status = 'pending';
            $task->completed_at = null;
        } else {
            $task->status = 'completed';
            $task->completed_at = now();
        }

        $task->save();

        return response()->json([
            'success' => true,
            'message' => $task->status === 'completed' ? 'Tugas diselesaikan' : 'Tugas dibuka kembali',
            'data' => $task->load('subject')
        ]);
    }
}
