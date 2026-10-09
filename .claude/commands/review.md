---
description: The operator's creative review loop — build the local review page, then apply the exported verdicts to the manifests.
argument-hint: "build [--batch x] | apply scratch/review-N.json"
---

Review loop for **$ARGUMENTS** (`.claude/specs/05-first-100.md` → The loop).

- `build`: `node scripts/review.mjs build [--status draft] [--batch x]` → tell the operator the `file://` link. Every draft
  is playable there with 👍 / 👎 and a note; "Export" copies a JSON.
- `apply`: the operator pastes the JSON (save it to `scratch/review-<date>.json`) → `node scripts/review.mjs apply <file>`
  → statuses become `approved` / `rejected`, notes land in the manifest. Then: read every rejection note, group them
  (overlay · motion · source · copy · sound), fix what is fixable once, give up the slot after the second rejection,
  localise approved masters to their remaining languages, and report `node scripts/creatives.mjs stats` by angle.
