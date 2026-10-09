# 04 — Backlog

Edited in place. Move an item to the journal when it is done.

## Blocked on the operator / owner

- [x] `.env`: all keys present (2026-10-09). `META_PAGE_ID` 194765280381084 and `META_PIXEL_ID` 1194380562291350 match `/verify`.
- [ ] **Instagram identity (blocks 001/002)**: Page 194765280381084 has no linked Instagram; the business and ad account list 0
      Instagram accounts; the pinned `META_INSTAGRAM_ACTOR_ID` (17841402079737028) does not resolve for the System User. Owner,
      in Business Settings: Accounts → Instagram accounts → Add @svora.nails → Connected assets → ad account; Users → System
      users → Assign assets → Instagram; Page Settings → Linked accounts → Instagram. Then `/verify` and re-pin the id.
- [ ] Events Manager → Test Events: one click-through after consent. Pixel `/stats` already shows Fresha InitiateCheckout/
      AddPaymentInfo/Reservation/Purchase since 2026-10-05 (pre-flight 2 effectively met).
- [ ] Approve the 20 v2 creatives in specs 001/002 (`launch.mjs spec` refuses: all `draft`, 2026-10-09).
- [ ] Yes/no on the settings key fix below (Polish 34→15, Warsaw 2498152→1881861); `/verify` stays NOT launchable until then.
- [ ] Custom audiences created in Ads Manager; ids into `campaigns/specs/003-retarget.yaml`.
- [ ] Instagram session for the full archive: `node scripts/ig-login.mjs` (operator types the password).
- [ ] Confirm or drop the "-20% first visit" offer (`settings/brand.yaml → offers`).
- [ ] Target cost per confirmed booking (owner's number).
- [ ] **Founder talking head, recorded clean** (no Instagram captions/stickers baked in, phone, 30–60 s per topic: "too expensive",
      "what to expect", "why Wola") — the existing reels were rejected for their baked captions (review 2026-10-09).
- [ ] Footage for the non-close-up angles (`03-creative-portfolio-plan.md` → Diversity first): a "before" photo
      or mid-process still (before-after), 60 s of phone video at the entrance / street / chair (location, studio),
      2–3 real reviews with permission to quote (review), written OK from tagged clients to reuse their posts (ugc).
- [ ] Music beds: 3–5 tracks cleared for ads into `brand/music/` (Meta Sound Collection is free) — `brand/music/README.md`.
- [ ] Decide whether to add a 14-day repair guarantee / "Nude Duo" bundle (competitor gaps 3–4) — copy can only
      say it once it is real on Fresha.

## Agent work, in order

- [ ] `/ingest` (12 posts now; full archive after login) → `sources/instagram/selected/` by concept.
- [ ] `/creatives` first 100 per `05-first-100.md`: wave A (free localisation + new statics + cut videos) → review → wave B (Seedance) → review → wave C.
- [ ] creative-director review → `approved`.
- [ ] `/launch campaigns/specs/001-prospect-uaru.yaml`, then 002.
- [ ] Week 2: `/creatives` DM-CTA variants → `/launch 004`.
- [ ] First `/report` the Monday after activation.

## Known gaps / ideas

- **Wrong Meta keys in settings (blocks 002 and `/verify`)**: Meta `adlocale` Polish = **15** (settings `languages.pl.locales`
  = 34, `scripts/verify.mjs` `localeChecks` = 34, `.claude/other/tools.md` says pl_PL 34). Warsaw city = **1881861**
  (settings `geo.warsaw.key` = 2498152). Fix all three files in one commit once the operator says yes.
- `verify.mjs` does not flag a Page without `instagram_business_account`, nor check that `META_INSTAGRAM_ACTOR_ID` resolves.
  Make both a problem (the build passes `instagram_user_id`). If `META_PIXEL_ID` is unset it pins `pixels.rows[0]`, which on this
  account is the dead Booksy pixel 2337099316770915. Pin by name or by `last_fired_time` instead.
- **Token hygiene**: Graph `paging.next` URLs embed `access_token` (and came back as v26.0 although `graph.mjs` pins v24.0).
  `graph.mjs` should strip `paging` from what it returns and redact `access_token=` from any URL it logs. One probe on
  2026-10-09 printed one into a session transcript; consider rotating the System User token.
- `list.mjs` has no learning status: add `learning_stage_info` (ad set level) so "Learning Limited" (the §7 day-7 trigger)
  is readable without Ads Manager. It also lacks a `lifetime` mention in its usage line (the preset exists: `-d lifetime`).
- `launch.mjs` cannot edit targeting. Widening 6 km → 10 km means a new `retest` spec plus a pause; decide whether that is the
  intended path or whether an `update-geo` command (with its own GO) is wanted.
- Specs 001/002 carry 10 ads per ad set; playbook §4 cites Meta's "no more than six". At about 10 IC/week the per-creative cut
  rule cannot separate 10 creatives in week 1. Watch it, and keep it in mind if the operator re-picks.
- Old campaigns used locale 54 (Belarusian) with UA/RU. `settings/audiences.yaml → languages.uaru` has no 54; this is a decision
  for the operator, not a fix.
- `verify.mjs` resolves interest ids but `settings/audiences.yaml → int-nails` holds placeholders until the first run.
- No script creates custom audiences; add `scripts/audiences.mjs` (Graph `customaudiences`) if the owner prefers it scripted.
- Meta multi-language ads for Sales → Website: check availability on the account; it would replace split language ad sets.
- Ad Library competitor scan needs a logged-in browser (`/research` with Playwright + session), fetch is blocked.
- Fresha has no API: a weekly manual export of confirmed bookings is the reconciliation input for `/report`.
- `scripts/list.mjs` reads `BookingClick` (custom event) only via `offsite_conversion.custom.*` ids — add once the id is known.
- **SVME20 on the landing** (svora-landing): when `utm_source=meta` is in the URL (the attribution script already reads
  it), show a sticky line "Kod SVME20 = -20%" above the Book buttons, in the page language. Fresha cannot prefill a
  code from a link, so this is the only place between the ad and the checkout where the code can be repeated.
- **SVME20 in Fresha**: the owner checks the promotion is valid for online bookings, all services, all clients (not
  "new clients only"), no end date before the campaigns end, and reads its redemptions weekly into `/report`.
- **Multi-language ads (DLO) test, week 2**: the operator asked why 001/002 are split by language instead of one ad set
  with Meta's "Languages" (translations per ad). Answer on 2026-10-09: our creatives are language-specific videos (hook
  and outro cards), so the feature needs per-locale media via `asset_feed_spec` + `asset_customization_rules` (locales),
  which `launch.mjs` does not build yet; and two ABO sets keep the budget split and the CPA readable per language for
  the first test. Build it as campaign 003: one ad set, CBO, 30 ads with locale rules, run against 001+002 for 7 days.
- **Direct-to-Fresha destination test, week 3** (playbook §6): a copy of 002 landing on the Fresha venue page (not
  `/booking`, so InitiateCheckout still means a click on "Book", not the landing itself); expect lower CPC and a smaller
  site retargeting pool. The site stays the default because Fresha has no UA page and no place to explain SVME20.
