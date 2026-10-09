# 06 — Launch schedule for 001 (uaru) and 002 (pl)

Written 2026-10-09. **Operator decision 2026-10-09: both campaigns launch today, same day, not staggered** — the
Mon 12 / Wed 14 proposal below is superseded; every date in the decision table shifts by -3 days (CTR check Thu 10-12 / Sat 10-12,
7-day cut-or-widen Fri 10-16 reported Mon 10-19, budget change earliest Mon 10-26). Preconditions still open at
writing: Instagram identity linked (owner), the 20 v2 creatives approved, music beds for the 5 silent videos (or
accept silent), a target cost per booking. **Status: plan. Nothing has been built or activated.** No GO has been given; the ledger is
empty. Inputs: `node scripts/verify.mjs` (2026-10-09), `campaigns/reports/2026-10-09-account-history.md`,
`research/meta-ads-playbook.md` §1.2, §4 and §7, specs `campaigns/specs/001-prospect-uaru.yaml` and `002-prospect-pl.yaml`.

## The two campaigns (as the specs stand)

| spec | campaign name (date = approval day) | ad set | budget | optimisation | geo · lang | ads |
| --- | --- | --- | --- | --- | --- | --- |
| 001 | `001_test_abo_ic_wola6km_uaru_mix_<date>` | `broad_wola6km_uaru_mix_cr10_<date>` | 100 PLN/day (10000 grosze) | OUTCOME_SALES · OFFSITE_CONVERSIONS on INITIATED_CHECKOUT, pixel 1194380562291350 | 6 km pin · locales [52, 17] | 10 (6 vd + 4 st, 9:16, v2) → `site-ua` |
| 002 | `002_test_abo_ic_wola6km_pl_mix_<date>` | `broad_wola6km_pl_mix_cr10_<date>` | 75 PLN/day (7500 grosze) | same | 6 km pin · locales **[15]** after the fix below | 10 (6 vd + 4 st, 9:16, v2) → `site` |

Total 175 PLN/day, inside the 50–500 range and the operator's budgets. Optimise for `ic`, not `purchase`: the pixel logs
about 1 Reservation/day organically, so far too few Purchase events to learn on (playbook §1.2).

## Blockers to clear before GO #1 (from verify, 2026-10-09)

