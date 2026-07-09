(function () {
  const workerUrl = "https://gflhfy-collab-translator.gflhfy-collab.workers.dev";
  const storageKey = "gflhfy-collab-chat-settings";
  const pollMs = 2500;

  // Kokoro book languages, with English as a single chat language.
  const LANGUAGES = [
    { code: "en", label: "English", translateAs: "English", ui: "en" },
    { code: "es", label: "Spanish", translateAs: "Spanish", ui: "es" },
    { code: "fr", label: "French", translateAs: "French", ui: "fr" },
    { code: "hi", label: "Hindi", translateAs: "Hindi", ui: "hi" },
    { code: "it", label: "Italian", translateAs: "Italian", ui: "it" },
    { code: "ja", label: "Japanese", translateAs: "Japanese", ui: "ja" },
    { code: "pt-br", label: "Portuguese (Brazil)", translateAs: "Portuguese", ui: "pt-br" },
    { code: "zh", label: "Mandarin Chinese", translateAs: "Chinese", ui: "zh" }
  ];

  const UI = {
    en: {
      yourLanguage: "Your language",
      name: "Name",
      namePlaceholder: "Your name",
      room: "Room",
      roomPassword: "Room password",
      connect: "Connect",
      reconnect: "Reconnect",
      send: "Send",
      messagePlaceholder: "Write a message...",
      notConnected: "Not connected.",
      loadingRooms: "Loading rooms...",
      noRooms: "No rooms yet",
      noRoomsStatus: "No rooms available. Ask an admin to create one.",
      failedRooms: "Failed to load rooms",
      selectRoom: "Select a room.",
      enterPassword: "Enter the room password.",
      connecting: "Connecting...",
      connectedTo: "Connected to {room}.",
      roomChanged: "Room changed. Connect again.",
      passwordChanged: "Room password changed. Enter the new password and connect again.",
      original: "Original {language}",
      translatedFrom: "Translated from {language}",
      guest: "Guest",
      noAudio: "No audio selected",
      connectForFiles: "Connect to a room to see files.",
      emptyFiles: "Empty",
      loadingFiles: "Loading files...",
      back: "Back",
      kindAudio: "Audio",
      kindVideo: "Video",
      kindText: "Text"
    },
    es: {
      yourLanguage: "Tu idioma",
      name: "Nombre",
      namePlaceholder: "Tu nombre",
      room: "Sala",
      roomPassword: "Contraseña de la sala",
      connect: "Conectar",
      reconnect: "Reconectar",
      send: "Enviar",
      messagePlaceholder: "Escribe un mensaje...",
      notConnected: "No conectado.",
      loadingRooms: "Cargando salas...",
      noRooms: "Aún no hay salas",
      noRoomsStatus: "No hay salas disponibles. Pide a un administrador que cree una.",
      failedRooms: "No se pudieron cargar las salas",
      selectRoom: "Selecciona una sala.",
      enterPassword: "Introduce la contraseña de la sala.",
      connecting: "Conectando...",
      connectedTo: "Conectado a {room}.",
      roomChanged: "Sala cambiada. Conéctate de nuevo.",
      passwordChanged: "La contraseña de la sala cambió. Introduce la nueva y conéctate de nuevo.",
      original: "Original {language}",
      translatedFrom: "Traducido del {language}",
      guest: "Invitado",
      noAudio: "Ningún audio seleccionado",
      connectForFiles: "Conéctate a una sala para ver archivos.",
      emptyFiles: "Vacío",
      loadingFiles: "Cargando archivos...",
      back: "Atrás",
      kindAudio: "Audio",
      kindVideo: "Video",
      kindText: "Texto"
    },
    fr: {
      yourLanguage: "Votre langue",
      name: "Nom",
      namePlaceholder: "Votre nom",
      room: "Salle",
      roomPassword: "Mot de passe de la salle",
      connect: "Connexion",
      reconnect: "Reconnecter",
      send: "Envoyer",
      messagePlaceholder: "Écrire un message...",
      notConnected: "Non connecté.",
      loadingRooms: "Chargement des salles...",
      noRooms: "Aucune salle pour le moment",
      noRoomsStatus: "Aucune salle disponible. Demandez à un administrateur d'en créer une.",
      failedRooms: "Échec du chargement des salles",
      selectRoom: "Sélectionnez une salle.",
      enterPassword: "Entrez le mot de passe de la salle.",
      connecting: "Connexion...",
      connectedTo: "Connecté à {room}.",
      roomChanged: "Salle changée. Reconnectez-vous.",
      passwordChanged: "Le mot de passe de la salle a changé. Entrez le nouveau et reconnectez-vous.",
      original: "Original {language}",
      translatedFrom: "Traduit de {language}",
      guest: "Invité",
      noAudio: "Aucun audio sélectionné",
      connectForFiles: "Connectez-vous à une salle pour voir les fichiers.",
      emptyFiles: "Vide",
      loadingFiles: "Chargement des fichiers...",
      back: "Retour",
      kindAudio: "Audio",
      kindVideo: "Vidéo",
      kindText: "Texte"
    },
    hi: {
      yourLanguage: "आपकी भाषा",
      name: "नाम",
      namePlaceholder: "आपका नाम",
      room: "कमरा",
      roomPassword: "कमरे का पासवर्ड",
      connect: "कनेक्ट करें",
      reconnect: "फिर से कनेक्ट करें",
      send: "भेजें",
      messagePlaceholder: "संदेश लिखें...",
      notConnected: "कनेक्ट नहीं है।",
      loadingRooms: "कमरे लोड हो रहे हैं...",
      noRooms: "अभी कोई कमरा नहीं",
      noRoomsStatus: "कोई कमरा उपलब्ध नहीं। व्यवस्थापक से एक बनाने को कहें।",
      failedRooms: "कमरे लोड नहीं हो सके",
      selectRoom: "एक कमरा चुनें।",
      enterPassword: "कमरे का पासवर्ड दर्ज करें।",
      connecting: "कनेक्ट हो रहा है...",
      connectedTo: "{room} से कनेक्ट है।",
      roomChanged: "कमरा बदल गया। फिर से कनेक्ट करें।",
      passwordChanged: "कमरे का पासवर्ड बदल गया। नया पासवर्ड डालकर फिर कनेक्ट करें।",
      original: "मूल {language}",
      translatedFrom: "{language} से अनुवादित",
      guest: "अतिथि",
      noAudio: "कोई ऑडियो चयनित नहीं",
      connectForFiles: "फ़ाइलें देखने के लिए एक कमरे से कनेक्ट करें।",
      emptyFiles: "खाली",
      loadingFiles: "फ़ाइलें लोड हो रही हैं...",
      back: "वापस",
      kindAudio: "ऑडियो",
      kindVideo: "वीडियो",
      kindText: "पाठ"
    },
    it: {
      yourLanguage: "La tua lingua",
      name: "Nome",
      namePlaceholder: "Il tuo nome",
      room: "Stanza",
      roomPassword: "Password della stanza",
      connect: "Connetti",
      reconnect: "Riconnetti",
      send: "Invia",
      messagePlaceholder: "Scrivi un messaggio...",
      notConnected: "Non connesso.",
      loadingRooms: "Caricamento stanze...",
      noRooms: "Nessuna stanza ancora",
      noRoomsStatus: "Nessuna stanza disponibile. Chiedi a un amministratore di crearne una.",
      failedRooms: "Impossibile caricare le stanze",
      selectRoom: "Seleziona una stanza.",
      enterPassword: "Inserisci la password della stanza.",
      connecting: "Connessione...",
      connectedTo: "Connesso a {room}.",
      roomChanged: "Stanza cambiata. Riconnettiti.",
      passwordChanged: "La password della stanza è cambiata. Inserisci la nuova e riconnettiti.",
      original: "Originale {language}",
      translatedFrom: "Tradotto da {language}",
      guest: "Ospite",
      noAudio: "Nessun audio selezionato",
      connectForFiles: "Connettiti a una stanza per vedere i file.",
      emptyFiles: "Vuoto",
      loadingFiles: "Caricamento file...",
      back: "Indietro",
      kindAudio: "Audio",
      kindVideo: "Video",
      kindText: "Testo"
    },
    ja: {
      yourLanguage: "あなたの言語",
      name: "名前",
      namePlaceholder: "あなたの名前",
      room: "ルーム",
      roomPassword: "ルームパスワード",
      connect: "接続",
      reconnect: "再接続",
      send: "送信",
      messagePlaceholder: "メッセージを書く...",
      notConnected: "未接続。",
      loadingRooms: "ルームを読み込み中...",
      noRooms: "ルームがまだありません",
      noRoomsStatus: "利用できるルームがありません。管理者に作成を依頼してください。",
      failedRooms: "ルームの読み込みに失敗しました",
      selectRoom: "ルームを選択してください。",
      enterPassword: "ルームパスワードを入力してください。",
      connecting: "接続中...",
      connectedTo: "{room} に接続しました。",
      roomChanged: "ルームが変わりました。もう一度接続してください。",
      passwordChanged: "ルームパスワードが変更されました。新しいパスワードを入力して再接続してください。",
      original: "原文 {language}",
      translatedFrom: "{language} からの翻訳",
      guest: "ゲスト",
      noAudio: "音声未選択",
      connectForFiles: "ファイルを見るにはルームに接続してください。",
      emptyFiles: "空",
      loadingFiles: "ファイルを読み込み中...",
      back: "戻る",
      kindAudio: "音声",
      kindVideo: "動画",
      kindText: "テキスト"
    },
    "pt-br": {
      yourLanguage: "Seu idioma",
      name: "Nome",
      namePlaceholder: "Seu nome",
      room: "Sala",
      roomPassword: "Senha da sala",
      connect: "Conectar",
      reconnect: "Reconectar",
      send: "Enviar",
      messagePlaceholder: "Escreva uma mensagem...",
      notConnected: "Não conectado.",
      loadingRooms: "Carregando salas...",
      noRooms: "Ainda não há salas",
      noRoomsStatus: "Nenhuma sala disponível. Peça a um administrador para criar uma.",
      failedRooms: "Falha ao carregar as salas",
      selectRoom: "Selecione uma sala.",
      enterPassword: "Digite a senha da sala.",
      connecting: "Conectando...",
      connectedTo: "Conectado a {room}.",
      roomChanged: "Sala alterada. Conecte novamente.",
      passwordChanged: "A senha da sala mudou. Digite a nova senha e conecte novamente.",
      original: "Original {language}",
      translatedFrom: "Traduzido de {language}",
      guest: "Convidado",
      noAudio: "Nenhum áudio selecionado",
      connectForFiles: "Conecte-se a uma sala para ver os arquivos.",
      emptyFiles: "Vazio",
      loadingFiles: "Carregando arquivos...",
      back: "Voltar",
      kindAudio: "Áudio",
      kindVideo: "Vídeo",
      kindText: "Texto"
    },
    zh: {
      yourLanguage: "你的语言",
      name: "名称",
      namePlaceholder: "你的名字",
      room: "房间",
      roomPassword: "房间密码",
      connect: "连接",
      reconnect: "重新连接",
      send: "发送",
      messagePlaceholder: "写一条消息...",
      notConnected: "未连接。",
      loadingRooms: "正在加载房间...",
      noRooms: "还没有房间",
      noRoomsStatus: "没有可用房间。请让管理员创建一个。",
      failedRooms: "无法加载房间",
      selectRoom: "请选择一个房间。",
      enterPassword: "请输入房间密码。",
      connecting: "正在连接...",
      connectedTo: "已连接到 {room}。",
      roomChanged: "房间已更改。请重新连接。",
      passwordChanged: "房间密码已更改。请输入新密码并重新连接。",
      original: "原文 {language}",
      translatedFrom: "译自 {language}",
      guest: "访客",
      noAudio: "未选择音频",
      connectForFiles: "连接房间后可查看文件。",
      emptyFiles: "空",
      loadingFiles: "正在加载文件...",
      back: "返回",
      kindAudio: "音频",
      kindVideo: "视频",
      kindText: "文本"
    }
  };

  const filesBaseUrl = "https://gflhfy.github.io/collab/files";
  const layoutKey = "gflhfy-collab-chat-width";

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
    send: document.querySelector("#send"),
    splitter: document.querySelector("#splitter"),
    filesBrowser: document.querySelector("#files-browser"),
    fileList: document.querySelector("#file-list"),
    audioPlayer: document.querySelector("#audio-player"),
    audioTitle: document.querySelector("#audio-title"),
    textViewer: document.querySelector("#text-viewer"),
    viewerBack: document.querySelector("#viewer-back"),
    viewerTitle: document.querySelector("#viewer-title"),
    viewerBody: document.querySelector("#viewer-body")
  };

  const state = {
    connected: false,
    latestId: 0,
    timer: null,
    pollInFlight: null,
    userId: getUserId(),
    messages: [],
    sessionVersion: null,
    rooms: [],
    statusKey: "notConnected",
    statusVars: {},
    roomSlug: "",
    files: []
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

  function selectedLanguage() {
    return LANGUAGES.find((item) => item.code === els.language.value) || LANGUAGES[0];
  }

  function uiBundle() {
    return UI[selectedLanguage().ui] || UI.en;
  }

  function t(key, vars = {}) {
    const bundle = uiBundle();
    let text = bundle[key] || UI.en[key] || key;
    for (const [name, value] of Object.entries(vars)) {
      text = text.replaceAll(`{${name}}`, String(value ?? ""));
    }
    return text;
  }

  function translateLanguageName() {
    return selectedLanguage().translateAs;
  }

  function applyUi() {
    document.documentElement.lang = selectedLanguage().ui === "pt-br"
      ? "pt-BR"
      : selectedLanguage().ui;

    document.querySelectorAll("[data-i18n]").forEach((node) => {
      if (node === els.connect && state.connected) {
        node.textContent = t("reconnect");
        return;
      }
      if (node === els.status) {
        return;
      }
      if (node === els.audioTitle && els.audioPlayer.getAttribute("src")) {
        return;
      }
      node.textContent = t(node.getAttribute("data-i18n"));
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
      node.setAttribute("placeholder", t(node.getAttribute("data-i18n-placeholder")));
    });

    if (state.connected) {
      els.connect.textContent = t("reconnect");
    } else {
      els.connect.textContent = t("connect");
    }

    if (!state.rooms.length && els.room.options.length === 1 && !els.room.value) {
      els.room.options[0].textContent = t(
        els.room.disabled && state.statusKey === "noRoomsStatus" ? "noRooms" : "loadingRooms"
      );
    }

    setStatusKey(state.statusKey, state.statusVars);
    renderMessages();
    renderFileList();
    if (!els.audioPlayer.getAttribute("src")) {
      els.audioTitle.textContent = t("noAudio");
    }
  }

  function setStatusKey(key, vars = {}) {
    state.statusKey = key;
    state.statusVars = vars || {};
    if (key) {
      els.status.textContent = t(key, state.statusVars);
    }
  }

  function setStatusRaw(text) {
    state.statusKey = "";
    state.statusVars = {};
    els.status.textContent = text;
  }

  function migrateLanguage(saved) {
    const value = String(saved || "").trim();
    if (!value) {
      return "en";
    }
    const byCode = LANGUAGES.find((item) => item.code === value);
    if (byCode) {
      return byCode.code;
    }
    const lower = value.toLowerCase();
    if (lower === "english" || lower === "english (us)" || lower === "english (uk)" || lower === "en-gb") {
      return "en";
    }
    const byLabel = LANGUAGES.find((item) => item.label.toLowerCase() === lower);
    if (byLabel) {
      return byLabel.code;
    }
    const byTranslate = LANGUAGES.find((item) => item.translateAs.toLowerCase() === lower);
    return byTranslate ? byTranslate.code : "en";
  }

  function fillLanguageOptions(preferredCode) {
    els.language.innerHTML = LANGUAGES.map((item) => (
      `<option value="${escapeHtml(item.code)}">${escapeHtml(item.label)}</option>`
    )).join("");
    els.language.value = preferredCode || "en";
    if (!els.language.value) {
      els.language.value = "en";
    }
  }

  function loadSettings() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey)) || {};
      fillLanguageOptions(migrateLanguage(saved.language));
      els.author.value = saved.author || "";
      return saved.room || "";
    } catch {
      fillLanguageOptions("en");
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
    return (els.author.value || t("guest")).trim() || t("guest");
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
        ? `<details><summary>${escapeHtml(t("original", { language: message.sourceLanguage }))}</summary><div class="original-text">${escapeHtml(message.sourceText)}</div></details>`
        : "";
      const note = message.translated
        ? `<div class="translation-note">${escapeHtml(t("translatedFrom", { language: message.sourceLanguage }))}</div>`
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
      els.room.innerHTML = `<option value="">${escapeHtml(t("noRooms"))}</option>`;
      els.room.disabled = true;
      setStatusKey("noRoomsStatus");
      return;
    }

    els.room.disabled = false;
    els.room.innerHTML = state.rooms.map((room) => {
      const name = room.name || "";
      return `<option value="${escapeHtml(name)}" data-slug="${escapeHtml(room.slug || "")}">${escapeHtml(name)}</option>`;
    }).join("");

    const preferred = preferredRoom || loadSettingsRoom();
    if (preferred && state.rooms.some((room) => room.name === preferred)) {
      els.room.value = preferred;
    }
  }

  function currentRoomSlug() {
    const selected = state.rooms.find((room) => room.name === roomName());
    if (selected && selected.slug) {
      return selected.slug;
    }
    const option = els.room.selectedOptions[0];
    return (option && option.getAttribute("data-slug")) || "";
  }

  function fileUrl(name) {
    return `${filesBaseUrl}/${encodeURIComponent(state.roomSlug)}/${encodeURIComponent(name)}`;
  }

  function kindLabel(kind) {
    if (kind === "audio") {
      return t("kindAudio");
    }
    if (kind === "video") {
      return t("kindVideo");
    }
    return t("kindText");
  }

  function showFilesBrowser() {
    els.filesBrowser.classList.remove("hidden");
    els.textViewer.classList.add("hidden");
  }

  function renderFileList() {
    showFilesBrowser();
    if (!state.connected) {
      els.fileList.innerHTML = `<div class="files-empty">${escapeHtml(t("connectForFiles"))}</div>`;
      return;
    }
    if (!state.files.length) {
      els.fileList.innerHTML = `<div class="files-empty">${escapeHtml(t("emptyFiles"))}</div>`;
      return;
    }

    els.fileList.innerHTML = state.files.map((file) => `
      <button type="button" class="file-item" data-name="${escapeHtml(file.name)}" data-kind="${escapeHtml(file.kind)}">
        <span class="file-kind">${escapeHtml(kindLabel(file.kind))}</span>
        <span class="file-name">${escapeHtml(file.name)}</span>
      </button>
    `).join("");
  }

  async function loadRoomFiles() {
    state.roomSlug = currentRoomSlug();
    state.files = [];
    if (!state.roomSlug) {
      renderFileList();
      return;
    }

    els.fileList.innerHTML = `<div class="files-empty">${escapeHtml(t("loadingFiles"))}</div>`;
    try {
      const response = await fetch(`${filesBaseUrl}/${encodeURIComponent(state.roomSlug)}/manifest.json?ts=${Date.now()}`, {
        cache: "no-store"
      });
      if (response.status === 404) {
        state.files = [];
        renderFileList();
        return;
      }
      if (!response.ok) {
        throw new Error(`Files request failed (${response.status})`);
      }
      const data = await response.json();
      const files = Array.isArray(data.files) ? data.files : [];
      state.files = files
        .filter((file) => file && file.name && file.kind)
        .slice()
        .sort((a, b) => String(a.name).localeCompare(String(b.name)));
      renderFileList();
    } catch {
      state.files = [];
      renderFileList();
    }
  }

  function playAudio(name) {
    const url = fileUrl(name);
    els.audioTitle.textContent = name;
    els.audioPlayer.pause();
    els.audioPlayer.src = url;
    els.audioPlayer.load();
    const playPromise = els.audioPlayer.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {});
    }
  }

  async function openTextFile(name) {
    els.viewerTitle.textContent = name;
    els.viewerBody.innerHTML = `<p>${escapeHtml(t("loadingFiles"))}</p>`;
    els.filesBrowser.classList.add("hidden");
    els.textViewer.classList.remove("hidden");

    try {
      const response = await fetch(fileUrl(name), { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`Could not open ${name}`);
      }
      const text = await response.text();
      const lower = name.toLowerCase();
      if (lower.endsWith(".md") || lower.endsWith(".markdown")) {
        if (window.marked && typeof window.marked.parse === "function") {
          els.viewerBody.innerHTML = window.marked.parse(text);
        } else {
          els.viewerBody.innerHTML = `<pre>${escapeHtml(text)}</pre>`;
        }
      } else {
        els.viewerBody.innerHTML = `<pre>${escapeHtml(text)}</pre>`;
      }
    } catch (error) {
      els.viewerBody.innerHTML = `<p>${escapeHtml(error.message)}</p>`;
    }
  }

  function onFileClick(event) {
    const button = event.target.closest(".file-item");
    if (!button) {
      return;
    }
    const name = button.getAttribute("data-name");
    const kind = button.getAttribute("data-kind");
    if (!name || !kind) {
      return;
    }
    if (kind === "audio") {
      playAudio(name);
      return;
    }
    if (kind === "video") {
      window.open(fileUrl(name), "_blank", "noopener,noreferrer");
      return;
    }
    openTextFile(name);
  }

  function setupSplitter() {
    const saved = localStorage.getItem(layoutKey);
    if (saved) {
      document.documentElement.style.setProperty("--chat-width", saved);
    }

    let dragging = false;

    function onMove(clientX) {
      const total = document.documentElement.clientWidth;
      if (total < 900) {
        return;
      }
      const percent = Math.min(75, Math.max(30, (clientX / total) * 100));
      const value = `${percent}%`;
      document.documentElement.style.setProperty("--chat-width", value);
      localStorage.setItem(layoutKey, value);
    }

    els.splitter.addEventListener("pointerdown", (event) => {
      dragging = true;
      els.splitter.setPointerCapture(event.pointerId);
      event.preventDefault();
    });
    els.splitter.addEventListener("pointermove", (event) => {
      if (!dragging) {
        return;
      }
      onMove(event.clientX);
    });
    els.splitter.addEventListener("pointerup", () => {
      dragging = false;
    });
    els.splitter.addEventListener("keydown", (event) => {
      const current = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--chat-width")) || 58;
      if (event.key === "ArrowLeft") {
        onMove(((current - 2) / 100) * document.documentElement.clientWidth);
      }
      if (event.key === "ArrowRight") {
        onMove(((current + 2) / 100) * document.documentElement.clientWidth);
      }
    });
  }

  function loadSettingsRoom() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey)) || {};
      return saved.room || "";
    } catch {
      return "";
    }
  }

  function disconnect(messageKeyOrText, vars = {}) {
    state.connected = false;
    state.sessionVersion = null;
    state.files = [];
    state.roomSlug = "";
    if (state.timer) {
      window.clearInterval(state.timer);
      state.timer = null;
    }
    els.message.disabled = true;
    els.send.disabled = true;
    els.connect.textContent = t("connect");
    els.users.textContent = "";
    els.audioPlayer.pause();
    els.audioPlayer.removeAttribute("src");
    els.audioTitle.textContent = t("noAudio");
    showFilesBrowser();
    renderFileList();
    if (messageKeyOrText) {
      if (UI.en[messageKeyOrText] || uiBundle()[messageKeyOrText]) {
        setStatusKey(messageKeyOrText, vars);
      } else {
        setStatusRaw(messageKeyOrText);
      }
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
        language: translateLanguageName(),
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
      const error = new Error(t("passwordChanged"));
      error.code = "session_kicked";
      throw error;
    }
  }

  function mergeMessages(incoming) {
    if (!Array.isArray(incoming) || !incoming.length) {
      return false;
    }

    const seen = new Set(state.messages.map((message) => message.id));
    let added = false;
    for (const message of incoming) {
      if (seen.has(message.id)) {
        continue;
      }
      seen.add(message.id);
      state.messages.push(message);
      added = true;
      if (message.id > state.latestId) {
        state.latestId = message.id;
      }
    }

    if (added) {
      state.messages = state.messages.slice(-200);
    }
    return added;
  }

  async function poll() {
    if (!state.connected) {
      return;
    }
    if (state.pollInFlight) {
      return state.pollInFlight;
    }

    state.pollInFlight = (async () => {
      try {
        const params = new URLSearchParams({
          room: roomName(),
          language: translateLanguageName(),
          after: String(state.latestId),
          limit: "100"
        });
        const data = await request(`/chat/messages?${params.toString()}`, { method: "GET" });
        checkSession(data);
        if (mergeMessages(data.messages)) {
          renderMessages();
        }
        renderUsers(data.users);
        setStatusKey("connectedTo", { room: roomName() });
      } catch (error) {
        handleRuntimeError(error);
      } finally {
        state.pollInFlight = null;
      }
    })();

    return state.pollInFlight;
  }

  function handleRuntimeError(error) {
    if (error.code === "session_kicked" || isAuthFailure(error, error.data)) {
      disconnect("passwordChanged");
      return;
    }
    setStatusRaw(error.message);
  }

  async function connect() {
    if (!roomName()) {
      setStatusKey("selectRoom");
      return;
    }
    if (!els.password.value) {
      setStatusKey("enterPassword");
      return;
    }

    saveSettings();
    state.connected = true;
    state.latestId = 0;
    state.messages = [];
    state.sessionVersion = null;
    els.message.disabled = false;
    els.send.disabled = false;
    els.connect.textContent = t("reconnect");
    setStatusKey("connecting");
    renderMessages();

    if (state.timer) {
      window.clearInterval(state.timer);
    }

    try {
      await sendPresence();
      await poll();
      await loadRoomFiles();
      state.timer = window.setInterval(() => {
        sendPresence().catch(handleRuntimeError);
        poll();
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
          language: translateLanguageName(),
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
    applyUi();
    if (state.connected) {
      state.latestId = 0;
      state.messages = [];
      poll();
    }
  });
  els.author.addEventListener("change", saveSettings);
  els.room.addEventListener("change", () => {
    saveSettings();
    if (state.connected) {
      disconnect("roomChanged");
    } else {
      renderFileList();
    }
  });
  els.fileList.addEventListener("click", onFileClick);
  els.viewerBack.addEventListener("click", () => {
    showFilesBrowser();
    renderFileList();
  });

  setupSplitter();
  const preferredRoom = loadSettings();
  applyUi();
  renderFileList();
  loadRooms(preferredRoom).catch((error) => {
    els.room.innerHTML = `<option value="">${escapeHtml(t("failedRooms"))}</option>`;
    els.room.disabled = true;
    setStatusRaw(error.message);
  });
}());
