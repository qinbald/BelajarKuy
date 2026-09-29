import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import GlassLoader from '../components/common/GlassLoader';

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <GlassLoader />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export function AdminRoute({ children }) {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <GlassLoader />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
}

export function GuestRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <GlassLoader />
      </div>
    );
  }

  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}
