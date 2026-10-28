    const TABS = ["daftar", "status", "info"];
    const STEP_LABELS = [...new Set(Object.values(STATUS_STYLE).sort((a, b) => a.step - b.step).map((s) => s.label))];
    const KODE_REGEX = /^JTM-\d{8}-[A-Z0-9]{3,6}$/;
    const KODE_STORAGE = "jtm_last_kode";

    function showTab(name) {
      TABS.forEach((t) => {
        const panel = $("panel-" + t);
        const btn = document.querySelector(`.tab-btn[data-tab="${t}"]`);
        const active = t === name;
        panel.classList.toggle("hidden", !active);
        btn.setAttribute("aria-selected", active ? "true" : "false");
        btn.tabIndex = active ? 0 : -1;
        btn.className =
          "tab-btn px-2 py-2.5 text-sm font-semibold leading-tight rounded-t-lg transition text-center sm:px-4 " +
          (active ? "bg-slate-50 text-blue-800" : "text-blue-100 hover:bg-white/10 hover:text-white");
      });
      window.scrollTo({ top: 0 });
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

    function initDropdowns() {
      const dusunSelect = $("dusun");
      DUSUN.forEach((d) => {
        const opt = document.createElement("option");
        opt.value = d;
        opt.textContent = d;
        dusunSelect.appendChild(opt);
      });

      const select = $("jenisLayanan");
      LAYANAN.forEach((l) => {
        const opt = document.createElement("option");
        opt.value = l.nama;
        opt.textContent = l.nama;
        select.appendChild(opt);
      });
    }

    function initAccordion() {
      const wrap = $("accordion");
      wrap.innerHTML = LAYANAN.map((l, i) => `
        <details class="group bg-blue-50 rounded-xl shadow-sm ring-1 ring-slate-200 overflow-hidden" name="syarat-layanan" ${i === 0 ? "open" : ""}>
          <summary class="cursor-pointer select-none flex items-center justify-between gap-3 px-5 py-4 hover:bg-slate-50">
            <div>
              <p class="font-bold text-blue-900">${escapeHtml(l.nama)}</p>
              <p class="text-sm text-slate-500 mt-0.5">${escapeHtml(l.deskripsi)}</p>
            </div>
            <svg class="chevron w-5 h-5 shrink-0 text-blue-700 transition-transform" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <div class="px-5 pb-5 pt-1 border-t border-slate-100">
            <p class="text-sm font-semibold text-slate-700 mt-3 mb-2">Berkas fisik yang dibawa:</p>
            <ul class="space-y-2">
              ${l.syarat.map((s) => `
                <li class="flex gap-2 text-sm text-slate-700">
                  <svg class="w-5 h-5 shrink-0 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
                  <span>${escapeHtml(s)}</span>
                </li>`).join("")}
            </ul>
            ${l.catatan ? `<p class="mt-3 text-xs rounded-lg bg-amber-50 border border-amber-200 text-amber-800 px-3 py-2">Catatan: ${escapeHtml(l.catatan)}</p>` : ""}
          </div>
        </details>
      `).join("");
    }

    function renderChecklist() {
      const layanan = findLayanan($("jenisLayanan").value);
      const box = $("checklist-box");

      if (!layanan) {
        box.classList.add("hidden");
        return;
      }

      $("checklist-layanan").textContent = layanan.nama + " (bawa berkas asli dan fotokopinya)";
      $("checklist-items").innerHTML = layanan.syarat.map((s) => `
        <li class="flex gap-2 text-sm text-amber-950">
          <svg class="w-5 h-5 shrink-0 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
          <span>${escapeHtml(s)}</span>
        </li>`).join("");

      const cat = $("checklist-catatan");
      if (layanan.catatan) {
        cat.textContent = "Catatan: " + layanan.catatan;
        cat.classList.remove("hidden");
      } else {
        cat.classList.add("hidden");
      }

      box.classList.remove("hidden");
    }

    function ymdFrom(d) {
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    }

    function initDateChips() {
      const d = parseYmd(todayYmd());
      const ymds = [];
      while (ymds.length < 3) {
        if (!HARI_TANPA_PELAYANAN.includes(d.getDay())) ymds.push(ymdFrom(d));
        d.setDate(d.getDate() + 1);
      }
      const today = todayYmd();
      $("date-chips").innerHTML = ymds.map((ymd) => {
        const c = parseYmd(ymd);
        const label = ymd === today ? "Hari ini" : c.getDate() + " " + BULAN_PENDEK[c.getMonth()];
        return `<button type="button" data-ymd="${ymd}" class="rounded-full border border-blue-200 bg-blue-50 text-blue-800 text-xs font-semibold px-3 py-1.5 transition hover:bg-blue-100">${label}</button>`;
      }).join("");
    }

    function syncTanggal() {
      const el = $("tanggalDatang");
      const d = parseYmd(el.value);
      if (el.value && HARI_TANPA_PELAYANAN.includes(d.getDay())) {
        el.value = "";
        setError("tanggalDatang", "Balai Desa tidak melayani pada hari " + HARI[d.getDay()] + ". Pilih hari lain.");
      } else {
        setError("tanggalDatang", "");
      }
      const out = $("tanggal-terpilih");
      if (el.value) {
        out.textContent = formatTanggalPanjang(el.value);
        out.classList.remove("hidden");
      } else {
        out.textContent = "";
        out.classList.add("hidden");
      }
    }

    $("tanggalDatang").addEventListener("change", syncTanggal);

    $("date-chips").addEventListener("click", (e) => {
      const chip = e.target.closest("button[data-ymd]");
      if (!chip) return;
      $("tanggalDatang").value = chip.dataset.ymd;
      syncTanggal();
    });

    function setError(field, message) {
      const el = document.querySelector(`.err[data-for="${field}"]`);
      const input = $(field);
      if (message) {
        el.textContent = message;
        el.classList.remove("hidden");
        input.classList.add("border-red-400");
      } else {
        el.textContent = "";
        el.classList.add("hidden");
        input.classList.remove("border-red-400");
      }
    }

    function liveWaFeedback() {
      const el = $("noWa");
      const v = el.value.trim();
      const ok = WA_REGEX.test(v);
      el.classList.toggle("border-green-500", v.length > 0 && ok);
      el.classList.toggle("border-red-400", v.length > 0 && !ok);
    }

    $("noWa").addEventListener("input", (e) => {
      e.target.value = e.target.value.replace(/[\s\-().]/g, "");
      liveWaFeedback();
    });

    $("noWa").addEventListener("blur", () => {
      $("noWa").value = $("noWa").value.replace(/^(\+62|62)/, "0");
      liveWaFeedback();
    });

    function validateForm() {
      let valid = true;
      const nama = $("nama").value.trim();
      const wa = normalizePhone($("noWa").value);
      const dusun = $("dusun").value;
      const layanan = $("jenisLayanan").value;
      const tanggal = $("tanggalDatang").value;

      if (nama.length < 3) { setError("nama", "Nama lengkap minimal 3 karakter."); valid = false; } else setError("nama", "");

      if (!WA_REGEX.test(wa)) {
        setError("noWa", "Masukkan nomor WhatsApp yang valid, contoh 081234567890."); valid = false;
      } else setError("noWa", "");

      if (!dusun) { setError("dusun", "Pilih dusun tempat tinggal Anda."); valid = false; } else setError("dusun", "");
      if (!layanan) { setError("jenisLayanan", "Pilih jenis layanan."); valid = false; } else setError("jenisLayanan", "");

      if (!tanggal) {
        setError("tanggalDatang", "Pilih tanggal kedatangan."); valid = false;
      } else if (tanggal < todayYmd()) {
        setError("tanggalDatang", "Tanggal tidak boleh sebelum hari ini."); valid = false;
      } else if (HARI_TANPA_PELAYANAN.includes(parseYmd(tanggal).getDay())) {
        setError("tanggalDatang", "Balai Desa tidak melayani pada hari " + HARI[parseYmd(tanggal).getDay()] + ". Pilih hari lain."); valid = false;
      } else setError("tanggalDatang", "");

      return valid;
    }

    function showFormAlert(msg) {
      const el = $("form-alert");
      if (msg) { el.textContent = msg; el.classList.remove("hidden"); }
      else { el.textContent = ""; el.classList.add("hidden"); }
    }

    function setLoading(btnId, spinId, labelId, loading, textLoading, textIdle) {
      $(btnId).disabled = loading;
      $(spinId).classList.toggle("hidden", !loading);
      $(labelId).textContent = loading ? textLoading : textIdle;
    }

    let lastRegistration = null;

    $("form-daftar").addEventListener("submit", async (e) => {
      e.preventDefault();
      showFormAlert("");
      if (!validateForm()) return;

      const payload = {
        action: "register",
        nama: $("nama").value.trim(),
        noWa: normalizePhone($("noWa").value),
        dusun: $("dusun").value,
        jenisLayanan: $("jenisLayanan").value,
        tanggalDatang: $("tanggalDatang").value
      };

      setLoading("btn-submit", "spin-submit", "label-submit", true, "Mengirim...", "Kirim Pendaftaran");

      let result;
      try {
        result = await callApi(payload);
        if (!result.trackingCode) {
          throw new Error("Pendaftaran gagal. Silakan coba lagi.");
        }
      } catch (err) {
        showFormAlert(err.message);
        setLoading("btn-submit", "spin-submit", "label-submit", false, "Mengirim...", "Kirim Pendaftaran");
        return;
      }
      lastRegistration = { kode: result.trackingCode, layanan: payload.jenisLayanan, tanggal: payload.tanggalDatang };
      localStorage.setItem(KODE_STORAGE, result.trackingCode);
      openModal(lastRegistration);
      $("form-daftar").reset();
      $("noWa").classList.remove("border-green-500", "border-red-400");
      $("checklist-box").classList.add("hidden");
      setLoading("btn-submit", "spin-submit", "label-submit", false, "Mengirim...", "Kirim Pendaftaran");
    });

    $("jenisLayanan").addEventListener("change", renderChecklist);

    function openModal(reg) {
      $("modal-kode").textContent = reg.kode;
      $("modal-layanan").textContent = reg.layanan;
      $("modal-tanggal").textContent = formatTanggalPanjang(reg.tanggal);

      const layanan = findLayanan(reg.layanan);
      $("modal-berkas").innerHTML = layanan
        ? layanan.syarat.map((s) => `<li>${escapeHtml(s)}</li>`).join("")
        : "";

      $("copy-label").textContent = "Salin Kode";
      $("modal").classList.remove("hidden");
      $("modal").classList.add("flex");
      document.body.classList.add("overflow-hidden");
    }

    function closeModal() {
      $("modal").classList.add("hidden");
      $("modal").classList.remove("flex");
      document.body.classList.remove("overflow-hidden");
    }

    $("btn-modal-tutup").addEventListener("click", closeModal);
    $("modal").addEventListener("click", (e) => { if (e.target === $("modal")) closeModal(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !$("modal").classList.contains("hidden")) closeModal(); });

    $("btn-modal-cek").addEventListener("click", () => {
      const kode = lastRegistration ? lastRegistration.kode : "";
      closeModal();
      showTab("status");
      $("trackingCode").value = kode;
      $("trackingCode").focus();
    });

    $("btn-copy").addEventListener("click", async () => {
      const kode = $("modal-kode").textContent;
      try {
        await navigator.clipboard.writeText(kode);
      } catch (e) {
        const ta = document.createElement("textarea");
        ta.value = kode;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand("copy"); } catch (_) {}
        document.body.removeChild(ta);
      }
      $("copy-label").textContent = "Tersalin!";
      setTimeout(() => { $("copy-label").textContent = "Salin Kode"; }, 2000);
    });

    function getStatusStyle(status) {
      const key = String(status || "").trim().toLowerCase();
      return STATUS_STYLE[key] || { cls: "bg-slate-100 text-slate-700 ring-1 ring-slate-300", label: status || "Tidak diketahui", step: -1 };
    }

    function renderSteps(activeStep) {
      $("res-steps").innerHTML = STEP_LABELS.map((label, i) => {
        const done = activeStep >= 0 && i <= activeStep;
        return `
          <li class="text-xs sm:text-sm leading-tight ${done ? "text-blue-800 font-bold" : "text-slate-500"}">${escapeHtml(label)}</li>`;
      }).join("");
    }

    function showStatusError(msg) {
      const el = $("status-error");
      if (msg) { el.textContent = msg; el.classList.remove("hidden"); }
      else { el.textContent = ""; el.classList.add("hidden"); }
    }

    function liveKodeFeedback() {
      const el = $("trackingCode");
      const v = el.value.trim();
      const ok = KODE_REGEX.test(v);
      el.classList.toggle("border-green-500", v.length > 0 && ok);
      el.classList.toggle("border-red-400", v.length > 0 && !ok);
    }

    $("trackingCode").addEventListener("input", (e) => {
      e.target.value = e.target.value.toUpperCase().replace(/\s+/g, "");
      $("kode-hint").classList.add("hidden");
      liveKodeFeedback();
    });

    $("form-status").addEventListener("submit", async (e) => {
      e.preventDefault();
      showStatusError("");
      $("status-result").classList.add("hidden");

      const kode = $("trackingCode").value.trim().toUpperCase();
      if (!kode) { showStatusError("Masukkan kode tracking terlebih dahulu."); return; }
      if (!KODE_REGEX.test(kode)) {
        showStatusError("Format kode tidak sesuai. Contoh yang benar: JTM-20261017-K7M2.");
        return;
      }

      setLoading("btn-status", "spin-status", "label-status", true, "Memeriksa...", "Cek Status");

      let data;
      try {
        data = await callApi({ action: "checkStatus", trackingCode: kode });
      } catch (err) {
        showStatusError(err.message);
        setLoading("btn-status", "spin-status", "label-status", false, "Memeriksa...", "Cek Status");
        return;
      }
      localStorage.setItem(KODE_STORAGE, kode);

      const style = getStatusStyle(data.statusPelayanan);

      $("res-kode").textContent = kode;
      $("res-nama").textContent = data.nama || "-";
      $("res-layanan").textContent = data.jenisLayanan || "-";
      $("res-tanggal").textContent = formatTanggalPanjang(data.tanggalDatang);
      $("res-catatan").textContent = data.catatan && data.catatan.trim() ? data.catatan : "Belum ada catatan dari petugas.";

      const badge = $("res-badge");
      badge.className = "inline-flex items-center rounded-full px-4 py-1.5 text-sm font-bold " + style.cls;
      badge.textContent = style.label;

      renderSteps(style.step);
      $("status-result").classList.remove("hidden");
      $("status-result").scrollIntoView({ block: "nearest" });
      setLoading("btn-status", "spin-status", "label-status", false, "Memeriksa...", "Cek Status");
    });

    (function init() {
      initDropdowns();
      initAccordion();
      initDateChips();

      $("tanggalDatang").min = todayYmd();

      const lastKode = localStorage.getItem(KODE_STORAGE);
      if (lastKode) {
        $("trackingCode").value = lastKode;
        $("kode-hint").classList.remove("hidden");
        liveKodeFeedback();
      }

      showTab("daftar");
    })();
