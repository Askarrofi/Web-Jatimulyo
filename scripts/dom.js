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
        d.className = "group bg-brand-50 shadow-md ring-1 ring-slate-300 overflow-hidden";

        const s = document.createElement("summary");
        s.className = "cursor-pointer select-none flex items-center justify-between gap-3 px-5 py-4 hover:bg-slate-50";
        const summaryText = document.createElement("div");
        const summaryTitle = document.createElement("p");
        summaryTitle.className = "font-bold text-brand-900";
        summaryTitle.textContent = l.nama;
        const summaryDescription = document.createElement("p");
        summaryDescription.className = "text-sm text-slate-500 mt-0.5";
        summaryDescription.textContent = l.desc;
        summaryText.appendChild(summaryTitle);
        summaryText.appendChild(summaryDescription);
        const chevron = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        chevron.setAttribute("class", "chevron w-5 h-5 shrink-0 text-brand-700 transition-transform");
        chevron.setAttribute("fill", "none");
        chevron.setAttribute("viewBox", "0 0 24 24");
        chevron.setAttribute("stroke", "currentColor");
        chevron.setAttribute("stroke-width", "2");
        chevron.setAttribute("aria-hidden", "true");
        const chevronPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        chevronPath.setAttribute("stroke-linecap", "round");
        chevronPath.setAttribute("stroke-linejoin", "round");
        chevronPath.setAttribute("d", "M19 9l-7 7-7-7");
        chevron.appendChild(chevronPath);
        s.appendChild(summaryText);
        s.appendChild(chevron);
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

