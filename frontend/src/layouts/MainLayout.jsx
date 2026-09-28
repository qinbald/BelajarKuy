import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import SurveyModal from '../components/survey/SurveyModal';
import { usePreferences } from '../hooks/usePreferences';
import { useTheme } from '../contexts/ThemeContext';

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { bgStyle, hasImage } = useTheme();
  
  // Persist collapsed state in localStorage
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', isCollapsed);
  }, [isCollapsed]);

  const { hasCompletedSurvey, loading: prefLoading, refreshPreferences } = usePreferences();
  const [dismissSurvey, setDismissSurvey] = useState(false);

  const showSurveyModal = !prefLoading && !hasCompletedSurvey && !dismissSurvey;

  return (
    <div className={`min-h-screen ${hasImage ? '' : 'bg-slate-50'}`} style={bgStyle}>
      <Sidebar 
        open={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />
      
      <div className={`relative z-0 flex flex-col min-h-screen transition-all duration-300 ease-in-out ${isCollapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>

      {showSurveyModal && (
        <SurveyModal
          isOpen={true}
          onClose={() => setDismissSurvey(true)}
          onComplete={() => {
            setDismissSurvey(true);
            refreshPreferences();
          }}
        />
      )}
    </div>
  );
}
