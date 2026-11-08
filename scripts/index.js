const TABS = ["daftar", "status", "info"];
const KODE_STORAGE = "jtm_kode_list";
let calPublic = null;

function showTab(name) {
    TABS.forEach((t) => {
        const panel = $("panel-" + t);
        const btn = document.querySelector(`.tab-btn[data-tab="${t}"]`);
        const active = t === name;
        panel.classList.toggle("hidden", !active);
        btn.setAttribute("aria-selected", active ? "true" : "false");
        btn.tabIndex = active ? 0 : -1;
    });
    if (name === "status") renderKodeList();
    window.scrollTo({ top: 0 });
}

function readKodeList() {
    try {
        const value = JSON.parse(
            sessionStorage.getItem(KODE_STORAGE) || "[]"
        );
        return Array.isArray(value)
            ? value
                .filter((code) => KODE_REGEX.test(code))
                .slice(0, 12)
            : [];
    } catch (error) {
        sessionStorage.removeItem(KODE_STORAGE);
        return [];
    }
}
function saveKodeList(list) {
    const codes = list
        .filter((code) => KODE_REGEX.test(code))
        .slice(0, 12);
    sessionStorage.setItem(
        KODE_STORAGE,
        JSON.stringify(codes)
    );
}
function addKode(full) {
    saveKodeList([full].concat(readKodeList().filter((k) => k !== full)));
}

document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => showTab(btn.dataset.tab));
    btn.addEventListener("keydown", (e) => {
        const i = TABS.indexOf(btn.dataset.tab);
        let next = null;
        if (e.key === "ArrowRight") next = (i + 1) % TABS.length;
        if (e.key === "ArrowLeft") next = (i - 1 + TABS.length) % TABS.length;
        if (next === null) return;
        e.preventDefault();
        showTab(TABS[next]);
        document.querySelector(`.tab-btn[data-tab="${TABS[next]}"]`).focus();
    });
});

document.addEventListener("click", (e) => {
    const go = e.target.closest("[data-goto]");
    if (!go) return;
    const open = document.querySelector(".modal-backdrop.flex, .warn-overlay.flex");
    if (open) closeModalById(open.id);
    showTab(go.dataset.goto);
});

(function init() {
    if (sessionStorage.getItem("jtm_splash")) $("splash").classList.add("hidden");
    else sessionStorage.setItem("jtm_splash", "1");
    fillDusunSelect($("dusun"));
    fillLayananSelect($("jenisLayanan"));
    fillBerkasBox("checklist-box");
    fillInfoAccordion($("accordion"));
    calPublic = makeCalendar($("tanggalDatang-btn"), $("tanggalDatang"), () => syncTanggalField("tanggalDatang", calPublic));
    showTab("daftar");
})();
