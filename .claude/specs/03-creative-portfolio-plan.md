# 03 — Creative portfolio plan

**Status:** pipeline shipped and smoke-tested 2026-10-08 (overlay → finish → manifest → launch dry-run);
AI steps untested until `OPENROUTER_API_KEY` exists. Source: `research/creative-playbook.md`,
`.claude/other/creatives.md`, `.claude/skills/svora-creative-pipeline/SKILL.md`.

## What "a few hundred creatives" means here

`concepts (7) × hooks (10) × languages (4) × formats (3)` is the space; we fill it from ~60–100 source
assets, one generation per source, the rest overlays:

| step | per source | cost (Oct 2026) |
| --- | --- | --- |
| Nano Banana still (clean/extend) | 0–1 | ~$0.07 |
| Seedance 2.5 clip, 8 s, 720×1280 | 1 | ~$1.8 |
| overlays: 2 hooks × 4 languages | 8 | free |
| finishing: video stays 720×1280 (9:16 Reels, the primary format; decision 2026-10-09), statics 1080 (+ 4:5 / 1:1 crops) | 8–12 | free |

60 sources → ~60 clips (~$110) + ~60 statics (~$5) → ~500 creatives. Cap live ads at ~15 per concept
and promote winners; the rest is a bench.

## Diversity first (2026-10-09, after the operator's review of wave-1 drafts)

The operator's verdict on the first 4 clips + 7 statics: "all one concept, just showing the product, very
similar". `research/andromeda-creative-diversity.md` agrees: hero close-ups of different photos are **one
angle** to Meta's retrieval, translations and hook text are not diversity. The portfolio is therefore planned
by **angle** (`settings/concepts.yaml → angles`), not by concept × hook × language:

| # | angle | wave-1 target | source | status |
| --- | --- | --- | --- | --- |
| 1 | hero | 2 per ad set (max) | A-grade close-ups — done (11 drafts, keep the best 2 per language) | ready |
| 2 | before-after | 1 | needs a "before" photo or mid-process still from the owner | blocked: footage |
| 3 | process | 1 | studio-life reels in the archive (filing/painting cuts) — re-cut | can do |
| 4 | founder | 1–2 | the founder's UA talking-head reels (3.6k-like humour reels) — re-cut, subtitles | can do (UA only) |
| 5 | studio | 1 | studio/interior reels in the archive — re-cut | can do |
| 6 | ugc | 1 | 26 tagged client posts — needs written permission | blocked: permission |
| 7 | review | 1 | real reviews (Fresha/Google) as text cards | blocked: owner supplies reviews |
| 8 | price | 1 | `settings/brand.yaml` prices on a photo background — done (1 draft) | ready |
| 9 | pick | 1 | three A-grade sets side by side, question hook | can do |
| 10 | location | 1 | Wola street / entrance footage | blocked: footage |

Minimum for a launchable `uaru` ad set: angles 1, 3, 4, 5, 8, 9 (six) — all possible from the archive now.
Angles 2, 6, 7, 10 need owner input (listed in `04-backlog.md`). PL needs its own founder/process cuts with
PL subtitles, or it launches with angles 1, 3, 5, 8, 9 only.

## Waves

| wave | when | sources | output | for |
| --- | --- | --- | --- | --- |
| 0 — smoke | done | `sources/legacy/videos/rich.mp4` | 1 creative (`2026-10-b00-smoke`) | proves the pipeline; never launch |
| 1 — launch set | week 0 | A-grade close-ups + founder/studio/process reels from the archive | per language: 6 angles × 1–2 creatives (≈ 8 ua, 6 pl, ru = ua twins in the ru ad set) | specs 001, 002 |
| 2 — full ingest | week 1 | full IG archive after `ig-login.mjs` → `selected/` by concept | +40 clips, all 4 languages, pedi/brows added | 003, week-3 arms, EN set |
| 3 — iterate | weekly | winners from `/report` | new hooks on winning sources; DM-CTA variants | 004 and refreshes |

## Quality gate (creative-director)

Nails identical to the source, hands right, overlay in the safe zone, language = `lang`, brand assets
only, no non-SVORA source, no medical before/after. `creatives.mjs validate` checks dimensions, names
and files; a human-like look at every file checks the rest.

## Batches and names

`creatives/yyyy-mm-bNN-<topic>/` with `manifest.json`; names per `.claude/rules/naming-conventions.md` §3.
The manifest records model, prompt, seed, job id and cost per step so any creative can be reproduced or
audited after a model is retired (as `gemini-2.5-flash-image` was on 2026-10-02).
