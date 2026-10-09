# Creatives — sources, pipeline, manifest

## Sources

| folder | what | tracked |
| --- | --- | --- |
| `sources/instagram/index.json` | every known post: code, date, caption, counts, media list, `fetched` | git |
| `sources/instagram/raw/<code>/` | full-res originals + `post.json` | **gitignored** (re-downloadable) |
| `sources/instagram/selected/` | the shortlist copied out of raw for production (hand- or agent-picked) | git-lfs |
| `sources/legacy/` | from `../svora-landing/contents/resources/Creatives`: 4 AI ads (beauty, black-hand, kiss-me, rich — 720×1280, 15–24 s, with audio), 5 reels, 41 work photos, 11 model photos | git-lfs |
| `brand/` | logos, fonts, palette | git-lfs |

Rights: everything under `sources/` is SVORA's own content or produced for SVORA. Photos from
other accounts (`karriinails_*` in legacy) are **not** to be used in ads.

## Pipeline — from a post to a creative

```
source photo/reel ──(gen-image: clean bg / extend to 9:16)──► still ──(gen-video: Seedance first frame)──► clip
                                                                 │
   copy/<concept>/<lang>.yaml → overlays/ctas ──(render-overlay)─┴─► overlay.png ──(video-finish)──► creatives/<batch>/<name>.mp4
                                                                                     │
                                                 photo + overlay ──(render-overlay static-hero)──► creatives/<batch>/<name>.png
```

1. **Pick** sources: `node scripts/ig-fetch.mjs profile|posts`, then choose by concept (classic / art /
   crazy / pedi / brows / brand) **and by angle** (`settings/concepts.yaml → angles`; an ad set needs ≥ 6
   distinct angles — `research/andromeda-creative-diversity.md`). Note the shortcode — it becomes the creative's `source`.
   Then **look**: `describe-image.mjs <photo|clip>` writes `<file>.look.json` — what is in the picture, where the
   nails are, `place` (top/middle/bottom) and `tone` (dark/light) for the overlay, baked-in text, risks. Never
   place text without it; never trust it without looking at the render.
2. **Still**: `gen-image.mjs --ref <photo> --prompt "…" --aspect 9:16` when the photo needs a cleaner
   background, more canvas or re-lighting. Keep the nails untouched: say so in the prompt.
3. **Clip**: `gen-video.mjs --first <still> --prompt "<camera + hand motion only>" --duration 6–10 --size 720x1280`.
   Prompt rules: `research/creative-playbook.md` §2 — one subject, slow camera, "the nail design stays
   exactly as in the image", no text, no extra hands. Check fingers before accepting.
4. **Overlay**: `render-overlay.mjs --template overlay-hook-cta --transparent --var place=<from look> --var tone=<from look>
   --var hook=… --var sub=… --var cta=… --var meta=… --var lang=…` with text from `copy/<concept>/<lang>.yaml → overlays/ctas`.
   The type system is `creatives/templates/_type.css` (shared by all templates): hook lines as Instagram-style
   stickers (dark box, cream text, one orange `<b>` accent; `tone=light` flips to cream box), a peach `sub`
   sticker, an orange pill CTA with an arrow, a small `meta` sticker (site · district · price). Sizes are set
   per format so a 9:16 hook line is ≈ 11% of the width after the 720p downscale. Fonts: Roboto Condensed for
   every language (Cyrillic + Polish), Antonio only for Latin display lines. Safe zone: nothing in the
   top 14% / bottom 35% of a 9:16 frame — `place` positions the group inside it.
5. **Finish**: `video-finish.mjs --in clip.mp4 --overlay overlay.png --overlay-from 0.6 [--music brand/music/x.mp3] [--pad blur] --out creatives/<batch>/<name>.mp4`
   (720×1280, H.264, AAC, faststart; the 1080 overlay is scaled down onto it; audio loudness-normalised to −14 LUFS;
   `--music` lays a bed under the clip audio — Seedance's own track is quiet and sometimes dropped, see `brand/music/README.md`;
   `--pad blur` fits a non-9:16 source whole over a blurred copy, MAAG tuning). Statics: `render-overlay.mjs --template
   static-hero --image <photo> --var place=…` (cover crop) or `static-blur-pad` (square/landscape photo shown whole over its blur).
