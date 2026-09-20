import { useState, useEffect, useRef } from 'react';
import { useSubjects } from '../../hooks/useSubjects';
import * as timerService from '../../services/timerService';
import {
  Play,
  Pause,
  RotateCcw,
  Square,
  CheckCircle,
  Clock,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react';

const PRESETS = [
  { label: '5 m', value: 5 * 60 },
  { label: '15 m', value: 15 * 60 },
  { label: '25 m (Pomodoro)', value: 25 * 60 },
  { label: '45 m', value: 45 * 60 },
  { label: '60 m', value: 60 * 60 },
];

export default function TimerPage() {
  const { subjects } = useSubjects();

  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [totalSeconds, setTotalSeconds] = useState(25 * 60);
  const [remainingSeconds, setRemainingSeconds] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Stats
  const [summary, setSummary] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null); // 'saving' | 'success' | 'error'
  const [recentSessions, setRecentSessions] = useState([]);

  const startTimeRef = useRef(null);
  const intervalRef = useRef(null);

  // Load summary and recent sessions
  const loadData = async () => {
    try {
      const [sumRes, sessRes] = await Promise.all([
        timerService.getStudySummary(),
        timerService.getStudySessions(1),
      ]);
      setSummary(sumRes.data.data);
      setRecentSessions(sessRes.data.data.data || []);
    } catch {
      // Ignored
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Timer Tick
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            handleFinish(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, totalSeconds, selectedSubjectId]);

  const handleStart = () => {
    if (!isRunning) {
      if (!startTimeRef.current) {
        startTimeRef.current = new Date();
      }
      setIsRunning(true);
      setSaveStatus(null);
    }
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setRemainingSeconds(totalSeconds);
    startTimeRef.current = null;
    setSaveStatus(null);
  };

  const handlePresetSelect = (secs) => {
    if (isRunning) return;
    setTotalSeconds(secs);
    setRemainingSeconds(secs);
    startTimeRef.current = null;
    setSaveStatus(null);
  };

  const handleFinish = async (completed = false) => {
    setIsRunning(false);
    const endTime = new Date();
    const startTime = startTimeRef.current || new Date(endTime.getTime() - (totalSeconds - remainingSeconds) * 1000);

    const actualDuration = Math.max(10, Math.round((endTime.getTime() - startTime.getTime()) / 1000));

    // Reset session tracking
    startTimeRef.current = null;
    setRemainingSeconds(totalSeconds);

    if (actualDuration < 10) {
      setSaveStatus('Durasi belajar terlalu singkat (< 10 detik), tidak disimpan.');
      return;
    }

    setSaveStatus('Menyimpan sesi belajar...');
    try {
      await timerService.createStudySession({
        subject_id: selectedSubjectId ? Number(selectedSubjectId) : null,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        duration_seconds: actualDuration,
        completed: completed,
      });

      setSaveStatus(`Selesai! Berhasil mencatat ${Math.round(actualDuration / 60)} menit belajar.`);
      loadData();
    } catch {
      setSaveStatus('Gagal menyimpan sesi belajar ke server.');
    }
  };

  // Format Helpers
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const formatMinutes = (secs) => {
    if (!secs) return '0 m';
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    if (hrs > 0) return `${hrs}j ${mins}m`;
    return `${mins}m`;
  };

  const progressPercent = Math.max(0, Math.min(100, ((totalSeconds - remainingSeconds) / totalSeconds) * 100));

  return (
    <div className={`space-y-6 transition-all duration-300 ${isFocusMode ? 'max-w-xl mx-auto py-8' : ''}`}>
      {/* Header */}
      {!isFocusMode && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Study Timer (Pomodoro)</h1>
            <p className="text-sm text-gray-500">
              Fokus penuh, catat waktu riil, dan tingkatkan konsistensi belajar
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 text-gray-500 hover:text-gray-700 bg-white border border-gray-200 rounded-lg shadow-sm"
              title="Notifikasi suara"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setIsFocusMode(true)}
              className="inline-flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3.5 py-2 rounded-lg text-sm font-medium transition"
            >
              <Sparkles className="w-4 h-4" /> Mode Fokus
            </button>
          </div>
        </div>
      )}

      {/* Focus Mode Exit button */}
      {isFocusMode && (
        <div className="flex justify-end">
          <button
            onClick={() => setIsFocusMode(false)}
            className="text-xs text-gray-500 hover:text-gray-800 bg-gray-100 px-3 py-1.5 rounded-lg font-medium"
          >
            Keluar Mode Fokus
          </button>
        </div>
      )}

      {/* Main Timer Display */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center flex flex-col items-center">
        {/* Subject Picker */}
        <div className="mb-6 w-full max-w-xs">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Target Mata Pelajaran
          </label>
          <select
            disabled={isRunning}
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition disabled:opacity-75"
          >
            <option value="">-- Belajar Umum / Mandiri --</option>
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>
        </div>

        {/* Big Digit Display */}
        <div className="relative my-4 flex items-center justify-center">
          <div className="text-7xl sm:text-8xl font-black font-mono tracking-tight text-gray-900 select-none">
            {formatTime(remainingSeconds)}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-md bg-gray-100 h-2.5 rounded-full overflow-hidden my-4">
          <div
            className="bg-blue-600 h-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Presets */}
        {!isRunning && (
          <div className="flex flex-wrap justify-center gap-2 mt-3 mb-6">
            {PRESETS.map((p) => (
              <button
                key={p.value}
                onClick={() => handlePresetSelect(p.value)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${
                  totalSeconds === p.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center gap-3 mt-2">
          {!isRunning ? (
            <button
              onClick={handleStart}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl font-bold text-base shadow-md hover:shadow-lg transition transform active:scale-95"
            >
              <Play className="w-5 h-5 fill-current" />
              Mulai Belajar
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-8 py-3.5 rounded-xl font-bold text-base shadow-md hover:shadow-lg transition transform active:scale-95"
            >
              <Pause className="w-5 h-5 fill-current" />
              Jeda
            </button>
          )}

          {isRunning && (
            <button
              onClick={() => handleFinish(false)}
              className="inline-flex items-center gap-1.5 bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-600 px-4 py-3.5 rounded-xl text-sm font-semibold transition"
              title="Akhiri & Simpan Waktu Terpakai"
            >
              <Square className="w-4 h-4 fill-current" />
              Selesai Sekarang
            </button>
          )}

          <button
            onClick={handleReset}
            disabled={isRunning}
            className="p-3.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition disabled:opacity-40"
            title="Reset Timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

        {/* Save Status Banner */}
        {saveStatus && (
          <div className="mt-6 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-lg flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{saveStatus}</span>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      {!isFocusMode && summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-center">
            <p className="text-xs text-gray-500 font-medium">Hari Ini</p>
            <h4 className="text-xl font-bold text-gray-900 mt-1">
              {formatMinutes(summary.today_seconds)}
            </h4>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-center">
            <p className="text-xs text-gray-500 font-medium">Minggu Ini</p>
            <h4 className="text-xl font-bold text-indigo-600 mt-1">
              {formatMinutes(summary.week_seconds)}
            </h4>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-center">
            <p className="text-xs text-gray-500 font-medium">Total Waktu</p>
            <h4 className="text-xl font-bold text-gray-900 mt-1">
              {formatMinutes(summary.total_seconds)}
            </h4>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-center">
            <p className="text-xs text-gray-500 font-medium">Total Sesi</p>
            <h4 className="text-xl font-bold text-gray-900 mt-1">
              {summary.total_sessions}
            </h4>
          </div>
        </div>
      )}

      {/* Recent Sessions Table */}
      {!isFocusMode && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-500" />
            Sesi Belajar Terakhir
          </h3>

          {recentSessions.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">
              Belum ada riwayat sesi belajar. Mulai timer di atas!
            </p>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentSessions.map((sess) => (
                <div key={sess.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: sess.subject?.color || '#9CA3AF' }}
                    />
                    <span className="font-medium text-gray-800">
                      {sess.subject?.name || 'Belajar Mandiri'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-gray-500">
                    <span>{formatMinutes(sess.duration_seconds)}</span>
                    <span className="text-[11px] text-gray-400">
                      {new Date(sess.start_time).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
