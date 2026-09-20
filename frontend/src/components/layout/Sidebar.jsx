import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard,
  ListTodo,
  Calendar,
  Timer,
  GraduationCap,
  FileText,
  Image,
  BarChart3,
  Settings,
  Shield,
  BookOpen,
  LogOut,
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/subjects', label: 'Mata Pelajaran', icon: BookOpen },
  { to: '/todos', label: 'Tugas', icon: ListTodo },
  { to: '/schedule', label: 'Jadwal', icon: Calendar },
  { to: '/timer', label: 'Timer', icon: Timer },
  { to: '/grades', label: 'Nilai', icon: GraduationCap },
  { to: '/results', label: 'Hasil Belajar', icon: FileText },
  { to: '/gallery', label: 'Galeri', icon: Image },
  { to: '/analytics', label: 'Analitik', icon: BarChart3 },
];

const adminItems = [
  { to: '/admin', label: 'Admin Panel', icon: Shield },
];

export default function Sidebar({ open, onClose }) {
  const { pathname } = useLocation();
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const linkClass = (to) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
      pathname.startsWith(to)
        ? 'bg-blue-50 text-blue-700'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`;

  return (
    <>
      {/* Overlay mobile */}
      {open && (
        <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 flex flex-col transition-transform lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand */}
        <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-100">
          <BookOpen className="w-7 h-7 text-blue-600" />
          <span className="text-xl font-bold text-gray-800">BelajarKuy</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} className={linkClass(to)} onClick={onClose}>
              <Icon className="w-5 h-5" />
              {label}
            </Link>
          ))}

          {isAdmin && (
            <>
              <div className="border-t border-gray-100 my-3" />
              {adminItems.map(({ to, label, icon: Icon }) => (
                <Link key={to} to={to} className={linkClass(to)} onClick={onClose}>
                  <Icon className="w-5 h-5" />
                  {label}
                </Link>
              ))}
            </>
          )}
        </nav>

        {/* User footer */}
        <div className="border-t border-gray-100 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
              {user?.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
            Keluar
          </button>
        </div>
      </aside>
    </>
  );
}
