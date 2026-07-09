(function () {
  const workerUrl = "https://gflhfy-collab-translator.gflhfy-collab.workers.dev";
  const storageKey = "gflhfy-collab-admin-password";
  const pollMs = 5000;

  const els = {
    loginPanel: document.querySelector("#login-panel"),
    adminPanel: document.querySelector("#admin-panel"),
    password: document.querySelector("#admin-password"),
    login: document.querySelector("#admin-login"),
    loginStatus: document.querySelector("#login-status"),
    adminStatus: document.querySelector("#admin-status"),
    refresh: document.querySelector("#refresh"),
    logout: document.querySelector("#logout"),
    createForm: document.querySelector("#create-form"),
    newName: document.querySelector("#new-name"),
    newPassword: document.querySelector("#new-password"),
    rooms: document.querySelector("#rooms")
  };

  let timer = null;

  function setLoginStatus(text) {
    els.loginStatus.textContent = text;
  }

  function setAdminStatus(text) {
    els.adminStatus.textContent = text;
  }

  function authHeaders() {
    return {
      authorization: `Bearer ${els.password.value}`,
      "content-type": "application/json"
    };
  }

  async function request(path, options = {}) {
    const response = await fetch(`${workerUrl}${path}`, {
      ...options,
      headers: {
        ...authHeaders(),
        ...(options.headers || {})
      }
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || "Request failed");
    }
    return data;
  }

  function escapeHtml(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function formatUsers(users) {
    if (!Array.isArray(users) || users.length === 0) {
      return "<p class=\"room-meta\">No one online.</p>";
    }
    const items = users
      .map((user) => `<li>${escapeHtml(user.author)} (${escapeHtml(user.language)})</li>`)
      .join("");
    return `<ul class="users">${items}</ul>`;
  }

  function renderRooms(rooms) {
    if (!Array.isArray(rooms) || rooms.length === 0) {
      els.rooms.innerHTML = "<p class=\"status\">No rooms yet. Create one above.</p>";
      return;
    }

    els.rooms.innerHTML = rooms.map((room) => {
      const overrides = Array.isArray(room.fileOverrides) ? room.fileOverrides : [];
      const overrideList = overrides.length
        ? `<div class="override-list">
            <p class="room-meta"><strong>${overrides.length}</strong> edited text file(s) on Cloudflare (override Pages):</p>
            <ul>
              ${overrides.map((file) => `
                <li data-file="${escapeHtml(file.name)}">
                  <code>${escapeHtml(file.name)}</code>
                  <span class="room-meta">${escapeHtml(file.updatedBy || "")} ${escapeHtml(file.updatedAt || "")}</span>
                  <button type="button" class="secondary download-override">Download</button>
                  <button type="button" class="danger revert-override">Revert</button>
                </li>
              `).join("")}
            </ul>
            <button type="button" class="secondary export-overrides">Export all edits (JSON)</button>
          </div>`
        : `<p class="room-meta">No Cloudflare text edits yet.</p>`;

      return `
      <article class="room-card" data-room="${escapeHtml(room.name)}" data-slug="${escapeHtml(room.slug || "")}">
        <h3>${escapeHtml(room.name)}</h3>
        <div class="room-meta slug-row">
          <span>Slug <code class="room-slug">${escapeHtml(room.slug || "")}</code></span>
          <button type="button" class="secondary copy-slug" title="Copy slug">Copy</button>
          <span>· Session ${escapeHtml(String(room.sessionVersion || 1))} · ${(room.users || []).length} online</span>
        </div>
        <div class="room-meta">Upload folder: ebooks/collab/files/${escapeHtml(room.slug || "")}/</div>
        ${formatUsers(room.users)}
        ${overrideList}
        <div class="room-actions">
          <label>
            <span>Room password</span>
            <input class="edit-password" type="text" maxlength="200" value="${escapeHtml(room.password || "")}" autocomplete="off" spellcheck="false">
          </label>
          <button type="button" class="save-room">Save password</button>
          <button type="button" class="secondary clear-history">Clear chat</button>
          <button type="button" class="danger delete-room">Delete</button>
        </div>
      </article>
    `;
    }).join("");
  }

  function downloadTextFile(name, text) {
    const blob = new Blob([text || ""], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = name;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  async function copySlug(slug) {
    if (!slug) {
      throw new Error("Missing slug");
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(slug);
      return;
    }
    const input = document.createElement("input");
    input.value = slug;
    document.body.appendChild(input);
    input.select();
    document.execCommand("copy");
    input.remove();
  }

  async function refreshRooms() {
    const data = await request("/admin/rooms", { method: "GET" });
    const rooms = data.rooms || [];
    for (const room of rooms) {
      try {
        const files = await request(`/admin/files?room=${encodeURIComponent(room.name)}`, { method: "GET" });
        room.fileOverrides = files.files || [];
      } catch {
        room.fileOverrides = [];
      }
    }
    renderRooms(rooms);
    setAdminStatus(`Updated ${new Date().toLocaleTimeString()}.`);
  }

  function stopPolling() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  function startPolling() {
    stopPolling();
    timer = window.setInterval(() => {
      refreshRooms().catch((error) => setAdminStatus(error.message));
    }, pollMs);
  }

  function showAdmin() {
    els.loginPanel.classList.add("hidden");
    els.adminPanel.classList.remove("hidden");
  }

  function showLogin() {
    stopPolling();
    els.adminPanel.classList.add("hidden");
    els.loginPanel.classList.remove("hidden");
    setLoginStatus("Enter the admin password to manage rooms.");
  }

  async function unlock() {
    if (!els.password.value) {
      setLoginStatus("Enter the admin password.");
      return;
    }

    setLoginStatus("Checking...");
    try {
      await request("/admin/session", { method: "GET" });
      sessionStorage.setItem(storageKey, els.password.value);
      showAdmin();
      await refreshRooms();
      startPolling();
      setLoginStatus("Unlocked.");
    } catch (error) {
      showLogin();
      setLoginStatus(error.message);
    }
  }

  async function createRoom(event) {
    event.preventDefault();
    try {
      await request("/admin/rooms", {
        method: "POST",
        body: JSON.stringify({
          name: els.newName.value,
          password: els.newPassword.value
        })
      });
      els.createForm.reset();
      await refreshRooms();
      setAdminStatus("Room created.");
    } catch (error) {
      setAdminStatus(error.message);
    }
  }

  async function onRoomsClick(event) {
    const card = event.target.closest(".room-card");
    if (!card) {
      return;
    }

    const room = card.getAttribute("data-room");
    const slug = card.getAttribute("data-slug") || "";

    if (event.target.classList.contains("copy-slug")) {
      try {
        await copySlug(slug);
        setAdminStatus(`Copied slug: ${slug}`);
      } catch (error) {
        setAdminStatus(error.message || "Could not copy slug.");
      }
      return;
    }

    if (event.target.classList.contains("download-override")) {
      const item = event.target.closest("li");
      const fileName = item?.getAttribute("data-file");
      if (!fileName) {
        return;
      }
      try {
        const data = await request(
          `/admin/files/${encodeURIComponent(fileName)}?room=${encodeURIComponent(room)}`,
          { method: "GET" }
        );
        downloadTextFile(fileName, data.text || "");
        setAdminStatus(`Downloaded ${fileName}`);
      } catch (error) {
        setAdminStatus(error.message);
      }
      return;
    }

    if (event.target.classList.contains("export-overrides")) {
      try {
        const data = await request(
          `/admin/files?room=${encodeURIComponent(room)}&includeText=1`,
          { method: "GET" }
        );
        const payload = {
          room: data.room,
          slug: data.slug,
          exportedAt: new Date().toISOString(),
          files: data.files || []
        };
        downloadTextFile(
          `${data.slug || "room"}-file-overrides.json`,
          JSON.stringify(payload, null, 2) + "\n"
        );
        setAdminStatus(`Exported ${(data.files || []).length} edited file(s) for ${room}.`);
      } catch (error) {
        setAdminStatus(error.message);
      }
      return;
    }

    if (event.target.classList.contains("revert-override")) {
      const item = event.target.closest("li");
      const fileName = item?.getAttribute("data-file");
      if (!fileName) {
        return;
      }
      if (!window.confirm(`Revert ${fileName} to the Pages file? Cloudflare edits will be deleted.`)) {
        return;
      }
      try {
        await request(`/admin/files/${encodeURIComponent(fileName)}`, {
          method: "DELETE",
          body: JSON.stringify({ room })
        });
        await refreshRooms();
        setAdminStatus(`Reverted ${fileName} for ${room}.`);
      } catch (error) {
        setAdminStatus(error.message);
      }
      return;
    }

    if (event.target.classList.contains("save-room")) {
      const password = card.querySelector(".edit-password").value.trim();
      if (!password) {
        setAdminStatus("Enter a room password to save.");
        return;
      }
      try {
        const data = await request("/admin/rooms", {
          method: "PUT",
          body: JSON.stringify({ name: room, password })
        });
        await refreshRooms();
        setAdminStatus(data.kicked
          ? `Updated ${room}. Connected users must log in again.`
          : `Password unchanged for ${room}.`);
      } catch (error) {
        setAdminStatus(error.message);
      }
      return;
    }

    if (event.target.classList.contains("clear-history")) {
      if (!window.confirm(`Clear all chat history for "${room}"?\n\nOK = clear\nCancel = keep messages`)) {
        return;
      }
      try {
        await request("/admin/rooms/clear-history", {
          method: "POST",
          body: JSON.stringify({ name: room })
        });
        await refreshRooms();
        setAdminStatus(`Cleared chat history for ${room}.`);
      } catch (error) {
        setAdminStatus(error.message);
      }
      return;
    }

    if (event.target.classList.contains("delete-room")) {
      if (!window.confirm(`Delete room "${room}"?`)) {
        return;
      }
      try {
        await request("/admin/rooms", {
          method: "DELETE",
          body: JSON.stringify({ name: room })
        });
        await refreshRooms();
        setAdminStatus(`Deleted ${room}.`);
      } catch (error) {
        setAdminStatus(error.message);
      }
    }
  }

  function logout() {
    sessionStorage.removeItem(storageKey);
    els.password.value = "";
    showLogin();
  }

  els.login.addEventListener("click", unlock);
  els.password.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      unlock();
    }
  });
  els.refresh.addEventListener("click", () => {
    refreshRooms().catch((error) => setAdminStatus(error.message));
  });
  els.logout.addEventListener("click", logout);
  els.createForm.addEventListener("submit", createRoom);
  els.rooms.addEventListener("click", onRoomsClick);

  const saved = sessionStorage.getItem(storageKey);
  if (saved) {
    els.password.value = saved;
    unlock();
  }
}());
