function swapLabel(el, busyText, busy) {
    if (busy) el.dataset.idle = el.textContent;
    el.textContent = busy ? busyText : el.dataset.idle;
}

function setLoading(btnId, spinId, labelId, loading, textLoading) {
    const button = $(btnId);
    const label = $(labelId);
    const region = button.closest("form, [role=dialog]");
    button.disabled = loading;
    button.setAttribute("aria-disabled", String(loading));
    button.classList.toggle("is-loading", loading);
    $(spinId).classList.toggle("hidden", !loading);
    label.setAttribute("role", "status");
    label.setAttribute("aria-live", "polite");
    swapLabel(label, textLoading, loading);
    if (region) region.setAttribute("aria-busy", String(loading));
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

function normalizePhone(raw) {
    return String(raw || "").trim().replace(/[\s\-().]/g, "");
}


document.addEventListener("submit", (event) => {
    if (event.target.getAttribute("aria-busy") === "true") {
        event.preventDefault();
        event.stopImmediatePropagation();
    }
}, true);
