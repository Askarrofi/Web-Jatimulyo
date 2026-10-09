import { useState } from 'react';
import {
  FileText,
  ClipboardCheck,
  CheckCircle2,
  Copy,
  Printer,
  ArrowRight,
  AlertTriangle,
  Calendar,
  User,
  Phone,
  MapPin,
  MessageSquare,
  Loader2,
  X,
} from 'lucide-react';
import {
  SERVICE_TYPES,
  DUSUN_RT_OPTIONS,
  STATUS_LABELS,
  type Registration,
} from '@/types';
import { insertRegistration } from '@/lib/api';
import type { ViewName } from './Header';

interface AjukanProps {
  onNavigate: (view: ViewName) => void;
}

interface FormData {
  full_name: string;
  phone: string;
  dusun_rt: string;
  service_type: string;
  planned_visit_date: string;
  notes: string;
}

const EMPTY_FORM: FormData = {
  full_name: '',
  phone: '',
  dusun_rt: '',
  service_type: '',
  planned_visit_date: '',
  notes: '',
};

export default function Ajukan({ onNavigate }: AjukanProps) {
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [ticket, setTicket] = useState<Registration | null>(null);
  const [copied, setCopied] = useState(false);

  const validate = (): boolean => {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (!form.full_name.trim()) e.full_name = 'Nama lengkap wajib diisi';
    if (!form.phone.trim()) e.phone = 'Nomor WhatsApp/HP wajib diisi';
    else if (!/^[0-9+\-\s]{8,15}$/.test(form.phone.trim())) e.phone = 'Format nomor tidak valid';
    if (!form.dusun_rt) e.dusun_rt = 'Pilih dusun / RT Anda';
    if (!form.service_type) e.service_type = 'Pilih jenis layanan';
    if (!form.planned_visit_date) e.planned_visit_date = 'Pilih tanggal rencana kedatangan';
    else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const visit = new Date(form.planned_visit_date);
      visit.setHours(0, 0, 0, 0);
      if (visit < today) e.planned_visit_date = 'Tanggal tidak boleh lampau';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      const reg = await insertRegistration({
        full_name: form.full_name.trim(),
        phone: form.phone.trim(),
        dusun_rt: form.dusun_rt,
        service_type: form.service_type,
        planned_visit_date: form.planned_visit_date,
        notes: form.notes.trim() || null,
      });
      setTicket(reg);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Terjadi kesalahan saat mengirim pengajuan');
    } finally {
      setSubmitting(false);
    }
  };

  const copyCode = async () => {
    if (!ticket) return;
    try {
      await navigator.clipboard.writeText(ticket.tracking_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const printTicket = () => {
    window.print();
  };

  const closeTicket = () => {
    setTicket(null);
    setForm(EMPTY_FORM);
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="animate-fade-in bg-slate-50 min-h-[calc(100vh-4rem)]">
      {/* Page Header */}
      <div className="bg-gradient-to-br from-primary-700 to-primary-600 py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
            <FileText className="w-7 h-7" />
            Ajukan Layanan
          </h1>
          <p className="text-primary-100 mt-2 text-sm">
            Isi form pendaftaran layanan administrasi desa secara online
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Security Notice */}
        <div className="mb-6 rounded-xl bg-amber-50 border border-amber-200 p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-900">Peringatan Penting</p>
            <p className="text-xs text-amber-800 mt-1 leading-relaxed">
              Sistem ini TIDAK menerima unggahan foto KTP/KK. Anda wajib membawa
              dokumen fisik asli (KTP, KK, Surat RT) saat datang ke Balai Desa
              sesuai tanggal yang dipilih.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
            <h2 className="font-bold text-slate-800 flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-primary-600" />
              Form Pendaftaran Layanan
            </h2>
            <p className="text-xs text-slate-500 mt-1">Kolom bertanda * wajib diisi</p>
          </div>

          <div className="p-6 space-y-5">
            {/* Full Name */}
            <Field
              label="Nama Lengkap"
              required
              icon={<User className="w-4 h-4" />}
              error={errors.full_name}
            >
              <input
                type="text"
                value={form.full_name}
                onChange={(e) => handleChange('full_name', e.target.value)}
                placeholder="Contoh: Sutrisno"
                className={inputClass(errors.full_name)}
              />
            </Field>

            {/* Phone */}
            <Field
              label="Nomor WhatsApp / HP"
              required
              icon={<Phone className="w-4 h-4" />}
              error={errors.phone}
            >
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="Contoh: 081234567890"
                className={inputClass(errors.phone)}
              />
            </Field>

            {/* Dusun / RT */}
            <Field
              label="Dusun / RT"
              required
              icon={<MapPin className="w-4 h-4" />}
              error={errors.dusun_rt}
            >
              <select
                value={form.dusun_rt}
                onChange={(e) => handleChange('dusun_rt', e.target.value)}
                className={inputClass(errors.dusun_rt)}
              >
                <option value="">Pilih Dusun / RT</option>
                {DUSUN_RT_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </Field>

            {/* Service Type */}
            <Field
              label="Jenis Layanan Surat"
              required
              icon={<FileText className="w-4 h-4" />}
              error={errors.service_type}
            >
              <select
                value={form.service_type}
                onChange={(e) => handleChange('service_type', e.target.value)}
                className={inputClass(errors.service_type)}
              >
                <option value="">Pilih Jenis Layanan</option>
                {SERVICE_TYPES.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </Field>

            {/* Visit Date */}
            <Field
              label="Tanggal Rencana Kedatangan ke Balai Desa"
              required
              icon={<Calendar className="w-4 h-4" />}
              error={errors.planned_visit_date}
            >
              <input
                type="date"
                min={today}
                value={form.planned_visit_date}
                onChange={(e) => handleChange('planned_visit_date', e.target.value)}
                className={inputClass(errors.planned_visit_date)}
              />
            </Field>

            {/* Notes */}
            <Field
              label="Catatan Tambahan"
              icon={<MessageSquare className="w-4 h-4" />}
            >
              <textarea
                value={form.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Opsional: tambahkan keperluan atau keterangan lain"
                rows={3}
                className={inputClass()}
              />
            </Field>

            {/* Checklist warning */}
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
              <p className="text-xs font-semibold text-slate-700 mb-2">
                Checklist wajib dibawa saat datang ke Balai Desa:
              </p>
              <ul className="space-y-1.5 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-success-600" />
                  KTP asli pemohon
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-success-600" />
                  Kartu Keluarga (KK)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-success-600" />
                  Surat pengantar dari RT setempat
                </li>
              </ul>
            </div>
          </div>

          {/* Submit */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
            {submitError && (
              <p className="text-sm text-error-600 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                {submitError}
              </p>
            )}
            <div className="flex items-center gap-3 ml-auto">
              <button
                type="button"
                onClick={() => { setForm(EMPTY_FORM); setErrors({}); }}
                className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Reset Form
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Mengirim...
                  </>
                ) : (
                  <>
                    Kirim Pengajuan
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Ticket Modal */}
      {ticket && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-scale-in max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="relative bg-gradient-to-br from-success-600 to-success-700 px-6 py-8 rounded-t-2xl">
              <button
                onClick={closeTicket}
                className="absolute top-4 right-4 text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-3">
                  <CheckCircle2 className="w-9 h-9 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">Pendaftaran Berhasil!</h2>
                <p className="text-success-100 text-sm mt-1">
                  Simpan kode tracking Anda untuk memantau status
                </p>
              </div>
            </div>

            {/* Ticket Body */}
            <div className="p-6 space-y-4">
              {/* Tracking Code */}
              <div className="text-center">
                <p className="text-xs text-slate-500 mb-1">Kode Tracking Anda</p>
                <div className="inline-flex items-center gap-2 px-4 py-3 bg-slate-800 rounded-xl">
                  <span className="text-lg font-bold text-white tracking-wider">
                    {ticket.tracking_code}
                  </span>
                </div>
              </div>

              {/* Summary */}
              <div className="rounded-xl border border-slate-200 divide-y divide-slate-100">
                <SummaryRow label="Nama" value={ticket.full_name} />
                <SummaryRow label="Layanan" value={ticket.service_type} />
                <SummaryRow label="Dusun / RT" value={ticket.dusun_rt} />
                <SummaryRow label="Tanggal Datang" value={formatDate(ticket.planned_visit_date)} />
                <SummaryRow label="Status" value={STATUS_LABELS[ticket.status]} />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={copyCode}
                  className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-colors ${
                    copied
                      ? 'bg-success-100 text-success-700'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Tersalin!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Salin Kode
                    </>
                  )}
                </button>
                <button
                  onClick={printTicket}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  Cetak Tiket
                </button>
              </div>

              <button
                onClick={() => {
                  closeTicket();
                  onNavigate('cek');
                }}
                className="w-full text-center text-sm text-primary-600 hover:text-primary-700 font-medium py-2"
              >
                Cek Status Sekarang &rarr;
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function inputClass(error?: string): string {
  return `w-full px-4 py-2.5 rounded-xl border text-sm transition-colors ${
    error
      ? 'border-error-300 bg-error-50 focus:ring-2 focus:ring-error-200 focus:border-error-400'
      : 'border-slate-200 bg-white focus:ring-2 focus:ring-primary-100 focus:border-primary-400'
  } outline-none`;
}

function Field({
  label,
  required,
  icon,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  icon: React.ReactNode;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        <span className="flex items-center gap-1.5">
          <span className="text-slate-400">{icon}</span>
          {label}
          {required && <span className="text-error-500">*</span>}
        </span>
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-error-600">{error}</p>}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-800 text-right">{value}</span>
    </div>
  );
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
