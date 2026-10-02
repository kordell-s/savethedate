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
- `?t=SECONDS` — jump to a frame (the animation is 18.8s). Example: `?t=17.5`
  lands on the Save the Date reveal.

## Export a shareable video with Remotion

```bash
npm install
npm run video:render
```

The master export is saved to `out/wedding-save-the-date-4k.mp4`: **2160 × 3840**,
**30 fps**, **25.3 seconds**, H.264 video with its soundtrack. The browser renders
at twice the pixel density, captures lossless PNG frames, and encodes at CRF 14
to preserve fine text and texture. Remotion downloads its rendering
browser on the first run; that first run needs internet access.

The video uses the same album, photos, wording, and animation timing as the website.
It opens directly on the album, with no Open, sound, replay, or editing controls.
Music fades in over 1.2 seconds at 25% volume, holds for 5 seconds after the
18.8-second animation, then fades out over 1.5 seconds.

```bash
npm run video:studio  # preview and scrub the video in Remotion Studio
npm run video:share   # create a smaller 1080 × 1920 MP4 from the 4K master
npm run video:still -- out/final-frame.png --frame=600
npm test             # check seeking, final-frame hold, and audio timing
```

The website and export share `src/timeline.js`. Edit photos/names in `src/App.jsx`,
then rerun the export command. Generated video and preview files in `out/` are
ignored by Git.

Use the 4K master for the best quality. `video:share` creates
`out/wedding-save-the-date-hd.mp4` by downsampling the master with Lanczos and
keeping the existing audio. The source engagement photos are 1600 pixels tall;
higher-resolution originals would improve close-up photo detail further.

### Keep the video sharp when sharing

Messaging apps may recompress videos sent through their photo/video picker.
For the best quality, send the MP4 as a **document/file attachment**, or share a
download link to the original file. Increasing the export resolution alone
cannot prevent an app from compressing it again.

In WhatsApp, use the chat's attachment menu and select **Document** to attach
the saved MP4. If you prefer the normal video message, select **HD** before
sending. See [WhatsApp's media instructions](https://faq.whatsapp.com/453914586839706/)
and [HD quality settings](https://faq.whatsapp.com/759301289012856).

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
