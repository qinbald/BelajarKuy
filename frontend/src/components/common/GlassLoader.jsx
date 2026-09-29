export default function GlassLoader({ small = false, text = 'Memuat data...' }) {
  const dotSize = small ? 'w-1.5 h-1.5' : 'w-2.5 h-2.5';
  const dotsGap = small ? 'gap-1' : 'gap-1.5';
  const containerGap = small ? 'gap-2' : 'gap-3';
  const padding = small ? 'px-3 py-1.5' : 'px-5 py-2.5';
  const textSize = small ? 'text-[11px]' : 'text-sm';
  const dot = `${dotSize} rounded-full bg-slate-800/70 shadow-sm animate-bounce`;

  return (
    <div className="relative inline-flex items-center justify-center p-[1.5px] rounded-full overflow-hidden shadow-lg">
      {/* Cahaya melingkar (spinning light) */}
      <div className="absolute inset-[-200%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0_280deg,rgba(255,255,255,0.9)_360deg)]" />

      {/* Background glass */}
      <div className={`relative flex items-center justify-center ${containerGap} ${padding} bg-white/30 backdrop-blur-md rounded-full`}>
        {/* Bouncing Dots */}
        <div className={`flex items-center ${dotsGap}`}>
          <div className={dot} />
          <div className={`${dot} [animation-delay:150ms]`} />
          <div className={`${dot} [animation-delay:300ms]`} />
        </div>
        
        {/* Text Microcopy */}
        {text && (
          <span className={`${textSize} font-medium text-slate-700 tracking-wide`}>
            {text}
          </span>
        )}
      </div>
    </div>
  );
}
