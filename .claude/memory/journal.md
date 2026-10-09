# Journal — decisions and facts the configs cannot hold

## 2026-10-08 — repository initialised
- Built from `.claude/specs/the-mission.md`. Structure and reasons: `.claude/specs/01-repo-structure.md`.
- Research stored under `research/` (playbook, competitors, creative). Copy decks for 7 concepts × 4 languages written.
- Instagram: anonymous access gives 12 posts; the full archive needs the operator to run `scripts/ig-login.mjs` once.
- Observed but unconfirmed: a "-20% na pierwszą wizytę" post (DaxwkGBtqcU, 2026-07-14). Recorded in `settings/brand.yaml → offers` as `confirmed: false`.
- Waiting on the operator: `.env` (OpenRouter key, System User token, ad account id), then `/verify` to pin page/pixel ids; custom audiences for retargeting created in Ads Manager.

## 2026-10-09 — creatives first; 720p video
- Operator: `.env` filled except the System User token (campaign work comes later; creatives first).
- Decision (operator): video creatives ship at 720p, Reels-first; no upscaling to 1080. `settings/concepts.yaml → formats.*.video`, `video-finish.mjs` scales overlays down.
- Instagram login for the full archive may use any account (not necessarily @svora.nails); a non-business account is safer for rate limits.
