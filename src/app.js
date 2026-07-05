const CATALOG_URL = "public/catalog.json";
const BOOKS_BASE = "public/books";
const READER_SETTINGS_KEY = "gflhfy:reader-settings";

const FONT_SIZES = [90, 100, 110, 125, 140];

const DEFAULT_READER_SETTINGS = {
  fontSize: 100,
  theme: "dark"
};

const EPUB_THEME_RULES = {
  light: {
    body: {
      color: "#211f1c",
      background: "#ffffff",
      "font-family": "Georgia, serif",
      "line-height": "1.55"
    },
    p: {
      "text-indent": "0 !important",
      margin: "0 0 0.85em !important"
    }
  },
  dark: {
    body: {
      color: "#ece7de",
      background: "#1a1c1e",
      "font-family": "Georgia, serif",
      "line-height": "1.55"
    },
    p: {
      "text-indent": "0 !important",
      margin: "0 0 0.85em !important"
    }
  }
};

let activeBook = null;
let activeRendition = null;
let activeSlug = "";
let activeToc = [];
let lastLocation = null;
let readerSettings = loadReaderSettings();
let settingsOpen = false;
let settingsOutsideIgnoreUntil = 0;
let settingsIgnoreClickUntil = 0;

function toggleSettingsPanel() {
  setSettingsPanelOpen(!settingsOpen);
}

const topbarEl = document.querySelector(".topbar");

const els = {
  libraryView: document.getElementById("libraryView"),
  readerView: document.getElementById("readerView"),
  bookGrid: document.getElementById("bookGrid"),
  settingsButton: document.getElementById("settingsButton"),
  settingsPanel: document.getElementById("settingsPanel"),
  settingsBackdrop: document.getElementById("settingsBackdrop"),
  fontSmallerButton: document.getElementById("fontSmallerButton"),
  fontLargerButton: document.getElementById("fontLargerButton"),
  fontSizeLabel: document.getElementById("fontSizeLabel"),
  settingsProgress: document.getElementById("settingsProgress"),
  themeButtons: Array.from(document.querySelectorAll("[data-theme]")),
  libraryButton: document.getElementById("libraryButton"),
  prevButton: document.getElementById("prevButton"),
  nextButton: document.getElementById("nextButton"),
  bookCover: document.getElementById("bookCover"),
  bookTitle: document.getElementById("bookTitle"),
  bookSubtitle: document.getElementById("bookSubtitle"),
  bookDescription: document.getElementById("bookDescription"),
  youtubeLink: document.getElementById("youtubeLink"),
  toc: document.getElementById("toc"),
  viewer: document.getElementById("viewer"),
  readerStatus: document.getElementById("readerStatus")
};

function loadReaderSettings() {
  try {
    const raw = localStorage.getItem(READER_SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_READER_SETTINGS };
    const parsed = JSON.parse(raw);
    const theme = parsed.theme === "sepia" || !EPUB_THEME_RULES[parsed.theme]
      ? DEFAULT_READER_SETTINGS.theme
      : parsed.theme;
    return {
      fontSize: FONT_SIZES.includes(parsed.fontSize) ? parsed.fontSize : DEFAULT_READER_SETTINGS.fontSize,
      theme
    };
  } catch {
    return { ...DEFAULT_READER_SETTINGS };
  }
}

function saveReaderSettings() {
  localStorage.setItem(READER_SETTINGS_KEY, JSON.stringify(readerSettings));
}

function applyShellTheme(theme) {
  document.documentElement.dataset.readerTheme = theme;
  els.viewer.style.background = EPUB_THEME_RULES[theme].body.background;
}

function syncSettingsPanelUi() {
  els.fontSizeLabel.textContent = `${readerSettings.fontSize}%`;
  const fontIndex = FONT_SIZES.indexOf(readerSettings.fontSize);
  els.fontSmallerButton.disabled = fontIndex <= 0;
  els.fontLargerButton.disabled = fontIndex >= FONT_SIZES.length - 1;

  for (const button of els.themeButtons) {
    button.classList.toggle("is-active", button.dataset.theme === readerSettings.theme);
  }
}

function isMobileSettingsLayout() {
  return window.matchMedia("(max-width: 760px)").matches;
}

function syncReaderChromeLayout() {
  if (!topbarEl) return;
  const height = Math.round(topbarEl.getBoundingClientRect().height);
  document.documentElement.style.setProperty("--topbar-height", `${height}px`);
  if (activeRendition) activeRendition.resize();
}

function syncSettingsPanelPosition() {
  if (!settingsOpen || !isMobileSettingsLayout()) {
    document.documentElement.style.removeProperty("--settings-panel-top");
    return;
  }
  const rect = els.settingsButton.getBoundingClientRect();
  const top = Math.max(12, Math.round(rect.bottom + 8));
  document.documentElement.style.setProperty("--settings-panel-top", `${top}px`);
}

