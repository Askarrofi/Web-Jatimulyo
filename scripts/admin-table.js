function formatPhoneId(value) {
    const digits = String(value || "").replace(/\D/g, "");

    if (!digits) return "-";
    if (digits.startsWith("62")) return "0" + digits.slice(2);
    if (digits.startsWith("8")) return "0" + digits;

    return digits;
}

const PAGE_SIZE = 12;
const SORTS = {
    "newest": (a, b) => String(b.timestamp).localeCompare(String(a.timestamp)),
    "date-asc": (a, b) => String(a.tanggalDatang).localeCompare(String(b.tanggalDatang)) || String(a.nama).localeCompare(String(b.nama)),
    "date-desc": (a, b) => String(b.tanggalDatang).localeCompare(String(a.tanggalDatang)) || String(a.nama).localeCompare(String(b.nama), "id-ID")
};

let view = [];
let toastTimer = null;
let page = 1;

function formatDateTimeId(value) {
    if (!value) return "-";
    return new Intl.DateTimeFormat("id-ID", {
        dateStyle: "long",
        timeStyle: "short",
        timeZone: "Asia/Jakarta"
    }).format(new Date(value));
}

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
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        el.classList.add("hidden");
        el.classList.remove("reveal");
    }, 2200);
}

function setConnState(state, text) {
    const el = $("conn");
    el.dataset.state = state;
    $("conn-state").textContent = text;
    $("conn-time").textContent = state === "ok"
        ? new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date()).replace(".", ":") + " WIB"
        : "";
}

function renderStats() {
    const today = todayYmd();
    const key = (s) => String(s || "").trim().toLowerCase();
    $("stat-today").textContent = rows.filter((r) => r.tanggalDatang === today && key(r.statusPelayanan) !== "selesai").length;
    $("stat-total").textContent = rows.length;
    $("stat-proses").textContent = rows.filter((r) => key(r.statusPelayanan) === "diproses").length;
    $("stat-selesai").textContent = rows.filter((r) => key(r.statusPelayanan) === "selesai").length;
}

function matches(r, q, status, layanan, dusun, jalur, dateMode) {
    if (
        status
        && String(r.statusPelayanan || "").trim().toLowerCase() !== status.toLowerCase()
    ) return false;
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
    if (
        dateMode === "lewat"
        && !(
            r.tanggalDatang < todayYmd()
            && String(r.statusPelayanan || "").trim().toLowerCase() !== "selesai"
        )
    ) return false;
    if (q) {
        const needle = q.toLowerCase();
        const phoneNeedle = q.replace(/\D/g, "").replace(/^62/, "0");
        const phone = formatPhoneId(r.noWa).replace(/\D/g, "");
        const hay = [
            r.nama,
            r.trackingCode,
            r.jenisLayanan,
            r.dusun,
            r.rt,
            r.catatan
        ].join(" ").toLowerCase();

        if (
            !hay.includes(needle)
            && (
                !phoneNeedle
                || !phone.includes(phoneNeedle)
            )
        ) return false;
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
    const cards = $("cards");
    cards.textContent = "";
    const start = (page - 1) * PAGE_SIZE;
    const slice = view.slice(start, start + PAGE_SIZE);

    slice.forEach((row) => {
        const card = $("card-tpl").content.firstElementChild.cloneNode(true);
        card.querySelector('[data-f="nama"]').textContent = row.nama || "-";
        card.querySelector('[data-f="layanan"]').textContent = row.jenisLayanan || "-";
        card.querySelector('[data-f="tanggal"]').textContent = formatTanggalDmy(row.tanggalDatang);
        card.querySelector('[data-f="kode"]').textContent = String(row.trackingCode || "").toUpperCase();
        card.querySelector('[data-f="wa"]').textContent = formatPhoneId(row.noWa);
        card.querySelector('[data-f="timestamp"]').textContent = "Didaftarkan " + formatDateTimeId(row.timestamp);
        const jalur = card.querySelector('[data-f="jalur"]');
        jalur.dataset.jalur = String(row.jalur || "").toLowerCase();
        jalur.textContent = row.jalur || "-";
        const status = card.querySelector('[data-f="status"]');
        const style = getStatusStyle(row.statusPelayanan);
        status.dataset.status = style.key;
        status.textContent = style.label;
        const catatan = card.querySelector('[data-f="catatan"]');
        catatan.textContent = row.catatan || "";
        catatan.classList.toggle("hidden", !row.catatan);
        card.querySelector('[data-f="manage"]').addEventListener("click", () => openManage(row));
        cards.appendChild(card);
    });
    const empty = view.length === 0;    $("cards-empty").classList.toggle("hidden", !empty);
    $("cards-empty-text").textContent = rows.length === 0
        ? "Belum ada pendaftaran."
        : "Tidak ada data yang cocok dengan filter.";
    $("cards-empty-reset").classList.toggle(
        "hidden",
        rows.length === 0
    );
    $("pager-info").textContent = empty ? "" : "Kartu " + (start + 1) + "-" + Math.min(start + PAGE_SIZE, view.length) + " dari " + view.length;
    const activeFilters = [
        $("f-search").value.trim(),
        $("f-status").value,
        $("f-layanan").value,
        $("f-dusun").value,
        $("f-jalur").value,
        $("f-date").value === "all"
            ? ""
            : $("f-date").value
    ].filter(Boolean).length;

    $("filter-info").textContent = rows.length === 0
        ? "Belum ada data."
        : "Menampilkan "
            + view.length
            + " dari "
            + rows.length
            + " pendaftar. "
            + activeFilters
            + " filter aktif.";

    $("f-reset").disabled =
        activeFilters === 0
        && $("f-sort").value === "newest";

    $("pg-prev").disabled = page <= 1;
    $("pg-next").disabled = page >= Math.ceil(view.length / PAGE_SIZE);
}
