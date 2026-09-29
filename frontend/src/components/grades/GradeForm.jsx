import { AlertCircle } from 'lucide-react';

const GRADE_TYPES = [
  { value: 'assignment', label: 'Tugas' },
  { value: 'quiz', label: 'Kuis' },
  { value: 'exam', label: 'Ujian (UTS/UAS)' },
  { value: 'project', label: 'Proyek' },
  { value: 'other', label: 'Lainnya' },
];

// ponytail: single form component, extract to hook when reused elsewhere
export default function GradeForm({
  form,
  setForm,
  subjects = [],
  grades = [],
  editingGrade = null,
  onSubmit,
  onCancel,
  formLoading = false,
  formError = null,
}) {
  const selectedSubject = subjects.find(s => s.id === Number(form.subject_id));
  const categories = selectedSubject?.category_weights ? Object.keys(selectedSubject.category_weights) : ['Tugas', 'Kuis', 'UTS', 'UAS'];

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {formError && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">{formError}</div>
      )}

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Mata Pelajaran *</label>
        <select
          required
          value={form.subject_id}
          onChange={(e) => setForm({ ...form, subject_id: e.target.value })}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          disabled={formLoading}
        >
          <option value="">-- Pilih Mata Pelajaran --</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Nama Evaluasi *</label>
        <input
          type="text"
          required
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Contoh: UTS"
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
              <option key={t.value} value={t.value}>{t.label}</option>
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
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Nilai (0-100) *</label>
          <input
            type="number"
            step="0.01"
            min="0"
            required
            value={form.score}
            onChange={(e) => setForm({ ...form, score: e.target.value })}
            placeholder="85"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            disabled={formLoading}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Skor Maks *</label>
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
      </div>

      {form.score && form.max_score && Number(form.max_score) > 0 && (
        <div className="p-3 bg-gray-50 rounded-lg text-xs text-gray-600 flex items-center justify-between">
          <span>Estimasi Persentase:</span>
          <span className="font-bold text-blue-600 text-sm">{Math.round((Number(form.score) / Number(form.max_score)) * 100)}%</span>
        </div>
      )}

      <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
        <button type="button" onClick={onCancel} disabled={formLoading} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition">Batal</button>
        <button type="submit" disabled={formLoading} className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition disabled:opacity-50">
          {formLoading ? 'Menyimpan...' : 'Simpan'}
        </button>
      </div>
    </form>
  );
}
