import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Trash2,
  RotateCcw,
  SlidersHorizontal,
  Check,
  Image as ImageIcon,
  ExternalLink,
  Plus,
  Maximize2,
  Edit3
} from 'lucide-react';

export const INITIAL_PINNED_IMAGES = [
  {
    id: 1,
    url: 'https://images.unsplash.com/photo-1517842645767-c639042777db?q=80&w=800&auto=format&fit=crop',
    title: 'Minimalist Study Desk',
    size: '2x2',
  },
  {
    id: 2,
    url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=600&auto=format&fit=crop',
    title: 'Notes & Highlighter',
    size: '1x1',
  },
  {
    id: 3,
    url: 'https://images.unsplash.com/photo-1456406644174-8ddd4cd52a06?q=80&w=600&auto=format&fit=crop',
    title: 'Deep Focus Morning',
    size: '1x2',
  },
  {
    id: 4,
    url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=600&auto=format&fit=crop',
    title: 'Study With Friends',
    size: '1x1',
  },
  {
    id: 5,
    url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=800&auto=format&fit=crop',
    title: 'Books & Knowledge',
    size: '2x1',
  },
];

const SIZE_VARIANTS = {
  '1x1': { label: '1×1', class: 'col-span-1 row-span-1' },
  '2x1': { label: '2×1', class: 'col-span-2 row-span-1' },
  '1x2': { label: '1×2', class: 'col-span-1 row-span-2' },
  '2x2': { label: '2×2', class: 'col-span-2 row-span-2' },
};

export default function VisionBoard() {
  const [images, setImages] = useState(INITIAL_PINNED_IMAGES);
  const [isEditing, setIsEditing] = useState(false);

  const moveItem = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= images.length) return;
    const updated = [...images];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    setImages(updated);
  };

  const changeSize = (id, newSize) => {
    setImages(images.map(img => (img.id === id ? { ...img, size: newSize } : img)));
  };

  const removeItem = (id) => {
    setImages(images.filter(img => img.id !== id));
  };

  const resetToDefault = () => {
    setImages(INITIAL_PINNED_IMAGES);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col h-full">
      {/* Header & Controls */}
      <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 leading-tight">Vision Board</h2>
            <p className="text-[11px] text-gray-400">Inspirasi belajar pilihanmu</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {isEditing && (
            <button
              onClick={resetToDefault}
              title="Reset ke susunan awal"
              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              isEditing
                ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {isEditing ? (
              <>
                <Check className="w-3.5 h-3.5" /> Selesai
              </>
            ) : (
              <>
                <SlidersHorizontal className="w-3.5 h-3.5" /> Sesuaikan
              </>
            )}
          </button>
        </div>
      </div>

      {/* Edit Mode Notice */}
      {isEditing && (
        <div className="mb-3 px-3 py-2 bg-blue-50/70 border border-blue-100 rounded-xl text-blue-700 text-xs flex items-center justify-between gap-2">
          <span>Pilih ukuran (1×1, 2×1, dst) dan geser urutan gambar.</span>
          <Link
            to="/gallery"
            className="font-semibold underline inline-flex items-center gap-1 hover:text-blue-800"
          >
            Galeri <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      )}

      {/* Grid Content */}
      {images.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-12 px-4 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
          <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3 text-gray-400">
            <ImageIcon className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-gray-800 mb-1">Vision Board Kosong</p>
          <p className="text-xs text-gray-500 mb-4 max-w-xs">
            Pilih gambar inspirasi dari Galeri untuk ditampilkan di sini sebagai motivasi belajarmu.
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={resetToDefault}
              className="text-xs font-semibold px-3 py-1.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition"
            >
              Pulihkan Contoh
            </button>
            <Link
              to="/gallery"
              className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Buka Galeri
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 auto-rows-[120px] grid-flow-dense">
          {images.map((img, index) => {
            const sizeConf = SIZE_VARIANTS[img.size] || SIZE_VARIANTS['1x1'];

            return (
              <div
                key={img.id}
                className={`relative group overflow-hidden rounded-2xl border transition-all duration-200 ${
                  sizeConf.class
                } ${
                  isEditing
                    ? 'border-blue-400 ring-2 ring-blue-100 shadow-md bg-gray-900'
                    : 'border-transparent shadow-sm hover:shadow-md'
                }`}
              >
                <img
                  src={img.url}
                  alt={img.title}
                  className={`w-full h-full object-cover transition-transform duration-500 ${
                    isEditing ? 'opacity-75 scale-95 rounded-xl' : 'group-hover:scale-105'
                  }`}
                  loading="lazy"
                />

                {/* Normal Hover Overlay (View Mode) */}
                {!isEditing && (
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {/* Gradient tipis hanya di atas */}
                    <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/50 to-transparent rounded-t-2xl" />
                    {/* Tombol aksi kanan atas */}
                    <div className="absolute top-2 right-2 flex items-center gap-1">
                      <button
                        title="Perbesar"
                        onClick={() => window.open(img.url, '_blank')}
                        className="p-1.5 bg-white/20 hover:bg-white/40 backdrop-blur-md border border-white/30 text-white rounded-lg transition"
                      >
                        <Maximize2 className="w-3 h-3" />
                      </button>
                      <button
                        title="Ganti gambar"
                        onClick={() => removeItem(img.id)}
                        className="p-1.5 bg-white/20 hover:bg-red-500/70 backdrop-blur-md border border-white/30 text-white rounded-lg transition"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Interactive Controls Overlay (Edit Mode) */}
                {isEditing && (
                  <div className="absolute inset-0 bg-black/55 backdrop-blur-[1px] p-2 flex flex-col justify-between">
                    {/* Top Row: Reorder & Delete */}
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => moveItem(index, -1)}
                          disabled={index === 0}
                          title="Geser ke kiri/atas"
                          className="p-1 bg-white/90 hover:bg-white text-gray-800 disabled:opacity-30 rounded-md transition"
                        >
                          <ArrowLeft className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => moveItem(index, 1)}
                          disabled={index === images.length - 1}
                          title="Geser ke kanan/bawah"
                          className="p-1 bg-white/90 hover:bg-white text-gray-800 disabled:opacity-30 rounded-md transition"
                        >
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(img.id)}
                        title="Hapus dari Vision Board"
                        className="p-1 bg-red-600/90 hover:bg-red-600 text-white rounded-md transition"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Bottom Row: Size Switcher */}
                    <div className="bg-black/60 backdrop-blur-sm p-1 rounded-lg flex items-center justify-around gap-1">
                      {Object.keys(SIZE_VARIANTS).map((key) => (
                        <button
                          key={key}
                          onClick={() => changeSize(img.id, key)}
                          className={`px-1.5 py-0.5 text-[10px] font-bold rounded transition ${
                            img.size === key
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'text-gray-300 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          {SIZE_VARIANTS[key].label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
