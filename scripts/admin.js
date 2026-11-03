let rows = [];
$("btn-lock").addEventListener("click", () => {
    clearKey();
    rows = [];
    view = [];
    $("cards").textContent = "";
    renderStats();
    setConnState("idle", "Belum terhubung");
    $("key-input").value = "";
    openModal("modal-key");
});

$("key-input").addEventListener("input", () => {
    $("key-submit").disabled = $("key-input").value.trim().length < 6;
});

function applyKey(k) {
    setKey(k);
    closeModalById("modal-key");
    load(true);
}

$("form-key").addEventListener("submit", (e) => {
    e.preventDefault();
    applyKey($("key-input").value.trim());
});



async function load(showSpinner) {
    if (!getKey()) {
        openModal("modal-key");
        return;
    }

    if (showSpinner) setConnState("loading", "Memuat data...");
    showError("");

    try {
        const data = await callApi({ action: "getAllData" });
        rows = Array.isArray(data.data)
            ? data.data.map((row) => Object.assign({}, row, {
                tanggalDatang: normalizeYmd(row.tanggalDatang)
            }))
            : [];
        renderStats();
        applyFilters();
        setConnState("ok", "Online");
    } catch (err) {
        setConnState("error", "Gagal terhubung");
        showError(
            err.message === "Kunci Operator tidak valid"
                ? "Kunci Operator tidak valid. Tekan Kunci lalu masukkan kunci yang tersimpan pada ADMIN_KEY."
                : err.message
        )
    }
}

["f-search", "f-status", "f-layanan", "f-dusun", "f-jalur", "f-date", "f-sort"].forEach((id) => {
    $(id).addEventListener("input", () => {
        page = 1;
        applyFilters();
    });
});

function resetFilters() {
    $("f-search").value = "";
    $("f-status").value = "";
    $("f-layanan").value = "";
    $("f-dusun").value = "";
    $("f-jalur").value = "";
    $("f-date").value = "all";
    $("f-sort").value = "newest";
    page = 1;
    applyFilters();
}

$("f-reset").addEventListener(
    "click",
    resetFilters
);

$("cards-empty-reset").addEventListener(
    "click",
    resetFilters
);

$("pg-prev").addEventListener("click", () => {
    if (page > 1) {
        page--;
        renderTable();
    }
});

$("pg-next").addEventListener("click", () => {
    if (page < Math.ceil(view.length / PAGE_SIZE)) {
        page++;
        renderTable();
    }
});

(function init() {
    fillDusunSelect($("f-dusun"));
    fillLayananSelect($("f-layanan"));
    $("f-dusun").querySelector("option").textContent = "Semua Dusun";
    $("f-layanan").querySelector("option").textContent = "Semua Layanan";
    renderStats();
    load(true);
})();
