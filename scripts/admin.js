    const PAGE_SIZE = 20;

    const CATATAN_CEPAT = [
      "Berkas lengkap",
      "Kurang fotokopi KTP",
      "Kurang fotokopi KK",
      "Kurang surat pengantar RT",
      "Menunggu tanda tangan Kades",
      "Surat sudah ditandatangani Kades",
      "Surat siap diambil di Balai Desa"
    ];

    function formatTanggalPendek(ymd) {
      const d = parseYmd(ymd);
      if (!d) return ymd || "-";
      return `${d.getDate()} ${BULAN_PENDEK[d.getMonth()]} ${d.getFullYear()}`;
    }

    function formatTimestampPanjang(ts) {
      const m = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/.exec(String(ts));
      return `${Number(m[3])} ${BULAN_PENDEK[Number(m[2]) - 1]} ${m[1]}, ${m[4]}.${m[5]}.${m[6]} WIB`;
    }

    function waLink(noWa) {
      let n = normalizePhone(noWa).replace(/^\+/, "");
      if (!/^\d{9,15}$/.test(n)) return "";
      if (n.startsWith("0")) n = "62" + n.slice(1);
      return "https://wa.me/" + n;
    }

    let toastTimer = null;
    function toast(message, type) {
      const el = $("toast");
      el.textContent = message;
      el.className = "fixed bottom-5 right-5 z-[60] max-w-sm rounded-lg px-4 py-3 text-sm font-semibold text-white shadow-xl " +
        (type === "error" ? "bg-red-600" : "bg-slate-900");
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => el.classList.add("hidden"), 3500);
    }

    function openModal(id) {
      const el = $(id);
      el.classList.remove("hidden");
      el.classList.add("flex");
    }
    function closeModalById(id) {
      const el = $(id);
      el.classList.add("hidden");
      el.classList.remove("flex");
    }

    function statusBadgeHtml(status) {
      const s = STATUS_STYLE[String(status || "").trim().toLowerCase()] ||
        { cls: "bg-slate-100 text-slate-700 ring-1 ring-slate-300", label: status || "-" };
      return `<span class="inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-bold ${s.cls}">${escapeHtml(s.label)}</span>`;
    }

    function jalurBadgeHtml(jalur) {
      const offline = String(jalur || "").toLowerCase() === "offline";
      const cls = offline ? "bg-slate-100 text-slate-800 ring-1 ring-slate-300" : "bg-sky-100 text-sky-800 ring-1 ring-sky-300";
      return `<span class="inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${cls}">${offline ? "Offline" : "Online"}</span>`;
    }

    function setConn(state, text) {
      const dot = $("conn-dot");
      const colors = { idle: "bg-slate-500", loading: "bg-amber-400 animate-pulse", ok: "bg-green-400", error: "bg-red-500" };
      dot.className = "w-2.5 h-2.5 rounded-full " + (colors[state] || colors.idle);
      $("conn-text").textContent = text;
    }

    let allData = [];
    let filtered = [];
    let page = 1;
    let loadPromise = null;
    let selectedCode = null;
    let saving = false;

    function showBanner(msg) {
      const el = $("error-banner");
      if (msg) { el.textContent = msg; el.classList.remove("hidden"); }
      else { el.textContent = ""; el.classList.add("hidden"); }
    }

    async function loadData(silent) {
      if (!getKey()) { openKeyModal(""); return; }
      const prev = loadPromise;
      const run = (async () => {
        if (prev) await prev;
        setConn("loading", "Memuat data...");
        if (!silent) showBanner("");
        try {
          const res = await callApi({ action: "getAllData" });
          if (!Array.isArray(res.data)) throw new ApiError("Format data dari server tidak sesuai.");
          allData = res.data;
          const t = new Date();
          setConn("ok", "Terhubung - " + String(t.getHours()).padStart(2, "0") + ":" + String(t.getMinutes()).padStart(2, "0") + ":" + String(t.getSeconds()).padStart(2, "0"));
          showBanner("");
          applyFilters(false);
        } catch (err) {
          setConn("error", "Gagal terhubung");
          if (err.code === "UNAUTHORIZED") {
            clearKey();
            openKeyModal(err.message);
          } else {
            showBanner(err.message);
          }
        } finally {
          if (loadPromise === run) loadPromise = null;
        }
      })();
      loadPromise = run;
      await run;
    }

    function renderStats() {
      const today = todayYmd();
      let proses = 0, siap = 0, selesai = 0, hariIni = 0;
      allData.forEach((r) => {
        const s = String(r.statusPelayanan || "").trim().toLowerCase();
        if (s === "pending" || s === "diproses") proses++;
        else if (s === "siap diambil") siap++;
        else if (s === "selesai") selesai++;
        if (r.tanggalDatang === today) hariIni++;
      });
      $("stat-total").textContent = allData.length;
      $("stat-total-sub").textContent = hariIni + " dijadwalkan datang hari ini";
      $("stat-proses").textContent = proses;
      $("stat-selesai").textContent = siap + selesai;
    }

    function applyFilters(resetPage) {
      const q = $("f-search").value.trim().toLowerCase();
      const qDigits = q.replace(/\D/g, "");
      const status = $("f-status").value.toLowerCase();
      const dateMode = $("f-date").value;
      const sort = $("f-sort").value;
      const today = todayYmd();

      filtered = allData.filter((r) => {
        if (status) {
          const s = String(r.statusPelayanan || "").trim().toLowerCase();
          const match = status === "proses" ? s === "pending" || s === "diproses" : s === status;
          if (!match) return false;
        }
        if (dateMode === "today" && r.tanggalDatang !== today) return false;
        if (q) {
          const hay = (String(r.nama) + " " + String(r.trackingCode)).toLowerCase();
          const waMatch = qDigits.length >= 3 && String(r.noWa).replace(/\D/g, "").includes(qDigits);
          if (!hay.includes(q) && !waMatch) return false;
        }
        return true;
      });

      filtered.sort((a, b) => {
        if (sort === "date-asc") return String(a.tanggalDatang).localeCompare(String(b.tanggalDatang)) || String(b.timestamp).localeCompare(String(a.timestamp));
        if (sort === "date-desc") return String(b.tanggalDatang).localeCompare(String(a.tanggalDatang)) || String(b.timestamp).localeCompare(String(a.timestamp));
        return String(b.timestamp).localeCompare(String(a.timestamp));
      });

      if (resetPage !== false) page = 1;
      const maxPage = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
      if (page > maxPage) page = maxPage;

      renderStats();
      renderTable();
    }

    function renderTable() {
      const start = (page - 1) * PAGE_SIZE;
      const rows = filtered.slice(start, start + PAGE_SIZE);
      const today = todayYmd();

      $("tbody").innerHTML = rows.map((r) => {
        const isToday = r.tanggalDatang === today;
        const catatan = String(r.catatan || "");
        return `
          <tr class="hover:bg-slate-50 ${isToday ? "bg-blue-50/40" : ""}">
            <td class="px-4 py-3 whitespace-nowrap">
              <span class="font-semibold">${escapeHtml(formatTanggalPendek(r.tanggalDatang))}</span>
              ${isToday ? '<span class="ml-1 rounded bg-blue-600 px-1.5 py-0.5 text-[10px] font-bold text-white">HARI INI</span>' : ""}
            </td>
            <td class="px-4 py-3 font-mono text-xs font-semibold text-blue-700 whitespace-nowrap">${escapeHtml(r.trackingCode)}</td>
            <td class="px-4 py-3">${jalurBadgeHtml(r.jalur)}</td>
            <td class="px-4 py-3 font-semibold text-slate-900">${escapeHtml(r.nama)}</td>
            <td class="px-4 py-3 whitespace-nowrap text-slate-600">${escapeHtml(r.noWa) || "-"}</td>
            <td class="px-4 py-3 text-slate-700">${escapeHtml(r.jenisLayanan)}</td>
            <td class="px-4 py-3">${statusBadgeHtml(r.statusPelayanan)}</td>
            <td class="px-4 py-3 text-slate-600 max-w-[220px]"><span class="block truncate" title="${escapeHtml(catatan)}">${escapeHtml(catatan) || "-"}</span></td>
            <td class="px-4 py-3 text-right">
              <button type="button" data-code="${escapeHtml(r.trackingCode)}" class="btn-manage whitespace-nowrap rounded-lg bg-blue-700 hover:brightness-125 text-white text-xs font-semibold px-3 py-1.5 transition">Kelola / Verifikasi</button>
            </td>
          </tr>`;
      }).join("");

      const empty = filtered.length === 0;
      $("table-empty").classList.toggle("hidden", !empty);
      if (empty) {
        $("table-empty-text").textContent = allData.length === 0 ? "Belum ada data pendaftar." : "Tidak ada data yang cocok dengan filter.";
      }

      const total = filtered.length;
      const from = total === 0 ? 0 : start + 1;
      const to = Math.min(start + PAGE_SIZE, total);
      $("pager-info").textContent = `Menampilkan ${from}-${to} dari ${total} data (halaman ${page} dari ${Math.max(1, Math.ceil(total / PAGE_SIZE))})`;
      $("filter-info").textContent = `${total} dari ${allData.length} pendaftar sesuai filter`;
      $("pg-prev").disabled = page <= 1;
      $("pg-next").disabled = start + PAGE_SIZE >= total;
    }

    $("tbody").addEventListener("click", (e) => {
      const btn = e.target.closest(".btn-manage");
      if (btn) openManage(btn.dataset.code);
    });
    $("pg-prev").addEventListener("click", () => { if (page > 1) { page--; renderTable(); window.scrollTo({ top: 0 }); } });
    $("pg-next").addEventListener("click", () => { page++; renderTable(); window.scrollTo({ top: 0 }); });

    let searchTimer = null;
    $("f-search").addEventListener("input", () => { clearTimeout(searchTimer); searchTimer = setTimeout(() => applyFilters(true), 180); });
    ["f-status", "f-date", "f-sort"].forEach((id) => $(id).addEventListener("change", () => applyFilters(true)));

    function openKeyModal(errorMsg) {
      const err = $("key-error");
      if (errorMsg) { err.textContent = errorMsg; err.classList.remove("hidden"); }
      else { err.textContent = ""; err.classList.add("hidden"); }
      $("key-input").value = "";
      $("key-submit").disabled = true;
      openModal("modal-key");
      setTimeout(() => $("key-input").focus(), 50);
    }

    $("key-input").addEventListener("input", () => {
      $("key-submit").disabled = !$("key-input").value.trim();
    });

    $("form-key").addEventListener("submit", (e) => {
      e.preventDefault();
      setKey($("key-input").value.trim());
      closeModalById("modal-key");
      loadData(false);
    });

    $("btn-lock").addEventListener("click", () => {
      clearKey();
      allData = [];
      applyFilters(true);
      setConn("idle", "Terkunci");
      openKeyModal("");
    });

    function openManage(code) {
      const r = allData.find((x) => x.trackingCode === code);
      if (!r) return;
      selectedCode = code;

      $("m-kode").textContent = r.trackingCode;
      $("m-nama").textContent = r.nama;
      $("m-wa").textContent = r.noWa || "-";
      const link = waLink(r.noWa);
      const a = $("m-wa-link");
      if (link) { a.href = link; a.classList.remove("hidden"); } else { a.classList.add("hidden"); a.removeAttribute("href"); }
      $("m-dusun").textContent = r.dusun || "-";
      $("m-jalur").innerHTML = jalurBadgeHtml(r.jalur);
      $("m-layanan").textContent = r.jenisLayanan;
      $("m-tanggal").textContent = formatTanggalPanjang(r.tanggalDatang);
      $("m-timestamp").textContent = r.timestamp ? formatTimestampPanjang(r.timestamp) : "-";
      $("m-current-badge").innerHTML = "Status saat ini: " + statusBadgeHtml(r.statusPelayanan);

      const layanan = findLayanan(r.jenisLayanan);
      $("m-berkas").innerHTML = layanan
        ? layanan.syarat.map((s) => `<li>${escapeHtml(s)}</li>`).join("")
        : '<li class="text-sm text-amber-900">Daftar syarat tidak tersedia untuk layanan ini.</li>';

      const sel = $("m-status");
      Array.from(sel.querySelectorAll("option[data-extra]")).forEach((o) => o.remove());
      const current = r.statusPelayanan === "Pending" ? "Diproses" : r.statusPelayanan;
      const known = Array.from(sel.options).map((o) => o.value);
      if (!known.includes(current)) {
        const o = document.createElement("option");
        o.value = current; o.textContent = current; o.dataset.extra = "1";
        sel.appendChild(o);
      }
      sel.value = current;

      $("m-catatan").value = r.catatan || "";
      $("m-chips").innerHTML = CATATAN_CEPAT.map((c) =>
        `<button type="button" data-chip="${escapeHtml(c)}" class="chip rounded-full bg-slate-100 hover:bg-blue-100 hover:text-blue-700 text-slate-600 text-xs font-semibold px-3 py-1 transition">${escapeHtml(c)}</button>`
      ).join("");

      $("m-error").classList.add("hidden");
      setSaving(false);
      openModal("modal-manage");
    }

    function closeManage() { if (saving) return; closeModalById("modal-manage"); selectedCode = null; }

    function setSaving(on) {
      saving = on;
      $("m-save").disabled = on;
      $("m-close").disabled = on;
      $("m-cancel").disabled = on;
      $("m-spin").classList.toggle("hidden", !on);
      $("m-save-label").textContent = on ? "Menyimpan..." : "Simpan Perubahan";
    }

    $("m-chips").addEventListener("click", (e) => {
      const chip = e.target.closest(".chip");
      if (!chip) return;
      $("m-catatan").value = chip.dataset.chip;
      $("m-catatan").focus();
    });

    $("m-close").addEventListener("click", closeManage);
    $("m-cancel").addEventListener("click", closeManage);

    $("m-save").addEventListener("click", async () => {
      if (!selectedCode || saving) return;
      const newStatus = $("m-status").value;
      const catatan = $("m-catatan").value.trim();
      $("m-error").classList.add("hidden");
      setSaving(true);
      if (loadPromise) await loadPromise;

      let res;
      try {
        res = await callApi({ action: "updateStatus", trackingCode: selectedCode, newStatus: newStatus, catatan: catatan });
      } catch (err) {
        setSaving(false);
        if (err.code === "UNAUTHORIZED") {
          clearKey();
          closeManage();
          openKeyModal(err.message);
        } else {
          $("m-error").textContent = err.message;
          $("m-error").classList.remove("hidden");
        }
        return;
      }
      const row = allData.find((x) => x.trackingCode === selectedCode);
      if (row) {
        row.statusPelayanan = res.statusPelayanan || newStatus;
        row.catatan = typeof res.catatan === "string" ? res.catatan : catatan;
      }
      const code = selectedCode;
      applyFilters(false);
      setSaving(false);
      closeManage();
      const st = STATUS_STYLE[String(newStatus).trim().toLowerCase()] || { label: newStatus };
      toast("Status " + code + " diperbarui menjadi \"" + st.label + "\".");
    });

    let lastWalkin = null;
    let walkinSaving = false;

    function initWalkinForm() {
      const dusunSel = $("w-dusun");
      DUSUN.forEach((d) => {
        const o = document.createElement("option");
        o.value = d; o.textContent = d;
        dusunSel.appendChild(o);
      });

      const sel = $("w-layanan");
      LAYANAN.forEach((l) => {
        const o = document.createElement("option");
        o.value = l.nama; o.textContent = l.nama;
        sel.appendChild(o);
      });
    }

    function walkinError(field, message) {
      const el = document.querySelector(`.w-err[data-for="${field}"]`);
      const input = $(field);
      if (message) { el.textContent = message; el.classList.remove("hidden"); input.classList.add("border-red-400"); }
      else { el.textContent = ""; el.classList.add("hidden"); input.classList.remove("border-red-400"); }
    }

    function syncWTanggal() {
      const el = $("w-tanggal");
      const d = parseYmd(el.value);
      if (el.value && HARI_TANPA_PELAYANAN.includes(d.getDay())) {
        el.value = "";
        walkinError("w-tanggal", "Balai Desa tidak melayani pada hari " + HARI[d.getDay()] + ". Pilih hari lain.");
      } else {
        walkinError("w-tanggal", "");
      }
      const out = $("w-tanggal-terpilih");
      if (el.value) {
        out.textContent = formatTanggalPanjang(el.value);
        out.classList.remove("hidden");
      } else {
        out.textContent = "";
        out.classList.add("hidden");
      }
    }

    function resetWalkin() {
      $("form-walkin").reset();
      $("w-tanggal").value = todayYmd();
      $("w-tanggal").min = todayYmd();
      $("w-berkas-box").classList.add("hidden");
      $("w-error").classList.add("hidden");
      ["w-nama", "w-wa", "w-dusun", "w-layanan", "w-tanggal"].forEach((f) => walkinError(f, ""));
      syncWTanggal();
      setWalkinLoading(false);
      $("walkin-form-view").classList.remove("hidden");
      $("walkin-success-view").classList.add("hidden");
    }

    function openWalkin() {
      if (!getKey()) { openKeyModal(""); return; }
      resetWalkin();
      openModal("modal-walkin");
      setTimeout(() => $("w-nama").focus(), 50);
    }

    function closeWalkin() { if (walkinSaving) return; closeModalById("modal-walkin"); }

    function setWalkinLoading(on) {
      walkinSaving = on;
      $("w-submit").disabled = on;
      $("w-close").disabled = on;
      $("w-cancel").disabled = on;
      $("w-spin").classList.toggle("hidden", !on);
      $("w-submit-label").textContent = on ? "Menyimpan..." : "Daftarkan & Buat Kode";
    }

    $("btn-walkin").addEventListener("click", openWalkin);
    $("w-close").addEventListener("click", closeWalkin);
    $("w-cancel").addEventListener("click", closeWalkin);
    $("w-tanggal").addEventListener("change", syncWTanggal);

    $("w-layanan").addEventListener("change", () => {
      const l = findLayanan($("w-layanan").value);
      if (!l) { $("w-berkas-box").classList.add("hidden"); return; }
      $("w-berkas").innerHTML = l.syarat.map((s) => `<li>${escapeHtml(s)}</li>`).join("");
      $("w-berkas-box").classList.remove("hidden");
    });

    function validateWalkin() {
      let ok = true;
      const nama = $("w-nama").value.trim();
      const wa = normalizePhone($("w-wa").value);
      if (nama.length < 3) { walkinError("w-nama", "Nama lengkap minimal 3 karakter."); ok = false; } else walkinError("w-nama", "");
      if (wa && !WA_REGEX.test(wa)) { walkinError("w-wa", "Nomor WA tidak valid. Kosongkan bila warga tidak punya."); ok = false; } else walkinError("w-wa", "");
      if (!$("w-dusun").value) { walkinError("w-dusun", "Pilih dusun."); ok = false; } else walkinError("w-dusun", "");
      if (!$("w-layanan").value) { walkinError("w-layanan", "Pilih jenis layanan."); ok = false; } else walkinError("w-layanan", "");
      const tgl = $("w-tanggal").value;
      if (!tgl) { walkinError("w-tanggal", "Pilih tanggal."); ok = false; }
      else if (tgl < todayYmd()) { walkinError("w-tanggal", "Tanggal tidak boleh sebelum hari ini."); ok = false; }
      else if (HARI_TANPA_PELAYANAN.includes(parseYmd(tgl).getDay())) { walkinError("w-tanggal", "Balai Desa tidak melayani pada hari " + HARI[parseYmd(tgl).getDay()] + ". Pilih hari lain."); ok = false; }
      else walkinError("w-tanggal", "");
      return ok;
    }

    $("form-walkin").addEventListener("submit", async (e) => {
      e.preventDefault();
      $("w-error").classList.add("hidden");
      if (!validateWalkin()) return;

      const payload = {
        action: "register",
        jalur: "Offline",
        nama: $("w-nama").value.trim(),
        noWa: normalizePhone($("w-wa").value),
        dusun: $("w-dusun").value,
        jenisLayanan: $("w-layanan").value,
        tanggalDatang: $("w-tanggal").value,
        catatan: $("w-catatan").value.trim()
      };

      setWalkinLoading(true);
      let res;
      try {
        res = await callApi(payload);
        if (!res.trackingCode) throw new ApiError("Server tidak mengembalikan kode tracking.");
      } catch (err) {
        setWalkinLoading(false);
        if (err.code === "UNAUTHORIZED") {
          clearKey();
          closeWalkin();
          openKeyModal(err.message);
        } else {
          $("w-error").textContent = err.message;
          $("w-error").classList.remove("hidden");
        }
        return;
      }
      lastWalkin = { kode: res.trackingCode, nama: payload.nama, layanan: payload.jenisLayanan, tanggal: payload.tanggalDatang };

      $("ws-kode").textContent = lastWalkin.kode;
      $("ws-nama").textContent = lastWalkin.nama;
      $("ws-layanan").textContent = lastWalkin.layanan;
      $("ws-tanggal").textContent = formatTanggalPanjang(lastWalkin.tanggal);

      $("walkin-form-view").classList.add("hidden");
      $("walkin-success-view").classList.remove("hidden");
      setWalkinLoading(false);
      await loadData(true);
    });

    $("ws-another").addEventListener("click", resetWalkin);
    $("ws-done").addEventListener("click", closeWalkin);
    $("ws-print").addEventListener("click", () => {
      if (!lastWalkin) return;
      $("ps-kode").textContent = lastWalkin.kode;
      $("ps-nama").textContent = lastWalkin.nama;
      $("ps-layanan").textContent = lastWalkin.layanan;
      $("ps-tanggal").textContent = formatTanggalPanjang(lastWalkin.tanggal);
      window.print();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      if (!$("modal-manage").classList.contains("hidden")) closeManage();
      else if (!$("modal-walkin").classList.contains("hidden")) closeWalkin();
    });

    (function init() {
      initWalkinForm();
      $("w-tanggal").value = todayYmd();
      applyFilters(true);

      if (!getKey()) {
        setConn("idle", "Menunggu kunci admin");
        openKeyModal("");
      } else {
        loadData(false);
      }
    })();
