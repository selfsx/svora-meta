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

## 2026-10-09 — third operator pass → wave E (measured placement)

- Verdicts round 2 (`scratch/review-2026-10-09-b.json`): 52 approved (photo-card statics: art, crazy, nude, price,
  seasonal; proof; founder quote), 66 rejected (all videos — "CTA right on the hands, empty space unused"; classic pick
  trio "broken in both"; location card). Operator: the start card is OK "but must be polished"; placement looked random.
- Fix: `scripts/free-zone.mjs` measures the emptiest band (edges + skin, max over sampled frames after cuts, UI
  penalties) and the runner puts the CTA there; busy frames get no body CTA — the new 1.5 s outro card (hook + CTA)
  carries it. Intro/outro cards centred with a centred logo. `static-pick` rebuilt as a flow stack (hook → tiles →
  CTA, no overlap). Location card: bigger tile, one line of hours/languages. V9 (approved with a CTA note) remade.

## 2026-10-09 — fourth operator pass: "with proper positioning results are much better"

- Verdicts round 3 (`scratch/review-2026-10-09-c.json`): 52 approved (every measured-placement video but three, the
  classic pick trio), 20 rejected as *content*, not layout: hero chrome almond video, coffee-at-the-mirror video, brows
  video, location card on the studio frame → retired from the wave files (V3, V10, V10b, S10). Approved total 135.
- Remaining concern: intro/outro cards are silent while the body has sound. Fix: `wave.mjs` now assembles video
  first and runs one audio pass over the whole piece — bed under everything when `brand/music/` has one, otherwise
  the clip's own audio starts under the intro card and fades out across the outro (fade in 0.3 s, out ≤ 1.5 s, −14 LUFS).
  Wave F = re-assembly of all 44 approved videos (statuses restored after the run) + the 4 re-laid drafts.

## 2026-10-09 — operator check of the first 20 → the SVME20 offer

- Operator: the review page "shows 26 creatives, how come 130?" — it shows one card per *master* (26) with the
  language/format switches inside; the file count (135) is in the page title. Nothing was missing.
- Decision (operator): a Fresha promo code **SVME20**, -20% on every service, created for Meta campaigns only, to
  strengthen the booking impulse of the first campaigns. Recorded as `settings/brand.yaml → offers.meta-20`
  (confirmed: true, with-code prices 152/96/304/336/240 zł). The old unconfirmed "-20% first visit" stays unquotable.
- Investigated prefill: Fresha's promotions docs describe the code as typed by the client "when booking online or
  during checkout"; no URL parameter exists (the booking page bundle reads only `utm_source`; the checkout step is
  lazy-loaded and undocumented). So the code must be legible on the creative and repeated in the primary text; the
  landing (svora-landing) should show it when `utm_source=meta` is present (backlog).
- Creative change: `wave.mjs` gained an `offer` text slot — outro card (now 2 s) closes on "service line · -20% з кодом
  SVME20 · CTA"; the body CTA's meta line carries the code when a free band exists; `static-card` gets the offer as a
  big line under the hook; price-angle hooks became the with-code price ("Crazy Shape 380 → 304 zł", "190 → 152 zł",
  menu rows "190 → 152 zł"). New copy ids h09/h10, p09/p10, d05 in `copy/mix/*`; specs 001/002 switched to h09/p09/d05
  and to the v2 creatives. `copy-lint.mjs` accepts with-code prices. A redo is now v+1 of the same n (`--n`).
- The 20 picked ads were regenerated as v2 (28 files incl. 4:5 twins); v1 stays until the operator checks v2.
  The other 107 approved files still carry no code — redo after the operator's OK on the v2 layout.

## 2026-10-09 — SVME20 offer redesign (operator rejection of the text-line presentation)
- Operator rejected the plain "-20% з кодом SVME20" line / the "380 → 304 zł" hook: not catchy, barely visible under the CTA, an arrow
  is not a price cut; and "5.0 · 117 відгуків" must carry star emoji.
