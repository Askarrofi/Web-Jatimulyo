function renderChecklist() {
    const nama = $("jenisLayanan").value;
    $("checklist-box").classList.toggle("hidden", !nama);
    syncBerkas("checklist-box", nama);
}

function initDateChips() {
    const date = parseYmd(todayYmd());
    const dates = [];

    date.setDate(date.getDate() + 1);

    while (dates.length < 2) {
        if (!HARI_TANPA_PELAYANAN.includes(date.getDay())) {
            dates.push(ymdFrom(date));
        }

        date.setDate(date.getDate() + 1);
    }

    $("date-chips").querySelectorAll(".date-chip").forEach((chip, index) => {
        const ymd = dates[index];
        const selected = parseYmd(ymd);

        chip.textContent =
            HARI[selected.getDay()]
            + ", "
            + selected.getDate()
            + " "
            + BULAN_PENDEK[selected.getMonth()];

        chip.dataset.ymd = ymd;
    });
}

$("date-chips").addEventListener("click", (e) => {
    const chip = e.target.closest("button[data-ymd]");
    if (chip === null) return;
    $("tanggalDatang").value = chip.dataset.ymd;
    syncTanggalField("tanggalDatang", calPublic);
});

function liveWaFeedback() {
    const el = $("noWa");
    const v = el.value.trim();
    el.classList.toggle("field-ok", v.length > 0 && WA_REGEX.test(v));
}

$("noWa").addEventListener("input", (e) => {
    const tail = e.target.value.replace(/\D/g, "").replace(/^(08|628|8|0)+/, "").slice(0, 12);
    e.target.value = "08" + tail;
    liveWaFeedback();
});

const FORM_CHECKS = {
    nama: (v) => v.trim().length < 3 ? "Mohon memasukkan nama lengkap minimal 3 huruf." : "",
    noWa: (v) => WA_REGEX.test(normalizePhone(v)) ? "" : "Masukkan nomor WhatsApp yang valid, contoh 081234567890.",
    dusun: (v) => v ? "" : "Mohon memilih dusun tempat tinggal Anda.",
    rt: (v) => RT_REGEX.test(v.trim()) ? "" : "Mohon mengisi RT dengan angka, contoh 003.",
    jenisLayanan: (v) => v ? "" : "Mohon memilih jenis layanan yang diinginkan.",
    tanggalDatang: (v) => msgTanggalError(v)
};

const FIELD_LABEL = {
    nama: "Nama Lengkap",
    noWa: "Nomor WhatsApp",
    dusun: "Dusun",
    rt: "RT",
    jenisLayanan: "Jenis Layanan",
    tanggalDatang: "Tanggal Kedatangan"
};

Object.keys(FORM_CHECKS).filter((f) => f !== "tanggalDatang").forEach((f) => attachLiveValidation(f, FORM_CHECKS[f]));

function fieldTarget(field) {
    return field === "tanggalDatang" ? $("tanggalDatang-btn") : $(field);
}

function collectErrors() {
    const errs = [];
    Object.keys(FORM_CHECKS).forEach((f) => {
        const msg = FORM_CHECKS[f]($(f).value);
        setFieldError(f, msg);
        if (msg) errs.push({ field: f, msg: msg });
    });
    return errs;
}

let errPopupTimer = null;

function showFormErrors(errs) {
    const list = $("err-list");
    list.textContent = "";
    errs.forEach((err) => {
        const li = document.createElement("li");
        li.textContent = (FIELD_LABEL[err.field] ? FIELD_LABEL[err.field] + ". " : "") + err.msg;
        list.appendChild(li);
    });
    $("err-title").textContent = errs.length > 1
        ? "Ada " + errs.length + " isian yang perlu diperbaiki"
        : "Isian belum lengkap";
    $("err-close").classList.add("hidden");
    openModal("err-popup");
    clearTimeout(errPopupTimer);
    errPopupTimer = setTimeout(() => $("err-close").classList.remove("hidden"), 1000);
}

function focusFirstError() {
    const err = $("form-daftar").querySelector("[data-err]:not(.hidden)");
    if (!err) return;
    const target = fieldTarget(err.dataset.for);
    target.focus();
    target.scrollIntoView({ block: "center", behavior: "smooth" });
}

$("err-close").addEventListener("click", () => {
    clearTimeout(errPopupTimer);
    closeModalById("err-popup");
    focusFirstError();
});

let lastRegistration = null;

$("form-daftar").addEventListener("submit", async (e) => {
    e.preventDefault();
    const errs = collectErrors();
    if (errs.length) {
        showFormErrors(errs);
        return;
    }

    const payload = {
        action: "register",
        nama: $("nama").value.trim(),
        noWa: normalizePhone($("noWa").value),
        dusun: $("dusun").value,
        rt: $("rt").value.trim(),
        jenisLayanan: $("jenisLayanan").value,
        tanggalDatang: $("tanggalDatang").value
    };

    setLoading("btn-submit", "spin-submit", "label-submit", true, "Mengirim pendaftaran...");

    let result;
    try {
        result = await callApi(payload);
        if (!result.trackingCode) {
            throw new Error("Pendaftaran gagal. Silakan coba lagi.");
        }
    } catch (err) {
        showFormErrors([{ field: "", msg: err.message }]);
        setLoading("btn-submit", "spin-submit", "label-submit", false, "Mengirim pendaftaran...");
        return;
    }
    const kodeFull = String(result.trackingCode).toUpperCase();
    lastRegistration = { kode: kodeFull, layanan: payload.jenisLayanan, tanggal: payload.tanggalDatang };
    addKode(kodeFull);
    openSuccessModal(lastRegistration);
    $("form-daftar").reset();
    calPublic.sync();
    $("noWa").classList.remove("field-ok");
    $("checklist-box").classList.add("hidden");
    setLoading("btn-submit", "spin-submit", "label-submit", false, "Mengirim pendaftaran...");
});

$("jenisLayanan").addEventListener("change", renderChecklist);

function openSuccessModal(reg) {
    $("modal-kode").textContent = reg.kode;
    $("modal-layanan").textContent = reg.layanan;
    $("modal-tanggal").textContent = formatTanggalPanjang(reg.tanggal);
    openModal("modal");
}

function closeModal() {
    closeModalById("modal");
}

$("btn-modal-tutup").addEventListener("click", closeModal);
$("modal").addEventListener("click", (e) => { if (e.target === $("modal")) closeModal(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !$("modal").classList.contains("hidden")) closeModal(); });

$("btn-modal-cek").addEventListener("click", () => {
    const kode = lastRegistration ? lastRegistration.kode.slice(-4) : "";
    closeModal();
    showTab("status");
    $("trackingCode").value = kode;
    liveKodeFeedback();
    $("trackingCode").focus();
});

$("btn-copy").addEventListener("click", async () => {
    const kode = $("modal-kode").textContent;
    try {
        await navigator.clipboard.writeText(kode);
    } catch (e) {
        const ta = document.createElement("textarea");
        ta.value = kode;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
    }
    swapLabel($("copy-label"), "Tersalin!", true);
    setTimeout(() => swapLabel($("copy-label"), "", false), 2000);
});

initDateChips();
