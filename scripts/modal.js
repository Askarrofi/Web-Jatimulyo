const modalTriggers = new Map();

function focusableElements(modal) {
    return Array.from(
        modal.querySelectorAll(
            'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
    );
}

function openModal(id) {
    const modal = $(id);

    modalTriggers.set(id, document.activeElement);
    modal.classList.remove("hidden");
    modal.classList.add("flex");
    document.body.classList.add("overflow-hidden");

    const focusable = focusableElements(modal);

    if (focusable.length) {
        focusable[0].focus();
    }

    const handleKeydown = (event) => {
        if (event.key === "Escape") {
            closeModalById(id);
            return;
        }

        if (event.key !== "Tab") return;

        const elements = focusableElements(modal);

        if (!elements.length) {
            event.preventDefault();
            return;
        }

        const first = elements[0];
        const last = elements[elements.length - 1];

        if (
            event.shiftKey
            && document.activeElement === first
        ) {
            event.preventDefault();
            last.focus();
        }

        if (
            !event.shiftKey
            && document.activeElement === last
        ) {
            event.preventDefault();
            first.focus();
        }
    };

    modal._handleKeydown = handleKeydown;
    modal.addEventListener("keydown", handleKeydown);
}

function closeModalById(id) {
    const modal = $(id);

    if (modal.classList.contains("hidden")) return;

    modal.classList.add("hidden");
    modal.classList.remove("flex");
    if (!document.querySelector(".modal-backdrop.flex, .warn-overlay.flex")) document.body.classList.remove("overflow-hidden");

    if (modal._handleKeydown) {
        modal.removeEventListener(
            "keydown",
            modal._handleKeydown
        );

        delete modal._handleKeydown;
    }

    const trigger = modalTriggers.get(id);

    modalTriggers.delete(id);

    if (trigger && trigger.isConnected) {
        trigger.focus();
    }
}
