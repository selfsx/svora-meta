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
| finishing to 9:16 (+ 4:5 / 1:1 crops of statics) | 8–12 | free |

60 sources → ~60 clips (~$110) + ~60 statics (~$5) → ~500 creatives. Cap live ads at ~15 per concept
and promote winners; the rest is a bench.

## Waves

| wave | when | sources | output | for |
| --- | --- | --- | --- | --- |
| 0 — smoke | done | `sources/legacy/videos/rich.mp4` | 1 creative (`2026-10-b00-smoke`) | proves the pipeline; never launch |
| 1 — launch set | week 0 | 12 latest IG posts (anonymous) + legacy reels/works | 8 `ua` + 4 `ru` + 6 `pl`, concepts crazy/classic/brand/art, hooks found/social/price/reveal | specs 001, 002 |
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
