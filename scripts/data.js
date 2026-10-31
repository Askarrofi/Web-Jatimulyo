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
        desc: "Untuk bukti bahwa warga memiliki usaha di wilayah desa seperti pengajuan pinjaman, izin, dan sebagainya.",
        berkas: [
            "Fotokopi KTP pemilik usaha",
            "Fotokopi Kartu Keluarga (KK)",
            "Surat Pengantar dari RT/RW setempat",
            "Keterangan usaha seperti nama usaha, jenis usaha, dan alamat tempat usaha",
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
            "Keterangan tujuan penggunaan surat (seperti sekolah, kesehatan, atau lainnya)",
            "Dokumen pendukung tujuan, misalnya surat dari sekolah/fasilitas kesehatan (jika ada)"
        ]
    },
    {
        nama: "Surat Keterangan Domisili",
        desc: "Untuk bukti tempat tinggal warga di wilayah Desa Jatimulyo.",
        berkas: [
            "Fotokopi KTP pemohon",
            "Fotokopi Kartu Keluarga (KK)",
            "Surat Pengantar dari RT/RW setempat",
            "Surat pindah atau keterangan tinggal (khusus pendatang/belum berdomisili sesuai KTP)",
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
            "Dokumen-dokumen yang penulisan namanya berbeda (misalnya ijazah, akta kelahiran, buku nikah, BPJS, rekening, dan sebagainya) berupa dokumen asli dan fotokopi",
            "Keterangan dokumen mana yang namanya perlu disamakan"
        ],
        catatan: "Bawa semua dokumen yang berbeda penulisan namanya agar petugas dapat mencocokkan."
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
