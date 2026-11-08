const SHEET_NAME = "Pendaftaran";
const HARI_TANPA_PELAYANAN = [0, 6];
const WA_REGEX = /^(\+62|62|0)8[1-9][0-9]{6,11}$/;
const RT_REGEX = /^\d{1,3}$/;
const KODE_REGEX = /^JTM-[0-9]{8}-[A-Z0-9]{16}$/;
const DUSUN_VALUES = ["I A", "I B", "I C", "I D", "II A", "II B", "II C", "II D", "III", "IV", "V A", "V B"];
const JALUR_VALUES = ["Online", "Offline"];
const STATUS_VALUES = ["Diproses", "Siap Diambil", "Selesai"];
const LAYANAN_VALUES = ["Surat Keterangan Usaha (SKU)", "Surat Keterangan Tidak Mampu (SKTM)", "Surat Keterangan Domisili", "Surat Keterangan Beda Nama", "Surat Pengantar SKCK"];
const HEADERS = ["Timestamp", "Nama Lengkap", "Nomor WhatsApp", "Dusun", "RT", "Jenis Layanan", "Tanggal Kedatangan", "Jalur", "Kode Tracking", "Status Pelayanan", "Catatan"];

function getSheet_() {
  const sheet = SpreadsheetApp
    .getActiveSpreadsheet()
    .getSheetByName(SHEET_NAME)

  if (!sheet) {
    throw new Error("Sheet Pendaftaran tidak ditemukan")
  }

  return sheet
}

function digest_(value) {
  return Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    String(value),
    Utilities.Charset.UTF_8
  )
}
function sameDigest_(left, right) {
  const leftDigest = digest_(left)
  const rightDigest = digest_(right)
  let difference = leftDigest.length ^ rightDigest.length
  const length = Math.max(
    leftDigest.length,
    rightDigest.length
  )
  for (let index = 0; index < length; index++) {
    difference |= (
      leftDigest[index] || 0
    ) ^ (
      rightDigest[index] || 0
    )
  }
  return difference === 0
}
function requireAdmin_(providedKey) {
  const expectedKey = String(
    PropertiesService
      .getScriptProperties()
      .getProperty("ADMIN_KEY")
      || ""
  ).trim()
  const receivedKey = String(
    providedKey || ""
  ).trim()
  if (
    expectedKey.length < 32
    || receivedKey.length < 32
    || receivedKey.length > 128
    || !sameDigest_(receivedKey, expectedKey)
  ) {
    throw new Error("Kunci Operator tidak valid")
  }
}
function setupSheet() {
  const sh = getSheet_();

  sh.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  sh.setFrozenRows(1);

  formatSheet_();
  setupValidation_();
  setupFilter_();
  setupSummary_();

  return "Spreadsheet siap digunakan.";
}

