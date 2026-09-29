import { useState, useMemo } from 'react';
import { useTodos } from '../../hooks/useTodos';
import { useSubjects } from '../../hooks/useSubjects';
import {
  Plus,
  Search,
  CheckCircle2,
  Circle,
  Clock,
  Calendar,
  Trash2,
  Edit2,
  AlertCircle,
  Tag,
} from 'lucide-react';

const priorityBadges = {
  high: { label: 'Tinggi', class: 'bg-red-50 text-red-700 border-red-200' },
  medium: { label: 'Sedang', class: 'bg-amber-50 text-amber-700 border-amber-200' },
  low: { label: 'Rendah', class: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
};

import PageHeader from '../../components/common/PageHeader';
import GlassLoader from '../../components/common/GlassLoader';

export default function TodoPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');

  const queryParams = useMemo(() => {
    const params = {};
    if (search) params.search = search;
    if (statusFilter) params.status = statusFilter;
    if (priorityFilter) params.priority = priorityFilter;
    if (subjectFilter) params.subject_id = subjectFilter;
    return params;
  }, [search, statusFilter, priorityFilter, subjectFilter]);

  const { tasks, loading, error, addTask, editTask, removeTask, toggleTask } = useTodos(queryParams);
  const { subjects } = useSubjects();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    subject_id: '',
    priority: 'medium',
    due_date: '',
    due_time: '',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  const openAddModal = () => {
    setEditingTask(null);
    setForm({
      title: '',
      description: '',
      subject_id: '',
      priority: 'medium',
      due_date: '',
      due_time: '',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setForm({
      title: task.title || '',
      description: task.description || '',
      subject_id: task.subject_id || '',
      priority: task.priority || 'medium',
      due_date: task.due_date ? task.due_date.substring(0, 10) : '',
      due_time: task.due_time ? task.due_time.substring(0, 5) : '',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);

    const payload = {
      ...form,
      subject_id: form.subject_id || null,
      due_date: form.due_date || null,
      due_time: form.due_time || null,
    };

    try {
      if (editingTask) {
        await editTask(editingTask.id, payload);
      } else {
        await addTask(payload);
      }
      setIsModalOpen(false);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Gagal menyimpan tugas');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader 
        title="Daftar Tugas" 
        subtitle="Kelola dan selesaikan target belajar Anda"
      >
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Tambah Tugas
        </button>
      </PageHeader>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Cari tugas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Semua Status</option>
          <option value="pending">Tertunda</option>
          <option value="in_progress">Sedang Dikerjakan</option>
          <option value="completed">Selesai</option>
        </select>

        {/* Priority Filter */}
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Semua Prioritas</option>
          <option value="high">Tinggi</option>
          <option value="medium">Sedang</option>
          <option value="low">Rendah</option>
        </select>

        {/* Subject Filter */}
        <select
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Semua Mata Pelajaran</option>
          {subjects.map((sub) => (
            <option key={sub.id} value={sub.id}>
              {sub.name}
            </option>
          ))}
        </select>
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-12">
          <GlassLoader />
        </div>
      ) : tasks.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <CheckCircle2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-gray-800">Belum ada tugas</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
            Mulai rencanakan belajar Anda dengan menambahkan tugas pertama hari ini.
          </p>
          <button
            onClick={openAddModal}
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            <Plus className="w-4 h-4" /> Tambah tugas sekarang
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => {
            const isCompleted = task.status === 'completed';
            const badge = priorityBadges[task.priority] || priorityBadges.medium;

            return (
              <div
                key={task.id}
                className={`bg-white rounded-xl p-4 border transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isCompleted ? 'border-gray-200 bg-gray-50/50 opacity-75' : 'border-gray-200 hover:border-blue-300 shadow-sm'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <button
                    onClick={() => toggleTask(task.id)}
                    className="mt-0.5 text-gray-400 hover:text-blue-600 transition flex-shrink-0"
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>

                  <div className="min-w-0">
                    <h4
                      className={`text-sm font-medium text-gray-900 truncate ${
                        isCompleted ? 'line-through text-gray-400' : ''
                      }`}
                    >
                      {task.title}
                    </h4>
                    {task.description && (
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                        {task.description}
                      </p>
                    )}

                    {/* Metadata tags */}
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      {task.subject && (
                        <span
                          className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded border"
                          style={{
                            borderColor: `${task.subject.color}40`,
                            backgroundColor: `${task.subject.color}15`,
                            color: task.subject.color,
                          }}
                        >
                          <Tag className="w-3 h-3" />
                          {task.subject.name}
                        </span>
                      )}

                      <span
                        className={`text-[11px] font-medium px-2 py-0.5 rounded border ${badge.class}`}
                      >
                        {badge.label}
                      </span>

                      {task.due_date && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-gray-500">
                          <Calendar className="w-3 h-3" />
                          {task.due_date.substring(0, 10)}
                        </span>
                      )}

                      {task.due_time && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-gray-500">
                          <Clock className="w-3 h-3" />
                          {task.due_time.substring(0, 5)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 self-end sm:self-center">
                  <button
                    onClick={() => openEditModal(task)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-gray-100 transition"
                    title="Edit Tugas"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => removeTask(task.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100 transition"
                    title="Hapus Tugas"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Add / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {editingTask ? 'Edit Tugas' : 'Tambah Tugas Baru'}
            </h3>

            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Judul Tugas *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Contoh: Menyelesaikan Resume Bab 3"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  disabled={formLoading}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Deskripsi</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Catatan detail mengenai tugas ini..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  disabled={formLoading}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Mata Pelajaran</label>
                  <select
                    value={form.subject_id}
                    onChange={(e) => setForm({ ...form, subject_id: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    disabled={formLoading}
                  >
                    <option value="">Tanpa Mata Pelajaran</option>
                    {subjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Prioritas</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    disabled={formLoading}
                  >
                    <option value="low">Rendah</option>
                    <option value="medium">Sedang</option>
                    <option value="high">Tinggi</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Tenggat Tanggal</label>
                  <input
                    type="date"
                    value={form.due_date}
                    onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    disabled={formLoading}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Waktu</label>
                  <input
                    type="time"
                    value={form.due_time}
                    onChange={(e) => setForm({ ...form, due_time: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    disabled={formLoading}
                  />
                </div>
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
                  {formLoading ? 'Menyimpan...' : 'Simpan Tugas'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
