import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  StickyNote,
  Plus,
  Trash2,
  Check,
  X,
  ArrowRight,
  Sparkles
} from 'lucide-react';

const COLOR_MAP = {
  amber: {
    card: 'bg-amber-50/70 border-amber-200 text-amber-950',
    badge: 'bg-amber-200/70 text-amber-900',
    button: 'bg-amber-400 hover:bg-amber-500 text-white',
  },
  blue: {
    card: 'bg-blue-50/70 border-blue-200 text-blue-950',
    badge: 'bg-blue-200/70 text-blue-900',
    button: 'bg-blue-500 hover:bg-blue-600 text-white',
  },
  rose: {
    card: 'bg-rose-50/70 border-rose-200 text-rose-950',
    badge: 'bg-rose-200/70 text-rose-900',
    button: 'bg-rose-400 hover:bg-rose-500 text-white',
  },
  emerald: {
    card: 'bg-emerald-50/70 border-emerald-200 text-emerald-950',
    badge: 'bg-emerald-200/70 text-emerald-900',
    button: 'bg-emerald-500 hover:bg-emerald-600 text-white',
  },
};

export const INITIAL_NOTES = [
  {
    id: 1,
    title: 'Hukum Newton & Rumus',
    content: 'F = m × a. Aksi = -Reaksi. Jangan lupa latihan soal gesekan bidang miring!',
    color: 'amber',
    date: 'Hari ini, 09:15',
  },
  {
    id: 2,
    title: 'Target Belajar Pekan Ini',
    content: 'Kuasai 3 bab Kalkulus Integral & selesaikan resume Sejarah sebelum hari Jumat.',
    color: 'blue',
    date: 'Kemarin',
  },
  {
    id: 3,
    title: 'Tips Pomodoro',
    content: 'Gunakan rasio 50m fokus + 10m istirahat untuk materi hitungan yang berat.',
    color: 'rose',
    date: '20 Sep',
  },
];

export default function QuickNotes() {
  const [notes, setNotes] = useState(INITIAL_NOTES);
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newColor, setNewColor] = useState('amber');
  const [selectedNote, setSelectedNote] = useState(null);

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const newNote = {
      id: Date.now(),
      title: newTitle.trim(),
      content: newContent.trim(),
      color: newColor,
      date: 'Baru saja',
    };

    setNotes([newNote, ...notes]);
    setNewTitle('');
    setNewContent('');
    setIsAdding(false);
  };

  const handleDelete = (id) => {
    setNotes(notes.filter((n) => n.id !== id));
    if (selectedNote?.id === id) setSelectedNote(null);
  };

  // ponytail: ESC close only; add focus-trap when a11y needed
  useEffect(() => {
    if (!selectedNote) return;
    const onKey = (e) => e.key === 'Escape' && setSelectedNote(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedNote]);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
            <StickyNote className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 leading-tight">Catatan Cepat</h2>
            <p className="text-[11px] text-gray-400">Ide & catatan ringkas harian</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition"
          >
            {isAdding ? (
              <>
                <X className="w-3.5 h-3.5" /> Batal
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" /> Tambah Catatan
              </>
            )}
          </button>
          <Link
            to="/notes"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 hidden sm:flex items-center gap-1"
          >
            Semua <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Form Tambah Catatan Inline */}
      {isAdding && (
        <form onSubmit={handleAddNote} className="mb-4 p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <input
              type="text"
              placeholder="Judul catatan..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <div className="flex items-center gap-1 flex-shrink-0">
              {Object.keys(COLOR_MAP).map((colorKey) => (
                <button
                  key={colorKey}
                  type="button"
                  onClick={() => setNewColor(colorKey)}
                  className={`w-5 h-5 rounded-full border transition ${
                    newColor === colorKey ? 'ring-2 ring-blue-500 scale-110' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor:
                      colorKey === 'amber' ? '#fde68a' : colorKey === 'blue' ? '#bfdbfe' : colorKey === 'rose' ? '#fecdd3' : '#a7f3d0',
                  }}
                />
              ))}
            </div>
          </div>

          <textarea
            placeholder="Tulis isi catatan cepat di sini..."
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            rows={2}
            className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1 text-xs text-gray-500 hover:text-gray-700"
            >
              Batal
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs"
            >
              <Check className="w-3.5 h-3.5" /> Simpan
            </button>
          </div>
        </form>
      )}

      {/* Daftar Catatan — judul saja, klik buka modal */}
      {notes.length === 0 ? (
        <div className="text-center py-8 text-gray-400 border border-dashed border-gray-200 rounded-2xl">
          <StickyNote className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-xs font-medium text-gray-600">Belum ada catatan</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Catat rumus atau memo penting di sini!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {notes.map((note) => {
            const theme = COLOR_MAP[note.color] || COLOR_MAP.amber;
            return (
              <button
                key={note.id}
                onClick={() => setSelectedNote(note)}
                className={`text-left p-4 rounded-2xl border ${theme.card} flex flex-col justify-between shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all relative group cursor-pointer`}
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-xs font-bold truncate pr-2">{note.title}</h3>
                  <span
                    onClick={(e) => { e.stopPropagation(); handleDelete(note.id); }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && (e.stopPropagation(), handleDelete(note.id))}
                    title="Hapus catatan"
                    className="opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 text-gray-400 hover:text-red-600 transition flex-shrink-0 p-1 -m-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </span>
                </div>
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-black/5 text-[10px] text-gray-500 font-medium">
                  <span>{note.date}</span>
                  <span className={`px-1.5 py-0.5 rounded-md ${theme.badge} font-semibold uppercase text-[9px]`}>Memo</span>
                </div>
              </button>
            );
          })}
        </div>
      )}
      {/* Modal detail — ponytail: ganti ke route /notes/:id saat butuh deep-link/share */}
      {selectedNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelectedNote(null)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            onClick={(e) => e.stopPropagation()}
            className={`relative w-full max-w-lg rounded-2xl border shadow-xl p-5 max-h-[80vh] overflow-auto ${COLOR_MAP[selectedNote.color]?.card || COLOR_MAP.amber.card}`}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <h3 className="text-sm font-bold leading-tight">{selectedNote.title}</h3>
              <button onClick={() => setSelectedNote(null)} className="p-1.5 rounded-xl bg-black/5 hover:bg-black/10 text-gray-600 transition flex-shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{selectedNote.content}</p>
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-black/10 text-xs text-gray-500">
              <span>{selectedNote.date}</span>
              <button onClick={() => { handleDelete(selectedNote.id); }} className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 font-semibold">
                <Trash2 className="w-3.5 h-3.5" /> Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
