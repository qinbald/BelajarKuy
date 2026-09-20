import { useState, useEffect } from 'react';
import { usePreferences } from '../../hooks/usePreferences';
import { Sparkles, Check, X } from 'lucide-react';

const EDUCATION_LEVELS = [
  'SMP',
  'SMA/SMK',
  'Perguruan Tinggi',
  'Umum / Profesional',
];

const INTEREST_OPTIONS = [
  'Pemrograman',
  'Matematika Diskrit',
  'UI/UX',
  'Sains & Biologi',
  'Bahasa Asing',
  'Desain Grafis',
  'Manajemen Waktu',
  'Kecerdasan Buatan (AI)',
];

const VISUAL_STYLES = [
  'Minimalist',
  'Aesthetic',
  'Clean',
  'Dark Mode',
  'Cozy Desk',
  'Pastel Notes',
];

export default function SurveyModal({ isOpen, onClose, onComplete }) {
  const { preference, updatePreferences } = usePreferences();

  const [educationLevel, setEducationLevel] = useState('');
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [selectedStyles, setSelectedStyles] = useState([]);
  const [customTag, setCustomTag] = useState('');
  const [tags, setTags] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (preference) {
      setEducationLevel(preference.education_level || '');
      setSelectedInterests(preference.interests || []);
      setSelectedStyles(preference.favorite_visual_styles || []);
      setTags(preference.tags || []);
    }
  }, [preference]);

  if (!isOpen) return null;

  const toggleInterest = (val) => {
    setSelectedInterests((prev) =>
      prev.includes(val) ? prev.filter((i) => i !== val) : [...prev, val]
    );
  };

  const toggleStyle = (val) => {
    setSelectedStyles((prev) =>
      prev.includes(val) ? prev.filter((s) => s !== val) : [...prev, val]
    );
  };

  const addCustomTag = (e) => {
    e.preventDefault();
    if (customTag.trim() && !tags.includes(customTag.trim())) {
      setTags([...tags, customTag.trim()]);
      setCustomTag('');
    }
  };

  const removeTag = (t) => {
    setTags(tags.filter((x) => x !== t));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await updatePreferences({
        education_level: educationLevel,
        interests: selectedInterests,
        favorite_visual_styles: selectedStyles,
        tags: tags,
      });
      if (onComplete) onComplete();
      if (onClose) onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan preferensi');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Personalisasi Pengalaman Belajar</h2>
              <p className="text-xs text-gray-500">Sesuaikan rekomendasi materi, galeri, dan tips</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Education Level */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Jenjang Pendidikan
            </label>
            <div className="grid grid-cols-2 gap-2">
              {EDUCATION_LEVELS.map((lvl) => (
                <button
                  type="button"
                  key={lvl}
                  onClick={() => setEducationLevel(lvl)}
                  className={`px-3 py-2 text-xs font-medium rounded-lg border text-left flex items-center justify-between transition ${
                    educationLevel === lvl
                      ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {lvl}
                  {educationLevel === lvl && <Check className="w-3.5 h-3.5 text-blue-600" />}
                </button>
              ))}
            </div>
          </div>

          {/* Interests */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Minat & Fokus Belajar (Pilih beberapa)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {INTEREST_OPTIONS.map((item) => {
                const active = selectedInterests.includes(item);
                return (
                  <button
                    type="button"
                    key={item}
                    onClick={() => toggleInterest(item)}
                    className={`px-2.5 py-1 text-xs rounded-full border transition ${
                      active
                        ? 'border-blue-600 bg-blue-600 text-white font-medium'
                        : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Visual Styles */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Gaya Belajar & Estetika Ruang Kerja
            </label>
            <div className="flex flex-wrap gap-1.5">
              {VISUAL_STYLES.map((style) => {
                const active = selectedStyles.includes(style);
                return (
                  <button
                    type="button"
                    key={style}
                    onClick={() => toggleStyle(style)}
                    className={`px-2.5 py-1 text-xs rounded-full border transition ${
                      active
                        ? 'border-indigo-600 bg-indigo-600 text-white font-medium'
                        : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {style}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Tags */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Tag Tambahan (Opsional)
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                placeholder="Contoh: flashcard, pomodoro, stis"
                className="flex-1 px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={addCustomTag}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg"
              >
                + Tambah
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[11px]"
                  >
                    #{t}
                    <button
                      type="button"
                      onClick={() => removeTag(t)}
                      className="hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                Nanti Saja
              </button>
            )}
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition disabled:opacity-50"
            >
              {saving ? 'Menyimpan...' : 'Simpan Preferensi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
