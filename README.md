# Web Jatimulyo

Website statis pelayanan administrasi Desa Jatimulyo.

## Struktur

- `index.html` halaman warga
- `admin.html` halaman Operator
- `scripts/config.js` alamat backend
- `scripts/data.js` data layanan dan validasi
- `scripts/date.js` tanggal dan kalender
- `scripts/dom.js` komponen antarmuka
- `scripts/forms.js` keadaan formulir
- `scripts/modal.js` modal dan fokus keyboard
- `scripts/api.js` komunikasi backend
- `scripts/index.js` inisialisasi halaman warga
- `scripts/index-form.js` pendaftaran warga
- `scripts/index-status.js` pemeriksaan status
- `scripts/admin-table.js` tabel, filter, statistik, dan paginasi
- `scripts/admin.js` akses Operator dan pemuatan data
- `scripts/admin-manage.js` perubahan status
- `scripts/admin-walkin.js` Pendaftaran Offline
- `src/input.css` sumber CSS
- `styles/styles.css` CSS hasil build
- `tailwind.config.js` konfigurasi Tailwind
- `build-css.sh` build CSS

## Build

Jalankan `./build-css.sh` dan jangan mengubah `styles/styles.css` secara langsung.

## Deployment

Salin hanya `index.html`, `admin.html`, `scripts/`, `styles/styles.css`, dan `assets/` ke server produksi.

## Pengujian manual

Uji pendaftaran, Kode Tracking, status, Kunci Operator, filter, perubahan status, Pendaftaran Offline, cetak bukti, modal dengan Tab, Shift+Tab, Escape, pengembalian fokus, dan tampilan ponsel melalui web server.
