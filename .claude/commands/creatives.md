---
description: Produce a batch of ad creatives (concept × hooks × languages) with the pipeline, then review them.
argument-hint: "<concept> --langs ua,pl --count 6 --batch 2026-10-b01-crazy --cap-usd 20 [--hooks reveal,social]"
---

Make creatives for **$ARGUMENTS**.

1. Preconditions: `OPENROUTER_API_KEY` in `.env` (`node scripts/doctor.mjs`), `copy/<concept>/<lang>.yaml`
   exists for every language asked, sources exist (`sources/instagram/index.json` with fetched posts or
   `sources/legacy/`). Refuse without a batch name and a USD cap.
2. Delegate production to the **creative-producer** agent with the brief (concept, hooks, languages, count,
   batch, cap, which sources). It follows `.claude/other/creatives.md` and reports cost per creative.
3. Delegate review to the **creative-director** agent: it views every file and sets `approved` / `rejected`
   with a reason.
4. Report: `node scripts/creatives.mjs stats`, the approved names, total spend vs cap, and what to launch
   first (a mix of hooks and sources, not five cuts of one clip).

Variants are cheap: one Seedance job per source, then overlays per language/hook. Never generate text
or logos with the image model — `render-overlay.mjs` does that.
