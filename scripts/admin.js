const PAGE_SIZE = 25;
const SORTS = {
    "newest": (a, b) => String(b.timestamp).localeCompare(String(a.timestamp)),
    "date-asc": (a, b) => String(a.tanggalDatang).localeCompare(String(b.tanggalDatang)) || String(a.nama).localeCompare(String(b.nama)),
    "date-desc": (a, b) => String(b.tanggalDatang).localeCompare(String(a.tanggalDatang)) || String(b.nama).localeCompare(String(a.nama))
};

let rows = [];
let view = [];
let page = 1;
let refreshTimer = null;

function showError(message) {
    const el = $("error-banner");
    if (message) {
        el.textContent = message;
        el.classList.remove("hidden");
    } else {
        el.textContent = "";
        el.classList.add("hidden");
    }
}

function toast(message) {
    const el = $("toast");
    el.textContent = message;
    el.classList.remove("hidden");
    el.classList.add("reveal");
    setTimeout(() => {
        el.classList.add("hidden");
        el.classList.remove("reveal");
    }, 2200);
}

function setConnState(state, text) {
    const el = $("conn");
    el.dataset.state = state;
    $("conn-state").textContent = text;
    $("conn-time").textContent = state === "online" ? " - " + new Date().toLocaleTimeString("id-ID") : "";
}

function renderStats() {
    const today = todayYmd();
    const key = (s) => String(s || "").trim().toLowerCase();
    $("stat-today").textContent = rows.filter((r) => r.tanggalDatang === today && key(r.statusPelayanan) !== "selesai").length;
    $("stat-total").textContent = rows.length;
    $("stat-proses").textContent = rows.filter((r) => key(r.statusPelayanan) !== "selesai").length;
    $("stat-selesai").textContent = rows.filter((r) => key(r.statusPelayanan) === "selesai").length;
}

function matches(r, q, status, layanan, dusun, jalur, dateMode) {
    if (status) {
        if (status === "proses") {
            if (String(r.statusPelayanan || "").trim().toLowerCase() === "selesai") return false;
        } else if (String(r.statusPelayanan || "").trim().toLowerCase() !== status.toLowerCase()) {
            return false;
        }
    }
    if (layanan && String(r.jenisLayanan || "") !== layanan) return false;
    if (dusun && String(r.dusun || "") !== dusun) return false;
    if (jalur && String(r.jalur || "").trim().toLowerCase() !== jalur) return false;
    if (dateMode === "today" && r.tanggalDatang !== todayYmd()) return false;
    if (dateMode === "besok") {
        const d = parseYmd(todayYmd());
        d.setDate(d.getDate() + 1);
        if (r.tanggalDatang !== ymdFrom(d)) return false;
    }
    if (dateMode === "pekan") {
        const start = todayYmd();
        const end = parseYmd(start);
        end.setDate(end.getDate() + 6);
        if (r.tanggalDatang < start || r.tanggalDatang > ymdFrom(end)) return false;
    }
    if (dateMode === "lewat" && !(r.tanggalDatang < todayYmd())) return false;
    if (q) {
        const needle = q.toLowerCase();
        const hay = [r.nama, r.trackingCode, r.noWa, r.jenisLayanan, r.dusun, r.rt, r.catatan].join(" ").toLowerCase();
        if (!hay.includes(needle)) return false;
    }
    return true;
}

function applyFilters() {
    const q = $("f-search").value.trim().toLowerCase();
    const status = $("f-status").value;
    const layanan = $("f-layanan").value;
    const dusun = $("f-dusun").value;
    const jalur = $("f-jalur").value;
    const dateMode = $("f-date").value;
    const sortKey = $("f-sort").value;

    view = rows.filter((r) => matches(r, q, status, layanan, dusun, jalur, dateMode));
    view.sort(SORTS[sortKey] || SORTS.newest);
    page = Math.min(page, Math.max(1, Math.ceil(view.length / PAGE_SIZE)));
    renderTable();
}

