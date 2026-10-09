import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  LayoutDashboard,
  Search,
  Filter,
  Trash2,
  Eye,
  ChevronDown,
  Plus,
  X,
  Calendar,
  Clock,
  FileClock,
  PackageCheck,
  Gauge,
  Loader2,
  ShieldCheck,
  User,
  Phone,
  MapPin,
  FileText,
  MessageSquare,
  TrendingUp,
  CheckCircle2,
} from 'lucide-react';
import {
  SERVICE_TYPES,
  STATUS_FLOW,
  STATUS_LABELS,
  STATUS_COLORS,
  DUSUN_RT_OPTIONS,
  type Registration,
  type RegistrationStatus,
} from '@/types';
import {
  fetchRegistrations,
  updateRegistrationStatus,
  deleteRegistration,
  insertWalkInRegistration,
} from '@/lib/api';

interface DashboardProps {
  onLogin: () => void;
}

export default function Dashboard({ onLogin }: DashboardProps) {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);

  const [data, setData] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterService, setFilterService] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [detailItem, setDetailItem] = useState<Registration | null>(null);
  const [walkInOpen, setWalkInOpen] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const regs = await fetchRegistrations();
      setData(regs);
    } catch {
      // keep empty
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authed) loadData();
  }, [authed, loadData]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') {
      setAuthed(true);
      setLoginError(false);
    } else {
      setLoginError(true);
    }
  };

  const filtered = useMemo(() => {
    return data.filter((r) => {
      const matchSearch =
        !searchQuery ||
        r.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.tracking_code.toLowerCase().includes(searchQuery.toLowerCase());
      const matchService = !filterService || r.service_type === filterService;
      const matchStatus = !filterStatus || r.status === filterStatus;
      return matchSearch && matchService && matchStatus;
    });
  }, [data, searchQuery, filterService, filterStatus]);

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayCount = data.filter(
      (r) => r.created_at.split('T')[0] === today
    ).length;
    const pending = data.filter(
      (r) => r.status === 'diajukan' || r.status === 'verifikasi' || r.status === 'diproses'
    ).length;
    const readyPickup = data.filter((r) => r.status === 'siap_diambil').length;

    const completed = data.filter((r) => r.status === 'selesai' && r.completed_at);
    let avgMinutes = 0;
    if (completed.length > 0) {
      const totalMs = completed.reduce((sum, r) => {
        const diff = new Date(r.completed_at!).getTime() - new Date(r.created_at).getTime();
        return sum + diff;
      }, 0);
      avgMinutes = Math.round(totalMs / completed.length / 60000);
    }

    return { todayCount, pending, readyPickup, avgMinutes };
  }, [data]);

  const handleStatusUpdate = async (id: string, status: RegistrationStatus) => {
    try {
      await updateRegistrationStatus(id, status);
      setData((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                status,
                updated_at: new Date().toISOString(),
                completed_at: status === 'selesai' ? new Date().toISOString() : r.completed_at,
              }
            : r
        )
      );
      if (detailItem?.id === id) {
        setDetailItem({ ...detailItem, status });
      }
    } catch {
      // ignore
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus data pengajuan ini? Tindakan ini tidak dapat dibatalkan.')) return;
    try {
      await deleteRegistration(id);
      setData((prev) => prev.filter((r) => r.id !== id));
      if (detailItem?.id === id) setDetailItem(null);
    } catch {
      // ignore
    }
  };

  const handleWalkInSubmit = async (payload: {
    full_name: string;
    phone: string;
    dusun_rt: string;
    service_type: string;
    planned_visit_date: string;
    notes: string;
  }) => {
    const reg = await insertWalkInRegistration({
      full_name: payload.full_name,
      phone: payload.phone,
      dusun_rt: payload.dusun_rt,
      service_type: payload.service_type,
      planned_visit_date: payload.planned_visit_date,
      notes: payload.notes || null,
    });
    setData((prev) => [reg, ...prev]);
    setWalkInOpen(false);
  };

  // Login Screen
  if (!authed) {
    return (
      <div className="animate-fade-in min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50 px-4">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 max-w-sm w-full">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-slate-700 to-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Login Operator</h2>
            <p className="text-sm text-slate-500 mt-1">Masuk untuk mengelola pengajuan layanan</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Username
              </label>
              <input
                type="text"
                defaultValue="operator"
                disabled
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setLoginError(false);
                }}
                placeholder="Masukkan password"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-slate-200 focus:border-slate-400 outline-none transition-colors"
              />
              {loginError && (
                <p className="mt-1.5 text-xs text-error-600">Password salah. Coba lagi.</p>
              )}
            </div>
            <div className="rounded-lg bg-blue-50 border border-blue-100 p-3">
              <p className="text-xs text-blue-700">
                <strong>Demo:</strong> Password adalah <code className="font-mono font-bold">admin123</code>
              </p>
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2.5 bg-slate-800 text-white text-sm font-semibold rounded-xl hover:bg-slate-700 transition-colors shadow-sm"
            >
              Masuk
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in bg-slate-50 min-h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                <LayoutDashboard className="w-6 h-6" />
                Dashboard Operator
              </h1>
              <p className="text-slate-300 mt-1 text-sm">
                Kelola pengajuan layanan administrasi Desa Jatimulyo
              </p>
            </div>
            <button
              onClick={() => setWalkInOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-accent-500 text-white text-sm font-semibold rounded-xl hover:bg-accent-600 transition-colors shadow-md"
            >
              <Plus className="w-4 h-4" />
              Tambah Walk-in
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<Calendar className="w-5 h-5" />}
            label="Pengajuan Hari Ini"
            value={stats.todayCount.toString()}
            color="bg-primary-500"
            bg="bg-primary-50"
            textColor="text-primary-700"
          />
          <StatCard
            icon={<FileClock className="w-5 h-5" />}
            label="Perlu Diproses"
            value={stats.pending.toString()}
            color="bg-amber-500"
            bg="bg-amber-50"
            textColor="text-amber-700"
          />
          <StatCard
            icon={<PackageCheck className="w-5 h-5" />}
            label="Siap Diambil"
            value={stats.readyPickup.toString()}
            color="bg-teal-500"
            bg="bg-teal-50"
            textColor="text-teal-700"
          />
          <StatCard
            icon={<Gauge className="w-5 h-5" />}
            label="Rata-rata Waktu"
            value={stats.avgMinutes > 0 ? `${stats.avgMinutes} mnt` : '-'}
            color="bg-success-500"
            bg="bg-success-50"
            textColor="text-success-700"
          />
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Toolbar */}
          <div className="px-5 py-4 border-b border-slate-100 flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between">
            <h2 className="font-bold text-slate-800 text-sm">
              Manajemen Pengajuan
              <span className="ml-2 text-xs font-normal text-slate-400">
                ({filtered.length} dari {data.length})
              </span>
            </h2>
            <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
              <div className="relative flex-1 lg:w-56">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama / kode..."
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none transition-colors"
                />
              </div>
              <select
                value={filterService}
                onChange={(e) => setFilterService(e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none transition-colors bg-white"
              >
                <option value="">Semua Layanan</option>
                {SERVICE_TYPES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none transition-colors bg-white"
              >
                <option value="">Semua Status</option>
                {STATUS_FLOW.map((s) => (
                  <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-sm text-slate-400">Tidak ada data pengajuan yang cocok</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-4 py-3 text-left font-semibold text-slate-600 text-xs uppercase tracking-wide">Kode</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600 text-xs uppercase tracking-wide">Tanggal</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600 text-xs uppercase tracking-wide">Nama Warga</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600 text-xs uppercase tracking-wide hidden md:table-cell">Layanan</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600 text-xs uppercase tracking-wide hidden lg:table-cell">Tgl Datang</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600 text-xs uppercase tracking-wide">Status</th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-600 text-xs uppercase tracking-wide">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs font-semibold text-slate-700">
                          {r.tracking_code}
                        </span>
                        {r.is_walk_in && (
                          <span className="ml-1.5 px-1.5 py-0.5 bg-accent-100 text-accent-700 text-[10px] font-bold rounded">
                            WALK-IN
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                        {formatDateShort(r.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-slate-800">{r.full_name}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600 hidden md:table-cell">
                        {r.service_type}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500 hidden lg:table-cell whitespace-nowrap">
                        {formatDateShort(r.planned_visit_date)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusDropdown
                          status={r.status}
                          onChange={(s) => handleStatusUpdate(r.id, s)}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setDetailItem(r)}
                            className="p-1.5 text-slate-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                            title="Lihat Detail"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(r.id)}
                            className="p-1.5 text-slate-500 hover:text-error-600 hover:bg-error-50 rounded-lg transition-colors"
                            title="Hapus"
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
          )}
        </div>

        {/* SDGs Info */}
        <div className="mt-6 rounded-xl bg-gradient-to-r from-primary-50 to-accent-50 border border-primary-100 p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">Evaluasi SDGs 16</p>
            <p className="text-xs text-slate-500">
              Rata-rata waktu pelayanan digunakan untuk evaluasi kualitas pelayanan publik
              yang akuntabel dan transparan.
            </p>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {detailItem && (
        <DetailModal item={detailItem} onClose={() => setDetailItem(null)} />
      )}

      {/* Walk-in Modal */}
      {walkInOpen && (
        <WalkInModal
          onClose={() => setWalkInOpen(false)}
          onSubmit={handleWalkInSubmit}
        />
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
  bg,
  textColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
  bg: string;
  textColor: string;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center text-white shadow-sm`}>
          {icon}
        </div>
        <div className="flex-1">
          <p className="text-2xl font-bold text-slate-800">{value}</p>
        </div>
      </div>
      <p className="text-xs text-slate-500 font-medium">{label}</p>
    </div>
  );
}

function StatusDropdown({
  status,
  onChange,
}: {
  status: RegistrationStatus;
  onChange: (s: RegistrationStatus) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border cursor-pointer transition-all hover:shadow-sm ${STATUS_COLORS[status]}`}
      >
        {STATUS_LABELS[status]}
        <ChevronDown className="w-3 h-3" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute z-20 mt-1 left-0 w-44 bg-white rounded-xl shadow-lg border border-slate-200 py-1 animate-scale-in">
            {STATUS_FLOW.map((s) => (
              <button
                key={s}
                onClick={() => {
                  onChange(s);
                  setOpen(false);
                }}
                className={`flex items-center gap-2 w-full px-3 py-2 text-left text-xs hover:bg-slate-50 transition-colors ${
                  s === status ? 'font-semibold text-slate-900' : 'text-slate-600'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${
                  STATUS_FLOW.indexOf(s) <= STATUS_FLOW.indexOf(status) ? 'bg-success-500' : 'bg-slate-300'
                }`} />
                {STATUS_LABELS[s]}
                {s === status && <CheckCircle2 className="w-3 h-3 ml-auto text-success-600" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function DetailModal({ item, onClose }: { item: Registration; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-scale-in max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800">Detail Pengajuan</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="text-center pb-4 border-b border-slate-100">
            <p className="text-xs text-slate-500">Kode Tracking</p>
            <p className="text-lg font-bold text-slate-800 font-mono">{item.tracking_code}</p>
            {item.is_walk_in && (
              <span className="inline-block mt-1 px-2 py-0.5 bg-accent-100 text-accent-700 text-xs font-bold rounded">
                Walk-in (Offline)
              </span>
            )}
          </div>
          <DetailRow icon={<User className="w-4 h-4" />} label="Nama Lengkap" value={item.full_name} />
          <DetailRow icon={<Phone className="w-4 h-4" />} label="No. WhatsApp/HP" value={item.phone} />
          <DetailRow icon={<MapPin className="w-4 h-4" />} label="Dusun / RT" value={item.dusun_rt} />
          <DetailRow icon={<FileText className="w-4 h-4" />} label="Jenis Layanan" value={item.service_type} />
          <DetailRow icon={<Calendar className="w-4 h-4" />} label="Tanggal Datang" value={formatDateLong(item.planned_visit_date)} />
          <DetailRow icon={<Clock className="w-4 h-4" />} label="Tanggal Daftar" value={formatDateTime(item.created_at)} />
          <div className="flex items-center justify-between py-2">
            <span className="text-xs text-slate-500">Status</span>
            <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${STATUS_COLORS[item.status]}`}>
              {STATUS_LABELS[item.status]}
            </span>
          </div>
          {item.notes && (
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs text-slate-500 flex items-center gap-1.5 mb-1">
                <MessageSquare className="w-3.5 h-3.5" /> Catatan Warga
              </p>
              <p className="text-sm text-slate-700">{item.notes}</p>
            </div>
          )}
          {item.officer_note && (
            <div className="rounded-xl bg-accent-50 border border-accent-100 p-3">
              <p className="text-xs text-accent-700 font-medium flex items-center gap-1.5 mb-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Catatan Petugas
              </p>
              <p className="text-sm text-accent-800">{item.officer_note}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center shrink-0 text-slate-500">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-sm font-medium text-slate-800">{value}</p>
      </div>
    </div>
  );
}

function WalkInModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (payload: {
    full_name: string;
    phone: string;
    dusun_rt: string;
    service_type: string;
    planned_visit_date: string;
    notes: string;
  }) => Promise<void>;
}) {
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    dusun_rt: '',
    service_type: '',
    planned_visit_date: new Date().toISOString().split('T')[0],
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.full_name.trim()) errs.full_name = 'Wajib diisi';
    if (!form.phone.trim()) errs.phone = 'Wajib diisi';
    if (!form.dusun_rt) errs.dusun_rt = 'Pilih dusun/RT';
    if (!form.service_type) errs.service_type = 'Pilih layanan';
    if (!form.planned_visit_date) errs.planned_visit_date = 'Pilih tanggal';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(form);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan data');
    } finally {
      setSubmitting(false);
    }
  };

  const fieldClass = (err?: string) =>
    `w-full px-3 py-2 rounded-lg border text-sm outline-none transition-colors ${
      err
        ? 'border-error-300 bg-error-50 focus:ring-2 focus:ring-error-200'
        : 'border-slate-200 focus:ring-2 focus:ring-primary-100 focus:border-primary-400'
    }`;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full animate-scale-in max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Plus className="w-5 h-5 text-accent-600" />
            Tambah Pendaftaran Walk-in
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Nama Lengkap *</label>
            <input
              type="text"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              className={fieldClass(errors.full_name)}
              placeholder="Nama warga"
            />
            {errors.full_name && <p className="mt-1 text-xs text-error-600">{errors.full_name}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Nomor HP *</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className={fieldClass(errors.phone)}
              placeholder="08xxxxxxxxxx"
            />
            {errors.phone && <p className="mt-1 text-xs text-error-600">{errors.phone}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Dusun / RT *</label>
              <select
                value={form.dusun_rt}
                onChange={(e) => setForm({ ...form, dusun_rt: e.target.value })}
                className={fieldClass(errors.dusun_rt)}
              >
                <option value="">Pilih...</option>
                {DUSUN_RT_OPTIONS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              {errors.dusun_rt && <p className="mt-1 text-xs text-error-600">{errors.dusun_rt}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Tanggal Datang *</label>
              <input
                type="date"
                value={form.planned_visit_date}
                onChange={(e) => setForm({ ...form, planned_visit_date: e.target.value })}
                className={fieldClass(errors.planned_visit_date)}
              />
              {errors.planned_visit_date && <p className="mt-1 text-xs text-error-600">{errors.planned_visit_date}</p>}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Jenis Layanan *</label>
            <select
              value={form.service_type}
              onChange={(e) => setForm({ ...form, service_type: e.target.value })}
              className={fieldClass(errors.service_type)}
            >
              <option value="">Pilih layanan...</option>
              {SERVICE_TYPES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {errors.service_type && <p className="mt-1 text-xs text-error-600">{errors.service_type}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Catatan</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
              className={fieldClass()}
              placeholder="Opsional"
            />
          </div>

          {error && (
            <p className="text-sm text-error-600 bg-error-50 p-3 rounded-lg">{error}</p>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-2 bg-accent-600 text-white text-sm font-semibold rounded-lg hover:bg-accent-700 transition-colors disabled:opacity-60"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function formatDateShort(d: string): string {
  return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatDateLong(d: string): string {
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatDateTime(d: string): string {
  return new Date(d).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