function setSettingsPanelOpen(open) {
  settingsOpen = open;
  els.settingsPanel.hidden = !open;
  const showBackdrop = open && isMobileSettingsLayout();
  if (els.settingsBackdrop) {
    els.settingsBackdrop.hidden = !showBackdrop;
    els.settingsBackdrop.setAttribute("aria-hidden", showBackdrop ? "false" : "true");
  }
  els.settingsButton.setAttribute("aria-expanded", open ? "true" : "false");
  if (topbarEl) topbarEl.classList.toggle("settings-open", open);
  if (open) {
    settingsOutsideIgnoreUntil = Date.now() + 350;
    syncSettingsPanelPosition();
  } else {
    document.documentElement.style.removeProperty("--settings-panel-top");
  }
}

function registerEpubThemes(rendition) {
  for (const [name, rules] of Object.entries(EPUB_THEME_RULES)) {
    rendition.themes.register(name, rules);
  }
}

function applyReaderSettingsToRendition(rendition = activeRendition) {
  if (!rendition) return;
  rendition.themes.select(readerSettings.theme);
  rendition.themes.fontSize(`${readerSettings.fontSize}%`);
}

function updateReaderSettings(patch) {
  readerSettings = { ...readerSettings, ...patch };
  saveReaderSettings();
  applyShellTheme(readerSettings.theme);
  syncSettingsPanelUi();
  applyReaderSettingsToRendition();
}

function stepFontSize(delta) {
  const index = FONT_SIZES.indexOf(readerSettings.fontSize);
  const next = Math.min(FONT_SIZES.length - 1, Math.max(0, index + delta));
  if (next === index) return;
  updateReaderSettings({ fontSize: FONT_SIZES[next] });
}

function chapterLabelForLocation(location) {
  if (!location || !location.start || !activeToc.length) return "";
  const href = String(location.start.href || "");
  if (!href) return "";

  let match = null;
  for (const item of activeToc) {
    if (href.includes(item.href) || item.href.includes(href)) {
      match = item;
    }
  }
  return match ? (match.label || "") : "";
}

function updateProgressLabel(location) {
  if (!activeSlug) {
    els.settingsProgress.textContent = "Open a book to see progress.";
    return;
  }
  if (!location || !location.start) {
    els.settingsProgress.textContent = "Reading…";
    return;
  }

  const pct = Math.max(0, Math.min(100, Math.round((location.start.percentage || 0) * 100)));
  const chapter = chapterLabelForLocation(location);
  els.settingsProgress.textContent = chapter ? `${pct}% · ${chapter}` : `${pct}% through book`;
}

function bookUrl(slug, file) {
  return `${BOOKS_BASE}/${encodeURIComponent(slug)}/${file}`;
}

function setStatus(message) {
  els.readerStatus.textContent = message || "";
  els.readerStatus.hidden = !message;
}

async function loadJson(url) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Could not load ${url}`);
  }
  return response.json();
}

async function showLibrary() {
  destroyReader();
  activeSlug = "";
  activeToc = [];
  lastLocation = null;
  els.readerView.hidden = true;
  els.libraryView.hidden = false;
  window.location.hash = "";
  updateProgressLabel(null);

  try {
    const catalog = await loadJson(CATALOG_URL);
    const books = Array.isArray(catalog.books) ? catalog.books : [];
    renderLibrary(books);
  } catch (error) {
    els.bookGrid.innerHTML = `<p class="empty">No catalog found. Run ebooks/scripts/Sync-Ebooks.ps1 first.</p>`;
  }
}

function renderLibrary(books) {
  if (!books.length) {
    els.bookGrid.innerHTML = `<p class="empty">No ebook packages have been synced yet.</p>`;
    return;
  }

  els.bookGrid.innerHTML = "";
  for (const book of books) {
    const card = document.createElement("a");
    card.className = "book-card";
    card.href = `#book=${encodeURIComponent(book.slug)}`;

    const img = document.createElement("img");
    img.src = book.cover || "";
    img.alt = "";
    img.loading = "lazy";

    const title = document.createElement("h2");
    title.textContent = book.title || book.slug;

    const subtitle = document.createElement("p");
    subtitle.textContent = book.subtitle || book.author || "";

    card.append(img, title, subtitle);
    els.bookGrid.append(card);
  }
}

async function showBook(slug) {
  activeSlug = slug;
  els.libraryView.hidden = true;
  els.readerView.hidden = false;
  setStatus("Loading...");

  try {
    const manifest = await loadJson(bookUrl(slug, "manifest.json"));
    renderBookMetadata(slug, manifest);
    await renderEpub(slug, manifest);
  } catch (error) {
    setStatus(error.message);
  }
}

function renderBookMetadata(slug, manifest) {
  els.bookTitle.textContent = manifest.title || slug;
  els.bookSubtitle.textContent = manifest.subtitle || manifest.author || "";
  els.bookDescription.textContent = manifest.description || "";

  if (manifest.cover) {
    els.bookCover.src = bookUrl(slug, manifest.cover);
    els.bookCover.hidden = false;
  } else {
    els.bookCover.hidden = true;
  }

  if (manifest.youtubeUrl) {
    els.youtubeLink.href = manifest.youtubeUrl;
    els.youtubeLink.hidden = false;
  } else {
    els.youtubeLink.hidden = true;
  }
}

