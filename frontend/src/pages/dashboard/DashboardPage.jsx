import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useDashboardSummary } from '../../hooks/useDashboardSummary';
import { useTheme } from '../../contexts/ThemeContext';
import { toggleTaskComplete } from '../../services/todoService';
import VisionBoard from '../../components/dashboard/VisionBoard';

import BackgroundSettingsModal from '../../components/dashboard/BackgroundSettingsModal';
import ProfileSettingsModal from '../../components/dashboard/ProfileSettingsModal';
import TacticalCommandCenter from '../../components/dashboard/TacticalCommandCenter';
import StatCard from '../../components/dashboard/StatCard';
import GlassSkeleton from '../../components/common/GlassSkeleton';
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
  Sparkles,
  AlertCircle,
  Palette,
  StickyNote,
  User,
  BarChart3,
  Upload,
  Trash2,
  Image as ImageIcon,
  GraduationCap
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
  const { background, hasImage } = useTheme();
  const [tasks, setTasks] = useState([]);
  const [isBgModalOpen, setIsBgModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('chart'); // 'chart' | 'vision'

  // ponytail: localStorage only, ceiling single-device; upgrade to POST /api/target-visual when need cross-device sync
  const [targetVisual, setTargetVisual] = useState(() => {
    return localStorage.getItem('bk_target_visual') || null;
  });

  const handleTargetVisualChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      setTargetVisual(dataUrl);
      localStorage.setItem('bk_target_visual', dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const clearTargetVisual = () => {
    setTargetVisual(null);
    localStorage.removeItem('bk_target_visual');
  };


  // Glassmorphism styling helper
  const cardClass = hasImage 
    ? 'bg-white/80 backdrop-blur-md border-white/40 shadow-xs' 
    : 'bg-white border-gray-100 shadow-xs';

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

  return (
    <div className="space-y-6 pb-12">
      {/* 0. HEADER / WELCOME BANNER */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-5 sm:p-6 text-white shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
          <Sparkles className="w-32 h-32 -mt-8 -mr-8" />
        </div>
        <div className="relative z-10 flex items-center gap-4">
          <button 
            onClick={() => setIsProfileModalOpen(true)}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-white/30 flex items-center justify-center bg-white/20 overflow-hidden shrink-0 hover:border-white hover:scale-105 transition-all cursor-pointer shadow-sm group relative"
            title="Pengaturan Profil"
          >
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User className="w-7 h-7 sm:w-8 sm:h-8 text-blue-100 group-hover:text-white transition-colors" />
            )}
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Halo, {user?.name || 'Pelajar'}! 👋</h1>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              {user?.institution && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/20 backdrop-blur-md border border-white/30 rounded-lg text-xs font-semibold text-white shadow-sm">
                  <GraduationCap className="w-3.5 h-3.5" />
                  {user.institution}
                </span>
              )}
              <p className="text-blue-100 text-xs sm:text-sm">Siap untuk mencapai target belajar hari ini?</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 relative z-10 flex-wrap">
          {/* Quick Notes Link */}
          <Link
            to="/notes"
            className="inline-flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition backdrop-blur-sm"
            title="Lihat Semua Catatan"
          >
            <StickyNote className="w-4 h-4 text-amber-300" />
            <span>Catatan Cepat</span>
          </Link>
          <button
            onClick={() => setIsBgModalOpen(true)}
            className="inline-flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition backdrop-blur-sm cursor-pointer"
            title="Atur Tema"
          >
            <Palette className="w-4 h-4" />
            <span className="hidden sm:inline">Tema</span>
          </button>
          <Link
            to="/todos"
            className="inline-flex items-center gap-1.5 bg-white text-blue-600 hover:bg-blue-50 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition shadow-xs"
          >
            <Plus className="w-4 h-4" /> Tambah Tugas
          </Link>
        </div>
      </div>

      {/* ERROR BANNER */}
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

      {/* 1. BARIS 1: 4 KARTU METRIK DI PALING ATAS (grid-cols-2 md:grid-cols-4) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {isLoading ? (
          [...Array(4)].map((_, i) => (
            <GlassSkeleton key={i} className="h-24 rounded-2xl" />
          ))
        ) : (
          <>
            <StatCard
              title="Streak Belajar"
              value={summary?.analytics?.streak || 0}
              icon={Flame}
              type="streak"
              subtitle="Hari berturut-turut"
            />
            <StatCard
              title="Waktu Belajar"
              value={formatDuration(summary?.analytics?.today_seconds)}
              icon={Clock}
              type="time"
              subtitle="Hari ini"
            />
            <StatCard
              title="Tugas Selesai"
              value={summary?.analytics?.tasks_completed || 0}
              icon={ListTodo}
              type="tasks"
              subtitle="Total tercapai"
            />
            <StatCard
              title="Mata Pelajaran"
              value={summary?.subjects_count || 0}
              icon={BookOpen}
              type="default"
              subtitle="Mata kuliah aktif"
            />
          </>
        )}
      </div>

      {/* GAMIFIKASI & TARGET VISUAL TACTICAL (Compact Row) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5">
          <TacticalCommandCenter 
            userExp={summary?.user?.exp || 0}
            userRank={summary?.user?.tactical_rank || 'Prajurit'}
            subjects={summary?.subjects || []}
          />
        </div>
        <div className="lg:col-span-7">
          <div className="h-full min-h-[220px] w-full rounded-2xl overflow-hidden border border-gray-200/80 shadow-xs relative group bg-gray-100 flex items-center justify-center">
            {targetVisual ? (
              <>
                <img 
                  src={targetVisual} 
                  alt="Target Visual" 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {/* Minimalist Action Overlay — no blocking text */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/50 to-transparent" />
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    <label 
                      className="p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md border border-white/30 text-white rounded-xl cursor-pointer transition shadow-xs" 
                      title="Ganti Gambar"
                    >
                      <Upload className="w-4 h-4" />
                      <input type="file" accept="image/*" onChange={handleTargetVisualChange} className="hidden" />
                    </label>
                    <button 
                      onClick={clearTargetVisual} 
                      className="p-2 bg-red-600/70 hover:bg-red-600 backdrop-blur-md border border-white/20 text-white rounded-xl transition shadow-xs" 
                      title="Hapus Gambar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center p-6">
                <div className="w-12 h-12 bg-white rounded-full shadow-xs flex items-center justify-center mx-auto mb-3 text-gray-400">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-gray-800 mb-1">Target Visual Belum Ditentukan</h3>
                <p className="text-xs text-gray-500 mb-3 max-w-xs mx-auto">
                  Pilih gambar inspirasi sebagai motivasi belajarmu hari ini.
                </p>
                <label className="inline-flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-blue-700 transition shadow-xs cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  Pilih Gambar
                  <input type="file" accept="image/*" onChange={handleTargetVisualChange} className="hidden" />
                </label>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. BARIS 2: MAIN CONTENT (grid-cols-1 lg:grid-cols-3 pembagian 70/30) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* KOLOM KIRI (70%): Tabbed Container (Grafik / Vision Board) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Tab Navigation (Glassmorphism Pill) */}
          <div className="inline-flex items-center p-1 bg-white/40 backdrop-blur-md border border-white/40 rounded-xl shadow-xs">
            <button
              onClick={() => setActiveTab('chart')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                activeTab === 'chart'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Grafik Belajar
            </button>
            <button
              onClick={() => setActiveTab('vision')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                activeTab === 'vision'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Vision Board
            </button>
          </div>

          {/* Tab Content */}
          <div className={`${cardClass} rounded-2xl border p-5 sm:p-6 min-h-[350px] flex flex-col`}>
            {activeTab === 'chart' ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-base font-bold text-gray-900">Grafik Waktu Belajar (7 Hari Terakhir)</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Analitik konsistensi waktu belajar harian</p>
                  </div>
                </div>

                <div className="flex-1 w-full min-h-[256px]">
                  {isLoading ? (
                    <div className="w-full h-full flex items-end gap-3 pt-6 pb-2 px-4 animate-pulse">
                      {[35, 60, 45, 80, 55, 90, 40].map((h, i) => (
                        <div key={i} className="flex-1 bg-gray-100 rounded-t-lg" style={{ height: `${h}%` }} />
                      ))}
                    </div>
                  ) : !hasStudyData ? (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                      <Timer className="w-10 h-10 mb-2 opacity-30" />
                      <p className="text-sm">Belum ada aktivitas belajar yang tercatat.</p>
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
              </>
            ) : (
              <div className="flex-1 flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-base font-bold text-gray-900">Vision Board</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Koleksi inspirasi dan target belajarmu</p>
                  </div>
                </div>
                <div className="flex-1 overflow-hidden rounded-xl">
                  <VisionBoard />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* KOLOM KANAN (30%): Tugas Hari Ini (Full Height) */}
        <div className="lg:col-span-1 flex flex-col">
          <div className={`${cardClass} rounded-2xl border p-5 flex-1 flex flex-col justify-between h-full`}>
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                    <ListTodo className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900">Tugas Hari Ini</h3>
                </div>
                <Link
                  to="/todos"
                  className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-0.5"
                >
                  Semua ({tasks.length}) <ArrowRight className="w-3 h-3" />
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
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1.5 opacity-60" />
                  <p className="text-xs font-semibold text-gray-600">Semua tugas beres!</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Waktunya istirahat atau santai.</p>
                </div>
              ) : (
                <div className="space-y-2 overflow-y-auto pr-1 max-h-[300px] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full">
                  {tasks.slice(0, 6).map((t) => (
                    <div
                      key={t.id}
                      className="p-2.5 rounded-xl border border-gray-100 bg-gray-50/60 flex items-center justify-between gap-2.5 hover:bg-gray-100/60 transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <button
                          onClick={() => handleToggleTask(t.id)}
                          className="text-gray-400 hover:text-blue-600 transition-colors cursor-pointer"
                        >
                          <Circle className="w-4 h-4" />
                        </button>
                        <span className="text-xs text-gray-700 truncate font-medium">{t.title}</span>
                      </div>
                      {t.subject && (
                        <span
                          className="text-[9px] font-bold px-1.5 py-0.5 rounded-md flex-shrink-0"
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

            <Link
              to="/todos"
              className="mt-4 w-full py-2 bg-gray-100/80 hover:bg-gray-200/80 text-gray-700 rounded-xl text-center text-xs font-semibold transition block"
            >
              Kelola Tugas Belajar
            </Link>
          </div>
        </div>
      </div>

      {/* THEME MODAL */}
      <BackgroundSettingsModal isOpen={isBgModalOpen} onClose={() => setIsBgModalOpen(false)} />
      <ProfileSettingsModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
    </div>
  );
}
