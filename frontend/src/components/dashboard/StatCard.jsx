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

  return (
    <div
      className={cn(
        'bg-white/70 backdrop-blur-2xl border border-white/40 shadow-sm',
        'p-4 rounded-2xl flex flex-col justify-between hover:shadow-md transition-shadow',
        iconGlow && value > 0 && type === 'streak' ? iconGlow : ''
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-700 font-bold drop-shadow-sm">{title}</span>
        <div
          className={cn(
            'p-2 rounded-xl transition-colors duration-200 shadow-xs',
            type === 'streak' && value > 0
              ? 'bg-orange-100/80'
              : type === 'tasks' && value > 0
                ? 'bg-emerald-100/80'
                : type === 'time' && isActive
                  ? 'bg-blue-100/80'
                  : 'bg-white/80'
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
      <div className="mt-2">
        <h3 className="text-2xl font-black text-slate-900 drop-shadow-sm">{value}</h3>
        {subtitle && <p className="text-[11px] text-slate-600 font-medium mt-0.5 drop-shadow-sm">{subtitle}</p>}
      </div>
    </div>
  );
}