6. **Register**: `creatives.mjs add <batch> --file … --concept … --hook … --angle … --source … --lang … --look x.look.json`
   moves the file under its law-abiding name and records the pipeline sidecars (model, prompt, seed, cost), the
   angle and the look summary. `validate` refuses an entry without a known angle.
7. **Review**: the creative-director agent (or the operator) sets `status=approved|rejected`. Only
   approved creatives can be launched.

Re-cuts of the owner's own reels skip steps 2–3 entirely: `transcribe.mjs` (timed transcript) → `subs.mjs` (captions for
the chosen cut) → `video-finish.mjs --cuts a:b,c:d --subs x.ass --overlay …`. This is how the founder, studio, process and
meme angles are made; it costs nothing but the transcript (≈ $0.005/min).

Every variant is cheap after step 3: one clip × 4 languages × 2 hooks = 8 creatives for one video job.

## Manifest schema — `creatives/<batch>/manifest.json`

```json
{
  "batch": "2026-10-b01-crazy",
  "created": "2026-10-12T10:00:00Z",
  "creatives": [
    {
      "name": "crazy_reveal_DaxwkGBtqcU_vd_n001_v1_9x16_ua",
      "file": "crazy_reveal_DaxwkGBtqcU_vd_n001_v1_9x16_ua.mp4",
      "type": "vd", "format": "9x16", "lang": "ua", "concept": "crazy", "hook": "reveal",
      "hook_text": "Такого ще не було у Варшаві",
      "angle": "hero",
      "look": {"place": "top", "tone": "dark", "avoid": "the nails and rings", "baked_text": false, "risks": "none"},
      "source": "DaxwkGBtqcU", "v": 1,
      "status": "approved",
      "copy": {"headline": "h02", "primary": "p05", "description": "d01"},
      "pipeline": [
        {"step": "animate", "model": "bytedance/seedance-2.5", "prompt": "…", "seed": 1842, "job_id": "…", "cost_usd": 1.84},
        {"step": "finish", "overlay": "…png", "trim": "0:8"}
      ],
      "cost_usd": 1.84,
      "created": "2026-10-12T10:20:00Z",
      "notes": "fingers ok; audio generated"
    }
  ]
}
```

`status`: `draft` → `approved` | `rejected` → `live` (set by hand after activation) → `retired`.
`review`: `{date, ok, note}` written by `scripts/review.mjs apply` from the operator's verdict JSON (the page: `review.mjs build`).
`copy` is a suggestion for the launch spec, not binding. `cost_usd` is the sum of the pipeline steps.

## Batches

`creatives/yyyy-mm-bNN-<topic>/` — one batch per production run (e.g. `2026-10-b01-crazy`,
`2026-10-b02-classic-pl`). `_work/` is the scratch area (gitignored); `templates/` holds the HTML.

## Quality gate before `approved`

- Nails identical to the source (no invented design); hands anatomically right; no text generated by the model.
- Overlay inside the safe zone; contrast readable on a phone (sticker boxes, hook ≥ 10% of the width); ≤ 6 words
  per hook; the CTA reads as a button at a glance; text does not cover the nails (`look.avoid`).
- The batch passes the overlay-removed test: ≥ 6 distinct `angle`s per planned ad set; no more than two
  creatives derived from the same source photo in one ad set (`research/andromeda-creative-diversity.md` §2, §5).
- Language on the creative = `lang`; Polish diacritics and Cyrillic render (Roboto Condensed).
- Video 9:16 = 720×1280 (4:5 = 720×900, 1:1 = 720×720): 720p is the delivery standard, never upscaled. Statics 1080×1920 / 1080×1350 / 1080×1080. Video 4–30 s, audio present or deliberately silent.
- Nothing from `karriinails_*` or any non-SVORA source; no before/after that implies a medical result.
