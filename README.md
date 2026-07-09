# GFL HFY Ebook Site

Static browser reader for published GFL HFY manuscripts.

The public ebook package lives under each locale production folder:

```text
books/<book-folder>/<locale>/ebook/
books-published/<book-folder>/<locale>/ebook/
```

Example: `books-published/life-unloop/en/ebook/`.

The book folder name is the route slug; the locale folder is the language.
Do not put a slug in the book-owned `ebook/manifest.json`; the sync script
derives slug and locale from the path and writes them into the site catalog.

## Book Package

Minimum package:

```text
books-published/example-book/en/ebook/
  manifest.json
  book.epub
  cover.png
```

`book.epub` is built from `<locale>/Chapters/*.md` when you run **Publish ebook**
on the dashboard (or `ebooks/scripts/Publish-Ebook.ps1 -Locale en`). Narration
tags (`[[say:…]]`, `[[pause:…]]`, etc.) and HTML comments are stripped; chapter
headings become the EPUB table of contents. Cover may also fall back to
book-root `assets/cover.png`.

Example `manifest.json`:

```json
{
  "title": "The Lights Over Trapalanda",
  "subtitle": "A GFL HFY read-aloud story",
  "author": "GFL HFY",
  "description": "A UAP investigator follows a missing hiker case into the Patagonia legend of Trapalanda.",
  "cover": "cover.png",
  "epub": "book.epub",
  "youtubeUrl": "https://www.youtube.com/watch?v=…",
  "locale": "en"
}
```

`youtubeUrl` is filled from `youtube-upload.config.json` → `last_upload.url` when you **Publish ebook** (after a YouTube API upload, or if `last_upload` was set manually for recovery).

## Sync

From the repository root:

```powershell
powershell -ExecutionPolicy Bypass -File ebooks/scripts/Sync-Ebooks.ps1
```

This scans:

- `books/*/<locale>/ebook/manifest.json`
- `books-published/*/<locale>/ebook/manifest.json`

It copies each ebook package into `ebooks/public/books/<slug>/<locale>/` and writes
`ebooks/public/catalog.json` (each entry includes `slug` and `locale`).

Use `-Clean` to remove old copied book packages before syncing:

```powershell
powershell -ExecutionPolicy Bypass -File ebooks/scripts/Sync-Ebooks.ps1 -Clean
```

## Local Preview

Serve the `ebooks/` folder with any static server. For example:

```powershell
python -m http.server 8080 -d ebooks
```

Then open:

```text
http://localhost:8080/
```

Reader routes look like `#book=life-unloop&locale=en`.

The reader uses epub.js from a CDN. No build step is required.

## GitHub Pages

Live site: [https://gflhfy.github.io/](https://gflhfy.github.io/) from [gflhfy/gflhfy.github.io](https://github.com/gflhfy/gflhfy.github.io).

**Publish ebook** on the dashboard also deploys the static site when GitHub is reachable. If you are offline, local publish still completes and GitHub upload is skipped.

Manual deploy from the repository root:

```powershell
powershell -ExecutionPolicy Bypass -File ebooks/scripts/Deploy-GitHubPages.ps1 -Json
```
