import QuickNotes from '../../components/dashboard/QuickNotes';
import { StickyNote } from 'lucide-react';

export default function NotesPage() {
  return (
    <div className="space-y-6 pb-8">
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
        <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
          <StickyNote className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Catatan & Memo Belajar</h1>
          <p className="text-xs text-gray-500 mt-0.5">Kelola ide, ringkasan, dan catatan cepat harianmu</p>
        </div>
      </div>

      <QuickNotes />
    </div>
  );
}
