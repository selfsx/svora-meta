# Context — what SVORA is and how a booking happens

**SVORA NAILS** is a premium nail and brow studio at Jana Kazimierza 25B/U3, Warsaw Wola (open daily
9–21, founded 2025, 5.0 on Fresha from 117 reviews). Positioning: **"Nude & Crazy"** — flawless
classic work (nude, French, milky, glazed) *and* the signature extra-long / 3D / sculpted sets that
no neighbouring studio markets. Ukrainian founder (Mariana) and team; the studio speaks Ukrainian,
Russian, Polish and English.

Facts you may use are in `settings/brand.yaml`. Everything else about the business is not a fact.

## Who we are buying

| segment | why they matter | language | note |
| --- | --- | --- | --- |
| Ukrainian / Belarusian / Russian-speaking women living in Warsaw | the existing core; they search Instagram and ask friends; many book by DM | `ua` default; `ru` as a separate, clearly-RU ad set | never address nationality; describe the studio ("українська команда"), not the reader |
| Polish women 20–45 in Wola / Bemowo / Ochota / west Śródmieście | the growth market; price-aware, Booksy-trained | `pl`, informal "Ty" | the hybrid at 190 zł is top of the Wola market — sell the art niche and the finish, not the discount |
| English-speaking expats and students | nearly uncontested in paid | `en` | EN site + EN-speaking team are real differentiators |

Competitor scan: `research/competitors-warsaw.md`. Short version: Wola is dense (PRO BEAUTY 179 zł
incl. removal next door, Arcobaleno with 1.2k reviews), everyone runs -10% first visit, nobody runs
3D/crazy creative, nobody targets expats, Booksy dominates discovery and we are on Fresha.

## The funnel

```
Meta ad (IG Reels/Stories/Feed, FB)
  └─ link → svora.place/<lang>/ (pixel: PageView, ViewContent, BookingClick)   ← default for ads
        └─ "Book" → fresha.com/…/booking?offerItemId=s:<id>&fbclid=…&utm_…      (site appends fbclid + utm)
              └─ Fresha pixel add-on (same pixel 1194380562291350, browser-only, after cookie consent):
                   InitiateCheckout → AddPaymentInfo → Reservation → Purchase (on confirmation, not payment)
  └─ or link → fresha.com booking directly (test arm; cheaper click, no site retargeting pool)
  └─ or CTA → Instagram DM (test arm for the diaspora; DMs logged by hand)
```

- **Optimization event for prospecting: `InitiateCheckout`** (`optgoal: ic`). Purchase volume at
  100–500 PLN/day will not reach the ~50 events/week an ad set needs. Move to Purchase when an ad
  set logs ~50 IC/week and IC→Reservation is measured (`research/meta-ads-playbook.md` §1, §7).
- **Reported KPI: cost per Fresha-confirmed booking**, reconciled weekly against Fresha's own
  report. Meta's Purchase count is an indicator, not the truth (fires before payment, consent-gated).
- **Attribution basis for every number we quote: 7-day click.** `scripts/list.mjs` pins it.

## Budget

100–500 PLN/day in total. `settings/defaults.yaml` refuses a spec outside 50–500 PLN/day. Start of
month 1: ~150–250 PLN/day across prospecting (70%), retargeting (15%), DM arm (15%).

## Where things live

| what | where |
| --- | --- |
| the mission and the plans | `.claude/specs/` |
| research (playbook, competitors, creative) | `research/` |
| facts, audiences, funnels, concepts, defaults | `settings/*.yaml` |
| source media (Instagram dump, legacy files) | `sources/` |
| finished creatives + manifests (git-lfs) | `creatives/<batch>/` |
| ad copy | `copy/<concept>/<lang>.yaml` |
| campaign specs and the ledger | `campaigns/specs/`, `campaigns/ledger.yaml` |
| scripts | `scripts/` (`.claude/other/tools.md`) |
| agent memory | `.claude/memory/` |
