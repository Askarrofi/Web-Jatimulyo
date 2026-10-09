import { Landmark, MapPin, Phone, Clock } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-800 text-slate-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
                <Landmark className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Desa Jatimulyo</h3>
                <p className="text-xs text-slate-400">Sistem Pelayanan Administrasi</p>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Digitalisasi pelayanan administrasi desa berbasis hybrid online/offline
              untuk mempercepat layanan dan menjaga privasi data warga.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-white text-sm mb-4">Lokasi & Kontak</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 text-primary-400 shrink-0" />
                <span>Balai Desa Jatimulyo, Kec. Jati Agung, Kab. Lampung Selatan</span>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="w-4 h-4 mt-0.5 text-primary-400 shrink-0" />
                <span>(0721) 123-4567</span>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="w-4 h-4 mt-0.5 text-primary-400 shrink-0" />
                <span>Senin - Jumat: 08.00 - 15.00 WIB</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white text-sm mb-4">Jenis Layanan</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>Surat Keterangan Usaha</li>
              <li>Surat Keterangan Domisili</li>
              <li>Surat Keterangan Tidak Mampu</li>
              <li>Surat Pengantar Umum</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-700 mt-8 pt-6 text-center">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} Pemerintah Desa Jatimulyo. Sistem Pelayanan Administrasi Desa.
          </p>
        </div>
      </div>
    </footer>
  );
}
