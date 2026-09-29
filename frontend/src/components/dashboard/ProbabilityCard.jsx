import React from 'react';

export default function ProbabilityCard({ probability = 0, subjectName = "Mata Pelajaran" }) {
  // Tentukan warna dan teks berdasarkan probabilitas
  let colorClass = "text-red-500";
  let strokeClass = "stroke-red-500";
  let bgClass = "bg-red-500/10";
  let insight = "Zona Bahaya - Tingkatkan belajar!";

  if (probability > 75) {
    colorClass = "text-emerald-500";
    strokeClass = "stroke-emerald-500";
    bgClass = "bg-emerald-500/10";
    insight = "Aman - Anda di jalur yang tepat menuju kelulusan!";
  } else if (probability >= 50) {
    colorClass = "text-yellow-500";
    strokeClass = "stroke-yellow-500";
    bgClass = "bg-yellow-500/10";
    insight = "Cukup - Perlu lebih banyak latihan.";
  }

  // Kalkulasi SVG Circle (Speedometer)
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (probability / 100) * circumference;

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 flex items-center gap-5">
      {/* Circular Progress */}
      <div className="relative w-24 h-24 flex-shrink-0">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          {/* Background Circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            className="stroke-slate-700"
            strokeWidth="8"
            fill="transparent"
          />
          {/* Progress Circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            className={`${strokeClass} transition-all duration-1000 ease-out`}
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <span className={`text-xl font-black ${colorClass}`}>{probability}%</span>
        </div>
      </div>

      {/* Teks Insight */}
      <div>
        <h4 className="text-sm font-bold text-slate-300 mb-1">{subjectName}</h4>
        <p className="text-xs text-slate-400 mb-2">Probabilitas Kelulusan</p>
        <div className={`inline-block px-3 py-1.5 rounded-lg text-xs font-medium ${bgClass} ${colorClass}`}>
          {insight}
        </div>
      </div>
    </div>
  );
}