function renderTable() {
    const tbody = $("tbody");
    tbody.textContent = "";
    const start = (page - 1) * PAGE_SIZE;
    const slice = view.slice(start, start + PAGE_SIZE);
    const today = todayYmd();

    slice.forEach((r) => {
        const tr = $("row-tpl").content.firstElementChild.cloneNode(true);
        tr.querySelector('[data-f="tanggal"]').textContent = formatTanggalDmy(r.tanggalDatang);
        tr.querySelector('[data-f="hari-ini"]').classList.toggle("hidden", r.tanggalDatang !== today);
        tr.querySelector('[data-f="kode"]').textContent = String(r.trackingCode || "").slice(-4).toUpperCase();
        const jalur = tr.querySelector('[data-f="jalur"]');
        jalur.dataset.jalur = String(r.jalur || "").toLowerCase();
        jalur.textContent = r.jalur || "-";
        tr.querySelector('[data-f="nama"]').textContent = r.nama || "-";
        tr.querySelector('[data-f="wa"]').textContent = r.noWa || "-";
        tr.querySelector('[data-f="layanan"]').textContent = r.jenisLayanan || "-";
        const status = tr.querySelector('[data-f="status"]');
        const style = getStatusStyle(r.statusPelayanan);
        status.dataset.status = style.key;
        status.textContent = style.label;
        tr.querySelector('[data-f="catatan"]').textContent = r.catatan || "";
        tr.querySelector('[data-f="manage"]').addEventListener("click", () => openManage(r));
        tbody.appendChild(tr);
    });

    const kosong = view.length === 0;
    $("table-empty").classList.toggle("hidden", !kosong);
    $("table-empty-text").textContent = rows.length === 0 ? "Belum ada pendaftaran." : "Tidak ada data yang cocok dengan filter.";
    $("pager-info").textContent = kosong ? "" : "Baris " + (start + 1) + "-" + Math.min(start + PAGE_SIZE, view.length) + " dari " + view.length;
    $("filter-info").textContent = rows.length === 0 ? "Belum ada data." : "Menampilkan " + view.length + " dari " + rows.length + " pendaftar";
    $("pg-prev").disabled = page <= 1;
    $("pg-next").disabled = page >= Math.ceil(view.length / PAGE_SIZE);
}

$("btn-lock").addEventListener("click", () => {
    clearKey();
    rows = [];
    view = [];
    $("tbody").textContent = "";
    renderStats();
    setConnState("idle", "Belum terhubung");
    $("modal-key").classList.remove("hidden");
    $("modal-key").classList.add("flex");
    $("key-input").value = "";
    $("key-input").focus();
});

$("key-input").addEventListener("input", () => {
    $("key-submit").disabled = $("key-input").value.trim().length < 6;
});

function applyKey(k) {
    setKey(k);
    $("modal-key").classList.add("hidden");
    $("modal-key").classList.remove("flex");
    load(true);
}

$("form-key").addEventListener("submit", (e) => {
    e.preventDefault();
    applyKey($("key-input").value.trim());
});

$("modal-key").addEventListener("click", (e) => { if (e.target === $("modal-key")) applyKey($("key-input").value.trim()); });

function scheduleRefresh(delay) {
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(() => load(), delay);
}

async function load(showSpinner) {
    if (!getKey()) {
        $("modal-key").classList.remove("hidden");
        $("modal-key").classList.add("flex");
        $("key-input").focus();
        return;
    }

    if (showSpinner) setConnState("loading", "Memuat data...");
    showError("");

    try {
        const data = await callApi({ action: "getAllData" });
        rows = Array.isArray(data.data) ? data.data : [];
        renderStats();
        applyFilters();
        setConnState("ok", "Online");
        scheduleRefresh(300000);
    } catch (err) {
        setConnState("error", "Gagal terhubung");
        showError(err.message + " Klik tombol Kunci lalu masukkan kunci untuk mencoba lagi.");
    }
}

["f-search", "f-status", "f-layanan", "f-dusun", "f-jalur", "f-date", "f-sort"].forEach((id) => {
    $(id).addEventListener("input", () => {
        page = 1;
        applyFilters();
    });
});

$("f-reset").addEventListener("click", () => {
    $("f-search").value = "";
    $("f-status").value = "";
    $("f-layanan").value = "";
    $("f-dusun").value = "";
    $("f-jalur").value = "";
    $("f-date").value = "all";
    $("f-sort").value = "newest";
    page = 1;
    applyFilters();
});

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
