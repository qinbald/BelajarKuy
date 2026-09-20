import { Menu } from 'lucide-react';

export default function Navbar({ onMenuClick }) {
  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center px-4 lg:px-8 sticky top-0 z-30">
      <button
        onClick={onMenuClick}
        className="p-2 -ml-2 mr-2 text-gray-600 hover:bg-gray-100 rounded-lg lg:hidden"
      >
        <Menu className="w-6 h-6" />
      </button>
      
      <div className="flex-1" />
      
      <div className="flex items-center gap-4">
        {/* Placeholder for notifications or profile dropdown */}
      </div>
    </header>
  );
}
