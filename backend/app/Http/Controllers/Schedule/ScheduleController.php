<?php

namespace App\Http\Controllers\Schedule;

use App\Http\Controllers\Controller;
use App\Models\Schedule;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ScheduleController extends Controller
{
    public function index(Request $request)
    {
        $schedules = $request->user()
            ->schedules()
            ->with('subject')
            ->orderBy('day')
            ->orderBy('start_time')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar jadwal berhasil diambil',
            'data' => $schedules,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:150',
            'day' => 'required|integer|between:0,6',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'type' => 'required|in:class,study',
            'location' => 'nullable|string|max:150',
            'subject_id' => [
                'nullable',
                Rule::exists('subjects', 'id')->where('user_id', $request->user()->id),
            ],
        ]);

        $schedule = $request->user()->schedules()->create($validated);
        $schedule->load('subject');

        return response()->json([
            'success' => true,
            'message' => 'Jadwal berhasil ditambahkan',
            'data' => $schedule,
        ], 201);
    }

    public function show(Request $request, $id)
    {
        $schedule = $request->user()->schedules()->with('subject')->findOrFail($id);

        return response()->json([
            'success' => true,
            'message' => 'Detail jadwal berhasil diambil',
            'data' => $schedule,
        ]);
    }

    public function update(Request $request, $id)
    {
        $schedule = $request->user()->schedules()->findOrFail($id);

        $validated = $request->validate([
            'title' => 'required|string|max:150',
            'day' => 'required|integer|between:0,6',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'type' => 'required|in:class,study',
            'location' => 'nullable|string|max:150',
            'subject_id' => [
                'nullable',
                Rule::exists('subjects', 'id')->where('user_id', $request->user()->id),
            ],
        ]);

        $schedule->update($validated);
        $schedule->load('subject');

        return response()->json([
            'success' => true,
            'message' => 'Jadwal berhasil diperbarui',
            'data' => $schedule,
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $schedule = $request->user()->schedules()->findOrFail($id);
        $schedule->delete();

        return response()->json([
            'success' => true,
            'message' => 'Jadwal berhasil dihapus',
            'data' => null,
        ]);
    }
}
