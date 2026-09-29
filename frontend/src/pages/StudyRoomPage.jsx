import { useState, useEffect, useRef, memo } from 'react';
import { Play, Pause, RotateCcw, Save } from 'lucide-react';
import client from '../api/client';
import PageHeader from '../components/common/PageHeader';

// Memo cegah re-render saat timer tick
const NoteEditor = memo(({ onSave, saveStatus }) => {
  const contentRef = useRef('');
  
  return (
    <div className="h-full flex flex-col bg-white/50 backdrop-blur-xl rounded-2xl border border-white/20 p-6 shadow-sm relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-800">Catatan Sesi</h2>
        {saveStatus && (
          <span className="text-xs font-medium text-blue-600 flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-md">
            <Save className="w-3 h-3" /> {saveStatus}
          </span>
        )}
      </div>
      <textarea
        className="flex-1 w-full resize-none outline-none bg-transparent text-gray-700 leading-relaxed"
        placeholder="Ketik materi atau ringkasan di sini... (Otomatis tersimpan saat kursor keluar)"
        onChange={(e) => (contentRef.current = e.target.value)}
        onBlur={() => onSave(contentRef.current)}
      />
    </div>
  );
});

export default function StudyRoomPage() {
  const [timeLeft, setTimeLeft] = useState(1500); // 25 menit
  const [isRunning, setIsRunning] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  
  const intervalRef = useRef(null);

  // Timer Logic
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    
    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  const toggleTimer = () => setIsRunning(!isRunning);
  
  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(1500);
  };

  // Auto-save Logic
  const handleSaveNote = async (content) => {
    if (!content.trim()) return;
    
    setSaveStatus('Menyimpan...');
    try {
      // Endpoint dummy/placeholder sesuai instruksi
      await client.post('/notes/study-session', { content });
      setSaveStatus('Tersimpan');
      setTimeout(() => setSaveStatus(''), 2000);
    } catch (error) {
      setSaveStatus('Gagal menyimpan');
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
      <PageHeader 
        title="Ruang Belajar" 
        subtitle="Fokus dengan Pomodoro dan catat materi secara langsung"
      />

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        {/* Kiri: 30% (4/12) - Timer */}
        <div className="lg:col-span-4 flex flex-col gap-6 h-full">
          <div className="bg-white/50 backdrop-blur-xl rounded-2xl border border-white/20 p-8 shadow-sm text-center flex flex-col items-center justify-center">
            <h2 className="text-lg font-bold mb-4 text-gray-800">Pomodoro Timer</h2>
            
            <div className="text-7xl font-mono font-bold text-blue-600 tracking-tighter mb-8">
              {formatTime(timeLeft)}
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={toggleTimer}
                className={`p-4 rounded-full text-white transition shadow-md ${isRunning ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                {isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
              </button>
              <button 
                onClick={resetTimer}
                className="p-4 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
              >
                <RotateCcw className="w-6 h-6" />
              </button>
            </div>
          </div>
          
          <div className="flex-1 bg-white/50 backdrop-blur-xl rounded-2xl border border-white/20 p-6 shadow-sm overflow-y-auto">
            <h2 className="text-lg font-bold mb-4 text-gray-800">Tugas Hari Ini</h2>
            <p className="text-sm text-gray-500 italic">Integrasi list tugas menyusul...</p>
          </div>
        </div>

        {/* Kanan: 70% (8/12) - Editor */}
        <div className="lg:col-span-8 h-full">
          <NoteEditor onSave={handleSaveNote} saveStatus={saveStatus} />
        </div>
      </div>
    </div>
  );
}
