const LAYANAN = [
  {
    nama: "Surat Keterangan Usaha (SKU)",
    deskripsi: "Untuk bukti bahwa warga memiliki usaha di wilayah desa (pengajuan pinjaman, izin, dsb).",
    syarat: [
      "Fotokopi KTP pemilik usaha",
      "Fotokopi Kartu Keluarga (KK)",
      "Surat Pengantar dari RT/RW setempat",
      "Keterangan usaha: nama usaha, jenis usaha, dan alamat tempat usaha",
      "Pas foto 3x4 (jika diminta petugas)"
    ]
  },
  {
    nama: "Surat Keterangan Tidak Mampu (SKTM)",
    deskripsi: "Untuk keperluan bantuan pendidikan, kesehatan, atau bantuan sosial lainnya.",
    syarat: [
      "Fotokopi KTP pemohon",
      "Fotokopi Kartu Keluarga (KK)",
      "Surat Pengantar dari RT/RW setempat",
      "Keterangan tujuan penggunaan surat (sekolah/kesehatan/lainnya)",
      "Dokumen pendukung tujuan, misalnya surat dari sekolah/fasilitas kesehatan (jika ada)"
    ]
  },
  {
    nama: "Surat Keterangan Domisili",
    deskripsi: "Untuk bukti tempat tinggal warga di wilayah Desa Jatimulyo.",
    syarat: [
      "Fotokopi KTP pemohon",
      "Fotokopi Kartu Keluarga (KK)",
      "Surat Pengantar dari RT/RW setempat",
      "Surat pindah atau keterangan tinggal (khusus pendatang/belum berdomisili sesuai KTP)",
      "Keterangan tujuan penggunaan surat"
    ]
  },
  {
    nama: "Surat Keterangan Beda Nama",
    deskripsi: "Untuk menyatakan bahwa dua penulisan nama pada dokumen berbeda merujuk pada orang yang sama.",
    syarat: [
      "Fotokopi KTP pemohon",
      "Fotokopi Kartu Keluarga (KK)",
      "Surat Pengantar dari RT/RW setempat",
      "Dokumen-dokumen yang penulisan namanya berbeda (misalnya ijazah, akta kelahiran, buku nikah, BPJS, atau rekening), asli dan fotokopi",
      "Keterangan dokumen mana yang namanya perlu disamakan"
    ],
    catatan: "Bawa semua dokumen yang berbeda penulisan namanya agar petugas dapat mencocokkan."
  },
  {
    nama: "Surat Pengantar SKCK",
    deskripsi: "Surat pengantar dari desa sebagai syarat pengurusan SKCK di kepolisian.",
    syarat: [
      "Fotokopi KTP pemohon",
      "Fotokopi Kartu Keluarga (KK)",
      "Surat Pengantar dari RT/RW setempat",
      "Fotokopi akta kelahiran atau ijazah terakhir",
      "Pas foto terbaru (ukuran sesuai ketentuan petugas)"
    ],
    catatan: "Syarat di kepolisian dapat berbeda. Tanyakan petugas desa dan kepolisian setempat."
  }
];

const DUSUN = ["Dusun 1", "Dusun 2", "Dusun 3", "Dusun 4", "Dusun 5"];

const HARI_TANPA_PELAYANAN = [0, 6];
const REQUEST_TIMEOUT_MS = 25000;
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyhpnJGXnmT6RnfgghNaY310fDS5lfxAIZ-YnsIkPpph2e_m_9itLQ4IAYPk03B6yceAA/exec";
const KEY_STORAGE = "jtm_admin_key";
const WA_REGEX = /^(\+62|62|0)8[1-9][0-9]{6,11}$/;

const $ = (id) => document.getElementById(id);
const BULAN = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
const BULAN_PENDEK = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
const HARI = ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];

const STATUS_STYLE = {
  "pending":      { cls: "bg-blue-100 text-blue-900 ring-1 ring-blue-500", label: "Sedang Diproses", step: 0 },
  "diproses":     { cls: "bg-blue-100 text-blue-900 ring-1 ring-blue-500", label: "Sedang Diproses", step: 0 },
  "siap diambil": { cls: "bg-amber-100 text-amber-900 ring-1 ring-amber-500", label: "Siap Diambil", step: 1 },
  "selesai":      { cls: "bg-green-100 text-green-900 ring-1 ring-green-500", label: "Selesai", step: 2 }
};

function escapeHtml(str) {
  return String(str === null || str === undefined ? "" : str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function parseYmd(ymd) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(ymd || ""));
  if (!m) return null;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

function todayYmd() {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Jakarta", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const get = (type) => parts.find((p) => p.type === type).value;
  return get("year") + "-" + get("month") + "-" + get("day");
}

function formatTanggalPanjang(ymd) {
  const d = parseYmd(ymd);
  if (!d) return ymd || "-";
  return `${HARI[d.getDay()]}, ${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`;
}

function findLayanan(nama) {
  return LAYANAN.find((l) => l.nama === nama);
}

function normalizePhone(raw) {
  return String(raw || "").trim().replace(/[\s\-().]/g, "");
}

function getKey() {
  return sessionStorage.getItem(KEY_STORAGE) || "";
}

function setKey(k) {
  sessionStorage.setItem(KEY_STORAGE, k);
}

function clearKey() {
  sessionStorage.removeItem(KEY_STORAGE);
}

class ApiError extends Error {
  constructor(message, code) { super(message); this.code = code || ""; }
}

async function callApi(payload) {
  if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.indexOf("GANTI_DENGAN") === 0) {
    throw new ApiError("URL Google Apps Script belum diatur. Isi konstanta GOOGLE_SCRIPT_URL.", "NO_URL");
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(Object.assign({}, payload, { adminKey: getKey() })),
      signal: controller.signal
    });

    if (!response.ok) throw new ApiError("Server mengembalikan kesalahan (" + response.status + ").");

    let data;
    try { data = await response.json(); }
    catch (e) { throw new ApiError("Respons server tidak valid. Pastikan Web App di-deploy (versi terbaru) dengan akses \"Anyone\"."); }

    if (data && data.success === false) {
      throw new ApiError(data.message || "Permintaan ditolak.", data.code);
    }
    return data;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (err.name === "AbortError") throw new ApiError("Koneksi terlalu lama. Periksa internet lalu coba lagi.");
    if (err instanceof TypeError) throw new ApiError("Tidak dapat terhubung ke server. Periksa internet atau URL Apps Script.");
    throw err;
  } finally {
    clearTimeout(timer);
  }
}
