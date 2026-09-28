import { useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard,
  ListTodo,
  Calendar,
  Timer,
  GraduationCap,
  FileText,
  StickyNote,
  Image,
  BarChart3,
  Settings,
  Shield,
  BookOpen,
  LogOut,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', label: 'Beranda', icon: LayoutDashboard },
  { to: '/subjects', label: 'Mata Pelajaran', icon: BookOpen },
  { to: '/todos', label: 'Tugas', icon: ListTodo },
  { to: '/notes', label: 'Catatan', icon: StickyNote },
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

export default function Sidebar({ open, onClose, isCollapsed, onToggleCollapse }) {
  const { pathname } = useLocation();
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const sidebarRef = useRef(null);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (to) => pathname.startsWith(to);

  const linkBase = 'flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ease-in-out';
  const linkClass = (to) =>
    `${linkBase} ${
      isActive(to)
        ? 'bg-blue-50 text-blue-700'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    } ${isCollapsed ? 'justify-center' : ''}`;

  return (
    <>
      {/* Overlay mobile */}
      {open && (
        <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={onClose} />
      )}

      <aside
        ref={sidebarRef}
        className={`fixed top-0 left-0 z-50 h-full bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        } ${isCollapsed ? 'w-20 overflow-visible' : 'w-64 overflow-hidden'}`}
      >
        {/* Brand */}
        <div className={`flex items-center gap-2 py-5 border-b border-gray-100 transition-all duration-300 ${isCollapsed ? 'justify-center px-2' : 'px-6'}`}>
          <BookOpen className="w-7 h-7 text-blue-600 shrink-0" />
          <span className={`text-xl font-bold text-gray-800 truncate transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100 w-auto'}`}>BelajarKuy</span>
        </div>

        {/* Nav */}
        <nav className={`flex-1 px-3 py-4 space-y-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${isCollapsed ? 'overflow-visible' : 'overflow-y-auto overflow-x-hidden'}`}>
          {navItems.map(({ to, label, icon: Icon }) => (
            <div key={to} className={`relative ${isCollapsed ? 'group' : ''}`}>
              <Link to={to} className={linkClass(to)} onClick={onClose}>
                <Icon className="w-5 h-5 shrink-0" />
                <span className={`truncate transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100 w-auto'}`}>{label}</span>
              </Link>
              {/* Glassmorphism pop-out (collapsed only, CSS-only) */}
              {isCollapsed && (
                <div aria-hidden="true" className="absolute left-1 top-1/2 -translate-y-1/2 flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/70 backdrop-blur-xl border border-white/40 shadow-xl opacity-0 invisible scale-95 -translate-x-1 group-hover:opacity-100 group-hover:visible group-hover:scale-100 group-hover:translate-x-0 transition-all duration-100 ease-out pointer-events-none z-[60] whitespace-nowrap">
                  <Icon className={`w-6 h-6 shrink-0 transition-transform duration-100 ${isActive(to) ? 'text-blue-700' : 'text-gray-700'}`} />
                  <span className={`text-sm font-semibold ${isActive(to) ? 'text-blue-700' : 'text-gray-800'}`}>{label}</span>
                </div>
              )}
            </div>
          ))}

          {isAdmin && (
            <>
              <div className="border-t border-gray-100 my-3" />
              {adminItems.map(({ to, label, icon: Icon }) => (
                <div key={to} className={`relative ${isCollapsed ? 'group' : ''}`}>
                  <Link to={to} className={linkClass(to)} onClick={onClose}>
                    <Icon className="w-5 h-5 shrink-0" />
                    <span className={`truncate transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100 w-auto'}`}>{label}</span>
                  </Link>
                  {isCollapsed && (
                    <div aria-hidden="true" className="absolute left-1 top-1/2 -translate-y-1/2 flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/70 backdrop-blur-xl border border-white/40 shadow-xl opacity-0 invisible scale-95 -translate-x-1 group-hover:opacity-100 group-hover:visible group-hover:scale-100 group-hover:translate-x-0 transition-all duration-100 ease-out pointer-events-none z-[60] whitespace-nowrap">
                      <Icon className={`w-6 h-6 shrink-0 transition-transform duration-100 ${isActive(to) ? 'text-blue-700' : 'text-gray-700'}`} />
                      <span className={`text-sm font-semibold ${isActive(to) ? 'text-blue-700' : 'text-gray-800'}`}>{label}</span>
                    </div>
                  )}
                </div>
              ))}
            </>
          )}
        </nav>

        {/* Toggle Button (Desktop only) */}
        <div className={`hidden lg:flex p-2 border-t border-gray-100 relative ${isCollapsed ? 'group' : ''}`}>
          <button
            onClick={onToggleCollapse}
            className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-all duration-300 ${isCollapsed ? 'justify-center' : ''}`}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="w-5 h-5 shrink-0" />
            ) : (
              <>
                <PanelLeftClose className="w-5 h-5 shrink-0" />
                <span className="truncate">Tutup Sidebar</span>
              </>
            )}
          </button>
          {isCollapsed && (
            <div aria-hidden="true" className="absolute left-1 top-1/2 -translate-y-1/2 flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/70 backdrop-blur-xl border border-white/40 shadow-xl opacity-0 invisible scale-95 -translate-x-1 group-hover:opacity-100 group-hover:visible group-hover:scale-100 group-hover:translate-x-0 transition-all duration-100 ease-out pointer-events-none z-[60] whitespace-nowrap">
              <PanelLeftOpen className="w-6 h-6 shrink-0 text-gray-700" />
              <span className="text-sm font-semibold text-gray-800">Buka Sidebar</span>
            </div>
          )}
        </div>

        {/* User footer */}
        <div className={`border-t border-gray-100 p-4 transition-all duration-300 ${isCollapsed ? 'px-2' : ''}`}>
          <div className={`flex items-center gap-3 mb-3 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm shrink-0">
              {user?.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div className={`flex-1 min-w-0 transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100 w-auto'}`}>
              <p className="text-sm font-medium text-gray-800 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <div className={`relative ${isCollapsed ? 'group' : ''}`}>
            <button
              onClick={handleLogout}
              className={`flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition ${isCollapsed ? 'justify-center' : ''}`}
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span className={`truncate transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100 w-auto'}`}>Keluar</span>
            </button>
            {isCollapsed && (
              <div aria-hidden="true" className="absolute left-1 top-1/2 -translate-y-1/2 flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/70 backdrop-blur-xl border border-white/40 shadow-xl opacity-0 invisible scale-95 -translate-x-1 group-hover:opacity-100 group-hover:visible group-hover:scale-100 group-hover:translate-x-0 transition-all duration-100 ease-out pointer-events-none z-[60] whitespace-nowrap">
                <LogOut className="w-5 h-5 shrink-0 text-red-600" />
                <span className="text-sm font-semibold text-red-600">Keluar</span>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