- Built: sale tag (-20%, orange, -6°), coupon chip (dashed, "КОД SVME20"), price pair (struck old, big orange new) in
  `creatives/templates/_type.css`; render-overlay vars `offer_pct/offer_code/price_old/price_new`; wave defaults `offer_pct/offer_code`;
  outro card, body CTA row (free band only), static-card, static-pick, S7/S8/V13 price angle. Ratings: new copy ids (brand h09/d05/p09,
  classic ua/ru d05, overlay ids via copy-sync); copy-lint counts a star run as one emoji.
- The 28 v2 drafts of 2026-10-b03-wavea were deleted and regenerated as v2 (no model calls, $0). Review pages rebuilt.

## 2026-10-09 — System User token in; /verify, account history, launch schedule (nothing built)
- `/verify`: **NOT launchable**. Account act_362995589550515 ACTIVE · PLN · Europe/Warsaw · lifetime spent 3,877.69 PLN.
  Pixel 1194380562291350 last fired 2026-10-08T20:07:45Z. Problems reported: Polish locale is Meta key **15** (settings and
  `verify.mjs` say 34), Warsaw city key **1881861** (settings say 2498152). Not reported by the script, but found: Page
  194765280381084 has **no Instagram account linked**. The business and ad account list 0 Instagram accounts, and the
  pinned `META_INSTAGRAM_ACTOR_ID` does not resolve for the System User. `.env` was not edited: page and pixel ids
  were already pinned and match; the IG id cannot be confirmed until the owner links it.
- Pixel: Fresha events arrive since 2026-10-05 (7 d: 88 InitiateCheckout, 9 AddPaymentInfo, 6 Reservation, 6 Purchase, all
  organic), so pre-flight 2 is effectively confirmed. The site's old `Schedule` event stopped on 10-05; `BookingClick` replaced it.
  A second pixel 2337099316770915 "svora.place (Booksy)" never fired; do not use it.
- History (`campaigns/reports/2026-10-09-account-history.md`): 31 campaigns, 0 IC and 0 Purchase ever attributed (7d click).
  67 % of spend went to profile visits, DMs and Page likes. No campaign ran more than 5 days except a 14-day Page-like boost.
  Website campaigns optimised ViewContent/Schedule, never a Fresha event (none existed). The best paid baseline: 3.80 PLN/LPV and
  29 Schedule at 29.21 PLN (March 2026, PL locale 15, 2-mile pin).
- `launch.mjs spec` on 001/002 (local resolution only) refuses: all 20 v2 creatives are `draft`. 002 targeting carries
  `locales:[34]`, the wrong language.
- Plan (`.claude/specs/06-launch-schedule.md`, operator to confirm): build both PAUSED on Mon 2026-10-12; activate 001 at about 09:00
  that day; activate 002 on Wed 10-14 after a 48 h canary proving ad → site → Fresha → IC attribution (never proven before).
  Expect "Learning Limited": the derived estimate is 9–28 IC/week for 001 and 7–21 for 002, against 50 needed.
  Widening to wola10km = a new `retest` spec, since `launch.mjs` cannot edit targeting.
- Incident: one read-only probe printed a raw Graph `paging.next` URL, which embeds the access token, into this session's tool
  output. It was not written to any file or commit. The operator may want to rotate the System User token. Backlog item added.
- Re-resolved against Meta (search type=adlocale / adgeolocation, 2026-10-09): Polish = locale **15** (34 was wrong),
  Warsaw city = **1881861** (2498152 is Archbold, Ohio). Fixed in settings/audiences.yaml, verify.mjs, tools.md. Specs
  001/002 use the wola6km radius, so only 002's language filter was affected — before any launch.
- A read-only probe by the campaign agent echoed a Graph paging URL carrying the access token into its own
  transcript (not into any file or commit); the transcript was masked. Rotation of the System User token recommended.
