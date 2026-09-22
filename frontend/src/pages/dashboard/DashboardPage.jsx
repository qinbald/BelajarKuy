import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useDashboardSummary } from '../../hooks/useDashboardSummary';
import { toggleTaskComplete } from '../../services/todoService';
import VisionBoard from '../../components/dashboard/VisionBoard';
import QuickNotes from '../../components/dashboard/QuickNotes';
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
  Sparkles,
  AlertCircle
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: summary, isLoading, error, refetch } = useDashboardSummary();
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    if (summary?.tasks) {
      setTasks(summary.tasks);
    }
  }, [summary?.tasks]);

  const handleToggleTask = async (id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    try {
      await toggleTaskComplete(id);
    } catch {
      if (summary?.tasks) setTasks(summary.tasks);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0j 0m';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}j ${m}m`;
  };

  const hasStudyData = summary?.analytics?.study_chart?.some((d) => d.minutes > 0);
  const todaySchedules = summary?.schedules || [];

  return (
    <div className="space-y-6 pb-8">
      {/* Welcome Banner - Never Blocked by Data Loading */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
          <Sparkles className="w-32 h-32 -mt-8 -mr-8" />
        </div>
        <div className="relative z-10">
          <h1 className="text-2xl font-bold">Halo, {user?.name || 'Pelajar'}! 👋</h1>
          <p className="text-blue-100 text-sm mt-1">Siap untuk mencapai target belajar hari ini?</p>
        </div>
        <div className="flex items-center gap-2 relative z-10">
          <Link
            to="/timer"
            className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl text-sm font-medium transition backdrop-blur-sm"
          >
            <Timer className="w-4 h-4" /> Mulai Belajar
          </Link>
          <Link
            to="/todos"
            className="inline-flex items-center gap-2 bg-white text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl text-sm font-medium transition shadow-sm"
          >
            <Plus className="w-4 h-4" /> Tambah Tugas
          </Link>
        </div>
      </div>

      {/* Error Notification Banner if Aggregate Fetch Fails */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-between text-red-700 text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={refetch}
            className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* Main Grid: 2 Cols Left (Data), 1 Col Right (Vision Board) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: Analytics & Tasks */}
        <div className="lg:col-span-2 space-y-6">
          {/* Metrics Overview (Progressive Skeleton) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {isLoading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm animate-pulse space-y-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl" />
                  <div className="space-y-1.5">
                    <div className="h-6 w-14 bg-gray-200 rounded" />
                    <div className="h-3 w-20 bg-gray-100 rounded" />
                  </div>
                </div>
              ))
            ) : (
              <>
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-3 hover:shadow-md transition-shadow">
                  <div className="p-2.5 bg-orange-50 text-orange-600 rounded-xl w-fit">
                    <Flame className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{summary?.analytics?.streak || 0}</h3>
                    <p className="text-xs text-gray-500 font-medium mt-0.5">Streak Hari</p>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-3 hover:shadow-md transition-shadow">
                  <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl w-fit">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {formatDuration(summary?.analytics?.today_seconds)}
                    </h3>
                    <p className="text-xs text-gray-500 font-medium mt-0.5">Belajar Hari Ini</p>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-3 hover:shadow-md transition-shadow">
                  <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl w-fit">
                    <ListTodo className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{summary?.analytics?.tasks_completed || 0}</h3>
                    <p className="text-xs text-gray-500 font-medium mt-0.5">Tugas Selesai</p>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-3 hover:shadow-md transition-shadow">
                  <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl w-fit">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{summary?.subjects_count || 0}</h3>
                    <p className="text-xs text-gray-500 font-medium mt-0.5">Mata Pelajaran</p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Study Time Chart (Fixed min-height avoids layout thrashing in Recharts) */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-base font-bold text-gray-900 mb-4">Waktu Belajar (7 Hari Terakhir)</h2>
            <div className="h-56 min-h-[224px] w-full">
              {isLoading ? (
                <div className="w-full h-full flex items-end gap-3 pt-6 pb-2 px-4 animate-pulse">
                  {[35, 60, 45, 80, 55, 90, 40].map((h, i) => (
                    <div key={i} className="flex-1 bg-gray-100 rounded-t-lg" style={{ height: `${h}%` }} />
                  ))}
                </div>
              ) : !hasStudyData ? (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                  <Timer className="w-10 h-10 mb-2 opacity-30" />
                  <p className="text-sm">Belum ada data waktu belajar.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={summary?.analytics?.study_chart || []}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#9ca3af' }}
                      dy={10}
                    />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                    <Tooltip
                      cursor={{ fill: '#f9fafb' }}
                      contentStyle={{
                        borderRadius: '12px',
                        border: 'none',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      }}
                      formatter={(value) => [`${value} menit`, 'Waktu']}
                    />
                    <Bar dataKey="minutes" fill="#4f46e5" radius={[6, 6, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Tasks & Schedule Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Today's Schedule (Progressive Skeleton) */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-gray-900">Jadwal Hari Ini</h2>
                <Link
                  to="/schedule"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  Lihat <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {isLoading ? (
                <div className="space-y-3 animate-pulse">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-14 bg-gray-50 rounded-xl" />
                  ))}
                </div>
              ) : todaySchedules.length === 0 ? (
                <div className="text-center py-6 text-gray-400">
                  <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-medium text-gray-600">Kosong!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {todaySchedules.map((s) => (
                    <div
                      key={s.id}
                      className="flex gap-3 p-3 rounded-xl border border-gray-50 bg-gray-50/50 hover:bg-gray-50 transition-colors"
                    >
                      <div
                        className="w-1.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: s.subject?.color || '#3b82f6' }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-gray-900 truncate">{s.subject?.name}</p>
                        <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>
                            {s.start_time.substring(0, 5)} - {s.end_time.substring(0, 5)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pending Tasks (Progressive Skeleton) */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-gray-900">Tugas Tertunda</h2>
                <Link
                  to="/todos"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  Semua ({tasks.length}) <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {isLoading ? (
                <div className="space-y-2 animate-pulse">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-10 bg-gray-50 rounded-xl" />
                  ))}
                </div>
              ) : tasks.length === 0 ? (
                <div className="text-center py-6 text-gray-400">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-medium text-gray-600">Semua beres!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {tasks.map((t) => (
                    <div
                      key={t.id}
                      className="p-3 rounded-xl border border-gray-50 bg-gray-50/50 flex items-center justify-between gap-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          onClick={() => handleToggleTask(t.id)}
                          className="text-gray-300 hover:text-blue-600 transition-colors"
                        >
                          <Circle className="w-4.5 h-4.5" />
                        </button>
                        <span className="text-sm text-gray-700 truncate font-medium">{t.title}</span>
                      </div>
                      {t.subject && (
                        <span
                          className="text-[10px] font-bold px-2 py-1 rounded-md flex-shrink-0"
                          style={{
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

        {/* RIGHT COLUMN: Vision Board */}
        <div className="lg:col-span-1">
          <VisionBoard />
        </div>
      </div>

      {/* Quick Notes — Full Width */}
      <QuickNotes />
    </div>
  );
}
