const CATALOG_URL = "public/catalog.json";
const BOOKS_BASE = "public/books";

let activeBook = null;
let activeRendition = null;
let activeSlug = "";

const els = {
  libraryView: document.getElementById("libraryView"),
  readerView: document.getElementById("readerView"),
  bookGrid: document.getElementById("bookGrid"),
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
  els.readerView.hidden = true;
  els.libraryView.hidden = false;
  window.location.hash = "";

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

  activeRendition.themes.default({
    body: {
      "font-family": "Georgia, serif",
      "line-height": "1.55"
    },
    p: {
      "text-indent": "0 !important",
      "margin": "0 0 0.85em !important"
    }
  });

  activeRendition.hooks.content.register(contents => {
    const doc = contents.document;
    const style = doc.createElement("style");
    style.textContent = "p { text-indent: 0 !important; margin: 0 0 0.85em !important; }";
    doc.head.appendChild(style);
  });

  const savedLocation = localStorage.getItem(`gflhfy:${slug}:location`);
  await activeRendition.display(savedLocation || undefined);
  setStatus("");

  activeRendition.on("relocated", location => {
    if (location && location.start && location.start.cfi) {
      localStorage.setItem(`gflhfy:${slug}:location`, location.start.cfi);
    }
  });

  const navigation = await activeBook.loaded.navigation;
  renderToc(navigation.toc || []);
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

els.libraryButton.addEventListener("click", showLibrary);
els.prevButton.addEventListener("click", () => activeRendition && activeRendition.prev());
els.nextButton.addEventListener("click", () => activeRendition && activeRendition.next());
window.addEventListener("hashchange", route);
window.addEventListener("resize", () => activeRendition && activeRendition.resize());

route();

