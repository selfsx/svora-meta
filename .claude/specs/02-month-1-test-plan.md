# 02 — Month-1 test plan

**Status:** planned 2026-10-08; blocked on credentials (`04-backlog.md`). Source: `research/meta-ads-playbook.md`
§1–§7, `research/competitors-warsaw.md` §6. Specs: `campaigns/specs/001–004`.

## Goal of month 1

Not "scale". Produce four numbers SVORA does not have: Poland CPM/CTR per placement for this account,
the InitiateCheckout → Fresha-confirmed booking rate, a first cost per confirmed booking, and a verdict on
DM vs Fresha for the UA/RU audience. Those set month 2.

## Pre-flight (week 0, owner + agents)

1. `.env` filled; `/verify` launchable; page, Instagram actor and pixel ids pinned.
2. Events Manager → Test Events: after cookie consent on fresha.com, `InitiateCheckout`, `AddPaymentInfo`,
   `Reservation`, `Purchase` arrive; from svora.place: `PageView`, `ViewContent`, `BookingClick`, `Contact`.
3. Custom audiences in Ads Manager: site visitors 30 d; IG engagers 90 d; `InitiateCheckout` 14 d excluding
   `Reservation` 14 d. Ids → `campaigns/specs/003-retarget.yaml`.
4. Account-level: Advantage+ creative "test new optimisations" off; minimum age 18; DSA beneficiary/payor.
5. Target cost per confirmed booking set by the owner (unit economics, e.g. ≤ the 190 zł first ticket).
6. Creatives: ≥ 8 approved `ua`/`ru` and ≥ 6 approved `pl` (`03-creative-portfolio-plan.md`, wave 1).

## Structure

| campaign | objective / event | audience | budget | creatives | lands on |
| --- | --- | --- | --- | --- | --- |
| 001 prospect uaru | Sales / InitiateCheckout | 6 km radius, women 18–54, UI uk+ru, Advantage+ audience on | 100 PLN/d | 6–8 videos: crazy + classic + brand, UA overlays (RU variants if an RU ad set is split later) | svora.place/ua |
| 002 prospect pl | Sales / InitiateCheckout | 6 km, UI pl | 75 PLN/d | 6 videos: crazy/art/classic, PL overlays | svora.place |
| 003 retarget | Sales / Purchase | the three custom audiences, 25 km, no language filter | 30 PLN/d | mix carousel + best prospecting videos | svora.place |
| 004 dm-arm ua (week 2) | Engagement / Conversations → Instagram Direct | 10 km, UI uk | 30 PLN/d | crazy videos with "напиши в Direct" overlay, Reels+Stories only | Instagram DM |

Total 205–235 PLN/day. ABO with one ad set per campaign so events pool. Advantage+ placements on
except 004.

## Decision rules — every Monday (`/report`)

| signal | threshold | action |
| --- | --- | --- |
| link CTR | < 0.5% after 3 days | replace hook/creative |
| spend per creative ≥ 3× target cost per booking with 0–1 IC | at 7 days | pause the ad |
| ad set Learning Limited | after 7 days | widen 6 → 10 km, merge, keep IC; do not add ad sets |
| cost per Fresha-confirmed booking ≤ target | 2 consecutive weeks | raise budget ≤ 20% per step |
| 004 cost per confirmed booking < 001 by > 25% | week 4 | shift 20% of 001 to 004, build a second DM set |
| retargeting frequency > 4–5 | any | rotate creative |
| an ad set reaches ~50 Reservation/week | — | consider Purchase optimisation / Advantage+ Sales |

## Week-3 arms (only if 001 is stable)

- Direct-to-Fresha landing (`destination: booking`) vs site: expect cheaper clicks, weaker retargeting.
- `int-nails` interest signals vs `broad`.
- A separate `ru` ad set if the uaru set's breakdown shows RU-UI users under-served.

## Reporting basis

Every number: 7-day click, from `scripts/list.mjs`; Fresha's own booking count is the truth for the KPI.