function formatSheet_() {
  const sh = getSheet_();
  const maxRows = sh.getMaxRows();

  sh.setFrozenRows(1);
  sh.setHiddenGridlines(false);

  sh.getRange(1, 1, 1, HEADERS.length)
    .setFontWeight("bold")
    .setFontColor("#FFFFFF")
    .setBackground("#1B3A22")
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle")
    .setWrap(true);

  sh.setRowHeight(1, 42);

  const widths = [
    165,
    220,
    150,
    85,
    65,
    280,
    150,
    85,
    195,
    145,
    320
  ];

  widths.forEach((width, index) => {
    sh.setColumnWidth(index + 1, width);
  });

  if (maxRows < 2) return;

  const dataRows = maxRows - 1;

  sh.getRange(2, 1, dataRows, HEADERS.length)
    .setVerticalAlignment("middle")
    .setFontColor("#202124");

  sh.getRange(2, 1, dataRows, 1)
    .setNumberFormat("dd/mm/yyyy hh:mm");

  sh.getRange(2, 2, dataRows, 1)
    .setWrap(true);

  sh.getRange(2, 3, dataRows, 1)
    .setNumberFormat("@");

  sh.getRange(2, 4, dataRows, 1)
    .setHorizontalAlignment("center");

  sh.getRange(2, 5, dataRows, 1)
    .setNumberFormat("@")
    .setHorizontalAlignment("center");

  sh.getRange(2, 6, dataRows, 1)
    .setWrap(true);

  sh.getRange(2, 7, dataRows, 1)
    .setNumberFormat("dd/mm/yyyy")
    .setHorizontalAlignment("center");

  sh.getRange(2, 8, dataRows, 1)
    .setHorizontalAlignment("center");

  sh.getRange(2, 9, dataRows, 1)
    .setNumberFormat("@")
    .setFontWeight("bold")
    .setFontColor("#1B5E20")
    .setHorizontalAlignment("center");

  sh.getRange(2, 10, dataRows, 1)
    .setHorizontalAlignment("center");

  sh.getRange(2, 11, dataRows, 1)
    .setWrap(true);

  sh.getRange(2, 1, dataRows, HEADERS.length)
    .applyRowBanding(
      SpreadsheetApp.BandingTheme.LIGHT_GREY,
      false,
      false
    );

  const statusRange = sh.getRange(2, 10, dataRows, 1);

  sh.setConditionalFormatRules([
    SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo("Diproses")
      .setBackground("#FFF4CC")
      .setFontColor("#6B4F00")
      .setBold(true)
      .setRanges([statusRange])
      .build(),

    SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo("Siap Diambil")
      .setBackground("#D9EAF7")
      .setFontColor("#0B4F71")
      .setBold(true)
      .setRanges([statusRange])
      .build(),

    SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo("Selesai")
      .setBackground("#DDEFE2")
      .setFontColor("#1B5E20")
      .setBold(true)
      .setRanges([statusRange])
      .build()
  ]);
}

function listRule_(values, helpText) {
  return SpreadsheetApp.newDataValidation()
    .requireValueInList(values, true)
    .setAllowInvalid(false)
    .setHelpText(helpText)
    .build();
}

function setupValidation_() {
  const sh = getSheet_();
  const dataRows = sh.getMaxRows() - 1;

  sh.getRange(2, 4, dataRows, 1)
    .setDataValidation(
      listRule_(
        DUSUN_VALUES,
        "Pilih Dusun dari daftar."
      )
    );

  sh.getRange(2, 6, dataRows, 1)
    .setDataValidation(
      listRule_(
        LAYANAN_VALUES,
        "Pilih jenis layanan dari daftar."
      )
    );

  sh.getRange(2, 7, dataRows, 1)
    .setDataValidation(
      SpreadsheetApp.newDataValidation()
        .requireDate()
        .setAllowInvalid(false)
        .setHelpText("Masukkan tanggal kedatangan yang valid.")
        .build()
    );

  sh.getRange(2, 8, dataRows, 1)
    .setDataValidation(
      listRule_(
        JALUR_VALUES,
        "Pilih Online atau Offline."
      )
    );

  sh.getRange(2, 10, dataRows, 1)
    .setDataValidation(
      listRule_(
        STATUS_VALUES,
        "Pilih status pelayanan dari daftar."
      )
    );
}

function setupFilter_() {
  const sh = getSheet_();
  const filter = sh.getFilter();

  if (filter) {
    filter.remove();
  }

  sh.getRange(
    1,
    1,
    sh.getMaxRows(),
    HEADERS.length
  ).createFilter();
}

