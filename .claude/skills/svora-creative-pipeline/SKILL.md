---
name: svora-creative-pipeline
description: Make SVORA ad creatives from Instagram sources — Nano Banana stills, Seedance 2.5 image-to-video via OpenRouter, HTML-rendered overlays with brand fonts (PL/UA/RU/EN), ffmpeg finishing to 720p video (9:16 Reels first) and 1080 statics, and manifest registration. Use for any "make creatives", "animate this post", "add overlays", "re-cut", "localise this video" task.
---

# Creative pipeline

Model and schema: `.claude/other/creatives.md`. Research behind the choices: `research/creative-playbook.md`.
Names: `.claude/rules/naming-conventions.md` §3. Everything below runs with the scripts; never call the
APIs by hand.

## Recipe — one source photo → 8 creatives

```bash
# 1. still (optional): clean/extend the photo; nails untouched
node scripts/gen-image.mjs --ref sources/instagram/raw/<code>/<code>_01.jpg --aspect 9:16 --resolution 1K \
  --prompt "Extend this photo to a vertical 9:16 frame. Keep the hand and every nail exactly as in the reference; \
  soften the background into warm cream (#F7F1EB) studio light; no text, no logo, no extra objects." \
  --out creatives/_work/<code>-still.png

# 2. clip: 8 s, 720×1280, first frame = the still (≈ $1.8)
node scripts/gen-video.mjs --first creatives/_work/<code>-still.png --duration 8 --size 720x1280 \
  --prompt "Slow push-in on the hand; the fingers turn gently so the light slides across the glossy nails; \
  the nail design stays exactly as in the image; soft studio light, shallow depth of field; no text." \
  --out creatives/_work/<code>-clip.mp4

# 3. overlay per language/hook (text from copy/<concept>/<lang>.yaml → overlays/ctas)
node scripts/render-overlay.mjs --template overlay-hook-cta --format 9x16 --transparent --var lang=ua \
  --var hook="Нарешті знайшла <b>свій</b> салон" --var sub="Nude & Crazy · Wola" --var cta="Записатися онлайн" \
  --var price="від 190 zł" --out creatives/_work/<code>-ua-found.png

# 4. finish (720×1280 as generated — no upscale; overlay scaled onto it from 0.6 s; keep generated audio)
node scripts/video-finish.mjs --in creatives/_work/<code>-clip.mp4 --overlay creatives/_work/<code>-ua-found.png \
  --overlay-from 0.6 --out creatives/_work/<code>-ua-found.mp4

# 5. look at it, then register (moves + renames the file under the naming law)
node scripts/video-finish.mjs --still --in creatives/_work/<code>-ua-found.mp4 --out creatives/_work/check.jpg --at 3
node scripts/creatives.mjs add 2026-10-b01-crazy --file creatives/_work/<code>-ua-found.mp4 \
  --concept crazy --hook found --source <code> --lang ua --hook-text "Нарешті знайшла свій салон" \
  --pipeline creatives/_work/<code>-clip.mp4.json --pipeline creatives/_work/<code>-ua-found.mp4.json
```

Statics: `render-overlay.mjs --template static-hero --image <photo> --format 4x5 …` → `creatives.mjs add … --type st`.
Reels from Instagram (already video): skip 1–2; `video-finish.mjs --in <code>_01.mp4 --trim 0:8 …`.

## Rules that save money and rejections

- One generation per source; languages and hooks are overlays. 60 clips ≈ $110 at 720p; test prompts at 480p.
- Seedance: 4–30 s, 480p/720p, **no 4:5 and no 1080p**; we deliver video at 720p (Meta accepts it; Reels are 9:16 vertical), finish only crops. `frame_images` beats
  `input_references` (the latter is ignored when a first frame is given). Prompt = camera + hand motion +
  "design stays identical"; never ask for text, logos or a second hand.
- Nano Banana: `gemini-3.1-flash-image` for edits, `gemini-3-pro-image` for composites; never for text/logos.
- Overlays: Roboto Condensed for everything (Cyrillic + Polish); Antonio only for Latin display; text in the
  middle 50% of a 9:16 frame (top 14% / bottom 35% are Meta UI); ≤ 6 words on screen; orange pill CTA.
- Facts in overlays come from `settings/brand.yaml`; offers only when the owner confirmed them on Fresha.
- Fingers, nails, diacritics: look before you register. Rejected drafts stay in `_work/` (gitignored).
- Record cost: every script writes a sidecar with `usage.cost`; `creatives.mjs add --pipeline` sums them.

## Batch planning (from research §6)

Per launch wave: 2–3 concepts × 2–3 hooks × the languages of the ad sets you will launch, 6–8 ads per ad
set. A first wave for `uaru` + `pl` prospecting needs ~12–16 approved creatives, not 300. Build the few
hundred over weeks, promoting hooks that win (`/report`).
