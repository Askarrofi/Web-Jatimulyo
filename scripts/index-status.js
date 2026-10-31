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
    liveKodeFeedback();
});

function paintKodeList(container, rows) {
    container.textContent = "";
    rows.forEach((row) => {
        const style = getStatusStyle(row.status);
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "kode-item";
        const full = document.createElement("span");
        full.className = "kode-item-full";
        full.textContent = row.full;
        const badge = document.createElement("span");
        badge.className = "badge";
        badge.dataset.status = style.key;
        badge.textContent = style.label;
        btn.appendChild(full);
        btn.appendChild(badge);
        btn.addEventListener("click", () => {
            $("trackingCode").value = row.full.slice(-4);
            liveKodeFeedback();
            $("trackingCode").focus();
        });
        container.appendChild(btn);
    });
}

function renderKodeList() {
    const codes = readKodeList();
    $("kode-list-box").classList.toggle("hidden", !codes.length);
    if (!codes.length) return;
    Promise.allSettled(codes.map((full) =>
        callApi({ action: "checkStatus", trackingCode: full.slice(-4) })
    )).then((results) => {
        const aktif = [];
        const selesai = [];
        results.forEach((r, i) => {
            if (r.status !== "fulfilled") return;
            const row = { full: codes[i], status: r.value.statusPelayanan };
            if (getStatusStyle(row.status).key === "selesai") selesai.push(row);
            else aktif.push(row);
        });
        paintKodeList($("kode-list-aktif"), aktif);
        paintKodeList($("kode-list-selesai"), selesai);
        $("kode-aktif-wrap").classList.toggle("hidden", !aktif.length);
        $("kode-selesai-wrap").classList.toggle("hidden", !selesai.length);
    });
}

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
    addKode(String(data.trackingCode).toUpperCase());

    const style = getStatusStyle(data.statusPelayanan);

    $("res-kode").textContent = data.trackingCode || kode;
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
