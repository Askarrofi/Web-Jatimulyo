const STATUS_OPTIONS = ["Diproses", "Siap Diambil", "Selesai"];

function renderStatusOptions(selected) {
    $("m-status").textContent = "";
    STATUS_OPTIONS.forEach((s) => {
        const o = document.createElement("option");
        o.value = s;
        o.textContent = s === "Diproses" ? "Sedang Diproses" : s;
        o.selected = s === selected;
        $("m-status").appendChild(o);
    });
}

let current = null;

function openManage(r) {
    current = r;
    $("m-kode").textContent = "Kode Tracking: " + String(r.trackingCode || "").slice(-4).toUpperCase();
    $("m-nama").textContent = r.nama || "-";
    $("m-wa").textContent = formatPhoneId(r.noWa);
    const phone = String(r.noWa || "").replace(/\D/g, "");
    const whatsappPhone = phone.replace(/^0/, "62");

    $("m-wa-link").classList.toggle("hidden", !phone);
    $("m-call-link").classList.toggle("hidden", !phone);

    $("m-wa-link").href = phone
        ? "https://wa.me/" + whatsappPhone
        : "#";

    $("m-call-link").href = phone
        ? "tel:+" + whatsappPhone
        : "#";
    $("m-dusun").textContent = r.dusun || "-";
    $("m-rt").textContent = r.rt || "-";
    $("m-jalur").textContent = r.jalur || "-";
    $("m-layanan").textContent = r.jenisLayanan || "-";
    $("m-tanggal").textContent = formatTanggalPanjang(r.tanggalDatang);
    $("m-timestamp").textContent = formatDateTimeId(r.timestamp);
    $("m-catatan").value = r.catatan || "";
    renderStatusOptions(r.statusPelayanan || "Diproses");
    const style = getStatusStyle(r.statusPelayanan);
    $("m-current-badge").querySelector(".badge").dataset.status = style.key;
    $("m-current-badge").querySelector(".badge").textContent = style.label;
    syncBerkas("m-berkas", r.jenisLayanan);
    showError("");
    openModal("modal-manage");
    $("m-close").focus();
}

function closeManage() {
    closeModalById("modal-manage");
}

$("m-close").addEventListener("click", closeManage);
$("m-cancel").addEventListener("click", closeManage);
$("modal-manage").addEventListener("click", (e) => { if (e.target === $("modal-manage")) closeManage(); });

$("m-chips").addEventListener("click", (e) => {
    const chip = e.target.closest("button[data-chip]");
    if (chip === null) return;
    const note = chip.dataset.chip;
    const notes = $("m-catatan").value
        .split("\n")
        .map((value) => value.trim())
        .filter(Boolean);

    if (!notes.includes(note)) {
        notes.push(note);
    }

    $("m-catatan").value = notes.join("\n");
    $("m-catatan").focus();
});

$("m-save").addEventListener("click", async () => {
    const status = $("m-status").value;
    const catatan = $("m-catatan").value.trim();

    setLoading("m-save", "m-spin", "m-save-label", true, "Menyimpan perubahan...");

    try {
        await callApi({
            action: "updateStatus",
            trackingCode: current.trackingCode,
            newStatus: status,
            catatan: catatan
        });
        toast("Perubahan tersimpan.");
        closeManage();
        await load();
    } catch (err) {
        showError(err.message);
    } finally {
        setLoading("m-save", "m-spin", "m-save-label", false, "Menyimpan perubahan...");
    }
});

fillBerkasBox("m-berkas");
