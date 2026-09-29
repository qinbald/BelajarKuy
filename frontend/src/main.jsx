import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import AppRoutes from './routes/AppRoutes';
import { ThemeProvider } from './contexts/ThemeContext';
import { GamificationThemeProvider } from './contexts/GamificationThemeContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <GamificationThemeProvider>
        <AppRoutes />
      </GamificationThemeProvider>
    </ThemeProvider>
  </StrictMode>
);