function setupSummary_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName("Ringkasan");

  if (!sh) {
    sh = ss.insertSheet("Ringkasan");
  }

  sh.clear();
  sh.setHiddenGridlines(true);
  sh.setFrozenRows(2);

  sh.getRange("A1:D1")
    .merge()
    .setValue("Ringkasan Pelayanan Desa Jatimulyo")
    .setFontSize(16)
    .setFontWeight("bold")
    .setFontColor("#FFFFFF")
    .setBackground("#1B3A22")
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle");

  sh.setRowHeight(1, 44);

  sh.getRange("A3:B3")
    .setValues([["Indikator", "Jumlah"]])
    .setFontWeight("bold")
    .setFontColor("#FFFFFF")
    .setBackground("#315C3A");

  sh.getRange("A4:A10").setValues([
    ["Total Pendaftaran"],
    ["Sedang Diproses"],
    ["Siap Diambil"],
    ["Selesai"],
    ["Pendaftaran Online"],
    ["Pendaftaran Offline"],
    ["Kedatangan Hari Ini"]
  ]);

  sh.getRange("B4:B10").setFormulas([
    ["=COUNTA(Pendaftaran!I2:I)"],
    ["=COUNTIF(Pendaftaran!J2:J,\"Diproses\")"],
    ["=COUNTIF(Pendaftaran!J2:J,\"Siap Diambil\")"],
    ["=COUNTIF(Pendaftaran!J2:J,\"Selesai\")"],
    ["=COUNTIF(Pendaftaran!H2:H,\"Online\")"],
    ["=COUNTIF(Pendaftaran!H2:H,\"Offline\")"],
    ["=COUNTIF(Pendaftaran!G2:G,TODAY())"]
  ]);

  sh.getRange("A3:B10")
    .setVerticalAlignment("middle");

  sh.getRange("B4:B10")
    .setFontWeight("bold")
    .setFontSize(13)
    .setFontColor("#1B5E20")
    .setHorizontalAlignment("center");

  sh.getRange("D3:E3")
    .setValues([["Jenis Layanan", "Jumlah"]])
    .setFontWeight("bold")
    .setFontColor("#FFFFFF")
    .setBackground("#315C3A");

  sh.getRange(4, 4, LAYANAN_VALUES.length, 1)
    .setValues(
      LAYANAN_VALUES.map((value) => [value])
    );

  sh.getRange(4, 5, LAYANAN_VALUES.length, 1)
    .setFormulas(
      LAYANAN_VALUES.map((value) => [
        '=COUNTIF(Pendaftaran!F:F,"'
        + value.replace(/"/g, '""')
        + '")'
      ])
    );

  sh.getRange(4, 5, LAYANAN_VALUES.length, 1)
    .setFontWeight("bold")
    .setHorizontalAlignment("center");

  sh.setColumnWidth(1, 220);
  sh.setColumnWidth(2, 100);
  sh.setColumnWidth(3, 30);
  sh.setColumnWidth(4, 300);
  sh.setColumnWidth(5, 100);

  sh.getRange("A3:B10")
    .applyRowBanding(
      SpreadsheetApp.BandingTheme.LIGHT_GREY,
      true,
      false
    );

  sh.getRange(
    3,
    4,
    LAYANAN_VALUES.length + 1,
    2
  ).applyRowBanding(
    SpreadsheetApp.BandingTheme.LIGHT_GREY,
    true,
    false
  );

  sh.getRange("A12:E12")
    .merge()
    .setValue(
      "Ringkasan berubah otomatis ketika data Pendaftaran berubah."
    )
    .setFontColor("#5F6368")
    .setFontStyle("italic");
}

function readRows_() {
  const sh = getSheet_();
  const last = sh.getLastRow();
  if (last < 2) return [];
  return sh.getRange(2, 1, last - 1, HEADERS.length).getValues();
}

function ymdToday_() {
  return Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyyMMdd");
}

function todayYmd_() {
  return Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyy-MM-dd");
}

function parseYmd_(ymd) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(ymd || ""));
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  return date;
}

function ok_(payload) {
  return ContentService.createTextOutput(JSON.stringify(Object.assign({ success: true }, payload))).setMimeType(ContentService.MimeType.JSON);
}

