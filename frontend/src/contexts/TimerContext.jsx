import { createContext, useContext, useState, useEffect, useRef } from 'react';
import client from '../api/client';

const TimerContext = createContext();

export function TimerProvider({ children }) {
  const [initialDuration, setInitialDuration] = useState(1500);
  const [timeLeft, setTimeLeft] = useState(1500); // 25 menit
  const [isActive, setIsActive] = useState(false);
  const [isWidgetOpen, setIsWidgetOpen] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [distractionAlert, setDistractionAlert] = useState(null);
  
  const intervalRef = useRef(null);
  const distractionTimeoutRef = useRef(null);

  // Minta izin notifikasi saat pertama kali mount
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Anti-Cheat / Focus Tracker: Page Visibility API (Toleransi 5 Menit / 300000ms)
  useEffect(() => {
    if (!isActive) {
      if (distractionTimeoutRef.current) {
        clearTimeout(distractionTimeoutRef.current);
        distractionTimeoutRef.current = null;
      }
      return;
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // User meninggalkan halaman: pasang batas toleransi 5 menit
        distractionTimeoutRef.current = setTimeout(() => {
          setIsActive(false);

          // Web Notification
          if (Notification.permission === 'granted') {
            new Notification('Peringatan dari Markas!', {
              body: 'Jenderal, Anda terdeteksi meninggalkan medan tempur. Timer dihentikan sementara!',
            });
          }

          // Audio peringatan
          try {
            const warningAudio = new Audio('https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg');
            warningAudio.play();
          } catch (e) {
            // Abaikan kesalahan audio
          }

          // Siapkan pesan notifikasi saat user kembali
          const alertMsg = 'Jenderal, Anda terdeteksi meninggalkan medan tempur lebih dari 5 menit. Timer dihentikan sementara!';
          setDistractionAlert(alertMsg);
          window.dispatchEvent(new CustomEvent('distraction-pause', { detail: alertMsg }));
        }, 300000);
      } else {
        // User kembali sebelum batas 5 menit: batalkan timeout
        if (distractionTimeoutRef.current) {
          clearTimeout(distractionTimeoutRef.current);
          distractionTimeoutRef.current = null;
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (distractionTimeoutRef.current) {
        clearTimeout(distractionTimeoutRef.current);
        distractionTimeoutRef.current = null;
      }
    };
  }, [isActive]);

  const handleSessionComplete = async () => {
    try {
      const res = await client.post('/study-sessions/pomodoro-complete', {
        duration_seconds: initialDuration,
      });
      window.dispatchEvent(new CustomEvent('pomodoro-complete', { detail: res.data.message }));
    } catch (error) {
      console.error('Gagal menyimpan sesi pomodoro', error);
    }
  };

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setIsActive(false);
            
            // Notifikasi waktu habis
            if (Notification.permission === 'granted') {
              new Notification('Waktu Fokus Selesai!', { body: 'Waktunya istirahat sejenak.' });
            }
            
            // Audio singkat
            try {
              const audio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
              audio.play();
            } catch (e) {
              // Ignore audio error
            }
            
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    
    return () => clearInterval(intervalRef.current);
  }, [isActive]);

  // Update Document Title
  useEffect(() => {
    if (isActive) {
      const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
      const s = (timeLeft % 60).toString().padStart(2, '0');
      document.title = `(${m}:${s}) BelajarKuy - Fokus!`;
    } else {
      document.title = 'BelajarKuy';
    }
  }, [isActive, timeLeft]);

  const startTimer = async () => {
    if (!isActive) {
      try {
        await client.post('/study-sessions/pomodoro-start');
      } catch (e) {
        console.error('Gagal memulai sesi di server', e);
      }
    }
    setDistractionAlert(null);
    setIsActive(true);
    setHasStarted(true);
  };
  
  const pauseTimer = () => setIsActive(false);
  
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(1500);
    setInitialDuration(1500);
    setDistractionAlert(null);
    if (distractionTimeoutRef.current) {
      clearTimeout(distractionTimeoutRef.current);
      distractionTimeoutRef.current = null;
    }
  };
  
  const adjustTime = (minutes) => {
    setTimeLeft((prev) => {
      const newTime = Math.max(0, prev + minutes * 60);
      setInitialDuration(newTime);
      return newTime;
    });
  };
  
  const toggleWidget = () => setIsWidgetOpen(!isWidgetOpen);
  const clearDistractionAlert = () => setDistractionAlert(null);

  return (
    <TimerContext.Provider value={{
      timeLeft,
      isActive,
      isWidgetOpen,
      hasStarted,
      distractionAlert,
      clearDistractionAlert,
      startTimer,
      pauseTimer,
      resetTimer,
      adjustTime,
      toggleWidget
    }}>
      {children}
    </TimerContext.Provider>
  );
}

export const useTimer = () => useContext(TimerContext);
