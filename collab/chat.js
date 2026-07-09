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
    messages: []
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
      els.room.value = saved.room || "main";
    } catch {
      els.language.value = "English";
      els.room.value = "main";
    }
  }

  function saveSettings() {
    localStorage.setItem(storageKey, JSON.stringify({
      language: els.language.value,
      author: els.author.value.trim(),
      room: els.room.value.trim()
    }));
  }

  function authHeaders() {
    return {
      "authorization": `Bearer ${els.password.value}`,
      "content-type": "application/json"
    };
  }

  function roomName() {
    return (els.room.value || "main").trim() || "main";
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

  async function sendPresence() {
    await request("/chat/presence", {
      method: "POST",
      body: JSON.stringify({
        room: roomName(),
        author: authorName(),
        language: els.language.value,
        userId: state.userId
      })
    });
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
      if (data.messages && data.messages.length) {
        state.messages.push(...data.messages);
        state.messages = state.messages.slice(-200);
        state.latestId = data.latestId || state.messages[state.messages.length - 1].id;
        renderMessages();
      }
      renderUsers(data.users);
      setStatus(`Connected to ${roomName()}.`);
    } catch (error) {
      setStatus(error.message);
    }
  }

  async function connect() {
    if (!els.password.value) {
      setStatus("Enter the shared password.");
      return;
    }

    saveSettings();
    state.connected = true;
    state.latestId = 0;
    state.messages = [];
    els.message.disabled = false;
    els.send.disabled = false;
    els.connect.textContent = "Reconnect";
    setStatus("Connecting...");

    if (state.timer) {
      window.clearInterval(state.timer);
    }

    try {
      await sendPresence();
      await poll();
      state.timer = window.setInterval(() => {
        sendPresence().catch(() => {});
        poll().catch(() => {});
      }, pollMs);
    } catch (error) {
      state.connected = false;
      els.message.disabled = true;
      els.send.disabled = true;
      setStatus(error.message);
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
      await request("/chat/send", {
        method: "POST",
        body: JSON.stringify({
          room: roomName(),
          author: authorName(),
          language: els.language.value,
          userId: state.userId,
          text
        })
      });
      els.message.value = "";
      await poll();
    } catch (error) {
      setStatus(error.message);
    } finally {
      els.send.disabled = false;
      els.message.focus();
    }
  }

  els.connect.addEventListener("click", connect);
  els.composer.addEventListener("submit", sendMessage);
  els.language.addEventListener("change", () => {
    saveSettings();
    if (state.connected) {
      state.latestId = 0;
      state.messages = [];
      poll().catch((error) => setStatus(error.message));
    }
  });
  els.author.addEventListener("change", saveSettings);
  els.room.addEventListener("change", saveSettings);

  loadSettings();
}());

