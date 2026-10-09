# Budget and expected CPA for 001 (uaru) and 002 (pl) — 2026-10-09

Basis: the account's own history (`2026-10-09-account-history.md`, 7-day click, lifetime), the Fresha pixel's organic
funnel (last 7 days to 2026-10-08, from `verify.mjs`), `research/meta-ads-playbook.md` §1.2/§4/§5 and
`research/competitors-warsaw.md` §1–3. Every number below says what it rests on; the ones marked *estimate* are mine.

## 1. What the account has already paid for

| the only booking-shaped campaigns (Mar 2026, Schedule event, 7d click) | spend | CPM | link CTR | landing-page view | cost / LPV | Schedule | cost / Schedule |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `sales-website-narrow-aggressive-09.02.2026` (2 d) | 246.67 | 23.20 | 1.12 % | 80 | 3.08 | 16 | 15.42 |
| `sales-website-narrow-aggressive-10.03.2026` (2 d) | 600.28 | 31.88 | 1.03 % | 143 | 4.20 | 13 | 46.18 |
| blended | 846.95 | — | — | 223 | 3.80 | 29 | 29.21 |

Reading: Warsaw women 18–54 cost this account **23–32 PLN per 1,000 impressions** and **3–4 PLN per landing-page view**;
roughly **one visitor in eight** started a booking (29 / 223). Polish market CPM references are 15–45 zł
([double-digital](https://double-digital.pl/blog/ile-kosztuje-reklama-na-facebooku/)), ≈ $5.5 ([Lebesgue](https://lebesgue.io/facebook-ads/facebook-cpm-by-country),
[Adamigo](https://www.adamigo.ai/blog/meta-ads-cpm-cpc-benchmarks-by-country-2026)); beauty link CTR 1.5–2.5 % globally
([MHI](https://mhigrowthengine.com/blog/meta-ads-benchmarks-ecommerce-2026/), [LocaliQ](https://localiq.com/blog/facebook-advertising-benchmarks/)).
The account's 1.0–1.1 % CTR came from product-only creatives without an offer.

## 2. What Fresha's funnel converts organically (pixel, 7 days to 2026-10-08, no ads running)

InitiateCheckout 88 → AddPaymentInfo 9 → Reservation 6 → Purchase 6: **6.8 % of checkout starts become a booking**.
Paid traffic that arrives on a "-20% with code" promise should convert checkout starts better than browsing
traffic (they came for the booking), but it also brings colder people; *estimate*: **10–20 % IC → booking** for the first
two weeks, to be replaced by the measured rate on the first Monday.

## 3. Expected costs (estimate, from §1 × §2)

| step | pessimistic | central | optimistic | rests on |
| --- | ---: | ---: | ---: | --- |
| cost per landing-page view | 4.20 | 3.50 | 2.80 | §1; the offer should lift CTR above 1.1 % |
| landing → InitiateCheckout | 8 % | 12 % | 18 % | §1 (1 in 8) → the offer + direct "Book" CTA |
| **cost per InitiateCheckout** | **52** | **29** | **16** | the optimisation event |
| InitiateCheckout → booking | 7 % | 12 % | 20 % | §2 |
| **cost per first booking (CPA)** | **≈ 750** | **≈ 240** | **≈ 80** | — |

The honest expectation for week 1 is a **CPA between 80 and 250 PLN** per first booking, with the pessimistic case
(no lift from the offer, organic-like conversion) above 500. The number that decides anything is cost per
InitiateCheckout in the first 3–4 days: **≤ 25 PLN is on plan, 25–40 is wait, > 40 after 300 PLN spent is a creative
or landing problem** (playbook §7 reads the same metric).

## 4. What a first booking is worth

- Revenue of a first visit with the code: hybrid 152, CLEAN 96, extensions 240, Crazy Shape 304 (`brand.yaml`).
- The marketplaces price a new client at **45 % of the first visit** (Booksy Boost, ≈ 70–85 PLN on a hybrid) or a
  one-time **≈ 20 %** fee (Fresha marketplace, ≈ 30–38 PLN) — `competitors-warsaw.md` §3. That is the market's own
  price of a new nail client in Wola: **40–85 PLN**.
- Retention is the difference: a client returning every 3–4 weeks at 190 PLN is worth ≈ 2,000 PLN a year, so a first
  booking bought at 120–150 PLN pays back on the second visit. The owner's margin per visit is not in the repo; the
  target below assumes ≥ 50 % contribution.

**Proposed target: ≤ 120 PLN per first booking** (≈ 80 % of the discounted hybrid price). Decision rules: scale when
≤ 80, hold 80–150, cut an ad set above 200 after 14 days and ≥ 600 PLN spent. The owner confirms or replaces 120.

## 5. Budget: why 100/75 is below the learning floor and what to run instead

Meta's learning phase wants ≈ 50 optimisation events per ad set per 7 days (playbook §1.2). At the central 29 PLN per
InitiateCheckout that is **≈ 1,450 PLN/week ≈ 207 PLN/day per ad set**; at the optimistic 16 PLN it is 115 PLN/day.

| plan | 001 uaru | 002 pl | total / day | total / 4 weeks | expected IC / week (central) | learning |
| --- | ---: | ---: | ---: | ---: | --- | --- |
| as specified | 100 | 75 | 175 | 4,900 | 24 + 18 | both Learning Limited |
| **recommended** | **150** | **100** | **250** | **7,000** | 36 + 24 (52 + 35 optimistic) | 001 exits learning in the optimistic case; 002 limited |
| fast learning | 200 | 150 | 350 | 9,800 | 48 + 36 | both exit learning in the central-to-optimistic band |

Recommendation: **150 / 100 PLN/day** now (inside the 100–500 PLN/day mandate, 7,000 PLN for the 4-week test), and
the first budget change on Mon 2026-10-19 by the rules above: +20 %/day steps on the set whose cost per
InitiateCheckout is ≤ 25 PLN, no change while 25–40. Polish gets the smaller budget because its CPM is the lower one
and its audience is wider, so each złoty buys more impressions there; the Ukrainian/Russian set is the one with the
retention story (language, diaspora) and the richer creative mix.

Expected week-1 outcome at 250 PLN/day (central): ≈ 60 InitiateCheckouts and **≈ 7 first bookings for 1,750 PLN**, i.e.
≈ 250 PLN each — above target in week 1 by design; the test is whether the number falls toward 120 as Meta learns
and as the owner's own footage (6 of 15 ads in each set) finds its audience.

## 6. Watch items

- Ads Manager undercounts bookings (consent gating, playbook §2): Fresha's own report and SVME20 redemptions are
  the truth; the Monday `/report` reconciles both.
- The SVME20 code is in every ad; if Fresha applies it only to some bookings, the IC → booking rate will read low
  for a reason that is not the ads.
