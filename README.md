# Alejandro — About Me

A light, personal web presentation in English. Ten chapters, with the personal interests first and the academic/work material grouped near the end. Notes contain roughly 1,000 words: allow 8–10 minutes with pauses.

## Edit

- **All wording, order, images, notes and artist names:** `dist/assets/scripts/content.js`
- **Layout, palette, image framing and motion:** `dist/assets/styles/presentation.css`
- **Scene templates, keyboard navigation, piano and chess interactions:** `dist/assets/scripts/app.js`
- **Page shell and controls:** `dist/index.html`
- **Original images:** `dist/assets/images/`

Slides are objects in `presentationContent.slides`. Each `kind` chooses a scene template. Move an object to reorder scenes. The overview, counter and notes follow automatically. Image crops are intentionally avoided for the laptop and portfolio screenshots.

## Present

Open `dist/index.html` directly in a modern browser, or use the deployed URL. Fonts, scripts and images are local; no CDN or build process is needed.

## Deploy elsewhere

The downloadable ZIP is already arranged as a static site: `index.html` is at its root and every dependency is inside `assets/`. Upload or extract the complete ZIP contents into the public/root directory of Netlify, Vercel, GitHub Pages, Cloudflare Pages or any ordinary web server. No install command, build command, environment variable or backend is required.

- Arrow keys, Page Up / Page Down and Space: navigate
- F: fullscreen (or use the browser fullscreen command)
- O: overview
- N: speaker notes. These appear on the SAME screen; close before screen sharing.
- Escape: close a dialog
- Home / End: first / last chapter
- Mobile: swipe horizontally or use arrow buttons

Artist selection changes the visual emphasis; it does not play copyrighted music. Piano keys produce short synthesized notes only after a click. Alejandro’s supplied July 3, 2026 rapid game against ovikc starts automatically whenever the chess chapter opens; its controls can pause, resume, reset or replay it. Each chapter replays its own topic-specific entrance animation whenever it is revisited. Reduced-motion preferences are supported. Browser printing uses a static slide layout.

## Content basis

Personal photos, portfolio, music preferences, the chess game and the approximate PLM scope come from the conversation. The Bostik mark is the official logo downloaded from Bostik’s website. No sales results, proficiency certifications or SAP experience are claimed. Speaker notes are an editable rehearsal draft, not a verbatim autobiographical account.
