# Our Forever — Save the Date

A single-page cinematic save-the-date. A luxury wedding album opens, flips
through your engagement photos, and reveals **SAVE THE DATE · 27.07.27 ·
ANGUILLA**, over real red & pink rose photography, with a soft ambient piano
track. Vertical 9:16, built for phones.

## Run locally

```bash
npm install
npm run dev            # http://localhost:5173
```

## Personalize

1. **Photos** — drop files into `public/photos/` (portrait crops look best).
2. **Names + photos** — edit the `COUPLE` config at the top of `src/App.jsx`:
   ```js
   const COUPLE = {
     n1: "Gabriela",
     n2: "Kordell",
     p1: "/photos/engagement-1.jpg",
     p2: "/photos/engagement-2.jpg",
   };
   ```
   Leave a value `""` to show an elegant placeholder.
3. The date, place, and cover text ("OUR FOREVER") live in the JSX if you ever
   need to change them.

## Preview / dev tools

- `?edit` — shows a live asset panel (paste image URLs, type names) and the
  timeline scrubber. Example: `http://localhost:5173/?edit`
- `?t=SECONDS` — jump to a frame (the film is ~18.8s). Example: `?t=17.5`
  lands on the Save the Date reveal.

## Build & deploy

```bash
npm run build          # outputs to dist/
```

Deploy `dist/` to any static host (Vercel recommended — it's a plain Vite SPA,
zero config).

## Assets

Fonts are self-hosted (Cormorant Garamond + Jost). Rose photos and the music
are free-to-use (CC0); see `CREDITS.md`. The rose cut-outs live in
`public/roses/`; the track in `public/audio/`.
