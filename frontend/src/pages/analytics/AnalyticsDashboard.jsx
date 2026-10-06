import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Target, TrendingUp, Clock, Shield, AlertTriangle } from 'lucide-react';
import { useDashboardSummary } from '../../hooks/useDashboardSummary';
import GlassLoader from '../../components/common/GlassLoader';

export default function AnalyticsDashboard() {
  const { data: summary, isLoading, error } = useDashboardSummary();

  const weeklyData = useMemo(() => {
    if (!summary?.analytics?.study_chart) return [];
    return summary.analytics.study_chart.map(item => {
      const date = new Date(item.date);
      const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
      return {
        day: dayNames[date.getDay()],
        hours: Number((item.minutes / 60).toFixed(1)),
      };
    });
  }, [summary]);

  const gradeWeights = useMemo(() => {
    if (!summary?.subjects) return [];
    return summary.subjects.map(sub => ({
      course: sub.name,
      currentGrade: sub.conquest_progress || 0,
      target: 100,
      weight: 'Target Penguasaan',
      status: (sub.conquest_progress || 0) >= 70 ? 'Aman' : 'Kritis'
    }));
  }, [summary]);

  const formatDuration = (seconds) => {
    if (!seconds) return '0 Jam';
    const h = (seconds / 3600).toFixed(1);
    return `${h} Jam`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#11131f] text-gray-100 flex items-center justify-center">
        <GlassLoader message="Memuat Analitik..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#11131f] text-gray-100 p-10">
        <p className="text-red-400">Gagal memuat data analitik: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#11131f] text-gray-100 p-6 md:p-10 font-sans">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
          Command Center: Analitik Performa
        </h1>
        <p className="text-gray-400 mt-2">Pantau metrik belajar, status rank, dan zona aman akademismu.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          icon={<Shield className="w-6 h-6 text-blue-400" />} 
          title="Tactical Rank" 
          value={summary?.user?.tactical_rank || 'Prajurit'} 
          subtitle={`${summary?.user?.exp || 0} EXP Terkumpul`} 
        />
        <StatCard 
          icon={<Clock className="w-6 h-6 text-green-400" />} 
          title="Waktu Belajar (Hari ini)" 
          value={formatDuration(summary?.analytics?.today_seconds)} 
          subtitle="Pantau terus progresmu!" 
        />
        <StatCard 
          icon={<TrendingUp className="w-6 h-6 text-orange-400" />} 
          title="Current Streak" 
          value={`${summary?.analytics?.streak || 0} Hari`} 
          subtitle="Konsistensi sempurna!" 
        />
        <StatCard 
          icon={<Target className="w-6 h-6 text-purple-400" />} 
          title="Tugas Selesai" 
          value={`${summary?.analytics?.tasks_completed || 0} Tugas`} 
          subtitle="Tugas berhasil ditaklukkan" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-gray-900/40 border border-gray-800 rounded-2xl p-6 backdrop-blur-md">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-200">Intensitas Belajar Mingguan (Jam)</h2>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer height="100%" width="100%">
              <AreaChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#374151" strokeDasharray="3 3" vertical={false} />
                <XAxis axisLine={false} dataKey="day" fontSize={12} stroke="#9ca3af" tickLine={false} />
                <YAxis axisLine={false} fontSize={12} stroke="#9ca3af" tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '8px', color: '#f3f4f6' }} formatter={(val) => [`${val} Jam`, 'Durasi']} />
                <Area dataKey="hours" fill="url(#colorHours)" fillOpacity={1} stroke="#3b82f6" strokeWidth={3} type="monotone" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-6 backdrop-blur-md flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <AlertTriangle className="text-yellow-500 w-5 h-5"/>
            <h2 className="text-xl font-semibold text-gray-200">Radar Zona Aman (Penguasaan)</h2>
          </div>
          <div className="space-y-5 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {gradeWeights.length === 0 ? (
              <p className="text-gray-500 text-sm italic text-center mt-10">Belum ada mata pelajaran</p>
            ) : gradeWeights.map((item, idx) => (
              <div key={idx} className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/50">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium text-gray-200">{item.course}</h3>
                    <span className="text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">{item.weight}</span>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-md ${item.status === 'Aman' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                    {item.status}
                  </span>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Skor Penguasaan: {item.currentGrade}%</span>
                    <span>Target: {item.target}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className={`h-2 rounded-full transition-all duration-1000 ${item.currentGrade >= item.target ? 'bg-green-500' : item.currentGrade >= 70 ? 'bg-blue-500' : 'bg-yellow-500'}`} style={{ width: `${Math.min((item.currentGrade / 100) * 100, 100)}%` }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, subtitle }) {
  return (
    <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-5 backdrop-blur-md flex items-start gap-4 transition-transform hover:-translate-y-1 duration-300">
      <div className="bg-gray-800/80 p-3 rounded-xl border border-gray-700 shadow-inner">{icon}</div>
      <div>
        <h3 className="text-gray-400 text-sm font-medium">{title}</h3>
        <p className="text-2xl font-bold text-gray-100 mt-1">{value}</p>
        <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
      </div>
    </div>
  );
}