function fail_(message, code) {
  return ContentService.createTextOutput(JSON.stringify({ success: false, message: message, code: code || "" })).setMimeType(ContentService.MimeType.JSON);
}

function normalizePhone_(raw) {
  return String(raw || "").trim().replace(/[\s\-().]/g, "");
}

function isFormula_(value) {
  return /^[=+\-@]/.test(
    String(value || "").trim()
  )
}

function register_(e) {
  const nama = String(e.nama || "").trim();
  const noWaRaw = String(e.noWa || "").trim();
  const dusun = String(e.dusun || "").trim();
  const rt = String(e.rt || "").trim();
  const jenisLayanan = String(e.jenisLayanan || "").trim();
  const tanggalDatang = String(e.tanggalDatang || "").trim();
  const jalur = String(e.jalur || "Online").trim();
  const catatan = String(e.catatan || "").trim();
  if (isFormula_(nama)) return fail_("Nama lengkap tidak valid.");
  if (isFormula_(noWaRaw)) return fail_("Nomor WhatsApp tidak valid.");
  if (isFormula_(rt)) return fail_("RT tidak valid.");
  if (isFormula_(catatan)) return fail_("Catatan tidak valid.");
  if (!JALUR_VALUES.includes(jalur)) return fail_("Jalur pendaftaran tidak valid.");
  if (jalur === "Offline") requireAdmin_(e.adminKey);
  if (nama.length < 3 || nama.length > 100) return fail_("Nama lengkap harus terdiri dari 3 sampai 100 karakter.");
  if (!DUSUN_VALUES.includes(dusun)) return fail_("Dusun tidak valid.");
  if (!RT_REGEX.test(rt)) return fail_("RT harus angka, contoh 003.");
  if (!LAYANAN_VALUES.includes(jenisLayanan)) return fail_("Jenis layanan tidak valid.");
  if (!noWaRaw && jalur === "Online") return fail_("Nomor WhatsApp harus diisi untuk pendaftaran Online.");
  if (noWaRaw && !WA_REGEX.test(normalizePhone_(noWaRaw))) return fail_("Nomor WhatsApp tidak valid.");
  if (catatan.length > 500) return fail_("Catatan maksimal 500 karakter.");
  const tgl = parseYmd_(tanggalDatang);
  if (!tgl) return fail_("Tanggal kedatangan tidak valid.");
  if (tanggalDatang < todayYmd_()) return fail_("Tanggal tidak boleh sebelum hari ini.");
  if (HARI_TANPA_PELAYANAN.includes(tgl.getDay())) return fail_("Balai Desa tidak melayani pada hari itu. Pilih hari lain.");
  const lock = LockService.getScriptLock();

  lock.waitLock(10000)

  try {
    const kode = trackingCode_()

    getSheet_().appendRow([
      new Date(),
      nama,
      noWaRaw
        ? normalizePhone_(noWaRaw)
        : "",
      dusun,
      rt.padStart(3, "0"),
      jenisLayanan,
      parseYmd_(tanggalDatang),
      jalur,
      kode,
      "Diproses",
      catatan
    ])

    SpreadsheetApp.flush()

    return ok_({
      trackingCode: kode
    })
  } finally {
    lock.releaseLock()
  }
}

function trackingCode_() {
  return "JTM-"
    + ymdToday_()
    + "-"
    + Utilities
      .getUuid()
      .replace(/-/g, "")
      .slice(0, 16)
      .toUpperCase()
}

function findTrackingRow_(code) {
  const sheet = getSheet_()
  const dataRows = sheet.getLastRow() - 1

  if (dataRows < 1) {
    return null
  }

  const cell = sheet
    .getRange(
      2,
      9,
      dataRows,
      1
    )
    .createTextFinder(code)
    .matchEntireCell(true)
    .findNext()

  if (!cell) {
    return null
  }

  return {
    sheet: sheet,
    rowNumber: cell.getRow(),
    row: sheet
      .getRange(
        cell.getRow(),
        1,
        1,
        HEADERS.length
      )
      .getValues()[0]
  }
}

