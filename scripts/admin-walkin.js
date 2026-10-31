let calWalkin = null;

function resetWalkinForm() {
    $("form-walkin").reset();
    if (calWalkin) calWalkin.sync();
    $("w-berkas-box").classList.add("hidden");
    $("w-error").classList.add("hidden");
    ["w-nama", "w-wa", "w-dusun", "w-rt", "w-layanan", "w-tanggal"].forEach((f) => setFieldError(f, ""));
}

function openWalkin() {
    resetWalkinForm();
    $("walkin-form-view").classList.remove("hidden");
    $("walkin-success-view").classList.add("hidden");
    openModal("modal-walkin");
    $("w-nama").focus();
}

function closeWalkin() {
    closeModalById("modal-walkin");
}

$("btn-walkin").addEventListener("click", openWalkin);
$("w-close").addEventListener("click", closeWalkin);
$("w-cancel").addEventListener("click", closeWalkin);
$("modal-walkin").addEventListener("click", (e) => { if (e.target === $("modal-walkin")) closeWalkin(); });

$("w-layanan").addEventListener("change", () => {
    syncBerkas("w-berkas-box", $("w-layanan").value);
    $("w-berkas-box").classList.toggle("hidden", !$("w-layanan").value);
});

const WALKIN_CHECKS = {
    "w-nama": (v) => v.trim().length < 3 ? "Mohon memasukkan nama lengkap minimal 3 huruf." : "",
    "w-wa": (v) => !v.trim() || WA_REGEX.test(normalizePhone(v)) ? "" : "Nomor WhatsApp tidak valid. Kosongkan jika tidak punya.",
    "w-dusun": (v) => v ? "" : "Mohon memilih dusun tempat tinggal warga.",
    "w-rt": (v) => RT_REGEX.test(v.trim()) ? "" : "Mohon mengisi RT dengan angka, contoh 003.",
    "w-layanan": (v) => v ? "" : "Mohon memilih jenis layanan.",
    "w-tanggal": (v) => msgTanggalError(v)
};

function collectWalkinErrors() {
    const errs = [];
    Object.keys(WALKIN_CHECKS).forEach((f) => {
        const msg = WALKIN_CHECKS[f]($(f).value);
        setFieldError(f, msg);
        if (msg) errs.push({ field: f, msg: msg });
    });
    return errs;
}

$("form-walkin").addEventListener("submit", async (e) => {
    e.preventDefault();
    $("w-error").classList.add("hidden");

    const errs = collectWalkinErrors();
    if (errs.length) {
        const first = errs[0];
        $(first.field).focus();
        $(first.field).scrollIntoView({ block: "center", behavior: "smooth" });
        return;
    }

    setLoading("w-submit", "w-spin", "w-submit-label", true, "Membuat kode...");

    const payload = {
        action: "register",
        nama: $("w-nama").value.trim(),
        noWa: normalizePhone($("w-wa").value),
        dusun: $("w-dusun").value,
        rt: $("w-rt").value.trim(),
        jenisLayanan: $("w-layanan").value,
        tanggalDatang: $("w-tanggal").value,
        jalur: "Offline",
        catatan: $("w-catatan").value.trim()
    };

    let result;
    try {
        result = await callApi(payload);
        if (!result.trackingCode) throw new Error("Pendaftaran gagal. Silakan coba lagi.");
    } catch (err) {
        $("w-error").textContent = err.message;
        $("w-error").classList.remove("hidden");
        setLoading("w-submit", "w-spin", "w-submit-label", false, "Membuat kode...");
        return;
    }

    const kodeShort = String(result.trackingCode).slice(-4).toUpperCase();
    $("ws-kode").textContent = kodeShort;
    $("ws-nama").textContent = payload.nama;
    $("ws-layanan").textContent = payload.jenisLayanan;
    $("ws-tanggal").textContent = formatTanggalPanjang(payload.tanggalDatang);
    $("ps-kode").textContent = kodeShort;
    $("ps-nama").textContent = payload.nama;
    $("ps-layanan").textContent = payload.jenisLayanan;
    $("ps-tanggal").textContent = formatTanggalPanjang(payload.tanggalDatang);

    $("walkin-form-view").classList.add("hidden");
    $("walkin-success-view").classList.remove("hidden");
    setLoading("w-submit", "w-spin", "w-submit-label", false, "Membuat kode...");
    await load();
});

$("ws-print").addEventListener("click", () => window.print());
$("ws-another").addEventListener("click", openWalkin);
$("ws-done").addEventListener("click", closeWalkin);

fillDusunSelect($("w-dusun"));
fillLayananSelect($("w-layanan"));
fillBerkasBox("w-berkas-box");
calWalkin = makeCalendar($("w-tanggal-btn"), $("w-tanggal"), () => syncTanggalField("w-tanggal", calWalkin));
