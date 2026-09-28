import { useState } from 'react';
import { X, Check, Upload, RotateCcw, Image as ImageIcon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const COLOR_OPTIONS = [
  { name: 'Default', value: null },
  { name: 'Slate', value: '#f1f5f9' },
  { name: 'Biru Muda', value: '#dbeafe' },
  { name: 'Hijau Mint', value: '#d1fae5' },
  { name: 'Krem', value: '#fef3c7' },
  { name: 'Lavender', value: '#ede9fe' },
  { name: 'Pink Muda', value: '#fce7f3' },
];

const PRESET_IMAGES = [
  'https://images.unsplash.com/photo-1517842645767-c639042777db?q=80&w=1600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=1600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1456406644174-8ddd4cd52a06?q=80&w=1600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=1600&auto=format&fit=crop',
];

export default function BackgroundSettingsModal({ isOpen, onClose }) {
  const { background, saving, setColor, setPreset, uploadCustom, reset } = useTheme();
  const [uploadError, setUploadError] = useState(null);

  if (!isOpen) return null;

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Ukuran gambar maksimal 10MB');
      return;
    }
    setUploadError(null);
    try {
      await uploadCustom(file);
    } catch {
      setUploadError('Gagal mengunggah gambar');
    }
  };

  const isActive = (type, value) => background.type === type && background.value === value;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Kustomisasi Background</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Solid Colors */}
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Warna Solid</p>
        <div className="flex flex-wrap gap-2 mb-5">
          {COLOR_OPTIONS.map((c) => (
            <button
              key={c.name}
              onClick={() => setColor(c.value)}
              disabled={saving}
              title={c.name}
              className={`w-10 h-10 rounded-xl border-2 transition relative ${
                isActive('color', c.value) ? 'border-blue-600 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'
              }`}
              style={{ backgroundColor: c.value ?? '#f8fafc' }}
            >
              {isActive('color', c.value) && (
                <Check className="w-4 h-4 text-blue-600 absolute inset-0 m-auto" />
              )}
            </button>
          ))}
        </div>

        {/* Preset Images */}
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Gambar Preset</p>
        <div className="grid grid-cols-2 gap-2 mb-5">
          {PRESET_IMAGES.map((url) => (
            <button
              key={url}
              onClick={() => setPreset(url)}
              disabled={saving}
              className={`relative h-20 rounded-xl overflow-hidden border-2 transition ${
                isActive('preset_image', url) ? 'border-blue-600 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <img src={url.replace('w=1600', 'w=400')} alt="Preset" className="w-full h-full object-cover" loading="lazy" />
              {isActive('preset_image', url) && (
                <div className="absolute inset-0 bg-blue-600/30 flex items-center justify-center">
                  <Check className="w-5 h-5 text-white" />
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Custom Upload */}
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Wallpaper Sendiri</p>
        <label className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-sm font-medium text-gray-600 hover:border-blue-400 hover:text-blue-600 cursor-pointer transition mb-2">
          <Upload className="w-4 h-4" />
          {saving ? 'Mengunggah...' : 'Pilih Gambar (max 10MB)'}
          <input type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={saving} />
        </label>
        {background.type === 'custom_image' && (
          <div className="flex items-center gap-2 text-xs text-emerald-600 mb-2">
            <ImageIcon className="w-3.5 h-3.5" /> Wallpaper kustom aktif
          </div>
        )}
        {uploadError && (
          <p className="text-xs text-red-600 mb-2">{uploadError}</p>
        )}

        {/* Reset */}
        <button
          onClick={reset}
          disabled={saving}
          className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-gray-500 hover:text-red-600 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset ke Default
        </button>
      </div>
    </div>
  );
}
