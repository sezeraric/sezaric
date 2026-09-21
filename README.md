# sezaric.com

Personal site for Furkan Sezer Ariç. Next.js (App Router) + React Three Fiber,
statically prerendered.

## Run

```bash
npm run dev            # http://localhost:3000
npm run build
npm run lint
npm run check:curves   # asserts the scroll choreography invariants
```

## Editing the site

**All copy lives in `src/lib/content.ts`.** No component hardcodes a string, so
changing text never means touching layout code.

## How the bullet-time section works

The tall `#bullet-time` section is a scroll budget; the sticky child inside it
is what you see. One progress value drives three layers at once:

1. **A scrubbed video** (`public/bullet-time.mp4`). It never plays — scroll
   position maps onto `currentTime`, so scrolling back rewinds. Generated with
   Higgsfield from a reference image.
2. **The digital rain**, a WebGL shader that keeps running over the clip and
   slows down while the shot holds.
3. **The copy and the problem log**, the engineering failures on the right.

`src/lib/curves.ts` holds that timing as pure functions — no three.js, no DOM —
so it can be checked on its own with `npm run check:curves`.

### Replacing the clip

Any short clip works. It has to be re-encoded so every frame is a keyframe,
otherwise seeking snaps to the nearest keyframe and the picture jumps:

```bash
scripts/encode-scrub.sh new-clip.mp4 public/bullet-time.mp4 1280
scripts/encode-scrub.sh new-clip.mp4 public/bullet-time-mobile.mp4 854
```

Keep it around five seconds. All-keyframe encoding multiplies the file size, and
the whole clip has to buffer before scrubbing is smooth. The current pair is
1.9 MB and 861 KB.

### The portrait

`public/me.png` is a cut-out made from a studio photo:

```bash
python3 scripts/cutout.py photo.jpg public/me.png
```

A plain brightness key does not work on that kind of shot — dark hair and a dark
backdrop sit at the same luminance. The script separates them on warmth and
texture instead; the reasoning is in its docstring.

## Architecture notes

- `src/lib/scroll.ts` — module-level scroll state. Lenis writes to it on every
  scroll event; the scene and the scrubber sample it inside their frame loops.
  Nothing here touches React state, so scrolling costs zero re-renders.
- `src/components/BackdropLayer.tsx` — the video and the WebGL canvas in one
  fixed layer, ordered by DOM order rather than z-index.
- `src/components/scene/` — the WebGL layer. Imperative by design; ESLint's
  immutability rules are scoped off for this directory only, and
  `eslint.config.mjs` explains why.

Everything readable is in the DOM above the backdrop, which is `aria-hidden` and
`pointer-events-none`. The page reads correctly with no video and no WebGL.

## Degradation

- **No JavaScript, or no IntersectionObserver** — the scroll-reveal styles are
  scoped to `html.js`, a class an inline script sets only when the observer
  exists. Content is never hidden by an animation that cannot run.
- **Reduced motion** — Lenis is skipped, transitions collapse, the typing and
  scramble effects render their final state, and the clip holds a single frame
  instead of scrubbing.
- **Low-end devices** — `src/lib/perf.ts` picks a tier from pointer type,
  viewport and core count, and scales DPR, rain density and postprocessing.
  Phones get the smaller video.

## Still to do

- `site.linkedin` is percent-encoded to survive the Turkish character in the
  handle — worth clicking once to confirm it resolves.
- The phone number from the CV is deliberately not on the site.
