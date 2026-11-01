let modalTrigger = null;

function modalFocusable(el) {
    return [...el.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')];
}

function openModal(id) {
    const el = $(id);
    modalTrigger = document.activeElement;
    el.classList.remove("hidden");
    el.classList.add("flex");
    document.body.classList.add("overflow-hidden");
    modalFocusable(el)[0].focus();
}

function closeModalById(id) {
    const el = $(id);
    el.classList.add("hidden");
    el.classList.remove("flex");
    document.body.classList.remove("overflow-hidden");
    modalTrigger.focus();
    modalTrigger = null;
}

document.addEventListener("keydown", (event) => {
    const el = document.querySelector(".modal-backdrop.flex, .warn-overlay.flex");

    if (!el) return;

    if (event.key === "Escape") {
        closeModalById(el.id);
        return;
    }

    if (event.key !== "Tab") return;

    const items = modalFocusable(el);
    const first = items[0];
    const last = items[items.length - 1];

    if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
    }

    if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
    }
});