async function renderEpub(slug, manifest) {
  destroyReader();

  const epubPath = manifest.epub || "book.epub";
  activeBook = ePub(bookUrl(slug, epubPath));
  activeRendition = activeBook.renderTo("viewer", {
    width: "100%",
    height: "100%",
    flow: "paginated",
    spread: "auto"
  });

  registerEpubThemes(activeRendition);
  applyShellTheme(readerSettings.theme);

  activeRendition.hooks.content.register(contents => {
    const doc = contents.document;
    const style = doc.createElement("style");
    style.textContent = "p { text-indent: 0 !important; margin: 0 0 0.85em !important; }";
    doc.head.appendChild(style);
  });

  applyReaderSettingsToRendition(activeRendition);

  const savedLocation = localStorage.getItem(`gflhfy:${slug}:location`);
  await activeRendition.display(savedLocation || undefined);
  setStatus("");

  activeRendition.on("relocated", location => {
    lastLocation = location;
    if (location && location.start && location.start.cfi) {
      localStorage.setItem(`gflhfy:${slug}:location`, location.start.cfi);
    }
    updateProgressLabel(location);
  });

  const navigation = await activeBook.loaded.navigation;
  activeToc = navigation.toc || [];
  renderToc(activeToc);
  updateProgressLabel(lastLocation);
  syncReaderChromeLayout();
}

function renderToc(items) {
  els.toc.innerHTML = "";

  for (const item of items) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = item.label || "Chapter";
    button.addEventListener("click", () => {
      if (activeRendition) activeRendition.display(item.href);
    });
    els.toc.append(button);
  }
}

function destroyReader() {
  if (activeRendition) {
    activeRendition.destroy();
    activeRendition = null;
  }
  if (activeBook) {
    activeBook.destroy();
    activeBook = null;
  }
  els.toc.innerHTML = "";
  els.viewer.innerHTML = "";
  setStatus("");
}

function route() {
  const match = window.location.hash.match(/^#book=([^&]+)$/);
  if (match) {
    showBook(decodeURIComponent(match[1]));
  } else {
    showLibrary();
  }
}

function isEditableTarget(target) {
  if (!(target instanceof Element)) return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable;
}

els.settingsButton.addEventListener("touchend", event => {
  event.preventDefault();
  event.stopPropagation();
  settingsIgnoreClickUntil = Date.now() + 500;
  toggleSettingsPanel();
}, { passive: false });

els.settingsButton.addEventListener("click", event => {
  event.stopPropagation();
  if (Date.now() < settingsIgnoreClickUntil) return;
  toggleSettingsPanel();
});

if (els.settingsBackdrop) {
  const closeSettingsFromBackdrop = event => {
    event.preventDefault();
    event.stopPropagation();
    setSettingsPanelOpen(false);
  };
  els.settingsBackdrop.addEventListener("touchend", closeSettingsFromBackdrop, { passive: false });
  els.settingsBackdrop.addEventListener("click", closeSettingsFromBackdrop);
}

els.fontSmallerButton.addEventListener("click", () => stepFontSize(-1));
els.fontLargerButton.addEventListener("click", () => stepFontSize(1));

for (const button of els.themeButtons) {
  button.addEventListener("click", () => {
    updateReaderSettings({ theme: button.dataset.theme });
  });
}

document.addEventListener("click", event => {
  if (!settingsOpen || isMobileSettingsLayout()) return;
  if (Date.now() < settingsOutsideIgnoreUntil) return;
  if (event.target instanceof Node && els.settingsPanel.contains(event.target)) return;
  if (event.target instanceof Node && els.settingsButton.contains(event.target)) return;
  setSettingsPanelOpen(false);
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && settingsOpen) {
    setSettingsPanelOpen(false);
    return;
  }

  if (isEditableTarget(event.target)) return;

  if (event.key === "ArrowLeft") {
    if (activeRendition) activeRendition.prev();
    return;
  }
  if (event.key === "ArrowRight") {
    if (activeRendition) activeRendition.next();
    return;
  }
  if (event.key === "+" || event.key === "=") {
    event.preventDefault();
    stepFontSize(1);
    return;
  }
  if (event.key === "-" || event.key === "_") {
    event.preventDefault();
    stepFontSize(-1);
  }
});

els.libraryButton.addEventListener("click", showLibrary);
els.prevButton.addEventListener("click", () => activeRendition && activeRendition.prev());
els.nextButton.addEventListener("click", () => activeRendition && activeRendition.next());
window.addEventListener("hashchange", route);
window.addEventListener("resize", () => {
  syncReaderChromeLayout();
  syncSettingsPanelPosition();
});

applyShellTheme(readerSettings.theme);
syncSettingsPanelUi();
syncReaderChromeLayout();
route();
