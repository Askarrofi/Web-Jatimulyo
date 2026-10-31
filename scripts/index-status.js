function renderSteps(activeStep) {
    $("res-steps").querySelectorAll("li").forEach((li, i) => {
        if (activeStep >= 0 && i <= activeStep) li.setAttribute("data-done", "");
        else li.removeAttribute("data-done");
    });
}

function showStatusError(msg) {
    const el = $("status-error");
    if (msg) { el.textContent = msg; el.classList.remove("hidden"); }
    else { el.textContent = ""; el.classList.add("hidden"); }
}

function liveKodeFeedback() {
    const el = $("trackingCode");
    const v = el.value.trim().toUpperCase();
    el.classList.toggle("field-ok", v.length > 0 && KODE_REGEX.test(v));
}

function checkKode(v) {
    const s = v.trim().toUpperCase();
    if (!s) return "Masukkan kode tracking terlebih dahulu.";
    return KODE_REGEX.test(s) ? "" : "Kode terdiri dari 4 huruf atau angka, contoh K7M2.";
}

attachLiveValidation("trackingCode", checkKode);

$("trackingCode").addEventListener("input", (e) => {
    e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4);
    $("kode-hint").classList.add("hidden");
    liveKodeFeedback();
});

$("form-status").addEventListener("submit", async (e) => {
    e.preventDefault();
    showStatusError("");
    $("status-result").classList.add("hidden");

    const kode = $("trackingCode").value.trim().toUpperCase();
    const kodeMsg = checkKode(kode);
    if (kodeMsg) { setFieldError("trackingCode", kodeMsg); $("trackingCode").focus(); return; }
    setFieldError("trackingCode", "");

    setLoading("btn-status", "spin-status", "label-status", true, "Memeriksa...");

    let data;
    try {
        data = await callApi({ action: "checkStatus", trackingCode: kode });
    } catch (err) {
        showStatusError(err.message);
        setLoading("btn-status", "spin-status", "label-status", false, "Memeriksa...");
        return;
    }
    localStorage.setItem(KODE_STORAGE, kode);

    const style = getStatusStyle(data.statusPelayanan);

    $("res-kode").textContent = kode;
    $("res-nama").textContent = data.nama || "-";
    $("res-layanan").textContent = data.jenisLayanan || "-";
    $("res-tanggal").textContent = formatTanggalPanjang(data.tanggalDatang);
    $("res-catatan").textContent = data.catatan && data.catatan.trim() ? data.catatan : "Belum ada catatan dari petugas.";

    const badge = $("res-badge");
    badge.dataset.status = style.key;
    badge.textContent = style.label;

    renderSteps(style.step);
    $("status-result").classList.remove("hidden");
    $("status-result").scrollIntoView({ block: "nearest" });
    setLoading("btn-status", "spin-status", "label-status", false, "Memeriksa...");
});

const lastKode = localStorage.getItem(KODE_STORAGE);
if (lastKode) {
    $("trackingCode").value = lastKode;
    $("kode-hint").classList.remove("hidden");
    liveKodeFeedback();
}
