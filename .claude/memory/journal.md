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

## 2026-10-09 — operator "go": wave-1 angles batch (2026-10-b02-angles)

- 15 drafts, $0 generation (transcripts ≈ $0.05 total): founder ×2 (ua, captions burned from the transcript),
  meme ×1 (en, as-is), studio ×4 (ua/pl + brows), process ×4 (ua/pl × 2 sources), pick statics ×4 (ua/pl × 4:5/9:16).
  Portfolio by angle now: hero 11 · price 1 · founder 2 · meme 1 · studio 4 · process 4 · pick 4.
- New tools: `transcribe.mjs` (OpenRouter audio input, Gemini 2.5 Flash), `subs.mjs` (.ass captions, brand font),
  `video-finish --cuts/--subs`, `static-pick` template. Shell gotcha recorded: zsh does not word-split `$p` — use `${=p}`.
- Decisions taken without asking: all Instagram-library-music reels muted (licence does not cover ads); the course-promo
  reel DJ3rTq8NxFW skipped (heavy baked typography); the "free brows" sign segment of DdljeKAtree skipped (unconfirmed offer).
- Not done on purpose: no more hero clips from the remaining cap — the research caps heroes at 2 per ad set and we hold 11.
  Spend the cap on a Seedance before/after or on nothing until the owner's footage arrives.
- Open: the founder's captions drift ≈ 1 s vs speech on DdJn2Wrsad- (Gemini timestamps); acceptable for review, fix by
  nudging segment times if the operator wants it tighter. No music beds yet (`brand/music/`).

## 2026-10-09 — plan for the first 100 + review loop

- Operator: pick static = great concept; videos "still not very great but we're moving"; wants ≈ 100 diverse, fully
  localised creatives (50/50 video/static), campaigns 1-1-5 (later 1-1-10), a generate → review → regenerate loop.
- Written: `.claude/specs/05-first-100.md` (28 masters × languages, video quality bar, waves A/B/C, $50 cap assumption,
  owner inputs that block specific masters). Built: `scripts/review.mjs` (local review page with 👍/👎/notes + export,
  `apply` writes verdicts to manifests), `/review` command.
- Next: wave A (free) as soon as the operator confirms the plan or marks the current 26 drafts.

## 2026-10-09 — operator approved the first-100 plan ($50 cap) → waves A + B produced

- Wave A (`creatives/waves/2026-10-A.yaml`, batch `2026-10-b03-wavea`): 127 files, $0 generation — V1–V10 localised
  (ru/en/pl), V12 pick video, V13 price video with end card, V14 process→result, S1–S13 statics (pick trios, hero covers,
  blur-pad, price, menu/location/proof/meme text cards, founder quote, autumn cover) in ua/pl/ru/en × 4:5/9:16.
- Wave B (`2026-10-B.yaml`): V15 burgundy autumn hand + V16 chrome-marble macro — 2 Seedance candidates each ($7.4 +
  $0.14 stills); winners DPZE-a (push-in, light sweep) and DASm-a (macro glide); alternates kept in `creatives/_work/wb/`
  and recorded under `alternates` in the manifest. OpenRouter total for the project ≈ $23 of the $50 cap.
- QA fixes before handing over: classic pick trio had a drinks-table slide (DQkTCNuDfmz_02) → C4dzm1rLo84_01; founder
  quote card rebuilt as a photo-tile text card; V16 text moved to the top (macro = nails everywhere); pick-video badges
  rebuilt without logo/CTA (empty CTA pill bug fixed: `cta_display`); shared-cost accounting so localised twins count $0.
- Tooling: `scripts/wave.mjs` (job file → render/finish/register, `--only/--redo/--langs/--dry`), `scripts/copy-sync.mjs`,
  `static-card` template (`bg`, `kicker`, `lines`, `tile_pos`, `tile_h`), `creatives.mjs add --job/--cost-shared`.
- Portfolio now 160 (1 approved smoke, 159 drafts) by angle: hero 42 · pick 28 · price 21 · seasonal 12 · studio 12 ·
  meme 9 · founder 8 · process 8 · review 8 · location 8 · before-after 4. Next: operator review → apply → wave C.
- Shell gotcha: zsh does not word-split `$var` in ffmpeg arg lists — use `${=var}` or build arrays.

## 2026-10-09 — first operator review (29 masters marked) → wave C

- Verdicts (`scratch/review-2026-10-09.json`, applied): 34 approved · 117 rejected. Approved masters: pick trios (mixed,
  crazy), menu price cards, meme text cards, the amber cat-eye hero static (pl), the EN meme video ("may be too weak
  for a nail creative" — keep, low priority). Rejected, by cause: every video and the hero/price/seasonal statics —
  "text overlays hands too much" / "overlay hides almost everything"; proof, location, founder cards — "messed up
  markup" (group climbed into the photo tile); classic pick trio 4:5 — layout collision (9:16 was fine); blur-pad of
  the landscape photo — "small original image"; founder re-cuts — "contains embedded overlays".
- Design change: `_type.css` now has two containers — `.group` (hook + optional sub, at `place`) and `.ctagroup` (CTA +
  meta, alone at the bottom of the safe zone); hook 92/78 px, CTA 48/42. Cards get `place=under` (anchored below the
  tile). `wave.mjs` supports `vars_4x5` / `vars_9x16` per-format overrides.
- Retired: V7/V8 founder re-cuts (owner must record clean footage — backlog), S6 landscape blur-pad (→ S6b hero on
  C4dzm1rLo84). Rejected files were deleted from disk and manifests (the verdict file is the record); approved ones kept.
- Wave C = re-run of waves A+B with the new layout; ua/pl versions of the b01/b02 masters are now produced in b03 so
  every master has all its languages in one place.

## 2026-10-09 — second operator pass → wave D (hook card + clean body; photo cards)

- Operator on the rebuilt drafts: "positioning of the layouts still not very great" and the review page showed the
  first round's marks (localStorage keyed per master) — fixed: marks keyed per build + "Clear all" button.
- Decision: stop placing text on the product. Videos = 1.2 s hook card (static-card, brand bg) + clip with CTA only;
  hero/price/seasonal statics = `static-card` photo cards (tile 54% at 4:5, 44% at 9:16, text under) — the construction
  the operator approved for the pick trios. `wave.mjs` gained `intro:`; sub → kicker mapping for cards.
- 120 drafts dropped and remade (wave D). Approved set (35) untouched.
