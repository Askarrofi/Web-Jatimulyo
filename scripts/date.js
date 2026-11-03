const MSG_TANGGAL_KOSONG = "Mohon memilih tanggal kedatangan.";
const MSG_TANGGAL_LEWAT = "Tanggal tidak boleh sebelum hari ini.";

function buildCalendarEl() {
    const overlay = document.createElement("div");
    overlay.className = "cal-overlay hidden";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", "Pilih tanggal kedatangan");
    overlay.innerHTML =
        '<div class="cal-backdrop" data-cal="close"></div>' +
        '<div class="cal-panel">' +
        '<div class="mb-2 flex items-center justify-between">' +
        '<button type="button" data-cal="prev" aria-label="Bulan sebelumnya" class="p-2 text-brand-900 transition hover:bg-brand-100">' +
        '<svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" /></svg>' +
        "</button>" +
        '<p data-cal-title class="text-sm font-bold text-brand-900"></p>' +
        '<button type="button" data-cal="next" aria-label="Bulan berikutnya" class="p-2 text-brand-900 transition hover:bg-brand-100">' +
        '<svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>' +
        "</button>" +
        "</div>" +
        '<div class="mb-1 grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-500">' +
        "<span>Sen</span><span>Sel</span><span>Rab</span><span>Kam</span><span>Jum</span><span>Sab</span><span>Min</span>" +
        "</div>" +
        '<div data-cal-grid class="grid grid-cols-7 gap-1"></div>' +
        "</div>";
    const grid = overlay.querySelector("[data-cal-grid]");
    for (let i = 0; i < 42; i++) {
        const c = document.createElement("button");
        c.type = "button";
        c.setAttribute("data-cell", "");
        grid.appendChild(c);
    }
    document.body.appendChild(overlay);
    return overlay;
}

function msgTanggalTutup(day) {
    return "Balai Desa tidak melayani pada hari " + HARI[day] + ". Pilih hari lain.";
}

function msgTanggalError(value) {
    if (!value) return MSG_TANGGAL_KOSONG;
    if (value < todayYmd()) return MSG_TANGGAL_LEWAT;
    const day = parseYmd(value).getDay();
    if (HARI_TANPA_PELAYANAN.includes(day)) return msgTanggalTutup(day);
    return "";
}

function parseYmd(ymd) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(ymd || ""));
    if (!m) return null;
    const year = Number(m[1]);
    const month = Number(m[2]);
    const day = Number(m[3]);
    const date = new Date(year, month - 1, day);
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
    return date;
}

function todayYmd() {
    const parts = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Jakarta", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
    const get = (type) => parts.find((p) => p.type === type).value;
    return get("year") + "-" + get("month") + "-" + get("day");
}

function normalizeYmd(value) {
    const text = String(value || "").trim();

    if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
        return text;
    }

    if (!text) return "";

    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Jakarta",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).formatToParts(new Date(text));

    const part = (type) => {
        return parts.find((item) => item.type === type).value;
    };

    return part("year")
        + "-"
        + part("month")
        + "-"
        + part("day");
}

function formatTanggalPanjang(ymd) {
    const d = parseYmd(normalizeYmd(ymd));
    if (!d) return ymd || "-";
    return `${HARI[d.getDay()]}, ${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`;
}

function formatTanggalDmy(ymd) {
    const d = parseYmd(normalizeYmd(ymd));
    if (!d) return ymd || "-";
    return d.getDate() + " " + BULAN[d.getMonth()] + " " + d.getFullYear();
}

function ymdFrom(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function makeCalendar(button, valueEl, onPick) {
    const pop = buildCalendarEl();
    const cells = pop.querySelectorAll("[data-cell]");
    const title = pop.querySelector("[data-cal-title]");
    const today = parseYmd(todayYmd());
    let view = new Date(today.getFullYear(), today.getMonth(), 1);

    const idleText = button.querySelector("span").textContent;

    function sync() {
        button.querySelector("span").textContent = valueEl.value ? formatTanggalDmy(valueEl.value) : idleText;
    }

    function render() {
        const first = new Date(view.getFullYear(), view.getMonth(), 1);
        const start = new Date(first.getFullYear(), first.getMonth(), 1 - ((first.getDay() + 6) % 7));
        cells.forEach((cell, i) => {
            const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
            const ymd = ymdFrom(d);
            const off = d < today || HARI_TANPA_PELAYANAN.includes(d.getDay());
            cell.textContent = d.getDate();
            cell.disabled = off;
            if (off) {
                cell.dataset.state = "off";
                cell.removeAttribute("data-ymd");
                cell.removeAttribute("aria-label");
                cell.removeAttribute("aria-current");
                return;
            }
            cell.dataset.state = ymd === valueEl.value ? "sel" : "on";
            cell.dataset.ymd = ymd;
            cell.setAttribute("aria-label", formatTanggalPanjang(ymd));
            if (ymd === ymdFrom(today)) cell.setAttribute("aria-current", "date");
            else cell.removeAttribute("aria-current");
        });
        title.textContent = BULAN[view.getMonth()] + " " + view.getFullYear();
    }

    function focusDay() {
        const target = pop.querySelector(`[data-ymd="${valueEl.value}"]`) || pop.querySelector("[data-ymd]");
        if (target) target.focus();
    }

    function open() {
        const base = parseYmd(valueEl.value) || today;
        view = new Date(base.getFullYear(), base.getMonth(), 1);
        render();
        pop.classList.remove("hidden");
        focusDay();
    }

    function close() {
        pop.classList.add("hidden");
        button.focus();
    }

    button.addEventListener("click", () => {
        if (pop.classList.contains("hidden")) open();
        else close();
    });

    pop.addEventListener("click", (e) => {
        const nav = e.target.closest("[data-cal]");
        if (nav) {
            if (nav.dataset.cal === "close") { close(); return; }
            view = new Date(view.getFullYear(), view.getMonth() + (nav.dataset.cal === "next" ? 1 : -1), 1);
            render();
            focusDay();
            return;
        }
        const day = e.target.closest("button[data-ymd]");
        if (!day) return;
        valueEl.value = day.dataset.ymd;
        sync();
        close();
        onPick();
    });

    pop.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            close();
            e.stopPropagation();
            return;
        }
        const dir = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key];
        if (dir === undefined) return;
        e.preventDefault();
        const cur = parseYmd(document.activeElement.dataset.ymd) || today;
        for (let i = 0; i < 7; i++) {
            cur.setDate(cur.getDate() + dir);
            if (cur >= today && !HARI_TANPA_PELAYANAN.includes(cur.getDay())) break;
        }
        if (cur < today || HARI_TANPA_PELAYANAN.includes(cur.getDay())) return;
        const ymd = ymdFrom(cur);
        if (cur.getMonth() !== view.getMonth() || cur.getFullYear() !== view.getFullYear()) {
            view = new Date(cur.getFullYear(), cur.getMonth(), 1);
            render();
        }
        pop.querySelector(`[data-ymd="${ymd}"]`).focus();
    });

    sync();
    return { sync: sync };
}

function syncTanggalField(field, cal) {
    const el = $(field);
    const d = parseYmd(el.value);
    if (el.value && HARI_TANPA_PELAYANAN.includes(d.getDay())) {
        el.value = "";
        setFieldError(field, msgTanggalTutup(d.getDay()));
    } else {
        setFieldError(field, "");
    }
    cal.sync();
}
