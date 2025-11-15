/* assets/script/script.js */
(function () {
  const STORAGE_KEY = "contacts_app_v1";

  // Inisialisasi default contacts jika belum ada
  function ensureDefaultContacts() {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (!existing) {
      const now = new Date().toISOString();
      const contacts = [
        {
          id: 1,
          fullname: "Taqwa Amni Ramadhan",
          phone: "0859102791881",
          email: "taqwa.r1928@gmail.com",
          location: "Jakarta",
          notes: "Kontak pribadi",
          created_at: now,
          updated_at: now,
        },
        {
          id: 2,
          fullname: "Hanabi Yasuraoka",
          phone: "08019283917",
          email: "HanaYasu@Kuzu.com",
          location: "Jakarta",
          notes: "Teman kampus",
          created_at: now,
          updated_at: now,
        },
      ];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
    }
  }

  function loadContacts() {
    ensureDefaultContacts();
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error("Gagal membaca localStorage", e);
      return [];
    }
  }

  function saveContacts(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  function generateId() {
    const list = loadContacts();
    const max = list.reduce((acc, c) => Math.max(acc, c.id || 0), 0);
    return max + 1;
  }

  function addContact(data) {
    const now = new Date().toISOString();
    const newContact = {
      id: generateId(),
      fullname: data.fullname || "",
      phone: data.phone || "",
      email: data.email || "",
      location: data.location || "",
      notes: data.notes || "",
      created_at: now,
      updated_at: now,
    };
    const list = loadContacts();
    list.push(newContact);
    saveContacts(list);
    return newContact;
  }

  function updateContact(id, newData) {
    const list = loadContacts();
    const idx = list.findIndex((c) => c.id === id);
    if (idx === -1) return false;
    const now = new Date().toISOString();
    list[idx] = Object.assign({}, list[idx], {
      fullname: newData.fullname,
      phone: newData.phone,
      email: newData.email,
      location: newData.location,
      notes: newData.notes,
      updated_at: now,
    });
    saveContacts(list);
    return true;
  }

  function deleteContact(id) {
    const list = loadContacts();
    const filtered = list.filter((c) => c.id !== id);
    saveContacts(filtered);
    return true;
  }

  function getContactById(id) {
    const list = loadContacts();
    return list.find((c) => c.id === id) || null;
  }

  function formatDate(iso) {
    if (!iso) return "-";
    const d = new Date(iso);
    if (isNaN(d)) return iso;
    return d.toLocaleString();
  }

  // Rendering untuk list.html
  function renderContactList(search = "") {
    const container = document.getElementById("listContainer");
    const countEl =
      document.getElementById && document.getElementById("contactCount");
    if (!container) return;
    const list = loadContacts();

    const q = String(search || "").toLowerCase();

    const filtered = list.filter((c) => {
      if (!q) return true;
      return (
        (c.fullname || "").toLowerCase().includes(q) ||
        (c.phone || "").toLowerCase().includes(q)
      );
    });

    container.innerHTML = "";

    if (countEl) countEl.textContent = `${filtered.length} kontak ditemukan`;

    if (filtered.length === 0) {
      const empty = document.createElement("div");
      empty.className = "bg-white p-6 rounded-lg shadow text-center";
      empty.innerHTML = `<p class="text-gray-600">Belum ada kontak. <a href="add.html" class="text-blue-600">Tambah kontak</a></p>`;
      container.appendChild(empty);
      return;
    }

    // Tampilkan sebagai card responsif
    const grid = document.createElement("div");
    grid.className = "grid gap-4 sm:grid-cols-2 lg:grid-cols-3";
    filtered.forEach((contact) => {
      const card = document.createElement("div");
      card.className =
        "bg-white p-4 rounded-lg shadow flex flex-col justify-between";

      const top = document.createElement("div");
      top.innerHTML = `
          <div class="text-lg font-medium">${escapeHtml(contact.fullname)}</div>
          <div class="text-sm text-gray-500 mt-1">${escapeHtml(
            contact.phone
          )} • ${escapeHtml(contact.location || "-")}</div>
          <div class="text-xs text-gray-400 mt-2">Terakhir diperbarui: ${formatDate(
            contact.updated_at
          )}</div>
        `;

      const actions = document.createElement("div");
      actions.className = "mt-4 flex gap-2";
      // Detail
      const btnDetail = document.createElement("button");
      btnDetail.className = "px-3 py-1 border rounded text-sm";
      btnDetail.textContent = "Detail";
      btnDetail.addEventListener("click", () => showDetailModal(contact.id));

      // Edit
      const btnEdit = document.createElement("a");
      btnEdit.className = "px-3 py-1 border rounded text-sm";
      btnEdit.textContent = "Edit";
      btnEdit.href = `edit.html?id=${encodeURIComponent(contact.id)}`;

      // Hapus
      const btnDelete = document.createElement("button");
      btnDelete.className = "px-3 py-1 bg-red-600 text-white rounded text-sm";
      btnDelete.textContent = "Hapus";
      btnDelete.addEventListener("click", () => {
        const confirmDel = confirm(
          `Hapus kontak "${contact.fullname}"? Aksi ini tidak bisa dibatalkan.`
        );
        if (confirmDel) {
          deleteContact(contact.id);
          renderContactList(
            document.getElementById("searchInput")
              ? document.getElementById("searchInput").value.trim()
              : ""
          );
        }
      });

      actions.appendChild(btnDetail);
      actions.appendChild(btnEdit);
      actions.appendChild(btnDelete);

      card.appendChild(top);
      card.appendChild(actions);

      grid.appendChild(card);
    });

    container.appendChild(grid);
  }

  // Modal detail
  function showDetailModal(id) {
    const modal = document.getElementById("detailModal");
    const content = document.getElementById("detailContent");
    if (!modal || !content) return;
    const c = getContactById(id);
    if (!c) return;
    content.innerHTML = `
        <div><strong>Nama:</strong> ${escapeHtml(c.fullname)}</div>
        <div><strong>Telepon:</strong> ${escapeHtml(c.phone)}</div>
        <div><strong>Email:</strong> ${escapeHtml(c.email || "-")}</div>
        <div><strong>Lokasi:</strong> ${escapeHtml(c.location || "-")}</div>
        <div><strong>Catatan:</strong> <div class="mt-1 text-sm text-gray-700">${nl2br(
          escapeHtml(c.notes || "-")
        )}</div></div>
        <div class="mt-3 text-xs text-gray-400"><strong>Dibuat:</strong> ${formatDate(
          c.created_at
        )}</div>
        <div class="text-xs text-gray-400"><strong>Diperbarui:</strong> ${formatDate(
          c.updated_at
        )}</div>
        <div class="mt-3">
          <a href="edit.html?id=${encodeURIComponent(
            c.id
          )}" class="px-3 py-1 border rounded text-sm">Edit</a>
          <button id="delFromModal" class="px-3 py-1 bg-red-600 text-white rounded text-sm ml-2">Hapus</button>
        </div>
      `;
    modal.classList.remove("hidden");
    modal.style.display = "flex";

    const delBtn = document.getElementById("delFromModal");
    if (delBtn) {
      delBtn.addEventListener("click", () => {
        const ok = confirm(`Hapus kontak "${c.fullname}"?`);
        if (ok) {
          deleteContact(c.id);
          closeDetailModal();
          renderContactList(
            document.getElementById("searchInput")
              ? document.getElementById("searchInput").value.trim()
              : ""
          );
        }
      });
    }
  }

  function closeDetailModal() {
    const modal = document.getElementById("detailModal");
    if (!modal) return;
    modal.classList.add("hidden");
    modal.style.display = "none";
  }

  // Utilities
  function escapeHtml(s) {
    if (s === null || s === undefined) return "";
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function nl2br(s) {
    return String(s).replace(/\n/g, "<br>");
  }

  // Eksport fungsi ke global supaya HTML lain bisa memanggil
  window.loadContacts = loadContacts;
  window.saveContacts = saveContacts;
  window.addContact = addContact;
  window.updateContact = updateContact;
  window.deleteContact = deleteContact;
  window.getContactById = getContactById;
  window.generateId = generateId;
  window.renderContactList = renderContactList;
  window.showDetailModal = showDetailModal;
  window.closeDetailModal = closeDetailModal;
})();
