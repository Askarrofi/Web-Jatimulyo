const REQUEST_TIMEOUT_MS = 25000;
const KEY_STORAGE = "jtm_admin_key";

function getKey() {
    return sessionStorage.getItem(KEY_STORAGE) || "";
}

function setKey(k) {
    sessionStorage.setItem(KEY_STORAGE, k);
}

function clearKey() {
    sessionStorage.removeItem(KEY_STORAGE);
}

class ApiError extends Error {
    constructor(message, code) { super(message); this.code = code || ""; }
}

async function callApi(payload) {
    if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.indexOf("GANTI_DENGAN") === 0) {
        throw new ApiError("URL Google Apps Script belum diatur. Isi konstanta GOOGLE_SCRIPT_URL.", "NO_URL");
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: "POST",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify(Object.assign({}, payload, { adminKey: getKey() })),
            signal: controller.signal
        });

        if (!response.ok) throw new ApiError("Server mengalami kesalahan (" + response.status + ").");

        let data;
        try { data = await response.json(); }
        catch (e) { throw new ApiError("Respons server tidak valid. Pastikan Web App di-deploy (versi terbaru) dengan akses \"Anyone\"."); }

        if (data && data.success === false) {
            throw new ApiError(data.message || "Permintaan ditolak.", data.code);
        }
        return data;
    } catch (err) {
        if (err instanceof ApiError) throw err;
        if (err.name === "AbortError") throw new ApiError("Waktu koneksi habis. Periksa koneksi internet, lalu coba kembali.");
        if (err instanceof TypeError) throw new ApiError("Tidak dapat terhubung ke server. Periksa internet atau URL Apps Script.");
        throw err;
    } finally {
        clearTimeout(timer);
    }
}
