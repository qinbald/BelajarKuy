<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\GalleryItem;
use App\Models\Report;
use App\Models\StudySession;
use App\Models\User;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function getStats()
    {
        $totalUsers = User::where('role', 'user')->count();
        $activeUsers = User::where('role', 'user')->where('is_active', true)->count();
        $totalUploads = GalleryItem::count();
        $totalStudySessions = StudySession::count();

        return response()->json([
            'success' => true,
            'data' => [
                'total_users' => $totalUsers,
                'active_users' => $activeUsers,
                'total_uploads' => $totalUploads,
                'total_study_sessions' => $totalStudySessions,
            ]
        ]);
    }

    public function getUsers()
    {
        $users = User::where('role', 'user')
            ->select('id', 'name', 'email', 'is_active', 'created_at')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $users
        ]);
    }

    public function toggleUserStatus($id)
    {
        $user = User::findOrFail($id);
        
        if ($user->role === 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Tidak dapat mengubah status admin.'
            ], 403);
        }

        $user->is_active = !$user->is_active;
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Status user berhasil diubah.',
            'data' => $user
        ]);
    }

    public function getReports()
    {
        $reports = Report::with(['reporter:id,name,email', 'reportable'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $reports
        ]);
    }

    public function updateReportStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:pending,reviewed,resolved',
            'action_taken' => 'nullable|string'
        ]);

        $report = Report::findOrFail($id);
        $report->status = $request->status;
        if ($request->has('action_taken')) {
            $report->action_taken = $request->action_taken;
        }
        $report->save();

        return response()->json([
            'success' => true,
            'message' => 'Status laporan berhasil diperbarui.',
            'data' => $report
        ]);
    }
}
