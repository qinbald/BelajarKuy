import { cn } from '../../utils/cn';
import { useTimer } from '../../contexts/TimerContext';

const typeConfig = {
  streak: {
    active: 'text-orange-500',
    inactive: 'text-slate-400',
    glow: 'shadow-[0_0_12px_rgba(249,115,22,0.25)]',
  },
  tasks: {
    active: 'text-emerald-500',
    inactive: 'text-slate-400',
    glow: '',
  },
  time: {
    active: 'text-blue-500',
    inactive: 'text-slate-400',
    glow: '',
  },
  default: {
    active: 'text-blue-500',
    inactive: 'text-slate-400',
    glow: '',
  },
};

export default function StatCard({ title, value, icon: Icon, type = 'default', subtitle }) {
  const { isActive } = useTimer();
  const config = typeConfig[type] || typeConfig.default;

  // Determine icon color based on type and data
  let iconColor = config.inactive;
  let iconGlow = '';
  let iconPulse = false;

  if (type === 'streak') {
    if (value > 0) {
      iconColor = config.active;
      iconGlow = config.glow;
    }
  } else if (type === 'tasks') {
    if (value > 0) {
      iconColor = config.active;
    }
  } else if (type === 'time') {
    if (isActive) {
      iconColor = config.active;
      iconPulse = true;
    }
  }

  const isStreakActive = type === 'streak';

  return (
    <div className="relative group rounded-2xl h-full flex flex-col overflow-hidden p-[1.5px]">
      {/* Animated Edge Glow Layer */}
      {isStreakActive && (
        <div 
          className="absolute -inset-[100%] animate-sweep-interval pointer-events-none z-0" 
          style={{ backgroundImage: 'conic-gradient(from 0deg, transparent 0 300deg, rgba(249,115,22,1) 360deg)' }}
        />
      )}
      
      {/* Actual Card Background */}
      <div
        className={cn(
          'relative w-full h-full flex flex-col justify-between p-4 backdrop-blur-2xl rounded-[calc(1rem-1.5px)] transition-all z-10',
          !isStreakActive ? 'bg-white/80 dark:bg-slate-800/90 border border-white/40 dark:border-slate-700/60 shadow-sm group-hover:shadow-md' : 'bg-white dark:bg-slate-800 shadow-[0_0_15px_rgba(249,115,22,0.15)] dark:shadow-[0_0_15px_rgba(249,115,22,0.1)] border-transparent'
        )}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-700 dark:text-slate-300 font-bold drop-shadow-sm">{title}</span>
        <div
          className={cn(
            'p-2 rounded-xl transition-colors duration-200 shadow-xs',
            type === 'streak' && value > 0
              ? 'bg-orange-100/80 dark:bg-orange-900/30'
              : type === 'tasks' && value > 0
                ? 'bg-emerald-100/80 dark:bg-emerald-900/30'
                : type === 'time' && isActive
                  ? 'bg-blue-100/80 dark:bg-blue-900/30'
                  : 'bg-white/80 dark:bg-slate-700/80'
          )}
        >
          <Icon
            className={cn(
              'w-4 h-4 transition-colors duration-200',
              iconColor,
              iconPulse && 'animate-pulse'
            )}
          />
        </div>
      </div>
      <div className="mt-2 z-10">
        <h3 className="text-2xl font-black text-slate-900 dark:text-white drop-shadow-sm">{value}</h3>
        {subtitle && <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium mt-0.5 drop-shadow-sm">{subtitle}</p>}
      </div>
    </div>
  </div>
  );
}
