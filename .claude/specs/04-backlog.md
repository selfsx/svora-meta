# 04 — Backlog

Edited in place. Move an item to the journal when it is done.

## Blocked on the operator / owner

- [ ] `.env`: `OPENROUTER_API_KEY`, `ACCESS_TOKEN` (System User; assets: ad account, Page, pixel; permissions
      `ads_management`, `ads_read`, `business_management`, `pages_read_engagement`, `instagram_basic`), `AD_ACCOUNT_ID`.
- [ ] `mise run verify` → pin `META_PAGE_ID`, `META_INSTAGRAM_ACTOR_ID`, `META_PIXEL_ID` in `.env`.
- [ ] Events Manager → Test Events: confirm Fresha events arrive after consent (`02-month-1-test-plan.md` pre-flight 2).
- [ ] Custom audiences created in Ads Manager; ids into `campaigns/specs/003-retarget.yaml`.
- [ ] Instagram session for the full archive: `node scripts/ig-login.mjs` (operator types the password).
- [ ] Confirm or drop the "-20% first visit" offer (`settings/brand.yaml → offers`).
- [ ] Target cost per confirmed booking (owner's number).
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

- `verify.mjs` resolves interest ids but `settings/audiences.yaml → int-nails` holds placeholders until the first run.
- No script creates custom audiences; add `scripts/audiences.mjs` (Graph `customaudiences`) if the owner prefers it scripted.
- Meta multi-language ads for Sales → Website: check availability on the account; it would replace split language ad sets.
- Ad Library competitor scan needs a logged-in browser (`/research` with Playwright + session), fetch is blocked.
- Fresha has no API: a weekly manual export of confirmed bookings is the reconciliation input for `/report`.
- `scripts/list.mjs` reads `BookingClick` (custom event) only via `offsite_conversion.custom.*` ids — add once the id is known.