| # | blocker | fact | who fixes, where |
| --- | --- | --- | --- |
| 1 | Polish locale key wrong | Meta `adlocale` search: Polish = **15**; `settings/audiences.yaml → languages.pl` has 34 (`verify.mjs` hard-codes 34 too). 002 would target the wrong language. The March 2026 campaigns used 15. | repo: `languages.pl.locales: [15]`, `verify.mjs` check list, `.claude/other/tools.md`. Operator says yes first (`/verify` rule) |
| 2 | Warsaw city key stale | Meta: Warsaw PL = **1881861**; settings have 2498152. 001/002 use a radius, so this does not block them, but `verify.mjs` reports NOT launchable until it is fixed. | repo: `geo.warsaw.key: "1881861"` (same yes) |
| 3 | No Instagram identity | Page 194765280381084 has no `instagram_business_account`. The ad account and business list 0 Instagram accounts. The pinned `META_INSTAGRAM_ACTOR_ID` 17841402079737028 returns "Object … does not exist, cannot be loaded due to missing permissions". The build passes it as `instagram_user_id`, so the creative create would fail, or the ads would run under the Page. | owner, in **Business Settings**: **Accounts → Instagram accounts → Add** @svora.nails. On that account, **Connected assets → Add assets** → ad account act_362995589550515. Then **Users → System users → (the token's user) → Assign assets → Instagram accounts**. The Page↔Instagram link itself is under the Page's **Settings → Linked accounts → Instagram**. Then re-run `/verify` and pin the `META_INSTAGRAM_ACTOR_ID` it prints. |
| 4 | Creatives not approved | `launch.mjs spec` refuses both specs: all 20 v2 creatives have status `draft`. They are being regenerated in a parallel session. | operator: `/review` → approve v2 (or re-pick) |
| 5 | SVME20 validity | The code is on every creative and in the copy. | owner: in Fresha, check the code works online, for all services and all clients, with no early end date (`04-backlog.md`) |
| 6 | Target cost per booking | The §7 cut rule needs it ("spend per creative ≥ 3× target"). | owner's number; until then the cut rule is not applied |

Already fine: account ACTIVE · PLN · Europe/Warsaw · pixel 1194380562291350 fires Fresha InitiateCheckout/AddPaymentInfo/
Reservation/Purchase since 2026-10-05 (pre-flight 2 satisfied by `/stats`, still worth one Test Events click-through after
consent) · Page/pixel ids pinned · DSA set per ad set from `settings/funnels.yaml` (Meta recommends "Svora.nails").

## When

**Proposal: activate 001 on Monday 2026-10-12 at about 09:00 Warsaw. Activate 002 48 h later, Wednesday 2026-10-14 at about 09:00,
if 001 passes the canary check.** Build both PAUSED on 10-12 (one GO per spec).

Why Monday: the 7-day rules then fall on the Monday `/report` (001: day 7 = 10-19). Why 09:00: the daily budget resets at
00:00 Europe/Warsaw (account time zone). Starting at opening time lets ad review and the first delivery happen while the studio
answers DMs and phones (9–21). Historical link CTR was highest 10:00–16:59 (2.9–3.2 %, Jan–Mar 2026, all objectives). No
dayparting: organic Fresha InitiateCheckout spreads from 08 to 21 h, and daily budgets cannot be dayparted. Weekday history is
unusable (2–3 delivery days per weekday, mixed objectives). The first day will spend less than the full 100 PLN; that is expected.

Why stagger: in 3,877.69 PLN of history, **no ad ever produced an attributed InitiateCheckout**, and Fresha events only reach
the pixel since 2026-10-05. The chain ad → svora.place (fbclid + utm) → Fresha → IC has never been proven with paid traffic.
At 100 PLN/day, 48 h of 001 tests it before 002 adds 75 PLN/day. The cost is that 002's day 7 falls on Wednesday 10-21 instead of a Monday.
(Same-day launch is the alternative if the operator prefers aligned dates; the locale split [52,17] vs [15] means the two do not
overlap in audience.)

Canary check for 002 (Wed 10-14 morning, before asking for GO #2 on 002):
- 001 has spent (> 0 PLN), no ad is `DISAPPROVED`/`WITH_ISSUES` (`launch.mjs verify`), and LPV > 0.
- One manual click-through from an ad preview: the svora.place/ua URL carries `fbclid` and `utm_*`, and the Fresha booking URL after
  "Book" still carries them.
- At least 1 attributed IC (`/list -s 001`) is a signal but not a gate: about 200 PLN may honestly show 0–6.

If blockers 1–4 are not clear by Monday morning, keep the same shape on the first weekday morning they are. The `date:`
field is the day GO #1 is given, and the 7-day rule is read on day 7 regardless of weekday.

## Learning phase at these budgets — what to expect

The threshold is about 50 optimisation events per ad set in 7 days (playbook §1.2).

| | weekly spend | IC/week needed | max cost per IC for 50/week |
| --- | ---: | ---: | ---: |
| 001 | 700 PLN | 50 | 14.00 PLN |
| 002 | 525 PLN | 50 | 10.50 PLN |

Derived estimate (not a benchmark): the account's best paid landing-page cost was 3.80 PLN/LPV (March 2026, PL locale,
2-mile pin, 7d click). If 5–15 % of ad landings open the Fresha booking flow (no paid measurement exists; the organic site
shows about 3 % PageView→BookingClick), cost per IC is about 25–76 PLN. That means **about 9–28 IC/week for 001 and 7–21 for 002**.
**50/week is not realistic. Expect both ad sets to show "Learning Limited".** That is the known trade-off of IC at
175 PLN/day. Playbook §7 adds that a second language ad set pays off only at ≥ 300 PLN/day; two sets at 175 PLN/day split the events.

## Rules applied (playbook §7), with dates for the Monday-10-12 / Wednesday-10-14 schedule

| when | 001 | 002 | rule → action (the operator decides; agents report) |
| --- | --- | --- | --- |
| day 3 | Thu 10-15 | Sat 10-17 | link CTR < 0.5 % → replace hook/creative (a new creative = significant edit = learning reset) |
| day 7 | **Mon 10-19** (first `/report`) | Wed 10-21 (reported Mon 10-26) | creative with spend ≥ 3× target cost per booking and 0–1 IC → cut (needs blocker 6) · ad set "Learning Limited" → widen to `wola10km` / merge, keep IC, **no new ad sets** |
| week 3+ | Mon 11-02 | Mon 11-02 | cost per Fresha-confirmed booking ≤ target for 2 consecutive weeks → raise budget in ≤ 20 %/day steps (new GO each) |
| week 4 | Mon 11-09 | Mon 11-09 | Advantage+ Sales only if one ad set reached about 25–50 Reservation/week; otherwise stay manual and consolidated |

Every number is quoted on the 7-day-click basis. Under about 10 events a cost-per figure is noise and is reported as such.

**Widening to wola10km**: triggered at day 7 by "Learning Limited" (read in Ads Manager's Delivery column; `/list` does not
show learning status yet, see backlog). `launch.mjs` has no edit command, and the 6 km campaign name must not lie. So widening is
a new spec (`camptype: retest`, `geo: wola10km`, same creatives and copy, next ledger number) with its own GO → build → verify →
GO → activate, plus a separate GO to pause the 6 km campaign. If **both** 001 and 002 are Learning Limited, the alternative to
put to the operator is one merged multi-language ad set (playbook §7, "Language") instead of two widened ones.

## Daily and weekly routine

- Daily, about 10:00 Warsaw: `node scripts/list.mjs tree -d yesterday -f all` (spend, CTR, LPV, IC, purch, frequency per ad).
  Then `node scripts/list.mjs campaigns -d last7 -f all` for the running total. Watch: delivery stalled (spend 0), disapprovals,
  link CTR after day 3, frequency > 4–5.
- Daily: the owner notes Fresha bookings with SVME20 (the code is Meta-only, so redemptions are the cleanest booking count).
- Monday: `/report` (analyst). It reconciles Meta IC/Purchase with Fresha-confirmed bookings and SVME20 redemptions, and applies
  the table above.

## What the ledger and journal must record

- `campaigns/ledger.yaml` (written by `launch.mjs`): `built` (campaign/ad set/creative/ad/media ids, names, budget in grosze,
  targeting), `activated`, `paused`. By hand, a `decision:` line under the entry for: the 002 canary verdict, any widening,
  any cut or pause, and why.
- `.claude/memory/journal.md`: each GO with the operator's reason, the date it was given, and the spec `date:` used.
- After activation: `node scripts/creatives.mjs set <name> status=live` for each of the 20 ads.

## The exact sequence (operator)

```bash
# 0. Pre-flight (after blockers 1–4)
node scripts/verify.mjs                                   # must end "launchable — nothing blocks a build"
#    set `date: 2026-10-12` (the GO #1 day) in both specs

# 1. 001
node scripts/launch.mjs spec campaigns/specs/001-prospect-uaru.yaml     # full table shown → operator: GO
node scripts/launch.mjs build campaigns/specs/001-prospect-uaru.yaml    # everything PAUSED; ids → ledger
node scripts/launch.mjs verify campaigns/specs/001-prospect-uaru.yaml   # quote any mismatch; stop on one
node scripts/verify.mjs                                                 # /verify again
#    verified ids presented → operator: GO (activate 001), about 09:00
node scripts/launch.mjs activate campaigns/specs/001-prospect-uaru.yaml

# 2. 002: build the same day (its own GO), activate after the canary (its own GO, on that day)
node scripts/launch.mjs spec campaigns/specs/002-prospect-pl.yaml       # → GO
node scripts/launch.mjs build campaigns/specs/002-prospect-pl.yaml
node scripts/launch.mjs verify campaigns/specs/002-prospect-pl.yaml
#    Wed 10-14: canary passes → /verify → operator: GO (activate 002)
node scripts/launch.mjs activate campaigns/specs/002-prospect-pl.yaml
```

A GO covers one action on one spec on that day. A GO to build is not a GO to activate, and a GO on Monday does not cover Wednesday.
