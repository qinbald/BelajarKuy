import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import client from '../api/client';

const STORAGE_KEY = 'bk_background';

const DEFAULT_BG = { type: 'color', value: null };

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  // Load from localStorage first to avoid flash
  const [background, setBackground] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_BG;
    } catch {
      return DEFAULT_BG;
    }
  });
  const [saving, setSaving] = useState(false);

  // Sync from API on mount (in case another device changed it)
  useEffect(() => {
    client.get('/background')
      .then((res) => {
        const { background_type, background_value } = res.data.data;
        const bg = { type: background_type, value: background_value };
        setBackground(bg);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(bg));
      })
      .catch(() => {}); // Fail silently — localStorage value still used
  }, []);

  const persist = (bg) => {
    setBackground(bg);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bg));
  };

  const setColor = useCallback(async (hex) => {
    persist({ type: 'color', value: hex });
    setSaving(true);
    try {
      await client.post('/background', { background_type: 'color', background_value: hex });
    } finally {
      setSaving(false);
    }
  }, []);

  const setPreset = useCallback(async (url) => {
    persist({ type: 'preset_image', value: url });
    setSaving(true);
    try {
      await client.post('/background', { background_type: 'preset_image', background_value: url });
    } finally {
      setSaving(false);
    }
  }, []);

  const uploadCustom = useCallback(async (file) => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await client.post('/background/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const { background_type, background_url } = res.data.data;
      persist({ type: background_type, value: background_url });
    } finally {
      setSaving(false);
    }
  }, []);

  const reset = useCallback(async () => {
    persist(DEFAULT_BG);
    setSaving(true);
    try {
      await client.delete('/background');
    } finally {
      setSaving(false);
    }
  }, []);

  // Compute CSS style for the background
  const bgStyle = (() => {
    if (!background.value) return {};
    if (background.type === 'color') return { backgroundColor: background.value };
    if (background.type === 'preset_image' || background.type === 'custom_image') {
      return {
        backgroundImage: `url(${background.value})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      };
    }
    return {};
  })();

  const hasImage = background.type === 'preset_image' || background.type === 'custom_image';

  return (
    <ThemeContext.Provider value={{ background, bgStyle, hasImage, saving, setColor, setPreset, uploadCustom, reset }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
};
