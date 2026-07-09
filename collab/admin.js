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

    els.rooms.innerHTML = rooms.map((room) => `
      <article class="room-card" data-room="${escapeHtml(room.name)}">
        <h3>${escapeHtml(room.name)}</h3>
        <div class="room-meta">
          Slug <code>${escapeHtml(room.slug || "")}</code>
          · Session ${escapeHtml(String(room.sessionVersion || 1))}
          · ${(room.users || []).length} online
        </div>
        <div class="room-meta">Upload folder: ebooks/collab/files/${escapeHtml(room.slug || "")}/</div>
        ${formatUsers(room.users)}
        <div class="room-actions">
          <label>
            <span>New password</span>
            <input class="edit-password" type="password" maxlength="200" placeholder="Leave blank to keep">
          </label>
          <button type="button" class="save-room">Save password</button>
          <button type="button" class="danger delete-room">Delete</button>
        </div>
      </article>
    `).join("");
  }

  async function refreshRooms() {
    const data = await request("/admin/rooms", { method: "GET" });
    renderRooms(data.rooms || []);
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
    if (event.target.classList.contains("save-room")) {
      const password = card.querySelector(".edit-password").value;
      if (!password) {
        setAdminStatus("Enter a new password to save.");
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
          : `Updated ${room}.`);
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
