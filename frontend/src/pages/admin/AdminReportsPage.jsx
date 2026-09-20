import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { Flag, CheckCircle, Clock, AlertTriangle, ExternalLink } from 'lucide-react';

const AdminReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await adminService.getReports();
      setReports(data);
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status, action_taken = null) => {
    setUpdatingId(id);
    try {
      await adminService.updateReportStatus(id, { status, action_taken });
      setReports((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status, action_taken: action_taken || r.action_taken } : r))
      );
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredReports = reports.filter((r) => {
    if (filter === 'all') return true;
    return r.status === filter;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
            <Clock className="w-3 h-3 mr-1" /> Pending
          </span>
        );
      case 'reviewed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <AlertTriangle className="w-3 h-3 mr-1" /> Ditinjau
          </span>
        );
      case 'resolved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" /> Selesai
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Moderasi Laporan</h1>
          <p className="text-sm text-gray-500">Kelola laporan konten publik dari pengguna.</p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center space-x-2 bg-gray-200 p-1 rounded-lg self-start">
          {['all', 'pending', 'reviewed', 'resolved'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors ${
                filter === f
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {f === 'all' ? 'Semua' : f}
            </button>
          ))}
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
        {filteredReports.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Flag className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="font-medium">Tidak ada laporan ditemukan.</p>
          </div>
        ) : (
          filteredReports.map((report) => (
            <div key={report.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {getStatusBadge(report.status)}
                    <span className="text-xs text-gray-400">
                      ID #{report.id} • {new Date(report.created_at).toLocaleString('id-ID')}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-gray-900">
                    Alasan: <span className="font-normal text-gray-700">{report.reason}</span>
                  </h3>
                </div>

                {/* Status Action Buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  {report.status !== 'reviewed' && report.status !== 'resolved' && (
                    <button
                      onClick={() => handleUpdateStatus(report.id, 'reviewed')}
                      disabled={updatingId === report.id}
                      className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-medium transition-colors"
                    >
                      Tinjau
                    </button>
                  )}
                  {report.status !== 'resolved' && (
                    <button
                      onClick={() => handleUpdateStatus(report.id, 'resolved', 'Laporan diselesaikan')}
                      disabled={updatingId === report.id}
                      className="px-3 py-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg text-xs font-medium transition-colors"
                    >
                      Selesaikan
                    </button>
                  )}
                  {report.status === 'resolved' && (
                    <button
                      onClick={() => handleUpdateStatus(report.id, 'pending')}
                      disabled={updatingId === report.id}
                      className="px-3 py-1.5 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg text-xs font-medium transition-colors"
                    >
                      Buka Kembali
                    </button>
                  )}
                </div>
              </div>

              {/* Reported details */}
              <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600 grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                <div>
                  <span className="font-medium text-gray-800">Pelapor:</span>{' '}
                  {report.reporter ? `${report.reporter.name} (${report.reporter.email})` : 'Anonim'}
                </div>
                <div>
                  <span className="font-medium text-gray-800">Tipe Konten:</span>{' '}
                  {report.reportable_type?.split('\\').pop() || 'Konten'}
                </div>
                {report.reportable && (
                  <div className="col-span-full">
                    <span className="font-medium text-gray-800">Judul Konten:</span>{' '}
                    {report.reportable.title || report.reportable.name || `ID #${report.reportable_id}`}
                  </div>
                )}
                {report.action_taken && (
                  <div className="col-span-full text-green-700 bg-green-50 p-2 rounded">
                    <span className="font-medium">Tindakan Diambil:</span> {report.action_taken}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminReportsPage;
