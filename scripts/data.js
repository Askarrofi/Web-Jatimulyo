const HARI_TANPA_PELAYANAN = [0, 6];
const WA_REGEX = /^(\+62|62|0)8[1-9][0-9]{6,11}$/;
const RT_REGEX = /^\d{1,3}$/;
const KODE_REGEX = /^[A-Z0-9]{4}$/;
const BULAN = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
const BULAN_PENDEK = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
const HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

const DUSUN_GROUP = [
    { label: "I", values: ["I A", "I B", "I C", "I D"] },
    { label: "II", values: ["II A", "II B", "II C", "II D"] },
    { label: "III", values: ["III"] },
    { label: "IV", values: ["IV"] },
    { label: "V", values: ["V A", "V B"] }
];

const LAYANAN = [
    {
        nama: "Surat Keterangan Usaha (SKU)",
        desc: "Sebagai bukti bahwa warga memiliki usaha di wilayah desa untuk keperluan pengajuan pinjaman, perizinan, dan keperluan lainnya.",
        berkas: [
            "Fotokopi KTP pemilik usaha",
            "Fotokopi Kartu Keluarga (KK)",
            "Surat Pengantar dari RT/RW setempat",
            "Keterangan usaha yang mencantumkan nama, jenis, dan alamat usaha",
            "Foto tempat usaha",
            "Pas foto 3x4"
        ]
    },
    {
        nama: "Surat Keterangan Tidak Mampu (SKTM)",
        desc: "Untuk keperluan bantuan pendidikan, kesehatan, atau bantuan sosial lainnya.",
        berkas: [
            "Fotokopi KTP pemohon",
            "Fotokopi Kartu Keluarga (KK)",
            "Surat Pengantar dari RT/RW setempat",
            "Keterangan tujuan penggunaan surat, seperti untuk pendidikan, kesehatan, atau keperluan lainnya",
            "Dokumen pendukung sesuai tujuan, misalnya surat dari sekolah atau fasilitas kesehatan, jika ada"
        ]
    },
    {
        nama: "Surat Keterangan Domisili",
        desc: "Sebagai bukti bahwa warga bertempat tinggal di wilayah Desa Jatimulyo.",
        berkas: [
            "Fotokopi KTP pemohon",
            "Fotokopi Kartu Keluarga (KK)",
            "Surat Pengantar dari RT/RW setempat",
            "Surat pindah atau surat keterangan tempat tinggal bagi pendatang atau warga yang alamat domisilinya belum sesuai dengan KTP",
            "Keterangan tujuan penggunaan surat"
        ]
    },
    {
        nama: "Surat Keterangan Beda Nama",
        desc: "Untuk menyatakan bahwa dua penulisan nama pada dokumen berbeda merujuk pada orang yang sama.",
        berkas: [
            "Fotokopi KTP pemohon",
            "Fotokopi Kartu Keluarga (KK)",
            "Surat Pengantar dari RT/RW setempat",
            "Dokumen asli dan fotokopi yang memuat perbedaan penulisan nama, seperti ijazah, akta kelahiran, buku nikah, kartu BPJS, atau buku rekening",
            "Keterangan mengenai nama dan dokumen yang perlu disesuaikan"
        ],
        catatan: "Bawa semua dokumen yang memuat perbedaan penulisan nama agar petugas dapat mencocokkan datanya."
    },
    {
        nama: "Surat Pengantar SKCK",
        desc: "Surat pengantar dari desa sebagai syarat pengurusan SKCK di kepolisian.",
        berkas: [
            "Fotokopi KTP pemohon",
            "Fotokopi Kartu Keluarga (KK)",
            "Surat Pengantar dari RT/RW setempat",
            "Fotokopi akta kelahiran atau ijazah terakhir",
            "Pas foto terbaru (ukuran sesuai ketentuan petugas)"
        ],
        catatan: "Syarat di kepolisian dapat berbeda. Tanyakan petugas desa dan kepolisian setempat."
    }
];

const STATUS_STYLE = {
    "pending": { key: "pending", label: "Sedang Diproses", step: 0 },
    "diproses": { key: "diproses", label: "Sedang Diproses", step: 0 },
    "siap diambil": { key: "siap diambil", label: "Siap Diambil", step: 1 },
    "selesai": { key: "selesai", label: "Selesai", step: 2 }
};

function getStatusStyle(status) {
    const key = String(status || "").trim().toLowerCase();
    return STATUS_STYLE[key] || { key: "unknown", label: status || "Tidak diketahui", step: -1 };
}
