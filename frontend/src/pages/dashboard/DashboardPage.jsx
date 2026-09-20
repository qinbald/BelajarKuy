import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTodos } from '../../hooks/useTodos';
import { useSubjects } from '../../hooks/useSubjects';
import { useAnalytics } from '../../hooks/useAnalytics';
import { useSchedules } from '../../hooks/useSchedules';
import {
  BookOpen,
  ListTodo,
  Timer,
  CheckCircle2,
  Circle,
  ArrowRight,
  Plus,
  Flame,
  Clock,
  Calendar,
  Award
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

export default function DashboardPage() {
  const { user } = useAuth();
  const { tasks, loading: tasksLoading, error: tasksError, toggleTask } = useTodos({ status: 'pending' });
  const { subjects, loading: subjectsLoading, error: subjectsError } = useSubjects();
  const { data: analytics, loading: analyticsLoading, error: analyticsError } = useAnalytics();
  const { schedules, loading: schedulesLoading, error: schedulesError } = useSchedules();

  const pendingTasks = tasks.slice(0, 5);
  
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const todaySchedules = schedules
    .filter(s => s.day_of_week === today)
    .sort((a, b) => a.start_time.localeCompare(b.start_time));

  const formatDuration = (seconds) => {
    if (!seconds) return '0j 0m';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}j ${m}m`;
  };

  const hasStudyData = analytics?.study_chart?.some(d => d.minutes > 0);
  const hasGradesData = analytics?.grades_chart?.length > 0;

  const isLoading = tasksLoading || subjectsLoading || analyticsLoading || schedulesLoading;
  const hasError = tasksError || subjectsError || analyticsError || schedulesError;

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-32 bg-gray-200 rounded-2xl w-full"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-xl w-full"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-80 bg-gray-200 rounded-xl w-full"></div>
            <div className="h-80 bg-gray-200 rounded-xl w-full"></div>
          </div>
          <div className="space-y-6">
            <div className="h-64 bg-gray-200 rounded-xl w-full"></div>
            <div className="h-64 bg-gray-200 rounded-xl w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center space-y-4">
        <div className="p-4 bg-red-50 text-red-600 rounded-full">
          <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900">Gagal Memuat Data</h2>
        <p className="text-gray-500 max-w-md">
          Maaf, terjadi kesalahan saat memuat data dashboard Anda. Silakan coba muat ulang halaman.
        </p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Muat Ulang
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Halo, {user?.name || 'Pelajar'}! 👋</h1>
          <p className="text-blue-100 text-sm mt-1">
            Siap untuk mencapai target belajar hari ini?
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/timer"
            className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition backdrop-blur-sm"
          >
            <Timer className="w-4 h-4" /> Mulai Belajar
          </Link>
          <Link
            to="/todos"
            className="inline-flex items-center gap-2 bg-white text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm"
          >
            <Plus className="w-4 h-4" /> Tambah Tugas
          </Link>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-orange-50 text-orange-600 rounded-lg">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Streak Belajar</p>
            <h3 className="text-2xl font-bold text-gray-900">
              {analyticsLoading ? '-' : analytics?.streak || 0} <span className="text-sm font-normal text-gray-500">hari</span>
            </h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Belajar Hari Ini</p>
            <h3 className="text-2xl font-bold text-gray-900">
              {analyticsLoading ? '-' : formatDuration(analytics?.study_time?.today_seconds)}
            </h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <ListTodo className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Tugas Selesai</p>
            <h3 className="text-2xl font-bold text-gray-900">
              {analyticsLoading ? '-' : analytics?.tasks?.completed || 0}
            </h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Mata Pelajaran</p>
            <h3 className="text-2xl font-bold text-gray-900">{subjects.length}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Study Time Chart */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h2 className="text-base font-bold text-gray-900 mb-4">Waktu Belajar (7 Hari Terakhir)</h2>
            <div className="h-64">
              {analyticsLoading ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                </div>
              ) : !hasStudyData ? (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                  <Timer className="w-10 h-10 mb-2 opacity-50" />
                  <p className="text-sm">Belum ada data waktu belajar.</p>
                  <p className="text-xs mt-1">Mulai sesi Pomodoro untuk merekam waktu!</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics?.study_chart || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                    <Tooltip 
                      cursor={{ fill: '#f3f4f6' }}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(value) => [`${value} menit`, 'Waktu']}
                    />
                    <Bar dataKey="minutes" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Grades Chart */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h2 className="text-base font-bold text-gray-900 mb-4">Rata-rata Nilai per Mata Pelajaran</h2>
            <div className="h-64">
              {analyticsLoading ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                </div>
              ) : !hasGradesData ? (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                  <Award className="w-10 h-10 mb-2 opacity-50" />
                  <p className="text-sm">Belum ada data nilai.</p>
                  <p className="text-xs mt-1">Catat nilai tugas/ujian di menu Nilai.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics?.grades_chart || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="subject_name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                    <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(value) => [`${value}%`, 'Rata-rata']}
                    />
                    <Line type="monotone" dataKey="avg_percentage" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Tasks & Schedule */}
        <div className="space-y-6">
          {/* Today's Schedule */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-900">Jadwal Hari Ini</h2>
              <Link
                to="/schedule"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                Lihat <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {todaySchedules.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-800">Kosong!</p>
                <p className="text-xs text-gray-400 mt-0.5">Tidak ada jadwal kelas hari ini.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todaySchedules.map((s) => (
                  <div key={s.id} className="flex gap-3 p-3 rounded-lg border border-gray-100 bg-gray-50">
                    <div className="w-1 bg-blue-500 rounded-full flex-shrink-0" style={{ backgroundColor: s.subject?.color || '#3b82f6' }} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-gray-900 truncate">{s.subject?.name}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>{s.start_time.substring(0, 5)} - {s.end_time.substring(0, 5)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Today's Tasks Section */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-900">Tugas Tertunda</h2>
              <Link
                to="/todos"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                Semua ({tasks.length}) <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {pendingTasks.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-800">Semua tugas beres!</p>
                <p className="text-xs text-gray-400 mt-0.5">Tidak ada tugas yang tertunda.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {pendingTasks.map((t) => (
                  <div key={t.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        onClick={() => toggleTask(t.id)}
                        className="text-gray-400 hover:text-blue-600 transition"
                      >
                        <Circle className="w-4 h-4" />
                      </button>
                      <span className="text-sm text-gray-800 truncate">{t.title}</span>
                    </div>
                    {t.subject && (
                      <span
                        className="text-[10px] font-medium px-2 py-0.5 rounded border flex-shrink-0"
                        style={{
                          borderColor: `${t.subject.color}40`,
                          backgroundColor: `${t.subject.color}15`,
                          color: t.subject.color,
                        }}
                      >
                        {t.subject.name}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
