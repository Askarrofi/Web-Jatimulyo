import {
  FileText,
  Search,
  ShieldCheck,
  ClipboardList,
  FolderCheck,
  PackageCheck,
  ArrowRight,
  Info,
  MapPin,
  Clock,
  Phone,
  Users,
  TrendingUp,
  Award,
} from 'lucide-react';
import type { ViewName } from './Header';

interface BerandaProps {
  onNavigate: (view: ViewName) => void;
}

const STEPS = [
  {
    icon: ClipboardList,
    title: 'Isi Form Online',
    desc: 'Daftar layanan dari rumah dan dapatkan kode tracking unik untuk memantau status pengajuan.',
    color: 'bg-primary-500',
  },
  {
    icon: FolderCheck,
    title: 'Bawa Berkas Fisik',
    desc: 'Bawa KTP, KK, dan Surat RT ke Balai Desa sesuai tanggal rencana kedatangan.',
    color: 'bg-accent-500',
  },
  {
    icon: PackageCheck,
    title: 'Verifikasi & Ambil Surat',
    desc: 'Petugas memverifikasi berkas, surat diproses, dan Anda ambil surat yang sudah selesai.',
    color: 'bg-success-500',
  },
];

const STATS = [
  { label: 'Jenis Layanan', value: '4', icon: FileText },
  { label: 'Dusun / RT', value: '10', icon: MapPin },
  { label: 'Jam Layanan', value: '7 jam', icon: Clock },
  { label: 'Hari Operasional', value: '5 hari', icon: Users },
];

export default function Beranda({ onNavigate }: BerandaProps) {
  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-700 via-primary-600 to-accent-600">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent-300 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 backdrop-blur-sm text-white text-sm font-medium mb-6">
              <ShieldCheck className="w-4 h-4" />
              Pelayanan Cepat & Aman
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
              Sistem Pelayanan Administrasi
              <span className="block text-accent-200">Desa Jatimulyo</span>
            </h1>
            <p className="text-base sm:text-lg text-primary-100 mb-8 leading-relaxed">
              Kecamatan Jati Agung, Kabupaten Lampung Selatan
            </p>
            <p className="text-sm sm:text-base text-primary-50/90 mb-10 max-w-2xl mx-auto leading-relaxed">
              Ajukan layanan administrasi desa secara online, dapatkan kode tracking,
              dan kunjungi balai desa untuk verifikasi berkas. Cepat, transparan, dan
              tanpa unggah dokumen sensitif.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => onNavigate('ajukan')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary-700 rounded-xl font-semibold hover:bg-primary-50 transition-all shadow-lg hover:shadow-xl w-full sm:w-auto"
              >
                <FileText className="w-5 h-5" />
                Ajukan Pendaftaran
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onNavigate('cek')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/30 text-white rounded-xl font-semibold hover:bg-white/20 transition-all w-full sm:w-auto"
              >
                <Search className="w-5 h-5" />
                Cek Status Pengajuan
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-slate-800">{stat.value}</p>
                    <p className="text-xs text-slate-500">{stat.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Service Flow */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-sm font-semibold text-primary-600 uppercase tracking-wide">
              Alur Pelayanan
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mt-2">
              Tiga Langkah Mudah
            </h2>
            <p className="text-slate-500 mt-2 text-sm">
              Proses pendaftaran layanan administrasi desa yang simpel dan transparan
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <div
                  key={i}
                  className="relative bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all group"
                >
                  <div className="absolute top-6 right-6 text-6xl font-bold text-slate-100 group-hover:text-slate-200 transition-colors">
                    {i + 1}
                  </div>
                  <div className={`w-14 h-14 ${step.color} rounded-2xl flex items-center justify-center mb-4 shadow-md`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-lg mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
                  {i < STEPS.length - 1 && (
                    <div className="hidden md:flex absolute top-1/2 -right-4 w-8 h-8 items-center justify-center z-10">
                      <ArrowRight className="w-5 h-5 text-slate-300" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Security Warning */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center shrink-0 shadow-md">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-amber-900 text-lg mb-2">
                  Peringatan Keamanan Data Warga
                </h3>
                <p className="text-sm text-amber-800 leading-relaxed">
                  Sistem ini <strong>TIDAK meminta unggahan foto KTP/KK</strong> untuk
                  menjaga privasi warga. Berkas fisik diverifikasi langsung di kantor desa
                  pada saat kedatangan. Pastikan Anda membawa dokumen asli yang diperlukan.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg text-xs font-medium text-amber-700 border border-amber-200">
                    <Info className="w-3.5 h-3.5" />
                    Tanpa Upload Dokumen
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg text-xs font-medium text-amber-700 border border-amber-200">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verifikasi Fisik di Balai Desa
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Access CTA */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <button
              onClick={() => onNavigate('ajukan')}
              className="group flex items-center gap-4 p-6 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-primary-200 transition-all text-left"
            >
              <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center group-hover:bg-primary-500 transition-colors">
                <FileText className="w-7 h-7 text-primary-600 group-hover:text-white transition-colors" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-800 text-lg">Ajukan Layanan Baru</h3>
                <p className="text-sm text-slate-500">Isi form online dan dapatkan kode tracking</p>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-primary-500 transition-colors" />
            </button>

            <button
              onClick={() => onNavigate('cek')}
              className="group flex items-center gap-4 p-6 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-accent-200 transition-all text-left"
            >
              <div className="w-14 h-14 bg-accent-100 rounded-2xl flex items-center justify-center group-hover:bg-accent-500 transition-colors">
                <Search className="w-7 h-7 text-accent-600 group-hover:text-white transition-colors" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-800 text-lg">Cek Status Pengajuan</h3>
                <p className="text-sm text-slate-500">Pantau progress layanan Anda dengan kode tracking</p>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-accent-500 transition-colors" />
            </button>
          </div>
        </div>
      </section>

      {/* SDGs Reference */}
      <section className="py-12 bg-gradient-to-r from-primary-700 to-accent-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <div className="w-16 h-16 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Award className="w-8 h-8 text-white" />
            </div>
            <div className="text-left">
              <h3 className="text-white font-bold text-lg">Mendukung SDGs 16</h3>
              <p className="text-primary-100 text-sm">
                Institusi yang tangguh, transparan, dan pelayanan publik yang akuntabel
                untuk seluruh warga Desa Jatimulyo.
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/15 backdrop-blur-sm rounded-xl">
              <TrendingUp className="w-5 h-5 text-white" />
              <span className="text-white font-semibold text-sm">SDGs 16</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