function checkStatus_(e) {
  const code = String(e.trackingCode || "").trim().toUpperCase();
  if (!KODE_REGEX.test(code)) return fail_("Kode Tracking tidak valid.");
  const found = findTrackingRow_(code);
  if (!found) return fail_("Kode Tracking tidak ditemukan. Periksa kembali kode Anda.");
  const row = found.row;
  return ok_({ jenisLayanan: row[5], tanggalDatang: ymdOfCell_(row[6]), trackingCode: row[8], statusPelayanan: row[9] });
}
function ymdOfCell_(value) {
  const text = String(value || "").trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return text;
  }

  const date = value instanceof Date
    ? value
    : new Date(text);

  return Utilities.formatDate(
    date,
    "Asia/Jakarta",
    "yyyy-MM-dd"
  );
}

function getAllData_(e) {
  requireAdmin_(e.adminKey);
  const data = readRows_().map((row) => ({ timestamp: row[0] ? new Date(row[0]).toISOString() : "", nama: row[1], noWa: row[2], dusun: row[3], rt: row[4], jenisLayanan: row[5], tanggalDatang: ymdOfCell_(row[6]), jalur: row[7], trackingCode: row[8], statusPelayanan: row[9], catatan: row[10] }));
  return ok_({ data: data });
}

function updateStatus_(e) {
  requireAdmin_(e.adminKey);
  const code = String(e.trackingCode || "").trim().toUpperCase();
  const newStatus = String(e.newStatus || "").trim();
  const catatan = String(e.catatan || "").trim();
  if (isFormula_(catatan)) return fail_("Catatan tidak valid.");
  if (!KODE_REGEX.test(code)) return fail_("Kode Tracking tidak valid.");
  if (!STATUS_VALUES.includes(newStatus)) return fail_("Status tidak valid.");
  if (catatan.length > 500) return fail_("Catatan maksimal 500 karakter.");
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const found = findTrackingRow_(code);
    if (!found) return fail_("Kode Tracking tidak ditemukan.");
    found.sheet.getRange(found.rowNumber, 10, 1, 2).setValues([[newStatus, catatan]]);
    SpreadsheetApp.flush();
    return ok_({ statusPelayanan: newStatus, catatan: catatan });
  } finally {
    lock.releaseLock();
  }
}
function doGet() {
  return fail_("Gunakan permintaan POST.", "METHOD_NOT_ALLOWED");
}

function doPost(e) {
  let payload

  try {
    if (
      !e
      || !e.postData
      || typeof e.postData.contents !== "string"
      || e.postData.contents.length > 4096
    ) {
      return fail_(
        "Permintaan tidak valid.",
        "BAD_REQUEST"
      )
    }

    payload = JSON.parse(
      e.postData.contents
    )
  } catch (error) {
    return fail_(
      "Permintaan tidak valid.",
      "BAD_REQUEST"
    )
  }

  if (
    !payload
    || Array.isArray(payload)
    || typeof payload !== "object"
  ) {
    return fail_(
      "Permintaan tidak valid.",
      "BAD_REQUEST"
    )
  }

  const handlers = {
    register: register_,
    updateStatus: updateStatus_,
    getAllData: getAllData_,
    checkStatus: checkStatus_
  }

  const handler = handlers[
    String(payload.action || "")
  ]
  if (!handler) {
    return fail_(
      "Aksi tidak dikenal.",
      "UNKNOWN_ACTION"
    )
  }
  try {
    return handler(payload)
  } catch (error) {
    const message = String(
      error && error.message || ""
    )
    if (message === "Kunci Operator tidak valid") {
      return fail_(
        message,
        "UNAUTHORIZED"
      )
    }
    return fail_(
      "Server mengalami kesalahan.",
      "INTERNAL_ERROR"
    )
  }
}
