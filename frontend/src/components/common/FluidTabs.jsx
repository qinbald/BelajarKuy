import { useState, useRef, useEffect } from 'react';

export default function FluidTabs({ 
  tabs = [], 
  activeTab = 0, 
  onChange,
  renderBadge,
  className = ''
}) {
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, top: 0, width: 0, height: 0, opacity: 0 });
  const tabRefs = useRef([]);

  const updateIndicator = (index) => {
    const el = tabRefs.current[index];
    if (el) {
      setIndicatorStyle({
        left: el.offsetLeft,
        top: el.offsetTop,
        width: el.offsetWidth,
        height: el.offsetHeight,
        opacity: 1,
      });
    }
  };

  useEffect(() => {
    updateIndicator(activeTab);

    const handleResize = () => updateIndicator(activeTab);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeTab, tabs]);

  return (
    <div className={`relative flex items-center gap-1.5 overflow-x-auto p-2 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-white/50 dark:border-white/10 rounded-xl shadow-sm ${className}`}>
      {/* Sliding Pill Indicator */}
      <div
        className="absolute top-0 left-0 bg-blue-600 rounded-lg transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] z-0 pointer-events-none shadow-sm"
        style={{
          transform: `translate3d(${indicatorStyle.left}px, ${indicatorStyle.top}px, 0)`,
          width: `${indicatorStyle.width}px`,
          height: `${indicatorStyle.height}px`,
          opacity: indicatorStyle.opacity,
        }}
      />

      {/* Tabs */}
      {tabs.map((tab, idx) => {
        const isActive = activeTab === idx;
        const label = typeof tab === 'string' ? tab : tab.label;
        const Icon = typeof tab === 'object' && tab.icon ? tab.icon : null;

        return (
          <button
            key={label || idx}
            ref={(el) => (tabRefs.current[idx] = el)}
            onClick={() => onChange && onChange(idx)}
            className={`relative z-10 px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors duration-300 flex items-center gap-2 ${
              isActive
                ? 'text-white'
                : 'text-slate-800 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white'
            }`}
          >
            {Icon && <Icon className="w-4 h-4 shrink-0" />}
            <span>{label}</span>
            {renderBadge && renderBadge(tab, idx, isActive)}
          </button>
        );
      })}
    </div>
  );
}
