import { useState } from 'react';
import { useLearningResults } from '../../hooks/useLearningResults';
import { useSubjects } from '../../hooks/useSubjects';
import {
  FileText,
  UploadCloud,
  Trash2,
  Download,
  AlertCircle,
  File,
  Eye,
  Lock,
  Globe,
} from 'lucide-react';

import PageHeader from '../../components/common/PageHeader';
import GlassLoader from '../../components/common/GlassLoader';

export default function LearningResultPage() {
  const [selectedSubject, setSelectedSubject] = useState('');
  const { subjects } = useSubjects();
  const { results, loading, error, addResult, removeResult } = useLearningResults(
    selectedSubject || null
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    subject_id: '',
    visibility: 'private',
    file: null,
  });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const openAddModal = () => {
    setForm({
      title: '',
      description: '',
      subject_id: subjects[0]?.id || '',
      visibility: 'private',
      file: null,
    });
    setUploadError(null);
    setIsModalOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setUploadError('Ukuran berkas maksimal 10MB');
        return;
      }
      setForm((prev) => ({ ...prev, file }));
      setUploadError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.file) {
      setUploadError('Silakan pilih berkas yang ingin diunggah');
      return;
    }

    setUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('title', form.title);
    if (form.description) formData.append('description', form.description);
    if (form.subject_id) formData.append('subject_id', form.subject_id);
    formData.append('visibility', form.visibility);
    formData.append('file', form.file);

    try {
      await addResult(formData);
      setIsModalOpen(false);
    } catch (err) {
      setUploadError(err.response?.data?.message || 'Gagal mengunggah berkas');
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader 
        title="Berkas & Hasil Belajar" 
        subtitle="Simpan catatan, dokumen tugas, sertifikat, dan artefak belajar Anda"
      >
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition shadow-sm"
        >
          <UploadCloud className="w-4 h-4" /> Unggah Berkas
        </button>
      </PageHeader>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
        <span className="text-xs text-gray-500 font-medium">Filter Mata Pelajaran:</span>
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="text-xs px-3 py-1.5 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none"
        >
          <option value="">Semua Mata Pelajaran</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* Results Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <GlassLoader />
        </div>
      ) : results.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-gray-800">Belum ada berkas hasil belajar</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
            Unggah tugas, rangkuman, atau sertifikat untuk mendokumentasikan pencapaian belajar Anda.
          </p>
          <button
            onClick={openAddModal}
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            <UploadCloud className="w-4 h-4" /> Unggah Berkas Pertama
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl p-5 border border-gray-200 hover:border-blue-200 transition shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                      <File className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm truncate max-w-[180px]">
                        {item.title}
                      </h3>
                      <p className="text-[11px] text-gray-400">{formatFileSize(item.file_size)}</p>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded ${
                      item.visibility === 'public'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {item.visibility === 'public' ? (
                      <>
                        <Globe className="w-3 h-3" /> Publik
                      </>
                    ) : (
                      <>
                        <Lock className="w-3 h-3" /> Pribadi
                      </>
                    )}
                  </span>
                </div>

                {item.description && (
                  <p className="text-xs text-gray-600 line-clamp-2 my-2">{item.description}</p>
                )}

                {item.subject && (
                  <div className="mt-3">
                    <span
                      className="text-[11px] font-medium px-2 py-0.5 rounded border"
                      style={{
                        borderColor: `${item.subject.color}40`,
                        backgroundColor: `${item.subject.color}15`,
                        color: item.subject.color,
                      }}
                    >
                      {item.subject.name}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-4">
                <span className="text-[11px] text-gray-400">
                  {new Date(item.created_at).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
                <div className="flex items-center gap-1">
                  {item.file_url && (
                    <a
                      href={item.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-gray-100 transition"
                      title="Lihat / Unduh"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  )}
                  <button
                    onClick={() => removeResult(item.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100 transition"
                    title="Hapus"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Upload */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Unggah Berkas Belajar</h3>

            {uploadError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                {uploadError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Judul Berkas / Tugas *
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Contoh: Laporan Akhir Praktikum Web"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  disabled={uploading}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Mata Pelajaran
                  </label>
                  <select
                    value={form.subject_id}
                    onChange={(e) => setForm({ ...form, subject_id: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    disabled={uploading}
                  >
                    <option value="">-- Umum --</option>
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Visibilitas
                  </label>
                  <select
                    value={form.visibility}
                    onChange={(e) => setForm({ ...form, visibility: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    disabled={uploading}
                  >
                    <option value="private">Pribadi</option>
                    <option value="public">Publik</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Deskripsi</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Catatan singkat tentang berkas ini..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  disabled={uploading}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Pilih Berkas * (PDF, DOC, Gambar, ZIP, max 10MB)
                </label>
                <input
                  type="file"
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
                    <GlassLoader small text="Mengunggah..." />
                  ) : (
                    'Unggah Sekarang'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
