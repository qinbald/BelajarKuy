import { useRef, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import ProfileSettingsModal from '../dashboard/ProfileSettingsModal';
import { cn } from '../../utils/cn';
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
  Shield,
  BookOpen,
  LogOut,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
  Layers,
  Compass,
  Focus,
  Moon,
  Sun,
} from 'lucide-react';

const navStructure = [
  { title: 'Beranda', path: '/dashboard', icon: LayoutDashboard },
  {
    title: 'Akademik',
    icon: BookOpen,
    children: [
      { title: 'Mata Pelajaran', path: '/subjects', icon: BookOpen },
      { title: 'Jadwal', path: '/schedule', icon: Calendar },
      { title: 'Tugas', path: '/todos', icon: ListTodo },
      { title: 'Catatan', path: '/notes', icon: StickyNote },
      { title: 'Evaluasi', path: '/grades', icon: GraduationCap, altPaths: ['/results'] },
    ],
  },
  {
    title: 'Eksplorasi',
    icon: Compass,
    children: [
      { title: 'Analitik', path: '/analytics', icon: BarChart3 },
      { title: 'Galeri', path: '/gallery', icon: Image },
    ],
  },
];

const adminItems = [{ to: '/admin', label: 'Admin Panel', icon: Shield }];

function isPathActive(pathname, item) {
  if (pathname === item.path || pathname.startsWith(item.path + '/')) return true;
  if (item.altPaths) return item.altPaths.some((p) => pathname === p || pathname.startsWith(p + '/'));
  return false;
}

function isParentActive(pathname, parent) {
  if (!parent.children) return false;
  return parent.children.some((c) => isPathActive(pathname, c));
}

