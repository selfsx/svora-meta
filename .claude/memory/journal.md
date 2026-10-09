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

## 2026-10-09 — archive ingested and analysed; wave-1 test clips
- Full @svora.nails archive scraped with the operator's session (another account; works): 700 grid posts, 669 own, 26 client/partner UGC. Media for 660 posts in `sources/instagram/raw/` (1.7 GB, gitignored).
- Visual pass on every own post since 2024 → `index.json → tags` (253 tagged, 83 A-grade). Analysis: `research/instagram-archive-analysis.md`.
- Operator cap for the first batch: $25; first 4 videos for verification before the rest. Spent ≈ $7.8 (4 clips + 5 stills); 4 creatives registered as `draft` in `creatives/2026-10-b01-wave1` (raw clips in `raw/`).
- Learned: Seedance audio copyright filter (auto-retry without audio added), "nude" rejected in prompts, one lap-framed source refused → swapped to DbMR6_ttcnF.

## 2026-10-09 — first statics (wave 1)

- Operator viewed the 4 test clips; next ask was "generate a few static ones". Produced 7 statics at $0 (render only) into
  `creatives/2026-10-b01-wave1/` (n005–n011): art Ddv-7k6DQJg 4:5 + 9:16 ua, crazy DY99E3XjWQK 9:16 ua, classic DV5ZDohDBx0
  4:5 pl (price), classic DOofqjpDaTt 4:5 + 9:16 pl via `static-blur-pad` (landscape source), art DZqf93TDGOU 4:5 pl. All `draft`.
- Template fixes found in review: empty badge rendered as an orange pill (now hidden unless set); 9:16 statics kept copy
  and logo inside the Meta UI zone, so `render-overlay.mjs` now sets per-format layout defaults and `static-hero` has
  `layout=copy-top` for photos with the nails low in the frame.
- Skipped DJZ8KfbtZS8 (red cat claws, 300 likes) for statics: the photo has "CLAWS"/"WTF" text baked in.
- Overlay facts used: hybryda 190 zł, Cat Claws od 420 zł, art od 10 zł, address Jana Kazimierza 25B — all from `settings/brand.yaml`.

## 2026-10-09 — operator review of wave-1 drafts → overlay system v2, angles, music

- Operator's concerns: (1) all videos one concept, product only, very similar → "investigate Andromeda";
  (2) music weak; (3) overlays weak, small on 9:16, CTA not understandable; statics: weak overlays, look at MAAG's
  1:1→9:16 approach, understand the picture before overlaying.
- Done: `research/andromeda-creative-diversity.md` (researcher agent; 12-angle matrix) → `settings/concepts.yaml →
  angles`, `angle` + `look` fields in manifests (`creatives.mjs add --angle --look`, validate refuses missing angle);
  `scripts/describe-image.mjs` (vision pass, ≈ $0.01/photo: place/tone/avoid/baked_text/risks);
  `creatives/templates/_type.css` sticker system (hook ≈ 11% of width at 9:16, boxed lines, pill CTA with arrow,
  meta sticker) used by all three templates; `static-blur-pad` and `video-finish --pad blur` on MAAG tuning
  (σ28 blur, 18% dim, 92% foreground, r16, shadow); `video-finish` loudnorm −14 LUFS + `--music` bed with ducking;
  `brand/music/README.md` (owner to supply cleared tracks — none in the repo yet).
- All 11 wave-1 drafts re-finished with v2 overlays in place (v stays 1: nothing shipped). Angle audit: hero 11,
  price 1 → the batch fails the one-sentence test by design; next production is by angle (process/founder/
  studio/pick cuts from archive reels, free), not more heroes.
- Facts recorded: Seedance audio ≈ −27 dB mean before normalisation; 2 of 4 clips had audio dropped by the
  copyright filter — a music bed is required for consistent sound.
