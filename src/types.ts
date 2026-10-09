export type ServiceType =
  | 'Surat Keterangan Usaha'
  | 'Surat Keterangan Domisili'
  | 'Surat Keterangan Tidak Mampu'
  | 'Surat Pengantar Umum';

export type RegistrationStatus =
  | 'diajukan'
  | 'verifikasi'
  | 'diproses'
  | 'siap_diambil'
  | 'selesai';

export interface Registration {
  id: string;
  tracking_code: string;
  full_name: string;
  phone: string;
  dusun_rt: string;
  service_type: string;
  planned_visit_date: string;
  notes: string | null;
  status: RegistrationStatus;
  officer_note: string | null;
  is_walk_in: boolean;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export const SERVICE_TYPES: ServiceType[] = [
  'Surat Keterangan Usaha',
  'Surat Keterangan Domisili',
  'Surat Keterangan Tidak Mampu',
  'Surat Pengantar Umum',
];

export const DUSUN_RT_OPTIONS = [
  'Dusun 01 / RT 01',
  'Dusun 01 / RT 02',
  'Dusun 01 / RT 03',
  'Dusun 02 / RT 01',
  'Dusun 02 / RT 02',
  'Dusun 02 / RT 03',
  'Dusun 03 / RT 01',
  'Dusun 03 / RT 02',
  'Dusun 03 / RT 03',
  'Dusun 03 / RT 04',
];

export const STATUS_FLOW: RegistrationStatus[] = [
  'diajukan',
  'verifikasi',
  'diproses',
  'siap_diambil',
  'selesai',
];

export const STATUS_LABELS: Record<RegistrationStatus, string> = {
  diajukan: 'Diajukan',
  verifikasi: 'Verifikasi Berkas',
  diproses: 'Sedang Diproses',
  siap_diambil: 'Siap Diambil',
  selesai: 'Selesai',
};

export const STATUS_COLORS: Record<RegistrationStatus, string> = {
  diajukan: 'bg-blue-100 text-blue-800 border-blue-200',
  verifikasi: 'bg-amber-100 text-amber-800 border-amber-200',
  diproses: 'bg-purple-100 text-purple-800 border-purple-200',
  siap_diambil: 'bg-teal-100 text-teal-800 border-teal-200',
  selesai: 'bg-emerald-100 text-emerald-800 border-emerald-200',
};
