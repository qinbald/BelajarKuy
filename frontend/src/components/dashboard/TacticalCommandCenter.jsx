import { Shield, Crosshair, Award, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGamificationTheme, GAMIFICATION_THEMES } from '../../contexts/GamificationThemeContext';

export default function TacticalCommandCenter({ userExp = 1250, userRank = 'Sersan', subjects = [] }) {
  const { theme, themeKey, setThemeKey } = useGamificationTheme();
  const navigate = useNavigate();

  const activeSubjects = subjects.length ? subjects : [
    { id: 1, name: 'Algoritma', conquest_progress: 85 },
    { id: 2, name: 'Basis Data', conquest_progress: 40 },
    { id: 3, name: 'UI/UX', conquest_progress: 15 },
  ];

  const rankReqs = [0, 500, 1500, 3000, 6000, 12000, 25000];
  const baseRanks = GAMIFICATION_THEMES.tactical.ranks;
  const currentRankIdx = baseRanks.indexOf(userRank) !== -1 ? baseRanks.indexOf(userRank) : 0;
  const displayRank = theme.ranks[currentRankIdx];
  const nextDisplayRank = theme.ranks[currentRankIdx + 1] || displayRank;
  const prevReq = rankReqs[currentRankIdx];
  const nextReq = rankReqs[currentRankIdx + 1] || prevReq;
  const progressPercent = nextReq === prevReq 
    ? 100 
    : Math.min(100, Math.max(0, ((userExp - prevReq) / (nextReq - prevReq)) * 100));

  return (
    <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 shadow-2xl rounded-2xl p-4 text-slate-100 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl -mr-12 -mt-12 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl -ml-8 -mb-8 pointer-events-none" />

      {/* Theme Switcher */}
      <div className="absolute top-3 right-3 z-20">
        <select 
          value={themeKey} 
          onChange={(e) => setThemeKey(e.target.value)}
          className="bg-slate-800 border border-slate-700 text-[10px] rounded-lg px-1.5 py-0.5 text-slate-300 focus:outline-none"
        >
          <option value="tactical">Tactical</option>
          <option value="academic">Academic</option>
          <option value="rpg">RPG</option>
        </select>
      </div>

      <div className="relative z-10 space-y-3">
        {/* Header + Rank */}
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-blue-400" />
          <h2 className="text-sm font-bold tracking-widest uppercase text-slate-200">{theme.title}</h2>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
          <div className="flex justify-between items-end mb-1.5">
            <div>
              <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Rank</p>
              <h3 className="text-lg font-black text-white flex items-center gap-1.5">
                <Award className="w-4 h-4 text-yellow-500" />
                {displayRank}
              </h3>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">EXP</p>
              <p className="text-sm font-bold text-blue-400">{userExp} <span className="text-xs text-slate-500">/ {nextReq}</span></p>
            </div>
          </div>
          <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-700">
            <div 
              className="h-full bg-blue-500 transition-all duration-1000 relative"
              style={{ width: `${progressPercent}%` }}
            >
              <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_6px,rgba(255,255,255,0.1)_6px,rgba(255,255,255,0.1)_12px)]" />
            </div>
          </div>
          <p className="text-[10px] text-slate-500 mt-1 text-right font-mono">
            {nextDisplayRank !== displayRank ? `${Math.ceil(nextReq - userExp)} EXP → ${nextDisplayRank}` : 'MAX RANK'}
          </p>
        </div>

        {/* Conquest Progress */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Crosshair className="w-3.5 h-3.5 text-red-400" />
            <h3 className="text-xs font-bold tracking-widest uppercase text-slate-300">{theme.conquest}</h3>
          </div>
          <div className="space-y-2">
            {activeSubjects.slice(0, 3).map(sub => (
              <div key={sub.id}>
                <div className="flex justify-between text-[10px] font-mono mb-0.5">
                  <span className="text-slate-300">{sub.name}</span>
                  <span className={sub.conquest_progress >= 100 ? 'text-emerald-400' : 'text-red-400'}>
                    {sub.conquest_progress}%
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-sm overflow-hidden border border-slate-700/50">
                  <div 
                    className={`h-full transition-all duration-1000 ${sub.conquest_progress >= 100 ? 'bg-emerald-500' : 'bg-red-500'}`}
                    style={{ width: `${sub.conquest_progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          
          <button 
            onClick={() => navigate('/subjects')}
            className="mt-3 w-full py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-[10px] font-mono uppercase tracking-widest text-slate-300 hover:text-white transition flex items-center justify-center gap-1.5"
          >
            {theme.button} <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
