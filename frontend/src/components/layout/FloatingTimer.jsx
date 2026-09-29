import { useEffect, useState } from 'react';
import { useTimer } from '../../contexts/TimerContext';
import { Play, Pause, RotateCcw, X, Clock, Plus, Minus } from 'lucide-react';

export default function FloatingTimer() {
  const { 
    timeLeft, 
    isActive, 
    isWidgetOpen, 
    hasStarted,
    startTimer, 
    pauseTimer, 
    resetTimer, 
    adjustTime,
    toggleWidget 
  } = useTimer();

  const [toast, setToast] = useState('');

  useEffect(() => {
    const handler = (e) => {
      setToast(e.detail);
      setTimeout(() => setToast(''), 3000);
    };
    window.addEventListener('pomodoro-complete', handler);
    return () => window.removeEventListener('pomodoro-complete', handler);
  }, []);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!isWidgetOpen) {
    return (
      <div className="flex items-center gap-2">
        {!hasStarted && (
          <div className="hidden sm:block bg-blue-50 border border-blue-100 rounded-full px-3 py-1 text-xs font-bold text-blue-700 animate-bounce">
            Fokus 25 Menit = +15 EXP
          </div>
        )}
        <button
          onClick={toggleWidget}
          className="w-10 h-10 bg-blue-600 text-white rounded-full shadow-md hover:bg-blue-700 transition-all hover:scale-105 flex items-center justify-center relative ring-2 ring-blue-200"
        >
          <Clock className="w-5 h-5" />
          {isActive && (
            <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
          )}
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="relative flex items-center gap-2">
        <button
          onClick={toggleWidget}
          className="w-10 h-10 bg-blue-600 text-white rounded-full shadow-md hover:bg-blue-700 transition-all flex items-center justify-center relative ring-2 ring-blue-200"
        >
          <Clock className="w-5 h-5" />
          {isActive && (
            <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
          )}
        </button>
      </div>
      <div className="absolute right-4 top-16 mt-1 w-72 bg-white border border-gray-200 shadow-2xl rounded-2xl p-5 select-none z-50">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" /> Pomodoro
          </h3>
          <button onClick={toggleWidget} className="text-gray-400 hover:text-gray-600 transition">
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="text-4xl font-mono font-bold text-center text-blue-600 tracking-tighter mb-3">
          {formatTime(timeLeft)}
        </div>

        <div className="flex justify-center gap-2 mb-5">
          <button onClick={() => adjustTime(-5)} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-bold flex items-center gap-1">
            <Minus className="w-3 h-3" /> 5m
          </button>
          <button onClick={() => adjustTime(5)} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-bold flex items-center gap-1">
            <Plus className="w-3 h-3" /> 5m
          </button>
        </div>
        
        <div className="flex items-center justify-center gap-3">
          <button 
            onClick={isActive ? pauseTimer : startTimer}
            className={`p-3 rounded-full text-white transition shadow-md ${isActive ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </button>
          <button 
            onClick={resetTimer}
            className="p-3 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-24 right-6 z-50 bg-green-600 text-white px-4 py-3 rounded-xl shadow-xl text-sm font-bold animate-bounce">
          {toast}
        </div>
      )}
    </>
  );
}
