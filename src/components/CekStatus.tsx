import { useState } from 'react';
import {
  Search,
  SearchX,
  Loader2,
  CheckCircle2,
  Clock,
  FileText,
  FileCheck,
  PackageCheck,
  PartyPopper,
  AlertCircle,
  Calendar,
  User,
  Phone,
  MapPin,
  MessageSquare,
} from 'lucide-react';
import {
  STATUS_FLOW,
  STATUS_LABELS,
  type Registration,
  type RegistrationStatus,
} from '@/types';
import { fetchByTrackingCode } from '@/lib/api';

const STATUS_ICONS: Record<RegistrationStatus, typeof CheckCircle2> = {
  diajukan: FileText,
  verifikasi: FileCheck,
  diproses: Clock,
  siap_diambil: PackageCheck,
  selesai: PartyPopper,
};

export default function CekStatus() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Registration | null>(null);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setError(null);
    setSearched(false);
    try {
      const data = await fetchByTrackingCode(code);
      setResult(data);
      setSearched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  const currentIndex = result ? STATUS_FLOW.indexOf(result.status) : -1;

  return (
    <div className="animate-fade-in bg-slate-50 min-h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="bg-gradient-to-br from-accent-700 to-accent-600 py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
            <Search className="w-7 h-7" />
            Cek Status Pengajuan
          </h1>
          <p className="text-accent-100 mt-2 text-sm">
            Masukkan kode tracking untuk melihat progress pengajuan Anda
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Kode Tracking
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Contoh: JTM-20261009-001"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 text-sm font-medium uppercase tracking-wider focus:ring-2 focus:ring-accent-100 focus:border-accent-400 outline-none transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !code.trim()}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-accent-600 text-white text-sm font-semibold rounded-xl hover:bg-accent-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Mencari...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Cek Status
                </>
              )}
            </button>
          </div>
          {error && (
            <p className="mt-2 text-sm text-error-600 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" />
              {error}
            </p>
          )}
        </form>

        {/* Not Found */}
        {searched && !result && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center animate-fade-in">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <SearchX className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="font-bold text-slate-700 text-lg">Kode Tracking Tidak Ditemukan</h3>
            <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto">
              Pastikan kode tracking yang Anda masukkan benar. Periksa kembali tiket
              pendaftaran yang Anda terima.
            </p>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="space-y-6 animate-fade-in">
            {/* Summary Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 bg-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">Kode Tracking</p>
                  <p className="text-lg font-bold text-white tracking-wider">{result.tracking_code}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">Status Saat Ini</p>
                  <p className="text-sm font-semibold text-accent-300">
                    {STATUS_LABELS[result.status]}
                  </p>
                </div>
              </div>

              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoItem icon={<User className="w-4 h-4" />} label="Nama" value={result.full_name} />
                <InfoItem icon={<FileText className="w-4 h-4" />} label="Layanan" value={result.service_type} />
                <InfoItem icon={<MapPin className="w-4 h-4" />} label="Dusun / RT" value={result.dusun_rt} />
                <InfoItem icon={<Calendar className="w-4 h-4" />} label="Tanggal Datang" value={formatDate(result.planned_visit_date)} />
                <InfoItem icon={<Phone className="w-4 h-4" />} label="No. HP" value={result.phone} />
                <InfoItem icon={<Clock className="w-4 h-4" />} label="Tanggal Daftar" value={formatDateTime(result.created_at)} />
              </div>

              {result.notes && (
                <div className="px-6 pb-4">
                  <div className="rounded-xl bg-slate-50 p-3 flex items-start gap-2">
                    <MessageSquare className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-slate-500">Catatan</p>
                      <p className="text-sm text-slate-700">{result.notes}</p>
                    </div>
                  </div>
                </div>
              )}

              {result.officer_note && (
                <div className="px-6 pb-6">
                  <div className="rounded-xl bg-accent-50 border border-accent-100 p-4 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-accent-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-accent-700">Pesan dari Petugas</p>
                      <p className="text-sm text-accent-800 mt-0.5">{result.officer_note}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5 text-accent-600" />
                Timeline Status Pengajuan
              </h3>

              <div className="relative">
                {STATUS_FLOW.map((status, i) => {
                  const Icon = STATUS_ICONS[status];
                  const isDone = i <= currentIndex;
                  const isCurrent = i === currentIndex;
                  const isLast = i === STATUS_FLOW.length - 1;

                  return (
                    <div key={status} className="flex items-start gap-4 pb-8 last:pb-0 relative">
                      {/* Line */}
                      {!isLast && (
                        <div className={`absolute left-5 top-12 bottom-0 w-0.5 ${
                          isDone ? 'bg-accent-400' : 'bg-slate-200'
                        }`} />
                      )}

                      {/* Icon Circle */}
                      <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all ${
                        isDone
                          ? 'bg-accent-500 text-white shadow-md'
                          : 'bg-slate-100 text-slate-400'
                      } ${isCurrent ? 'ring-4 ring-accent-100' : ''}`}>
                        {isDone && !isCurrent ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <Icon className="w-5 h-5" />
                        )}
                      </div>

                      {/* Label */}
                      <div className="pt-2">
                        <p className={`font-semibold text-sm ${
                          isDone ? 'text-slate-800' : 'text-slate-400'
                        }`}>
                          {STATUS_LABELS[status]}
                        </p>
                        {isCurrent && (
                          <span className="inline-flex items-center gap-1 mt-1 px-2.5 py-1 bg-accent-100 text-accent-700 text-xs font-medium rounded-full">
                            <span className="w-1.5 h-1.5 bg-accent-500 rounded-full animate-pulse" />
                            Status Saat Ini
                          </span>
                        )}
                        {isDone && !isCurrent && (
                          <p className="text-xs text-success-600 mt-0.5">Selesai</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Estimation */}
              <div className="mt-4 rounded-xl bg-blue-50 border border-blue-100 p-4 flex items-start gap-3">
                <Clock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-blue-900">Estimasi Waktu Pengerjaan</p>
                  <p className="text-xs text-blue-700 mt-0.5">
                    Layanan administrasi desa biasanya selesai dalam 1-3 hari kerja
                    setelah verifikasi berkas fisik. Pastikan Anda datang sesuai jadwal
                    yang dipilih.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Initial state */}
        {!searched && !loading && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
            <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-accent-600" />
            </div>
            <h3 className="font-bold text-slate-700 text-lg">Masukkan Kode Tracking</h3>
            <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto">
              Ketik kode tracking yang Anda terima saat pendaftaran untuk melihat
              status pengajuan layanan Anda.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center shrink-0 text-slate-500">
        {icon}
      </div>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-sm font-medium text-slate-800">{value}</p>
      </div>
    </div>
  );
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
