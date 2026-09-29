import { createContext, useContext, useState } from 'react';

export const GAMIFICATION_THEMES = {
  tactical: {
    title: 'Command Center',
    conquest: 'Territory Conquest',
    button: 'View Tactical Map',
    ranks: ['Prajurit', 'Sersan', 'Letnan', 'Kapten', 'Komandan', 'Jenderal', 'Panglima Besar']
  },
  academic: {
    title: 'Academic Dashboard',
    conquest: 'Penguasaan Materi',
    button: 'View Study Map',
    ranks: ['Maba', 'Mahasiswa', 'Sarjana', 'Magister', 'Doktor', 'Profesor', 'Guru Besar']
  },
  rpg: {
    title: 'Guild Hall',
    conquest: 'Eksplorasi Dunia',
    button: 'View Quest Map',
    ranks: ['Petualang', 'Fighter', 'Knight', 'Paladin', 'Hero', 'Legend', 'Pahlawan Mitos']
  }
};

const GamificationThemeContext = createContext(null);

export function GamificationThemeProvider({ children }) {
  // Bisa disambungkan ke localStorage atau backend user_preferences nanti
  const [themeKey, setThemeKey] = useState('tactical');
  const theme = GAMIFICATION_THEMES[themeKey];

  return (
    <GamificationThemeContext.Provider value={{ themeKey, setThemeKey, theme }}>
      {children}
    </GamificationThemeContext.Provider>
  );
}

export const useGamificationTheme = () => {
  const ctx = useContext(GamificationThemeContext);
  if (!ctx) throw new Error('useGamificationTheme must be used within GamificationThemeProvider');
  return ctx;
};
