import { useState } from 'react';
import { mutate } from 'swr';
import { useGrades } from '../../hooks/useGrades';
import { useSubjects } from '../../hooks/useSubjects';
import { Award, Plus, Trash2, Edit2, AlertCircle } from 'lucide-react';

const GRADE_TYPES = [
  { value: 'assignment', label: 'Tugas' },
  { value: 'quiz', label: 'Kuis' },
  { value: 'exam', label: 'Ujian (UTS/UAS)' },
  { value: 'project', label: 'Proyek' },
  { value: 'other', label: 'Lainnya' },
];

import PageHeader from '../../components/common/PageHeader';
import GlassLoader from '../../components/common/GlassLoader';

export default function GradePage() {
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedType, setSelectedType] = useState('');

  const { subjects } = useSubjects();
  const { grades, summary, loading, error, addGrade, editGrade, removeGrade } = useGrades({
    subject_id: selectedSubject || undefined,
    type: selectedType || undefined,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState(null);
  const [form, setForm] = useState({
    title: '',
    subject_id: '',
    type: 'assignment',
    category: 'Tugas',
    score: '',
    max_score: '100',
    date: new Date().toISOString().split('T')[0],
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  const openAddModal = () => {
    setEditingGrade(null);
    setForm({
      title: '',
      subject_id: subjects[0]?.id || '',
      type: 'assignment',
      category: 'Tugas',
      score: '',
      max_score: '100',
      date: new Date().toISOString().split('T')[0],
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (grade) => {
    setEditingGrade(grade);
    setForm({
      title: grade.title,
      subject_id: grade.subject_id,
      type: grade.type,
      category: grade.category || 'Tugas',
      score: grade.score,
      max_score: grade.max_score,
      date: grade.date ? grade.date.substring(0, 10) : '',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);

    const payload = {
      ...form,
      subject_id: Number(form.subject_id),
      score: Number(form.score),
      max_score: Number(form.max_score),
    };

    try {
      if (editingGrade) {
        await editGrade(editingGrade.id, payload);
      } else {
        await addGrade(payload);
      }
      setIsModalOpen(false);
      
      // SWR Mutate untuk sinkronisasi data
      mutate(key => typeof key === 'string' && key.startsWith('/grades'));
      mutate('/dashboard/summary');
    } catch (err) {
      setFormError(err.response?.data?.message || 'Gagal menyimpan nilai');
    } finally {
      setFormLoading(false);
    }
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 85) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (percentage >= 70) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (percentage >= 55) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader 
        title="Catatan Nilai Akademik" 
        subtitle="Pantau performa evaluasi tugas, kuis, dan ujian Anda"
      >
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition shadow-sm"
        >
          <Plus className="w-4 h-4" /> Tambah Nilai
        </button>
      </PageHeader>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Summary Cards per Subject */}
      {summary && summary.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {summary.map((sum) => {
            const avg = Math.round(sum.avg_percentage);
            return (
              <div
                key={sum.subject_id}
                className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: sum.subject?.color || '#3B82F6' }}
                    />
                    <h4 className="text-xs font-semibold text-gray-800 truncate max-w-[120px]">
                      {sum.subject?.name}
                    </h4>
                  </div>
                  <p className="text-[11px] text-gray-400">{sum.total} evaluasi</p>
                </div>
                <div className={`px-2.5 py-1 rounded-lg border text-sm font-bold ${getScoreColor(avg)}`}>
                  {avg}%
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
          Filter:
        </div>
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

        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="text-xs px-3 py-1.5 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none"
        >
          <option value="">Semua Tipe</option>
          {GRADE_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {/* Grades List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <GlassLoader />
        </div>
      ) : grades.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-gray-800">Belum ada nilai yang dicatat</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
            Catat hasil ujian dan tugas untuk memantau perkembangan akademik Anda.
          </p>
          <button
            onClick={openAddModal}
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            <Plus className="w-4 h-4" /> Catat Nilai Pertama
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-medium border-b border-gray-100">
                <tr>
                  <th className="px-5 py-3">Mata Pelajaran & Judul</th>
                  <th className="px-5 py-3">Tipe</th>
                  <th className="px-5 py-3">Tanggal</th>
                  <th className="px-5 py-3 text-right">Skor</th>
                  <th className="px-5 py-3">Kategori</th>
                  <th className="px-5 py-3 text-right">Persentase</th>
                  <th className="px-5 py-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {grades.map((g) => (
                  <tr key={g.id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: g.subject?.color || '#3B82F6' }}
                        />
                        <div>
                          <p className="font-semibold text-gray-900">{g.title}</p>
                          <p className="text-xs text-gray-500">{g.subject?.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded capitalize">
                        {g.type}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-500">
                      {new Date(g.date).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-5 py-3.5 text-right text-xs font-semibold text-gray-800">
                      {g.score} / {g.max_score}
                    </td>
                    <td className="px-5 py-3.5 text-xs font-medium text-gray-600">
                      <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[11px] font-semibold">
                        {g.category || 'Tugas'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded border inline-block ${getScoreColor(
                          g.percentage
                        )}`}
                      >
                        {g.percentage}%
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openEditModal(g)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-gray-100 transition"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeGrade(g.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Add / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {editingGrade ? 'Edit Catatan Nilai' : 'Tambah Catatan Nilai'}
            </h3>

            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Mata Pelajaran *
                </label>
                <select
                  required
                  value={form.subject_id}
                  onChange={(e) => setForm({ ...form, subject_id: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  disabled={formLoading}
                >
                  <option value="">-- Pilih Mata Pelajaran --</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Judul Evaluasi / Tugas *
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Contoh: Kuis 1 Aljabar Linier"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  disabled={formLoading}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Tipe *</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    disabled={formLoading}
                  >
                    {GRADE_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Kategori *</label>
                  <select
                    required
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    disabled={formLoading || !form.subject_id}
                  >
                    <option value="">-- Pilih Kategori --</option>
                    {(() => {
                      const selectedSub = subjects.find(s => s.id === Number(form.subject_id));
                      const categories = selectedSub?.category_weights ? Object.keys(selectedSub.category_weights) : ['Tugas', 'Kuis', 'UTS', 'UAS'];
                      return categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ));
                    })()}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Tanggal *</label>
                  <input
                    type="date"
                    required
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    disabled={formLoading}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Skor Diperoleh *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={form.score}
                    onChange={(e) => setForm({ ...form, score: e.target.value })}
                    placeholder="Contoh: 85"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    disabled={formLoading}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Skor Maksimal *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={form.max_score}
                    onChange={(e) => setForm({ ...form, max_score: e.target.value })}
                    placeholder="100"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    disabled={formLoading}
                  />
                </div>
              </div>

              {form.score && form.max_score && Number(form.max_score) > 0 && (
                <div className="p-3 bg-gray-50 rounded-lg text-xs text-gray-600 flex items-center justify-between">
                  <span>Estimasi Persentase:</span>
                  <span className="font-bold text-blue-600 text-sm">
                    {Math.round((Number(form.score) / Number(form.max_score)) * 100)}%
                  </span>
                </div>
              )}

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
  );
}