export default function Sidebar({ open, onClose, isCollapsed, onToggleCollapse }) {
  const { pathname } = useLocation();
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const sidebarRef = useRef(null);
  const navRefs = useRef({});
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState(() => {
    const active = navStructure.filter((n) => n.children && isParentActive(pathname, n)).map((n) => n.title);
    return active;
  });

  const hoverTimeoutRef = useRef(null);
  const [hoveredMenu, setHoveredMenu] = useState(null);

  const handleMouseEnter = (title) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setHoveredMenu(title);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredMenu(null);
    }, 250);
  };

  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'light';
    }
    return 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));

  // Auto-expand parent when child becomes active (e.g. on refresh / navigation)
  useEffect(() => {
    const activeParents = navStructure.filter((n) => n.children && isParentActive(pathname, n)).map((n) => n.title);
    if (activeParents.length) {
      setOpenMenus((prev) => {
        const merged = new Set([...prev, ...activeParents]);
        return [...merged];
      });
    }
  }, [pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const toggleMenu = (title) => {
    setOpenMenus((prev) => (prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]));
  };

  const isActive = (to) => pathname === to || pathname.startsWith(to + '/');

  // Sliding pill dihapus sesuai permintaan

  const childLinkClass = (path) => {
    const active = isPathActive(pathname, { path, altPaths: navStructure.flatMap((n) => n.children || []).find((c) => c.path === path)?.altPaths });
    return `relative z-10 flex w-full items-center gap-3 px-3 py-2.5 rounded-r-lg text-sm transition-colors duration-200 ${
      active
        ? 'bg-blue-500/10 text-blue-400 font-semibold border-l-4 border-blue-500'
        : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200 border-l-4 border-transparent'
    } ${isCollapsed ? 'justify-center' : ''}`;
  };

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={onClose} />}

      <aside
        ref={sidebarRef}
        className={`fixed top-0 left-0 z-50 h-full bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-r border-gray-200/60 dark:border-slate-800/60 shadow-[4px_0_24px_rgba(0,0,0,0.02)] flex flex-col transition-all duration-300 ease-in-out lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        } ${isCollapsed ? 'w-20 overflow-visible' : 'w-64 overflow-hidden'}`}
      >
        {/* Double-Click Edge Toggle */}
        <div 
          className="absolute top-0 right-0 w-1.5 h-full cursor-ew-resize z-[60] hover:bg-blue-400/40 transition-colors hidden lg:block"
          onDoubleClick={onToggleCollapse}
          title="Klik ganda untuk lipat/buka sidebar"
        />
        {/* Brand */}
        <div className={`flex items-center gap-2 py-5 border-b border-gray-100 dark:border-slate-800 transition-all duration-300 ${isCollapsed ? 'justify-center px-2' : 'px-6'}`}>
          <BookOpen className="w-7 h-7 text-blue-600 dark:text-blue-500 shrink-0" />
          <span className={`text-xl font-bold text-gray-800 dark:text-slate-100 truncate transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100 w-auto'}`}>BelajarKuy</span>
        </div>

        {/* Nav */}
        <nav className={`relative flex-1 px-3 py-4 space-y-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${isCollapsed ? 'overflow-visible' : 'overflow-y-auto overflow-x-hidden'}`}>
          {navStructure.map((item) => {
            const hasChildren = !!item.children;
            const isOpen = openMenus.includes(item.title);
            const parentActive = hasChildren && isParentActive(pathname, item);
            const ParentIcon = item.icon;

            if (!hasChildren) {
              // Top-level Beranda
              return (
                <div 
                  key={item.path} 
                  className="relative" 
                  ref={(el) => (navRefs.current[item.path] = el)}
                  onMouseEnter={() => isCollapsed && handleMouseEnter(item.title)}
                  onMouseLeave={() => isCollapsed && handleMouseLeave()}
                >
                  <Link to={item.path} className={childLinkClass(item.path)} onClick={onClose}>
                    <ParentIcon className={cn("w-5 h-5 shrink-0 transition-colors duration-200", isPathActive(pathname, item) ? "text-blue-600" : "text-slate-400 group-hover:text-blue-500")} />
                    <span className={`truncate transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100 w-auto'}`}>{item.title}</span>
                  </Link>
                  {isCollapsed && (
                    <div 
                      aria-hidden="true" 
                      className={`absolute left-1 top-1/2 -translate-y-1/2 flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/70 backdrop-blur-xl border border-white/40 shadow-xl scale-95 -translate-x-1 transition-all duration-200 ease-out pointer-events-none z-[60] whitespace-nowrap ${
                        hoveredMenu === item.title ? 'opacity-100 visible scale-100 translate-x-0' : 'opacity-0 invisible'
                      }`}
                    >
                      <ParentIcon className={cn("w-6 h-6 shrink-0", isPathActive(pathname, item) ? "text-blue-600" : "text-slate-400")} />
                      <span className={`text-sm font-semibold ${isPathActive(pathname, item) ? 'text-blue-700' : 'text-gray-800'}`}>{item.title}</span>
                    </div>
                  )}
                </div>
              );
            }

            // Parent with accordion
            return (
              <div 
                key={item.title} 
                className="relative"
                onMouseEnter={() => isCollapsed && handleMouseEnter(item.title)}
                onMouseLeave={() => isCollapsed && handleMouseLeave()}
              >
                <button
                  onClick={() => !isCollapsed && toggleMenu(item.title)}
                  className={`relative z-10 flex w-full items-center gap-3 px-3 py-2.5 rounded-r-lg text-sm transition-colors duration-200 ${
                    parentActive 
                      ? 'bg-blue-500/10 text-blue-400 font-semibold border-l-4 border-blue-500' 
                      : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200 border-l-4 border-transparent'
                  } ${isCollapsed ? 'justify-center' : 'justify-between'}`}
                >
                  <span className="flex items-center gap-3">
                    <ParentIcon className={`w-5 h-5 shrink-0 transition-colors duration-200 ${parentActive ? 'text-blue-400' : 'text-gray-400 group-hover:text-gray-200'}`} />
                    <span className={`truncate transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100 w-auto'}`}>{item.title}</span>
                  </span>
                  {!isCollapsed && (
                    <ChevronDown className={`w-4 h-4 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
                  )}
                </button>

                {/* Collapsed: show children as pop-out on hover */}
                {isCollapsed ? (
                  <div 
                    className={`absolute left-full top-0 pl-4 py-8 -mt-8 -ml-2 z-50 transition-all duration-200 ease-out ${
                      hoveredMenu === item.title ? 'opacity-100 visible translate-x-0 pointer-events-auto' : 'opacity-0 invisible translate-x-[-10px] pointer-events-none'
                    }`}
                  >
                    {hoveredMenu === item.title && (
                      <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 shadow-xl rounded-xl p-2 min-w-[180px]">
                        <p className="text-xs font-bold text-slate-500 px-2 py-1 uppercase tracking-wider">{item.title}</p>
                        {item.children.map((child) => {
                          const ChildIcon = child.icon;
                          const active = isPathActive(pathname, child);
                          return (
                            <Link
                              key={child.path}
                              to={child.path}
                              onClick={onClose}
                              className={`flex items-center gap-2 px-2 py-2 rounded-r-lg text-sm transition-colors ${
                                active ? 'bg-blue-500/10 text-blue-400 font-medium border-l-4 border-blue-500' : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200 border-l-4 border-transparent'
                              }`}
                            >
                              <ChildIcon className="w-4 h-4 shrink-0" />
                              {child.title}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  /* Expanded: fluid grid accordion */
                  <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100 mt-1' : 'grid-rows-[0fr] opacity-0'}`}>
                    <div className="overflow-hidden">
                      {isOpen && (
                        <div className="ml-3 pl-3 border-l border-slate-700/50 space-y-0.5 py-1">
                          {item.children.map((child) => {
                            const ChildIcon = child.icon;
                            const active = isPathActive(pathname, child);
                            return (
                              <div key={child.path} ref={(el) => (navRefs.current[child.path] = el)} className="relative">
                                <Link
                                  to={child.path}
                                  onClick={onClose}
                                  className={`relative z-10 flex items-center gap-3 px-3 py-2 rounded-r-lg text-sm transition-colors duration-200 ${
                                    active ? 'bg-blue-500/10 text-blue-400 font-medium border-l-4 border-blue-500' : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200 border-l-4 border-transparent'
                                  }`}
                                >
                                  <ChildIcon className="w-4 h-4 shrink-0" />
                                  <span className="truncate">{child.title}</span>
                                </Link>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {isAdmin && (
            <>
              <div className="border-t border-gray-100 my-3 relative z-10" />
              {adminItems.map(({ to, label, icon: Icon }) => (
                <div key={to} className={`relative ${isCollapsed ? 'group' : ''}`} ref={(el) => (navRefs.current[to] = el)}>
                  <Link to={to} className={`relative z-10 flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-300 ${isActive(to) ? 'bg-blue-50/80 text-blue-700' : 'text-gray-600 hover:text-gray-900 hover:bg-white/80'} ${isCollapsed ? 'justify-center' : ''}`} onClick={onClose}>
                    <Icon className={cn("w-5 h-5 shrink-0 transition-colors duration-200", isActive(to) ? "text-blue-600" : "text-slate-400 group-hover:text-blue-500")} />
                    <span className={`truncate transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100 w-auto'}`}>{label}</span>
                  </Link>
                  {isCollapsed && (
                    <div aria-hidden="true" className="absolute left-1 top-1/2 -translate-y-1/2 flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/70 backdrop-blur-xl border border-white/40 shadow-xl opacity-0 invisible scale-95 -translate-x-1 group-hover:opacity-100 group-hover:visible group-hover:scale-100 group-hover:translate-x-0 transition-all duration-100 ease-out pointer-events-none z-[60] whitespace-nowrap">
                      <Icon className={cn("w-6 h-6 shrink-0", isActive(to) ? "text-blue-600" : "text-slate-400")} />
                      <span className={`text-sm font-semibold ${isActive(to) ? 'text-blue-700' : 'text-gray-800'}`}>{label}</span>
                    </div>
                  )}
                </div>
              ))}
            </>
          )}
        </nav>

        {/* Toggle Button */}
        <div className={`hidden lg:flex p-2 border-t border-gray-100 relative ${isCollapsed ? 'group' : ''}`}>
          <button
            onClick={onToggleCollapse}
            className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-all duration-300 ${isCollapsed ? 'justify-center' : ''}`}
          >
            {isCollapsed ? <PanelLeftOpen className="w-5 h-5 shrink-0" /> : <><PanelLeftClose className="w-5 h-5 shrink-0" /><span className="truncate">Tutup Sidebar</span></>}
          </button>
          {isCollapsed && (
            <div aria-hidden="true" className="absolute left-1 top-1/2 -translate-y-1/2 flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/70 backdrop-blur-xl border border-white/40 shadow-xl opacity-0 invisible scale-95 -translate-x-1 group-hover:opacity-100 group-hover:visible group-hover:scale-100 group-hover:translate-x-0 transition-all duration-100 ease-out pointer-events-none z-[60] whitespace-nowrap">
              <PanelLeftOpen className="w-6 h-6 shrink-0 text-gray-700" />
              <span className="text-sm font-semibold text-gray-800">Buka Sidebar</span>
            </div>
          )}
        </div>

        {/* User footer */}
        <div className={`border-t border-gray-100 dark:border-slate-800 p-4 transition-all duration-300 ${isCollapsed ? 'px-2' : ''}`}>
          
          {/* Theme Toggle */}
          <div className={`relative mb-3 ${isCollapsed ? 'group' : ''}`}>
            <button
              onClick={toggleTheme}
              className={`flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition ${isCollapsed ? 'justify-center' : ''}`}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 shrink-0" /> : <Moon className="w-4 h-4 shrink-0" />}
              <span className={`truncate transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100 w-auto'}`}>
                {theme === 'dark' ? 'Terang' : 'Gelap'}
              </span>
            </button>
            {isCollapsed && (
              <div aria-hidden="true" className="absolute left-1 top-1/2 -translate-y-1/2 flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/70 dark:bg-slate-800/90 backdrop-blur-xl border border-white/40 dark:border-slate-700 shadow-xl opacity-0 invisible scale-95 -translate-x-1 group-hover:opacity-100 group-hover:visible group-hover:scale-100 group-hover:translate-x-0 transition-all duration-100 ease-out pointer-events-none z-[60] whitespace-nowrap">
                {theme === 'dark' ? <Sun className="w-5 h-5 shrink-0 text-slate-300" /> : <Moon className="w-5 h-5 shrink-0 text-gray-700" />}
                <span className="text-sm font-semibold text-gray-800 dark:text-slate-200">{theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}</span>
              </div>
            )}
          </div>

          <div className={`relative ${isCollapsed ? 'group' : ''}`}>
            <button 
              onClick={() => setIsProfileModalOpen(true)}
              className={`flex items-center gap-3 w-full mb-3 px-2 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors text-left ${isCollapsed ? 'justify-center' : ''}`}
            >
              <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm shrink-0 overflow-hidden border border-gray-200">
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  user?.name?.charAt(0)?.toUpperCase() || '?'
                )}
              </div>
              <div className={`flex-1 min-w-0 transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100 w-auto'}`}>
                <p className="text-sm font-medium text-gray-800 truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </button>
            
            {/* Tooltip Pengaturan Profil saat Collapsed */}
            {isCollapsed && (
              <div aria-hidden="true" className="absolute left-1 top-1/2 -translate-y-1/2 flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/70 backdrop-blur-xl border border-white/40 shadow-xl opacity-0 invisible scale-95 -translate-x-1 group-hover:opacity-100 group-hover:visible group-hover:scale-100 group-hover:translate-x-0 transition-all duration-100 ease-out pointer-events-none z-[60] whitespace-nowrap">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs shrink-0 overflow-hidden border border-blue-200">
                  {user?.avatar_url ? (
                    <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    user?.name?.charAt(0)?.toUpperCase() || '?'
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-gray-800">Pengaturan Profil</span>
                  <span className="text-xs text-gray-500">{user?.name}</span>
                </div>
              </div>
            )}
          </div>
          <div className={`relative ${isCollapsed ? 'group' : ''}`}>
            <button onClick={handleLogout} className={`flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition ${isCollapsed ? 'justify-center' : ''}`}>
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

      {/* MODAL PROFIL DARI SIDEBAR */}
      <ProfileSettingsModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
    </>
  );
}
