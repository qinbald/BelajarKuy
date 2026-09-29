import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn';

export default function SidebarItem({
  icon: Icon,
  title,
  path,
  isActive,
  isCollapsed,
  onClick,
  isChild = false,
}) {
  return (
    <div className={cn('relative', isCollapsed && 'group')}>
      <Link
        to={path}
        onClick={onClick}
        className={cn(
          'relative z-10 flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200',
          isCollapsed ? 'justify-center' : '',
          isActive
            ? 'text-blue-600 bg-blue-50/50'
            : 'text-slate-400 hover:text-slate-600 hover:bg-gray-50/50'
        )}
      >
        <Icon
          className={cn(
            'w-5 h-5 shrink-0 transition-colors duration-200',
            isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-500',
            isChild && 'w-4 h-4'
          )}
        />
        <span
          className={cn(
            'truncate transition-all duration-300',
            isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100 w-auto'
          )}
        >
          {title}
        </span>
      </Link>

      {/* Pop-out menu for collapsed state */}
      {isCollapsed && (
        <div
          aria-hidden="true"
          className={cn(
            'absolute left-1 top-1/2 -translate-y-1/2 flex items-center gap-3 px-3 py-2.5 rounded-xl',
            'bg-white/70 backdrop-blur-xl border border-white/40 shadow-xl',
            'opacity-0 invisible scale-95 -translate-x-1',
            'group-hover:opacity-100 group-hover:visible group-hover:scale-100 group-hover:translate-x-0',
            'transition-all duration-100 ease-out pointer-events-none z-[60] whitespace-nowrap'
          )}
        >
          <Icon
            className={cn(
              'w-6 h-6 shrink-0',
              isActive ? 'text-blue-600' : 'text-slate-400'
            )}
          />
          <span
            className={cn(
              'text-sm font-semibold',
              isActive ? 'text-blue-600' : 'text-gray-800'
            )}
          >
            {title}
          </span>
        </div>
      )}
    </div>
  );
}
