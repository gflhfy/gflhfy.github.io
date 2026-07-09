(function () {
  const workerUrl = "https://gflhfy-collab-translator.gflhfy-collab.workers.dev";
  const storageKey = "gflhfy-collab-chat-settings";
  const pollMs = 2500;

  const els = {
    language: document.querySelector("#language"),
    author: document.querySelector("#author"),
    room: document.querySelector("#room"),
    password: document.querySelector("#password"),
    connect: document.querySelector("#connect"),
    status: document.querySelector("#status"),
    users: document.querySelector("#users"),
    messages: document.querySelector("#messages"),
    composer: document.querySelector("#composer"),
    message: document.querySelector("#message"),
    send: document.querySelector("#send")
  };

  const state = {
    connected: false,
    latestId: 0,
    timer: null,
    userId: getUserId(),
    messages: [],
    sessionVersion: null,
    rooms: []
  };

  function getUserId() {
    const key = "gflhfy-collab-user-id";
    let id = localStorage.getItem(key);
    if (!id) {
      id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(key, id);
    }
    return id;
  }

  function loadSettings() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey)) || {};
      els.language.value = saved.language || "English";
      els.author.value = saved.author || "";
      return saved.room || "";
    } catch {
      els.language.value = "English";
      return "";
    }
  }

  function saveSettings() {
    localStorage.setItem(storageKey, JSON.stringify({
      language: els.language.value,
      author: els.author.value.trim(),
      room: els.room.value
    }));
  }

  function authHeaders() {
    return {
      "authorization": `Bearer ${els.password.value}`,
      "content-type": "application/json"
    };
  }

  function roomName() {
    return els.room.value || "";
  }

  function authorName() {
    return (els.author.value || "Guest").trim() || "Guest";
  }

  function setStatus(text) {
    els.status.textContent = text;
  }

  function escapeHtml(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function formatTime(value) {
    try {
      return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  }

  function renderMessages() {
    els.messages.innerHTML = state.messages.map((message) => {
      const own = message.author === authorName();
      const original = message.translated
        ? `<details><summary>Original ${escapeHtml(message.sourceLanguage)}</summary><div class="original-text">${escapeHtml(message.sourceText)}</div></details>`
        : "";
      const note = message.translated
        ? `<div class="translation-note">Translated from ${escapeHtml(message.sourceLanguage)}</div>`
        : "";
      return `
        <article class="message${own ? " own" : ""}">
          <div class="message-meta">
            <span class="message-author">${escapeHtml(message.author)}</span>
            <span>${escapeHtml(formatTime(message.createdAt))}</span>
          </div>
          <div class="message-text">${escapeHtml(message.displayText)}</div>
          ${note}
          ${original}
        </article>
      `;
    }).join("");
    els.messages.scrollTop = els.messages.scrollHeight;
  }

  function renderUsers(users) {
    if (!Array.isArray(users) || users.length === 0) {
      els.users.textContent = "";
      return;
    }
    const names = users.map((user) => `${user.author} (${user.language})`);
    els.users.textContent = names.join(", ");
  }

  function fillRooms(rooms, preferredRoom) {
    state.rooms = Array.isArray(rooms) ? rooms : [];
    if (!state.rooms.length) {
      els.room.innerHTML = '<option value="">No rooms yet</option>';
      els.room.disabled = true;
      setStatus("No rooms available. Ask an admin to create one.");
      return;
    }

    els.room.disabled = false;
    els.room.innerHTML = state.rooms.map((room) => {
      const name = room.name || "";
      return `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`;
    }).join("");

    const preferred = preferredRoom || loadSettingsRoom();
    if (preferred && state.rooms.some((room) => room.name === preferred)) {
      els.room.value = preferred;
    }
  }

  function loadSettingsRoom() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey)) || {};
      return saved.room || "";
    } catch {
      return "";
    }
  }

  function disconnect(message) {
    state.connected = false;
    state.sessionVersion = null;
    if (state.timer) {
      window.clearInterval(state.timer);
      state.timer = null;
    }
    els.message.disabled = true;
    els.send.disabled = true;
    els.connect.textContent = "Connect";
    els.users.textContent = "";
    if (message) {
      setStatus(message);
    }
  }

  function isAuthFailure(error, data) {
    const code = data && data.code;
    if (code === "room_auth_failed" || code === "unknown_room") {
      return true;
    }
    const text = String((error && error.message) || "");
    return /password|unauthorized|unknown room/i.test(text);
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
      const error = new Error(data.error || "Request failed");
      error.data = data;
      error.status = response.status;
      throw error;
    }
    return data;
  }

  async function publicRequest(path) {
    const response = await fetch(`${workerUrl}${path}`);
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || "Request failed");
    }
    return data;
  }

  async function loadRooms(preferredRoom) {
    const data = await publicRequest("/chat/rooms");
    fillRooms(data.rooms || [], preferredRoom);
  }

  async function sendPresence() {
    const data = await request("/chat/presence", {
      method: "POST",
      body: JSON.stringify({
        room: roomName(),
        author: authorName(),
        language: els.language.value,
        userId: state.userId
      })
    });
    checkSession(data);
    return data;
  }

  function checkSession(data) {
    if (!data || typeof data.sessionVersion !== "number") {
      return;
    }
    if (state.sessionVersion == null) {
      state.sessionVersion = data.sessionVersion;
      return;
    }
    if (data.sessionVersion !== state.sessionVersion) {
      const error = new Error("Room password changed. Enter the new password and connect again.");
      error.code = "session_kicked";
      throw error;
    }
  }

  async function poll() {
    if (!state.connected) {
      return;
    }

    try {
      const params = new URLSearchParams({
        room: roomName(),
        language: els.language.value,
        after: String(state.latestId),
        limit: "100"
      });
      const data = await request(`/chat/messages?${params.toString()}`, { method: "GET" });
      checkSession(data);
      if (data.messages && data.messages.length) {
        state.messages.push(...data.messages);
        state.messages = state.messages.slice(-200);
        state.latestId = data.latestId || state.messages[state.messages.length - 1].id;
        renderMessages();
      }
      renderUsers(data.users);
      setStatus(`Connected to ${roomName()}.`);
    } catch (error) {
      handleRuntimeError(error);
    }
  }

  function handleRuntimeError(error) {
    if (error.code === "session_kicked" || isAuthFailure(error, error.data)) {
      disconnect(error.message || "Room password changed. Enter the new password and connect again.");
      return;
    }
    setStatus(error.message);
  }

  async function connect() {
    if (!roomName()) {
      setStatus("Select a room.");
      return;
    }
    if (!els.password.value) {
      setStatus("Enter the room password.");
      return;
    }

    saveSettings();
    state.connected = true;
    state.latestId = 0;
    state.messages = [];
    state.sessionVersion = null;
    els.message.disabled = false;
    els.send.disabled = false;
    els.connect.textContent = "Reconnect";
    setStatus("Connecting...");
    renderMessages();

    if (state.timer) {
      window.clearInterval(state.timer);
    }

    try {
      await sendPresence();
      await poll();
      state.timer = window.setInterval(() => {
        sendPresence().catch(handleRuntimeError);
        poll().catch(handleRuntimeError);
      }, pollMs);
    } catch (error) {
      disconnect(error.message);
    }
  }

  async function sendMessage(event) {
    event.preventDefault();
    const text = els.message.value.trim();
    if (!text || !state.connected) {
      return;
    }

    els.send.disabled = true;
    try {
      const data = await request("/chat/send", {
        method: "POST",
        body: JSON.stringify({
          room: roomName(),
          author: authorName(),
          language: els.language.value,
          userId: state.userId,
          text
        })
      });
      checkSession(data);
      els.message.value = "";
      await poll();
    } catch (error) {
      handleRuntimeError(error);
    } finally {
      if (state.connected) {
        els.send.disabled = false;
        els.message.focus();
      }
    }
  }

  els.connect.addEventListener("click", connect);
  els.composer.addEventListener("submit", sendMessage);
  els.message.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (!els.send.disabled) {
        els.composer.requestSubmit();
      }
    }
  });
  els.language.addEventListener("change", () => {
    saveSettings();
    if (state.connected) {
      state.latestId = 0;
      state.messages = [];
      poll().catch(handleRuntimeError);
    }
  });
  els.author.addEventListener("change", saveSettings);
  els.room.addEventListener("change", () => {
    saveSettings();
    if (state.connected) {
      disconnect("Room changed. Connect again.");
    }
  });

  const preferredRoom = loadSettings();
  loadRooms(preferredRoom).catch((error) => {
    els.room.innerHTML = '<option value="">Failed to load rooms</option>';
    els.room.disabled = true;
    setStatus(error.message);
  });
}());
