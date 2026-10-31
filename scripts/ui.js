const $ = (id) => document.getElementById(id);

function fillDusunSelect(sel) {
    sel.textContent = "";
    const ph = document.createElement("option");
    ph.value = "";
    ph.textContent = "-- Pilih Dusun --";
    sel.appendChild(ph);
    DUSUN_GROUP.forEach((g) => {
        const og = document.createElement("optgroup");
        og.label = g.label;
        g.values.forEach((v) => {
            const o = document.createElement("option");
            o.value = v;
            o.textContent = "Dusun " + v;
            og.appendChild(o);
        });
        sel.appendChild(og);
    });
}

function fillLayananSelect(sel) {
    sel.textContent = "";
    const ph = document.createElement("option");
    ph.value = "";
    ph.textContent = "-- Pilih Jenis Layanan --";
    sel.appendChild(ph);
    LAYANAN.forEach((l) => {
        const o = document.createElement("option");
        o.value = l.nama;
        o.textContent = l.nama;
        sel.appendChild(o);
    });
}

function berkasList(l) {
    const wrap = document.createElement("div");
    wrap.dataset.berkas = l.nama;
    wrap.className = "hidden";
    const head = document.createElement("p");
    head.className = "text-sm font-semibold mb-2";
    head.textContent = l.nama;
    wrap.appendChild(head);
    const ul = document.createElement("ul");
    ul.className = "check-list";
    l.berkas.forEach((b) => {
        const li = document.createElement("li");
        li.textContent = b;
        ul.appendChild(li);
    });
    wrap.appendChild(ul);
    if (l.catatan) {
        const note = document.createElement("p");
        note.className = "mt-3 text-xs";
        note.textContent = "Catatan: " + l.catatan;
        wrap.appendChild(note);
    }
    return wrap;
}

function fillBerkasBox(containerId) {
    const box = $(containerId);
    box.querySelectorAll("[data-berkas]").forEach((el) => el.remove());
    LAYANAN.forEach((l) => box.appendChild(berkasList(l)));
}

function fillInfoAccordion(container) {
    container.textContent = "";
    LAYANAN.forEach((l, i) => {
        const d = document.createElement("details");
        d.name = "syarat-layanan";
        if (i === 0) d.open = true;
        d.className = "group bg-blue-50 shadow-sm ring-1 ring-slate-200 overflow-hidden";

        const s = document.createElement("summary");
        s.className = "cursor-pointer select-none flex items-center justify-between gap-3 px-5 py-4 hover:bg-slate-50";
        s.innerHTML = '<div><p class="font-bold text-blue-900"></p><p class="text-sm text-slate-500 mt-0.5"></p></div>' +
            '<svg class="chevron w-5 h-5 shrink-0 text-blue-700 transition-transform" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" /></svg>';
        s.querySelector("p").textContent = l.nama;
        s.querySelector("p + p").textContent = l.desc;
        d.appendChild(s);

        const body = document.createElement("div");
        body.className = "px-5 pb-5 pt-1 border-t border-slate-100";
        const label = document.createElement("p");
        label.className = "text-sm font-semibold text-slate-700 mt-3 mb-2";
        label.textContent = "Berkas fisik yang wajib dibawa";
        body.appendChild(label);
        const ul = document.createElement("ul");
        ul.className = "check-list text-slate-700";
        l.berkas.forEach((b) => {
            const li = document.createElement("li");
            li.textContent = b;
            ul.appendChild(li);
        });
        body.appendChild(ul);
        if (l.catatan) {
            const note = document.createElement("p");
            note.className = "mt-3 text-xs bg-amber-50 border border-amber-200 text-amber-800 px-3 py-2";
            note.textContent = "Catatan: " + l.catatan;
            body.appendChild(note);
        }
        d.appendChild(body);
        container.appendChild(d);
    });
}

function swapLabel(el, busyText, busy) {
    if (busy) el.dataset.idle = el.textContent;
    el.textContent = busy ? busyText : el.dataset.idle;
}

function setLoading(btnId, spinId, labelId, loading, textLoading) {
    $(btnId).disabled = loading;
    $(spinId).classList.toggle("hidden", !loading);
    swapLabel($(labelId), textLoading, loading);
}

function setFieldError(field, message) {
    const el = document.querySelector(`[data-err][data-for="${field}"]`);
    const input = $(field);
    const wrap = input.closest(".field");
    if (message) {
        el.textContent = message;
        el.classList.remove("hidden");
        input.setAttribute("aria-invalid", "true");
        wrap.classList.add("field-invalid");
    } else {
        el.textContent = "";
        el.classList.add("hidden");
        input.removeAttribute("aria-invalid");
        wrap.classList.remove("field-invalid");
    }
}

function attachLiveValidation(field, check) {
    let touched = false;
    $(field).addEventListener("change", () => {
        touched = true;
        setFieldError(field, check($(field).value));
    });
    $(field).addEventListener("input", () => {
        if (touched) setFieldError(field, check($(field).value));
    });
}

function syncBerkas(containerId, nama) {
    $(containerId).querySelectorAll("[data-berkas]").forEach((el) => {
        el.classList.toggle("hidden", el.dataset.berkas !== nama);
    });
}

function openModal(id) {
    const el = $(id);
    el.classList.remove("hidden");
    el.classList.add("flex");
    document.body.classList.add("overflow-hidden");
}

function closeModalById(id) {
    const el = $(id);
    el.classList.add("hidden");
    el.classList.remove("flex");
    document.body.classList.remove("overflow-hidden");
}

function normalizePhone(raw) {
    return String(raw || "").trim().replace(/[\s\-().]/g, "");
}
