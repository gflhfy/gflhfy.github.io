(function () {
  const workerUrl = "https://gflhfy-collab-translator.gflhfy-collab.workers.dev";
  const storageKey = "gflhfy-collab-chat-settings";
  const passwordKey = "gflhfy-collab-chat-password";
  const pollMs = 2500;
  const timestampRefreshMs = 5 * 60 * 1000;

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
      guest: "Guest",
      noAudio: "No audio selected",
      connectForFiles: "Connect to a room to see files.",
      emptyFiles: "Empty",
      loadingFiles: "Loading files...",
      filesHeading: "Files",
      refreshFiles: "Refresh",
      back: "Back",
      yesterday: "Yesterday",
      edit: "Edit",
      preview: "Preview",
      save: "Save",
      cancel: "Cancel",
      revert: "Revert",
      editedBadge: "Edited",
      editedOnCloud: "Saved on server (overrides Pages file).",
      viewingPages: "From GitHub Pages.",
      savedOk: "Saved.",
      revertedOk: "Reverted to Pages file.",
      saveFailed: "Could not save.",
      revertConfirm: "Discard the saved edits and show the original Pages file again?",
      tabLogin: "Login",
      tabChat: "Chat",
      tabFiles: "Files",
      newMessageTitle: "New message in {room}",
      newMessagesCount: "{count} new messages",
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
      guest: "Invitado",
      noAudio: "Ningún audio seleccionado",
      connectForFiles: "Conéctate a una sala para ver archivos.",
      emptyFiles: "Vacío",
      loadingFiles: "Cargando archivos...",
      filesHeading: "Archivos",
      refreshFiles: "Actualizar",
      back: "Atrás",
      yesterday: "Ayer",
      edit: "Editar",
      preview: "Vista previa",
      save: "Guardar",
      cancel: "Cancelar",
      revert: "Revertir",
      editedBadge: "Editado",
      editedOnCloud: "Guardado en el servidor (sustituye el archivo de Pages).",
      viewingPages: "Desde GitHub Pages.",
      savedOk: "Guardado.",
      revertedOk: "Revertido al archivo de Pages.",
      saveFailed: "No se pudo guardar.",
      revertConfirm: "¿Descartar las ediciones guardadas y volver al archivo original de Pages?",
      tabLogin: "Acceso",
      tabChat: "Chat",
      tabFiles: "Archivos",
      newMessageTitle: "Nuevo mensaje en {room}",
      newMessagesCount: "{count} mensajes nuevos",
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
      guest: "Invité",
      noAudio: "Aucun audio sélectionné",
      connectForFiles: "Connectez-vous à une salle pour voir les fichiers.",
      emptyFiles: "Vide",
      loadingFiles: "Chargement des fichiers...",
      filesHeading: "Fichiers",
      refreshFiles: "Actualiser",
      back: "Retour",
      yesterday: "Hier",
      tabLogin: "Connexion",
      tabChat: "Chat",
      tabFiles: "Fichiers",
      newMessageTitle: "Nouveau message dans {room}",
      newMessagesCount: "{count} nouveaux messages",
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
      guest: "अतिथि",
      noAudio: "कोई ऑडियो चयनित नहीं",
      connectForFiles: "फ़ाइलें देखने के लिए एक कमरे से कनेक्ट करें।",
      emptyFiles: "खाली",
      loadingFiles: "फ़ाइलें लोड हो रही हैं...",
      filesHeading: "फ़ाइलें",
      refreshFiles: "रीफ़्रेश",
      back: "वापस",
      yesterday: "कल",
      tabLogin: "लॉगिन",
      tabChat: "चैट",
      tabFiles: "फ़ाइलें",
      newMessageTitle: "{room} में नया संदेश",
      newMessagesCount: "{count} नए संदेश",
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
      guest: "Ospite",
      noAudio: "Nessun audio selezionato",
      connectForFiles: "Connettiti a una stanza per vedere i file.",
      emptyFiles: "Vuoto",
      loadingFiles: "Caricamento file...",
      filesHeading: "File",
      refreshFiles: "Aggiorna",
      back: "Indietro",
      yesterday: "Ieri",
      tabLogin: "Accesso",
      tabChat: "Chat",
      tabFiles: "File",
      newMessageTitle: "Nuovo messaggio in {room}",
      newMessagesCount: "{count} nuovi messaggi",
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
      guest: "ゲスト",
      noAudio: "音声未選択",
      connectForFiles: "ファイルを見るにはルームに接続してください。",
      emptyFiles: "空",
      loadingFiles: "ファイルを読み込み中...",
      filesHeading: "ファイル",
      refreshFiles: "更新",
      back: "戻る",
      yesterday: "昨日",
      tabLogin: "ログイン",
      tabChat: "チャット",
      tabFiles: "ファイル",
      newMessageTitle: "{room} の新着メッセージ",
      newMessagesCount: "{count} 件の新着メッセージ",
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
      guest: "Convidado",
      noAudio: "Nenhum áudio selecionado",
      connectForFiles: "Conecte-se a uma sala para ver os arquivos.",
      emptyFiles: "Vazio",
      loadingFiles: "Carregando arquivos...",
      filesHeading: "Arquivos",
      refreshFiles: "Atualizar",
      back: "Voltar",
      yesterday: "Ontem",
      tabLogin: "Entrar",
      tabChat: "Chat",
      tabFiles: "Arquivos",
      newMessageTitle: "Nova mensagem em {room}",
      newMessagesCount: "{count} novas mensagens",
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
      guest: "访客",
      noAudio: "未选择音频",
      connectForFiles: "连接房间后可查看文件。",
      emptyFiles: "空",
      loadingFiles: "正在加载文件...",
      filesHeading: "文件",
      refreshFiles: "刷新",
      back: "返回",
      yesterday: "昨天",
      tabLogin: "登录",
      tabChat: "聊天",
      tabFiles: "文件",
      newMessageTitle: "{room} 有新消息",
      newMessagesCount: "{count} 条新消息",
      kindAudio: "音频",
      kindVideo: "视频",
      kindText: "文本"
    }
  };

  const filesBaseUrl = "https://gflhfy.github.io/collab/files";
  const layoutKey = "gflhfy-collab-chat-width";

  const els = {
    appShell: document.querySelector(".app-shell"),
    mobileTabs: document.querySelectorAll(".mobile-tab"),
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
    filesRefresh: document.querySelector("#files-refresh"),
    fileList: document.querySelector("#file-list"),
    audioPlayer: document.querySelector("#audio-player"),
    audioTitle: document.querySelector("#audio-title"),
    textViewer: document.querySelector("#text-viewer"),
    viewerBack: document.querySelector("#viewer-back"),
    viewerTitle: document.querySelector("#viewer-title"),
    viewerBody: document.querySelector("#viewer-body"),
    viewerEditor: document.querySelector("#viewer-editor"),
    viewerBadge: document.querySelector("#viewer-badge"),
    viewerEdit: document.querySelector("#viewer-edit"),
    viewerSave: document.querySelector("#viewer-save"),
    viewerCancel: document.querySelector("#viewer-cancel"),
    viewerRevert: document.querySelector("#viewer-revert")
  };

  const state = {
    connected: false,
    latestId: 0,
    timer: null,
    timestampTimer: null,
    pollInFlight: null,
    userId: getUserId(),
    messages: [],
    sessionVersion: null,
    rooms: [],
    statusKey: "notConnected",
    statusVars: {},
    roomSlug: "",
    files: [],
    fileOverrides: {},
    mobileTab: "login",
    textViewerOpen: false,
    textViewerName: "",
    textViewerText: "",
    textViewerOverride: false,
    textViewerEditing: false,
    pageTitle: document.title,
    unreadCount: 0
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

  function isMobileLayout() {
    return window.matchMedia("(max-width: 900px)").matches;
  }

  function setMobileTab(tab) {
    const next = tab === "chat" || tab === "files" ? tab : "login";
    state.mobileTab = next;
    if (els.appShell) {
      els.appShell.setAttribute("data-mobile-tab", next);
    }
    els.mobileTabs.forEach((button) => {
      button.classList.toggle("is-active", button.getAttribute("data-tab") === next);
    });
    if (next === "chat") {
      window.requestAnimationFrame(() => {
        els.messages.scrollTop = els.messages.scrollHeight;
      });
    }
    if (next === "files") {
      // Keep markdown/text viewer open across tab switches; only Back closes it.
      restoreFilesPanelView();
    }
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
      els.password.value = localStorage.getItem(passwordKey) || "";
      return saved.room || "";
    } catch {
      fillLanguageOptions("en");
      els.password.value = localStorage.getItem(passwordKey) || "";
      return "";
    }
  }

  function saveSettings() {
    localStorage.setItem(storageKey, JSON.stringify({
      language: els.language.value,
      author: els.author.value.trim(),
      room: els.room.value
    }));
    if (els.password.value) {
      localStorage.setItem(passwordKey, els.password.value);
    } else {
      localStorage.removeItem(passwordKey);
    }
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

  function startOfLocalDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  function formatClock(date) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  function formatMessageTime(value) {
    try {
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) {
        return "";
      }
      const now = new Date();
      const dayMs = 24 * 60 * 60 * 1000;
      const diffDays = Math.round(
        (startOfLocalDay(now).getTime() - startOfLocalDay(date).getTime()) / dayMs
      );
      const clock = formatClock(date);
      if (diffDays === 0) {
        return clock;
      }
      if (diffDays === 1) {
        return `${t("yesterday")} ${clock}`;
      }
      const sameYear = date.getFullYear() === now.getFullYear();
      const day = date.toLocaleDateString([], sameYear
        ? { month: "short", day: "numeric" }
        : { month: "short", day: "numeric", year: "numeric" });
      return `${day}, ${clock}`;
    } catch {
      return "";
    }
  }

  function refreshMessageTimes() {
    els.messages.querySelectorAll("[data-created-at]").forEach((node) => {
      const stamp = node.getAttribute("data-created-at");
      if (!stamp) {
        return;
      }
      node.textContent = formatMessageTime(stamp);
    });
  }

  function renderMessages() {
    els.messages.innerHTML = state.messages.map((message) => {
      const own = message.author === authorName();
      const original = message.translated
        ? `<details><summary>${escapeHtml(t("original", { language: message.sourceLanguage }))}</summary><div class="original-text">${escapeHtml(message.sourceText)}</div></details>`
        : "";
      return `
        <article class="message${own ? " own" : ""}">
          <div class="message-meta">
            <span class="message-author">${escapeHtml(message.author)}</span>
            <span data-created-at="${escapeHtml(message.createdAt)}">${escapeHtml(formatMessageTime(message.createdAt))}</span>
          </div>
          <div class="message-text">${escapeHtml(message.displayText)}</div>
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

  function kindIcon(kind) {
    if (kind === "audio") {
      return `
        <svg class="file-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M9 18V6l11-2v12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="7" cy="18" r="2.5" fill="none" stroke="currentColor" stroke-width="2"/>
          <circle cx="18" cy="16" r="2.5" fill="none" stroke="currentColor" stroke-width="2"/>
        </svg>`;
    }
    if (kind === "video") {
      return `
        <svg class="file-icon" viewBox="0 0 24 24" aria-hidden="true">
          <rect x="3" y="6" width="13" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="2"/>
          <path d="M16 10l5-3v10l-5-3z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
        </svg>`;
    }
    return `
      <svg class="file-icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
        <path d="M14 3v5h5M9 13h6M9 17h6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>`;
  }

  function showFilesBrowser() {
    state.textViewerOpen = false;
    state.textViewerEditing = false;
    if (els.viewerEditor) {
      els.viewerEditor.classList.add("hidden");
    }
    if (els.viewerBody) {
      els.viewerBody.classList.remove("hidden");
    }
    els.filesBrowser.classList.remove("hidden");
    els.textViewer.classList.add("hidden");
  }

  function showTextViewer() {
    state.textViewerOpen = true;
    els.filesBrowser.classList.add("hidden");
    els.textViewer.classList.remove("hidden");
  }

  function restoreFilesPanelView() {
    if (state.textViewerOpen) {
      showTextViewer();
    } else {
      showFilesBrowser();
    }
  }

  function renderFileList() {
    if (!state.connected) {
      els.fileList.innerHTML = `<div class="files-empty">${escapeHtml(t("connectForFiles"))}</div>`;
      return;
    }
    if (!state.files.length) {
      els.fileList.innerHTML = `<div class="files-empty">${escapeHtml(t("emptyFiles"))}</div>`;
      return;
    }

    els.fileList.innerHTML = state.files.map((file) => `
      <button type="button" class="file-item${file.override ? " has-override" : ""}" data-name="${escapeHtml(file.name)}" data-kind="${escapeHtml(file.kind)}" title="${escapeHtml(kindLabel(file.kind))}">
        <span class="file-kind" aria-label="${escapeHtml(kindLabel(file.kind))}">${kindIcon(file.kind)}</span>
        <span class="file-name">${escapeHtml(file.name)}</span>
      </button>
    `).join("");
  }

  async function loadFileOverrides() {
    state.fileOverrides = {};
    if (!state.connected || !els.room.value || !els.password.value) {
      return;
    }
    try {
      const data = await request(
        `/chat/files?room=${encodeURIComponent(els.room.value)}`,
        { method: "GET" }
      );
      const files = Array.isArray(data.files) ? data.files : [];
      for (const file of files) {
        if (file && file.name) {
          state.fileOverrides[file.name] = file;
        }
      }
    } catch {
      state.fileOverrides = {};
    }
  }

  function mergeOverrideFlags() {
    const names = new Set(Object.keys(state.fileOverrides || {}));
    state.files = state.files.map((file) => ({
      ...file,
      override: names.has(file.name)
    }));
    for (const name of names) {
      if (!state.files.some((file) => file.name === name)) {
        state.files.push({ name, kind: "text", override: true });
      }
    }
    state.files.sort((a, b) => String(a.name).localeCompare(String(b.name)));
  }

  async function loadRoomFiles() {
    state.roomSlug = currentRoomSlug();
    state.files = [];
    state.fileOverrides = {};
    if (!state.connected || !state.roomSlug) {
      renderFileList();
      return;
    }

    els.fileList.innerHTML = `<div class="files-empty">${escapeHtml(t("loadingFiles"))}</div>`;
    if (els.filesRefresh) {
      els.filesRefresh.disabled = true;
    }
    try {
      const response = await fetch(`${filesBaseUrl}/${encodeURIComponent(state.roomSlug)}/manifest.json?ts=${Date.now()}`, {
        cache: "no-store"
      });
      if (response.status === 404) {
        state.files = [];
      } else if (!response.ok) {
        throw new Error(`Files request failed (${response.status})`);
      } else {
        const data = await response.json();
        const files = Array.isArray(data.files) ? data.files : [];
        state.files = files
          .filter((file) => file && file.name && file.kind)
          .slice()
          .sort((a, b) => String(a.name).localeCompare(String(b.name)));
      }
      await loadFileOverrides();
      mergeOverrideFlags();
      renderFileList();
    } catch {
      state.files = [];
      await loadFileOverrides();
      mergeOverrideFlags();
      renderFileList();
    } finally {
      if (els.filesRefresh) {
        els.filesRefresh.disabled = false;
      }
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

  function renderViewerContent(text, name) {
    const lower = String(name || "").toLowerCase();
    if ((lower.endsWith(".md") || lower.endsWith(".markdown")) &&
        window.marked && typeof window.marked.parse === "function") {
      els.viewerBody.innerHTML = window.marked.parse(text);
    } else {
      els.viewerBody.innerHTML = `<pre>${escapeHtml(text)}</pre>`;
    }
  }

  function setViewerMode(mode) {
    const editing = mode === "edit";
    state.textViewerEditing = editing;
    els.viewerBody.classList.toggle("hidden", editing);
    els.viewerEditor.classList.toggle("hidden", !editing);
    els.viewerEdit.classList.toggle("hidden", editing);
    els.viewerSave.classList.toggle("hidden", !editing);
    els.viewerCancel.classList.toggle("hidden", !editing);
    if (els.viewerRevert) {
      els.viewerRevert.classList.toggle("hidden", editing || !state.textViewerOverride);
    }
    if (els.viewerBadge) {
      els.viewerBadge.classList.toggle("hidden", !state.textViewerOverride);
    }
  }

  async function openTextFile(name) {
    els.viewerTitle.textContent = name;
    state.textViewerName = name;
    state.textViewerText = "";
    state.textViewerOverride = false;
    state.textViewerEditing = false;
    els.viewerEditor.value = "";
    setViewerMode("view");
    els.viewerBody.innerHTML = `<p>${escapeHtml(t("loadingFiles"))}</p>`;
    showTextViewer();

    try {
      let text = "";
      let fromOverride = false;
      try {
        const data = await request(
          `/chat/files/${encodeURIComponent(name)}?room=${encodeURIComponent(els.room.value)}`,
          { method: "GET" }
        );
        if (data.exists && typeof data.text === "string") {
          text = data.text;
          fromOverride = true;
        }
      } catch {
        // Fall back to Pages if override lookup fails.
      }

      if (!fromOverride) {
        const response = await fetch(fileUrl(name), { cache: "no-store" });
        if (!response.ok) {
          throw new Error(`Could not open ${name}`);
        }
        text = await response.text();
      }

      state.textViewerText = text;
      state.textViewerOverride = fromOverride;
      els.viewerEditor.value = text;
      renderViewerContent(text, name);
      setViewerMode("view");
    } catch (error) {
      els.viewerBody.innerHTML = `<p>${escapeHtml(error.message)}</p>`;
    }
  }

  function startEditText() {
    if (!state.textViewerName) {
      return;
    }
    els.viewerEditor.value = state.textViewerText;
    setViewerMode("edit");
    els.viewerEditor.focus();
  }

  function cancelEditText() {
    els.viewerEditor.value = state.textViewerText;
    renderViewerContent(state.textViewerText, state.textViewerName);
    setViewerMode("view");
  }

  async function saveEditText() {
    if (!state.textViewerName || !state.connected) {
      return;
    }
    const text = els.viewerEditor.value;
    els.viewerSave.disabled = true;
    try {
      const data = await request(`/chat/files/${encodeURIComponent(state.textViewerName)}`, {
        method: "PUT",
        body: JSON.stringify({
          room: els.room.value,
          text,
          author: els.author.value || t("guest")
        })
      });
      state.textViewerText = typeof data.text === "string" ? data.text : text;
      state.textViewerOverride = true;
      state.fileOverrides[state.textViewerName] = {
        name: state.textViewerName,
        updatedAt: data.updatedAt || null,
        updatedBy: data.updatedBy || ""
      };
      mergeOverrideFlags();
      renderFileList();
      renderViewerContent(state.textViewerText, state.textViewerName);
      setViewerMode("view");
    } catch (error) {
      window.alert(error.message || t("saveFailed"));
    } finally {
      els.viewerSave.disabled = false;
    }
  }

  async function revertTextFile() {
    if (!state.textViewerName || !state.textViewerOverride) {
      return;
    }
    if (!window.confirm(t("revertConfirm"))) {
      return;
    }
    els.viewerRevert.disabled = true;
    try {
      await request(`/chat/files/${encodeURIComponent(state.textViewerName)}`, {
        method: "DELETE",
        body: JSON.stringify({ room: els.room.value })
      });
      delete state.fileOverrides[state.textViewerName];
      mergeOverrideFlags();
      renderFileList();
      await openTextFile(state.textViewerName);
    } catch (error) {
      window.alert(error.message || t("saveFailed"));
    } finally {
      els.viewerRevert.disabled = false;
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

  function disconnect(messageKeyOrText, vars = {}, options = {}) {
    const notifyLeave = options.notifyLeave !== false && state.connected;
    if (notifyLeave) {
      leaveRoom();
    }
    state.connected = false;
    state.sessionVersion = null;
    state.files = [];
    state.roomSlug = "";
    if (state.timer) {
      window.clearInterval(state.timer);
      state.timer = null;
    }
    if (state.timestampTimer) {
      window.clearInterval(state.timestampTimer);
      state.timestampTimer = null;
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
    if (isMobileLayout()) {
      setMobileTab("login");
    }
    if (messageKeyOrText) {
      if (UI.en[messageKeyOrText] || uiBundle()[messageKeyOrText]) {
        setStatusKey(messageKeyOrText, vars);
      } else {
        setStatusRaw(messageKeyOrText);
      }
    }
  }

  function leaveRoom() {
    if (!els.password.value || !roomName()) {
      return;
    }
    const payload = JSON.stringify({
      room: roomName(),
      userId: state.userId
    });
    try {
      fetch(`${workerUrl}/chat/leave`, {
        method: "POST",
        headers: authHeaders(),
        body: payload,
        keepalive: true
      }).catch(() => {});
    } catch {
      // Best-effort only; 5-minute prune remains the fallback.
    }
  }

  function ensureNotificationPermission() {
    if (!("Notification" in window)) {
      return;
    }
    if (Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
  }

  function clearUnreadBadge() {
    state.unreadCount = 0;
    document.title = state.pageTitle;
  }

  function notifyIncomingMessages(messages) {
    if (!Array.isArray(messages) || !messages.length) {
      return;
    }

    const others = messages.filter((message) => message.author !== authorName());
    if (!others.length) {
      return;
    }

    const away = document.hidden || !document.hasFocus();
    if (!away) {
      clearUnreadBadge();
      return;
    }

    state.unreadCount += others.length;
    document.title = `(${state.unreadCount}) ${state.pageTitle}`;

    if (!("Notification" in window) || Notification.permission !== "granted") {
      return;
    }

    const latest = others[others.length - 1];
    const body = others.length === 1
      ? `${latest.author}: ${String(latest.displayText || "").slice(0, 140)}`
      : t("newMessagesCount", { count: others.length });

    try {
      const note = new Notification(t("newMessageTitle", { room: roomName() }), {
        body,
        tag: `gflhfy-collab-${roomName()}`,
        renotify: true
      });
      note.onclick = () => {
        window.focus();
        if (isMobileLayout()) {
          setMobileTab("chat");
        }
        note.close();
      };
    } catch {
      // Ignore notification failures.
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

  function mergeMessages(incoming, options = {}) {
    if (!Array.isArray(incoming) || !incoming.length) {
      return [];
    }

    const seen = new Set(state.messages.map((message) => message.id));
    const added = [];
    for (const message of incoming) {
      if (seen.has(message.id)) {
        continue;
      }
      seen.add(message.id);
      state.messages.push(message);
      added.push(message);
      if (message.id > state.latestId) {
        state.latestId = message.id;
      }
    }

    if (added.length) {
      state.messages = state.messages.slice(-200);
      if (options.notify) {
        notifyIncomingMessages(added);
      }
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
        const added = mergeMessages(data.messages, { notify: true });
        if (added.length) {
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
    ensureNotificationPermission();
    clearUnreadBadge();
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
    if (state.timestampTimer) {
      window.clearInterval(state.timestampTimer);
    }

    try {
      await sendPresence();
      await poll();
      await loadRoomFiles();
      if (isMobileLayout()) {
        setMobileTab("chat");
      }
      state.timer = window.setInterval(() => {
        sendPresence().catch(handleRuntimeError);
        poll();
      }, pollMs);
      state.timestampTimer = window.setInterval(refreshMessageTimes, timestampRefreshMs);
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
  els.password.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      connect();
    }
  });
  els.password.addEventListener("change", saveSettings);
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
  els.filesRefresh.addEventListener("click", () => {
    if (!state.connected) {
      renderFileList();
      return;
    }
    loadRoomFiles();
  });
  els.viewerBack.addEventListener("click", () => {
    if (state.textViewerEditing) {
      cancelEditText();
    }
    showFilesBrowser();
  });
  els.viewerEdit?.addEventListener("click", startEditText);
  els.viewerSave?.addEventListener("click", () => {
    saveEditText().catch(() => {});
  });
  els.viewerCancel?.addEventListener("click", cancelEditText);
  els.viewerRevert?.addEventListener("click", () => {
    revertTextFile().catch(() => {});
  });
  els.mobileTabs.forEach((button) => {
    button.addEventListener("click", () => {
      setMobileTab(button.getAttribute("data-tab"));
    });
  });
  window.addEventListener("pagehide", () => {
    if (state.connected) {
      leaveRoom();
    }
  });
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      clearUnreadBadge();
    }
  });
  window.addEventListener("focus", clearUnreadBadge);

  setupSplitter();
  setMobileTab("login");
  const preferredRoom = loadSettings();
  applyUi();
  renderFileList();
  loadRooms(preferredRoom).catch((error) => {
    els.room.innerHTML = `<option value="">${escapeHtml(t("failedRooms"))}</option>`;
    els.room.disabled = true;
    setStatusRaw(error.message);
  });
}());
