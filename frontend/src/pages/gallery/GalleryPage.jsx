import { useState } from 'react';
import { useGallery } from '../../hooks/useGallery';
import { Image as ImageIcon, UploadCloud, Trash2, Sparkles, Tag, Eye, Lock, Globe, AlertTriangle } from 'lucide-react';
import client from '../../api/client';

export default function GalleryPage() {
  const [activeTab, setActiveTab] = useState('inspiration'); // 'personal' or 'inspiration'
  const { items, userTags, loading, error, addItem, removeItem } = useGallery(activeTab);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    visibility: 'private',
    tags: '',
    file: null,
  });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  // Reporting state
  const [reportingItem, setReportingItem] = useState(null);
  const [reportReason, setReportReason] = useState('');
  const [reportLoading, setReportLoading] = useState(false);
  const [reportMessage, setReportMessage] = useState(null);

  const handleOpenReport = (item) => {
    setReportingItem(item);
    setReportReason('');
    setReportMessage(null);
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (!reportReason.trim()) return;
    setReportLoading(true);
    try {
      await client.post('/reports', {
        reportable_id: reportingItem.id,
        reportable_type: 'gallery_item',
        reason: reportReason,
      });
      setReportMessage({ type: 'success', text: 'Laporan berhasil dikirim ke Admin.' });
      setTimeout(() => {
        setReportingItem(null);
        setReportMessage(null);
      }, 1500);
    } catch (err) {
      setReportMessage({ type: 'error', text: err.response?.data?.message || 'Gagal mengirim laporan.' });
    } finally {
      setReportLoading(false);
    }
  };

  const openAddModal = () => {
    setForm({
      title: '',
      description: '',
      visibility: 'private',
      tags: '',
      file: null,
    });
    setUploadError(null);
    setIsModalOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setUploadError('Ukuran gambar maksimal 10MB');
        return;
      }
      setForm((prev) => ({ ...prev, file }));
      setUploadError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.file) {
      setUploadError('Silakan pilih gambar yang ingin diunggah');
      return;
    }

    setUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('title', form.title);
    if (form.description) formData.append('description', form.description);
    formData.append('visibility', form.visibility);
    formData.append('type', 'personal');
    formData.append('image', form.file);

    if (form.tags) {
      const tagsArray = form.tags.split(',').map((t) => t.trim()).filter(Boolean);
      tagsArray.forEach((t, i) => formData.append(`tags[${i}]`, t));
    }

    try {
      await addItem(formData);
      setIsModalOpen(false);
      if (activeTab !== 'personal') setActiveTab('personal');
    } catch (err) {
      setUploadError(err.response?.data?.message || 'Gagal mengunggah gambar');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Galeri Inspirasi</h1>
          <p className="text-sm text-gray-500">
            Temukan inspirasi ruang belajar dan simpan koleksi visual Anda
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition shadow-sm"
        >
          <UploadCloud className="w-4 h-4" /> Unggah Gambar
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('inspiration')}
          className={`pb-3 text-sm font-medium border-b-2 transition flex items-center gap-2 ${
            activeTab === 'inspiration'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <Sparkles className="w-4 h-4" /> Rekomendasi Untukmu
        </button>
        <button
          onClick={() => setActiveTab('personal')}
          className={`pb-3 text-sm font-medium border-b-2 transition flex items-center gap-2 ${
            activeTab === 'personal'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <ImageIcon className="w-4 h-4" /> Koleksi Pribadi
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* User Tags Info (Inspiration Tab) */}
      {activeTab === 'inspiration' && userTags && userTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
          <span className="font-medium">Rekomendasi berdasarkan minat Anda:</span>
          {userTags.map((t) => (
            <span key={t} className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full border border-blue-100">
              #{t}
            </span>
          ))}
        </div>
      )}

      {/* Gallery Grid (Masonry-like using CSS columns) */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-gray-800">Belum ada gambar</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
            {activeTab === 'inspiration'
              ? 'Belum ada rekomendasi inspirasi yang cocok saat ini.'
              : 'Anda belum mengunggah gambar apapun ke koleksi pribadi.'}
          </p>
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="break-inside-avoid bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition group relative"
            >
              {/* Image */}
              <div className="relative bg-gray-100">
                <img
                  src={item.file_url}
                  alt={item.title}
                  className="w-full h-auto object-cover"
                  loading="lazy"
                />
                {/* Overlay actions */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-start justify-end p-2 gap-2">
                  {activeTab === 'personal' && (
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-1.5 bg-white/90 hover:bg-red-50 text-red-600 rounded-lg backdrop-blur-sm transition"
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  {activeTab === 'inspiration' && (
                    <button
                      onClick={() => handleOpenReport(item)}
                      className="p-1.5 bg-white/90 hover:bg-amber-50 text-amber-600 rounded-lg backdrop-blur-sm transition"
                      title="Laporkan Konten"
                    >
                      <AlertTriangle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-bold text-gray-900 text-sm leading-tight">{item.title}</h3>
                  {activeTab === 'personal' && (
                    <span title={item.visibility === 'public' ? 'Publik' : 'Pribadi'}>
                      {item.visibility === 'public' ? (
                        <Globe className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Lock className="w-3.5 h-3.5 text-gray-400" />
                      )}
                    </span>
                  )}
                </div>

                {item.description && (
                  <p className="text-xs text-gray-600 line-clamp-2 mb-3">{item.description}</p>
                )}

                {/* Tags */}
                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {item.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="inline-flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded bg-gray-100 text-gray-600"
                      >
                        <Tag className="w-2.5 h-2.5" /> {tag.name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Author Info (Inspiration Tab) */}
                {activeTab === 'inspiration' && item.user && (
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                    <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-[10px]">
                      {item.user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-[11px] text-gray-500 font-medium truncate">
                      {item.user.name}
                    </span>
                    {item.match_score > 0 && (
                      <span className="ml-auto text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                        {item.match_score} Match
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Upload */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Unggah Gambar Galeri</h3>

            {uploadError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                {uploadError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Judul *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Contoh: Setup Meja Belajar Baru"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  disabled={uploading}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Deskripsi</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Ceritakan sedikit tentang gambar ini..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  disabled={uploading}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Tag (Pisahkan dengan koma)
                </label>
                <input
                  type="text"
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  placeholder="Contoh: minimalist, desk setup, aesthetic"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  disabled={uploading}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Visibilitas</label>
                <select
                  value={form.visibility}
                  onChange={(e) => setForm({ ...form, visibility: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  disabled={uploading}
                >
                  <option value="private">Pribadi (Hanya saya)</option>
                  <option value="public">Publik (Bisa dilihat orang lain)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Pilih Gambar * (JPG, PNG, WEBP, max 10MB)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  required
                  onChange={handleFileChange}
                  className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                  disabled={uploading}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={uploading}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition disabled:opacity-50"
                >
                  {uploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Mengunggah...</span>
                    </>
                  ) : (
                    'Unggah Sekarang'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {reportingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-150">
            <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" /> Laporkan Konten
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              Apakah konten "{reportingItem.title}" melanggar panduan komunitas atau tidak pantas?
            </p>

            {reportMessage && (
              <div
                className={`p-3 rounded-lg text-xs mb-4 ${
                  reportMessage.type === 'success'
                    ? 'bg-green-50 text-green-700'
                    : 'bg-red-50 text-red-700'
                }`}
              >
                {reportMessage.text}
              </div>
            )}

            <form onSubmit={handleSubmitReport} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Alasan Laporan *
                </label>
                <textarea
                  rows={3}
                  required
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  placeholder="Jelaskan alasan laporan (contoh: spam, gambar tidak pantas, hak cipta)..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  disabled={reportLoading}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setReportingItem(null)}
                  disabled={reportLoading}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={reportLoading || !reportReason.trim()}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-sm transition disabled:opacity-50"
                >
                  {reportLoading ? 'Mengirim...' : 'Kirim Laporan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
