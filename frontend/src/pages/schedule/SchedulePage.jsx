import { useState } from 'react';
import { useSchedules } from '../../hooks/useSchedules';
import { useSubjects } from '../../hooks/useSubjects';
import { Calendar, Plus, Trash2, Edit2, Clock, MapPin, AlertCircle } from 'lucide-react';

const DAYS = [
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
  'Minggu',
];

export default function SchedulePage() {
  const { schedules, loading, error, addSchedule, editSchedule, removeSchedule } = useSchedules();
  const { subjects } = useSubjects();

  const [activeDay, setActiveDay] = useState(0); // 0: Senin
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [form, setForm] = useState({
    title: '',
    day: 0,
    start_time: '08:00',
    end_time: '09:40',
    type: 'class',
    location: '',
    subject_id: '',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  const openAddModal = (defaultDay = activeDay) => {
    setEditingSchedule(null);
    setForm({
      title: '',
      day: defaultDay,
      start_time: '08:00',
      end_time: '09:40',
      type: 'class',
      location: '',
      subject_id: '',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (sch) => {
    setEditingSchedule(sch);
    setForm({
      title: sch.title,
      day: sch.day,
      start_time: sch.start_time.substring(0, 5),
      end_time: sch.end_time.substring(0, 5),
      type: sch.type,
      location: sch.location || '',
      subject_id: sch.subject_id || '',
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
      subject_id: form.subject_id ? Number(form.subject_id) : null,
      day: Number(form.day),
    };

    try {
      if (editingSchedule) {
        await editSchedule(editingSchedule.id, payload);
      } else {
        await addSchedule(payload);
      }
      setIsModalOpen(false);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Gagal menyimpan jadwal');
    } finally {
      setFormLoading(false);
    }
  };

  const filteredSchedules = schedules.filter((s) => s.day === activeDay);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Jadwal Belajar & Kuliah</h1>
          <p className="text-sm text-gray-500">Susun agenda mingguan Anda dengan rapi</p>
        </div>
        <button
          onClick={() => openAddModal(activeDay)}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Tambah Jadwal
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Day Selector Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-gray-200">
        {DAYS.map((day, idx) => {
          const count = schedules.filter((s) => s.day === idx).length;
          const isActive = activeDay === idx;
          return (
            <button
              key={day}
              onClick={() => setActiveDay(idx)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition flex items-center gap-2 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span>{day}</span>
              {count > 0 && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-blue-700 text-white' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Schedule Items for Active Day */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : filteredSchedules.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-gray-800">Tidak ada jadwal pada hari {DAYS[activeDay]}</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
            Gunakan tombol tambah untuk membuat jadwal kelas atau sesi belajar mandiri.
          </p>
          <button
            onClick={() => openAddModal(activeDay)}
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            <Plus className="w-4 h-4" /> Tambah Jadwal Hari Ini
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSchedules.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl p-5 border border-gray-200 hover:border-blue-200 transition shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider ${
                      item.type === 'class'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {item.type === 'class' ? 'Kuliah / Kelas' : 'Belajar Mandiri'}
                  </span>
                  {item.subject && (
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded border"
                      style={{
                        borderColor: `${item.subject.color}40`,
                        backgroundColor: `${item.subject.color}15`,
                        color: item.subject.color,
                      }}
                    >
                      {item.subject.name}
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-gray-900 text-base mb-2">{item.title}</h3>

                <div className="space-y-1.5 text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    <span>
                      {item.start_time.substring(0, 5)} - {item.end_time.substring(0, 5)} WIB
                    </span>
                  </div>

                  {item.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      <span>{item.location}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-1 pt-3 border-t border-gray-100 mt-4">
                <button
                  onClick={() => openEditModal(item)}
                  className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-gray-100 transition"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => removeSchedule(item.id)}
                  className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Add / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {editingSchedule ? 'Edit Jadwal' : 'Tambah Jadwal Baru'}
            </h3>

            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Judul Agenda / Kelas *
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Contoh: Kuliah Kecerdasan Buatan"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  disabled={formLoading}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Hari *</label>
                  <select
                    value={form.day}
                    onChange={(e) => setForm({ ...form, day: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    disabled={formLoading}
                  >
                    {DAYS.map((d, i) => (
                      <option key={d} value={i}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Tipe *</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    disabled={formLoading}
                  >
                    <option value="class">Kelas / Kuliah</option>
                    <option value="study">Belajar Mandiri</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Waktu Mulai *</label>
                  <input
                    type="time"
                    required
                    value={form.start_time}
                    onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    disabled={formLoading}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Waktu Selesai *</label>
                  <input
                    type="time"
                    required
                    value={form.end_time}
                    onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    disabled={formLoading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Mata Pelajaran (Opsional)</label>
                <select
                  value={form.subject_id}
                  onChange={(e) => setForm({ ...form, subject_id: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  disabled={formLoading}
                >
                  <option value="">-- Tanpa Mata Pelajaran --</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Ruangan / Lokasi</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="Contoh: Gedung B Ruang 204 / Zoom"
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
  );
}
