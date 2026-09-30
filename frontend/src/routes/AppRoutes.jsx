import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { TimerProvider } from '../contexts/TimerContext';
import { ProtectedRoute, GuestRoute, AdminRoute } from './Guards';
import MainLayout from '../layouts/MainLayout';

import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import VerifyEmail from '../pages/auth/VerifyEmail';
import DashboardPage from '../pages/dashboard/DashboardPage';
import TodoPage from '../pages/todo/TodoPage';
import SubjectPage from '../pages/subject/SubjectPage';
import SchedulePage from '../pages/schedule/SchedulePage';
import StudyRoomPage from '../pages/StudyRoomPage';
import GradePage from '../pages/grade/GradePage';
import LearningResultPage from '../pages/learning-result/LearningResultPage';
import GalleryPage from '../pages/gallery/GalleryPage';
import NotesPage from '../pages/notes/NotesPage';
import AdminLayout from '../layouts/AdminLayout';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminReportsPage from '../pages/admin/AdminReportsPage';

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TimerProvider>
          <Routes>
            {/* Public / Guest Routes */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
            <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
            <Route path="/verify-email" element={<VerifyEmail />} />

            {/* Protected User Routes */}
            <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/todos" element={<TodoPage />} />
              <Route path="/subjects" element={<SubjectPage />} />
              <Route path="/schedule" element={<SchedulePage />} />
              <Route path="/study-room" element={<StudyRoomPage />} />
              <Route path="/grades" element={<GradePage />} />
              <Route path="/results" element={<LearningResultPage />} />
              <Route path="/gallery" element={<GalleryPage />} />
              <Route path="/notes" element={<NotesPage />} />
            </Route>

            {/* Admin Routes */}
            <Route element={<AdminRoute><AdminLayout /></AdminRoute>}>
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/admin/reports" element={<AdminReportsPage />} />
            </Route>
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </TimerProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
