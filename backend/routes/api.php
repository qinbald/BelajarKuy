<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Subject\SubjectController;
use App\Http\Controllers\Todo\TaskController;
use App\Http\Controllers\Schedule\ScheduleController;
use App\Http\Controllers\Timer\StudySessionController;
use App\Http\Controllers\Grade\GradeController;
use App\Http\Controllers\LearningResult\LearningResultController;
use App\Http\Controllers\Analytics\AnalyticsController;
use App\Http\Controllers\Preference\PreferenceController;
use App\Http\Controllers\Gallery\GalleryController;
use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\Report\ReportController;
use App\Http\Controllers\Dashboard\DashboardSummaryController;

Route::middleware([\App\Http\Middleware\ForceJsonResponse::class])->group(function () {
    
    // Public routes
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    // Protected routes
    Route::middleware(['auth:sanctum', 'active'])->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);

        // Dashboard Summary (BFF Aggregate Endpoint)
        Route::get('/dashboard/summary', [DashboardSummaryController::class, 'index']);

        // Subjects
        Route::apiResource('subjects', SubjectController::class);

        // Tasks
        Route::apiResource('tasks', TaskController::class);
        Route::patch('/tasks/{id}/toggle', [TaskController::class, 'toggleComplete']);

        // Schedules
        Route::apiResource('schedules', ScheduleController::class);

        // Study Sessions / Timer
        Route::get('/study-sessions/summary', [StudySessionController::class, 'summary']);
        Route::get('/study-sessions', [StudySessionController::class, 'index']);
        Route::post('/study-sessions', [StudySessionController::class, 'store']);

        // Grades
        Route::apiResource('grades', GradeController::class);

        // Learning Results
        Route::apiResource('learning-results', LearningResultController::class);

        // Analytics
        Route::get('/analytics', [AnalyticsController::class, 'index']);

        // User Preferences / Onboarding Survey
        Route::get('/preferences', [PreferenceController::class, 'show']);
        Route::post('/preferences', [PreferenceController::class, 'update']);

        // Gallery & Recommendations
        Route::get('/gallery/recommendations', [GalleryController::class, 'recommendations']);
        Route::get('/gallery/tags', [GalleryController::class, 'tags']);
        Route::get('/gallery', [GalleryController::class, 'index']);
        Route::post('/gallery', [GalleryController::class, 'store']);
        Route::delete('/gallery/{id}', [GalleryController::class, 'destroy']);

        // User reporting content
        Route::post('/reports', [ReportController::class, 'store']);

        // Admin only routes
        Route::middleware(['admin'])->prefix('admin')->group(function () {
            Route::get('/stats', [AdminController::class, 'getStats']);
            Route::get('/users', [AdminController::class, 'getUsers']);
            Route::patch('/users/{id}/toggle-status', [AdminController::class, 'toggleUserStatus']);
            Route::get('/reports', [AdminController::class, 'getReports']);
            Route::patch('/reports/{id}', [AdminController::class, 'updateReportStatus']);
        });
    });
});
