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
    return JSON.parse(localStorage.getItem(KODE_STORAGE) || "[]");
}

function saveKodeList(list) {
    localStorage.setItem(KODE_STORAGE, JSON.stringify(list.slice(0, 12)));
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
    closeModalById("modal");
    closeModalById("err-popup");
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
