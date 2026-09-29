import { useState } from 'react';
import { useSubjects } from '../../hooks/useSubjects';
import { Plus, BookOpen, Trash2, Edit2, AlertCircle } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import GlassLoader from '../../components/common/GlassLoader';

export default function SubjectPage() {
  const { subjects, loading, error, addSubject, editSubject, removeSubject } = useSubjects();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [form, setForm] = useState({
    name: '',
    code: '',
    teacher: '',
    description: '',
    color: '#3B82F6',
    target_grade: '',
    category_weights: { Tugas: 20, Kuis: 10, UTS: 30, UAS: 40 },
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  const openAddModal = () => {
    setEditingSubject(null);
    setForm({ name: '', code: '', teacher: '', description: '', color: '#3B82F6', target_grade: '', category_weights: { Tugas: 20, Kuis: 10, UTS: 30, UAS: 40 } });
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (sub) => {
    setEditingSubject(sub);
    setForm({
      name: sub.name || '',
      code: sub.code || '',
      teacher: sub.teacher || '',
      description: sub.description || '',
      color: sub.color || '#3B82F6',
      target_grade: sub.target_grade || '',
      category_weights: sub.category_weights || { Tugas: 20, Kuis: 10, UTS: 30, UAS: 40 },
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleCategoryWeightChange = (cat, val) => {
    setForm(prev => ({
      ...prev,
      category_weights: { ...prev.category_weights, [cat]: Number(val) }
    }));
  };

  const addCategory = () => {
    const name = prompt('Nama Kategori Baru:');
    if (name && !form.category_weights[name]) {
      setForm(prev => ({
        ...prev,
        category_weights: { ...prev.category_weights, [name]: 0 }
      }));
    }
  };

  const removeCategory = (cat) => {
    setForm(prev => {
      const newWeights = { ...prev.category_weights };
      delete newWeights[cat];
      return { ...prev, category_weights: newWeights };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const totalWeight = Object.values(form.category_weights).reduce((a, b) => a + Number(b), 0);
    if (totalWeight !== 100) {
      setFormError(`Total bobot kategori harus 100%. Saat ini: ${totalWeight}%`);
      return;
    }

    setFormLoading(true);
    setFormError(null);

    const payload = {
      ...form,
      target_grade: form.target_grade !== '' ? Number(form.target_grade) : null,
    };

    try {
      if (editingSubject) {
        await editSubject(editingSubject.id, payload);
      } else {
        await addSubject(payload);
      }
      setIsModalOpen(false);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Gagal menyimpan mata pelajaran');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-cover bg-center rounded-2xl overflow-hidden">
      {/* WRAPPER KONTEN */}
      <div className="relative z-10 p-6 space-y-6">
      {/* Header */}
      <PageHeader 
        title="Mata Pelajaran & Kuliah" 
        subtitle="Daftar mata pelajaran yang Anda ikuti"
      >
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Tambah Mata Pelajaran
        </button>
      </PageHeader>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Grid List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <GlassLoader />
        </div>
      ) : subjects.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-dashed border-gray-300 p-12 text-center">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-gray-800">Belum ada mata pelajaran</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
            Daftarkan mata kuliah atau mata pelajaran untuk mengorganisasi tugas dan jadwal.
          </p>
          <button
            onClick={openAddModal}
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            <Plus className="w-4 h-4" /> Tambah sekarang
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((sub) => (
            <div
              key={sub.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 hover:border-blue-200 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: sub.color || '#3B82F6' }}
                    />
                    <h3 className="font-bold text-gray-900 truncate">{sub.name}</h3>
                  </div>
                  {sub.code && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono">
                      {sub.code}
                    </span>
                  )}
                </div>

                {sub.teacher && (
                  <p className="text-xs text-gray-500 mb-2">Pengajar: {sub.teacher}</p>
                )}

                {sub.description && (
                  <p className="text-xs text-gray-600 line-clamp-2 mb-3">{sub.description}</p>
                )}

                {sub.target_grade != null && (
                  <span className="inline-flex items-center gap-1 text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-medium mb-2">
                    🎯 KKM {sub.target_grade}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-2">
                <span className="text-xs text-gray-400">
                  {sub.tasks_count !== undefined ? `${sub.tasks_count} tugas aktif` : ''}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(sub)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-gray-100 transition"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => removeSubject(sub.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {editingSubject ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran Baru'}
            </h3>

            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Nama Mata Pelajaran *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Contoh: Algoritma & Pemrograman"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  disabled={formLoading}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Kode</label>
                  <input
                    type="text"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    placeholder="Contoh: CS101"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    disabled={formLoading}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Warna Label</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={form.color}
                      onChange={(e) => setForm({ ...form, color: e.target.value })}
                      className="h-9 w-12 rounded border border-gray-300 cursor-pointer"
                      disabled={formLoading}
                    />
                    <span className="text-xs font-mono text-gray-500">{form.color}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Pengajar / Dosen</label>
                <input
                  type="text"
                  value={form.teacher}
                  onChange={(e) => setForm({ ...form, teacher: e.target.value })}
                  placeholder="Nama pengajar"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  disabled={formLoading}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Target Nilai / KKM (Opsional)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={form.target_grade}
                  onChange={(e) => setForm({ ...form, target_grade: e.target.value })}
                  placeholder="Misal: 75 (Kosongkan untuk mengikuti default akun)"
                  className="w-full px-3 py-2 text-sm bg-white/70 backdrop-blur-md border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition shadow-inner placeholder:text-gray-400"
                  disabled={formLoading}
                />
              </div>

              <div className="border-t border-gray-100 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-medium text-gray-700">Bobot Kategori (%)</label>
                  <button type="button" onClick={addCategory} className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                    <Plus className="w-3 h-3" /> Tambah
                  </button>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {Object.entries(form.category_weights).map(([cat, weight]) => (
                    <div key={cat} className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 w-24 truncate">{cat}</span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={weight}
                        onChange={(e) => handleCategoryWeightChange(cat, e.target.value)}
                        className="w-20 px-2 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                      <button type="button" onClick={() => removeCategory(cat)} className="p-1 text-red-500 hover:bg-red-50 rounded">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-xs font-medium text-gray-500 flex justify-between">
                  <span>Total:</span>
                  <span className={Object.values(form.category_weights).reduce((a, b) => a + Number(b), 0) === 100 ? 'text-emerald-600' : 'text-red-600'}>
                    {Object.values(form.category_weights).reduce((a, b) => a + Number(b), 0)}%
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Deskripsi</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Keterangan singkat..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  disabled={formLoading}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={formLoading}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition disabled:opacity-50"
                >
                  {formLoading ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
