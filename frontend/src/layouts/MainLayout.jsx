import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import SurveyModal from '../components/survey/SurveyModal';
import { usePreferences } from '../hooks/usePreferences';

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { hasCompletedSurvey, loading: prefLoading, refreshPreferences } = usePreferences();
  const [dismissSurvey, setDismissSurvey] = useState(false);

  const showSurveyModal = !prefLoading && !hasCompletedSurvey && !dismissSurvey;

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="lg:pl-64 flex flex-col min-h-screen">
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
