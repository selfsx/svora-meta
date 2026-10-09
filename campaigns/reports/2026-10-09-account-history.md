# Account history — act_362995589550515 (Svora.nails), everything before campaign 001

Pulled 2026-10-09, read-only, System User token. **Basis:** Graph API v24.0 insights, `date_preset=maximum`
(account created 2023-12-07 → 2026-10-09), **7-day click** for pixel events (`action_attribution_windows=['7d_click']`,
what `scripts/list.mjs` pins); on-platform actions (profile clicks, likes, leads) are Meta's default
attribution. Run dates = first and last day with spend in daily campaign insights (`time_increment=1`, account time zone
Europe/Warsaw). Money in PLN (account currency). Sources: `node scripts/list.mjs {campaigns,adsets,ads} -d lifetime -f all`
and read-only Graph reads of `/{act}/campaigns`, `/{act}/adsets` (targeting, optimisation goal, promoted object),
`/{act}/ads` (creative names, CTA, link), `/{act}/insights` (breakdowns by placement, age×gender, hour).

## Headline

- **3,877.69 PLN over 31 campaigns** (+1 never delivered), 223,141 impressions. This equals the account's `amount_spent`.
- **0 InitiateCheckout, 0 Purchase ever attributed** (7d click). No campaign was ever optimised for a Fresha booking
  event: until **2026-10-05** the pixel received no Fresha events at all (see the pixel section).
- **67.1 % of spend (2,602.82 PLN) bought on-platform actions**: Instagram profile visits (1,685.95), DM "conversations"
  (514.04) and Page likes (402.83). None of these carries a booking signal back to Meta.
- **No campaign ran long enough to learn.** Every campaign except the Page-like boost (14 d) delivered for 1–5 days.
  The most conversion events any website-optimised campaign collected was 16 Schedule events in 2 days. The 50-event
  threshold (playbook §1.2) was never in reach. The API returns no `learning_stage_info` for these paused ad sets, so
  "never exited learning" is derived from the event counts and run lengths, not read from Meta.

## Campaigns

`result` = the event the ad set optimised for. Cost/result is noise below ~10 events. `lpv` = landing-page views.
`ic / purch` = InitiateCheckout / Purchase, both 7d click.

| ran (Warsaw) | campaign · id | objective / optimisation | status | spend | result | cost/result | CPM | link CTR % | lpv | ic / purch |
| --- | --- | --- | --- | ---: | --- | ---: | ---: | ---: | ---: | --- |
| 2023-12-08 → 2023-12-09 (2 d) | `Инст \|Ж \|все языки \|широкая \|крео\|«Трафік»` · 120203336571060007 | TRAFFIC / LINK_CLICKS | PAUSED | 47.00 | 26 link clicks | 1.81 | 15.89 | 0.88 | 0 | 0 / 0 |
| 2023-12-08 → 2023-12-08 (1 d) | `Инст \|Ж \|все языки \|бьюти/ногти \|крео\|«Трафік»` · 120203333424330007 | TRAFFIC / LINK_CLICKS | PAUSED | 9.65 | 1 link clicks | 9.65 | 20.75 | 0.22 | 0 | 0 / 0 |
| 2023-12-11 → 2023-12-20 (4 d) | `рус/укр Инстаграм \|на профиль\|18-46\|ногти\| крео "философия" «Трафік»` · 120203683812160007 | TRAFFIC / VISIT_INSTAGRAM_PROFILE | PAUSED | 144.59 | 143 clicks to IG profile | 1.01 | 31.33 | 3.10 | 0 | 0 / 0 |
| 2023-12-11 → 2023-12-11 (1 d) | `Инстаграм\|Ж\|18-58\|широкая\|крео печеньки\|«Взаємодія»` · 120203657673880007 | ENGAGEMENT / CONVERSATIONS | PAUSED | 9.36 | n/a conversations (not returned by API) | — | 49.26 | 0.00 | 0 | 0 / 0 |
| 2023-12-11 → 2023-12-11 (1 d) | `Инстаграм\|Ж\|18-58\|ногти\|крео печеньки\|«Взаємодія»` · 120203449036400007 | ENGAGEMENT / CONVERSATIONS | PAUSED | 34.50 | n/a conversations (not returned by API) | — | 43.29 | 0.25 | 0 | 0 / 0 |
| 2023-12-12 → 2023-12-14 (2 d) | `Рус/укр \|инст \|18-32 \|ногти \|статика \|на профиль \|"розовые штаны"\| трафик` · 120203774183040007 | TRAFFIC / VISIT_INSTAGRAM_PROFILE | PAUSED | 47.45 | 72 clicks to IG profile | 0.66 | 19.97 | 3.03 | 0 | 0 / 0 |
| 2023-12-12 → 2023-12-14 (2 d) | `Инстаграм \|на профиль\|18-46\|Рич\| крео "бизи" «Трафік»` · 120203772585750007 | TRAFFIC / VISIT_INSTAGRAM_PROFILE | PAUSED | 48.19 | 76 clicks to IG profile | 0.63 | 30.93 | 4.88 | 0 | 0 / 0 |
| 2023-12-12 → 2023-12-12 (1 d) | `Инстаграм \|на профиль\|18-46\|ногти\| крео "бизи" «Трафік»` · 120203771557260007 | TRAFFIC / VISIT_INSTAGRAM_PROFILE | PAUSED | 15.07 | 7 clicks to IG profile | 2.15 | 35.80 | 1.66 | 0 | 0 / 0 |
| 2023-12-14 → 2023-12-14 (1 d) | `Инстаграм \|на профиль\|18-46\|Рич\| крео "бизи" «сообщения» – копія` · 120203878512730007 | ENGAGEMENT / CONVERSATIONS | PAUSED | 40.84 | n/a conversations (not returned by API) | — | 36.21 | 0.62 | 0 | 0 / 0 |
| 2023-12-15 → 2023-12-15 (1 d) | `Рус/укр Инстагарм \| Ж \| 18-46 \| на профиль \| широкая \| «Взаємодія»` · 120204116297140007 | ENGAGEMENT / CONVERSATIONS | PAUSED | 19.63 | n/a conversations (not returned by API) | — | 44.41 | 0.45 | 0 | 0 / 0 |
| 2023-12-15 → 2023-12-16 (2 d) | `Рус/укр Инстагарм \| Ж \| 18-46 \| на профиль \| рич \| «Взаємодія»` · 120204114507590007 | ENGAGEMENT / CONVERSATIONS | PAUSED | 23.44 | n/a conversations (not returned by API) | — | 44.90 | 0.57 | 0 | 0 / 0 |
| 2023-12-15 → 2023-12-21 (4 d) | `Инстаграм/фейсбук \|Ж\| 18-46\| ногти\| на профиль «Взаємодія»` · 120204096350840007 | ENGAGEMENT / CONVERSATIONS | PAUSED | 112.09 | n/a conversations (not returned by API) | — | 41.89 | 0.56 | 0 | 0 / 0 |
| 2023-12-17 → 2023-12-18 (2 d) | `Инстаграм \|18-46 \|на профиль \|кре оскар \|Широкая\|рилс/сторис\|«Взаємодія»` · 120204356165460007 | ENGAGEMENT / CONVERSATIONS | PAUSED | 39.86 | n/a conversations (not returned by API) | — | 41.83 | 0.31 | 0 | 0 / 0 |
| 2023-12-17 → 2023-12-18 (2 d) | `Инстаграм \|18-46 \|на профиль \|кре оскар \|ногти\|рилс/сторис\|«Взаємодія»` · 120204354441060007 | ENGAGEMENT / CONVERSATIONS | PAUSED | 37.51 | n/a conversations (not returned by API) | — | 37.36 | 0.10 | 0 | 0 / 0 |
| 2023-12-18 → 2023-12-18 (1 d) | `Инстаграм \|18-40 \|на профиль \|кре оскар \|ногти\|рилс/сторис\|«Взаємодія»` · 120204456773310007 | ENGAGEMENT / CONVERSATIONS | PAUSED | 32.06 | n/a conversations (not returned by API) | — | 42.58 | 0.40 | 0 | 0 / 0 |
| 2023-12-18 → 2023-12-18 (1 d) | `Инстаграм \|18-40 \|на профиль \|кре оскар \|ногти\|рилс/сторис\|«Взаємодія»` · 120204456416800007 | ENGAGEMENT / CONVERSATIONS | PAUSED | 10.64 | n/a conversations (not returned by API) | — | 47.71 | 0.00 | 0 | 0 / 0 |
| 2023-12-22 → 2023-12-22 (1 d) | `Инст \|рилс/сторис\| красота\| 18-32\| крео "Трусы"\| «Взаємодія» – копія` · 120204924549060007 | ENGAGEMENT / CONVERSATIONS | PAUSED | 11.01 | n/a conversations (not returned by API) | — | 67.13 | 0.00 | 0 | 0 / 0 |
| 2023-12-22 → 2023-12-22 (1 d) | `Инст профиль \|рилс/сторис\| красота\| 18-32\| крео "Трусы"\| «Взаємодія»` · 120204924549050007 | ENGAGEMENT / CONVERSATIONS | PAUSED | 10.29 | n/a conversations (not returned by API) | — | 52.23 | 0.00 | 0 | 0 / 0 |
| 2023-12-22 → 2023-12-22 (1 d) | `Инст профиль \|рилс/сторис\| широкая\| 18-32\| крео "Трусы"\| «Взаємодія»` · 120204924352860007 | ENGAGEMENT / CONVERSATIONS | PAUSED | 9.30 | n/a conversations (not returned by API) | — | 75.61 | 0.00 | 0 | 0 / 0 |
| 2023-12-25 → 2023-12-27 (3 d) | `Инстаграм \|18-32 \|ногти \|оскар крео\| "Взаємодія»` · 120204989734700007 | ENGAGEMENT / CONVERSATIONS | PAUSED | 123.51 | n/a conversations (not returned by API) | — | 25.23 | 0.22 | 0 | 0 / 0 |
| 2023-12-28 → 2023-12-29 (2 d) | `Инст \|18-32 \|бьюти\| шар\| на профиль «Трафік»` · 120205072134820007 | TRAFFIC / VISIT_INSTAGRAM_PROFILE | PAUSED | 19.02 | 23 clicks to IG profile | 0.83 | 20.21 | 2.44 | 0 | 0 / 0 |
| 2025-09-17 → 2025-09-30 (14 d) | `[9/17/2025] Promoting Svora.nails` · 120234997832820007 | PAGE_LIKES / PAGE_LIKES | PAUSED | 402.83 | 156 page likes | 2.58 | 10.19 | 0.02 | 0 | 0 / 0 |
| 2026-01-09 → 2026-01-11 (3 d) | `sales+website-book-now-ua-09.01.2025` · 120241954373070007 | SALES / OFFSITE_CONVERSIONS CONTENT_VIEW | PAUSED | 175.94 | 3 ViewContent (7d click) | 58.65 | 18.54 | 0.81 | 43 | 0 / 0 |
| 2026-01-11 → 2026-01-14 (4 d) | `traffic+instagram-visits-ua-11.01.2025` · 120242049580910007 | TRAFFIC / PROFILE_VISIT | PAUSED | 166.43 | 459 clicks to IG profile | 0.36 | 14.68 | 4.05 | 2 | 0 / 0 |
| 2026-01-11 → 2026-01-13 (3 d) | `sales+website-book-now-ua-11.01.2025` · 120242048599480007 | SALES / OFFSITE_CONVERSIONS CONTENT_VIEW | PAUSED | 117.53 | 3 ViewContent (7d click) | 39.18 | 28.35 | 0.75 | 18 | 0 / 0 |
| 2026-01-14 → 2026-01-18 (5 d) | `traffic+ig-fb-visits-ua-14.01.2025` · 120242177450360007 | TRAFFIC / PROFILE_VISIT | PAUSED | 346.06 | 820 clicks to IG profile | 0.42 | 14.08 | 3.34 | 4 | 0 / 0 |
| 2026-02-26 → 2026-03-01 (4 d) | `traffic+ig-fb-visits-ua-25.02.2026` · 120243922329860007 | TRAFFIC / PROFILE_VISIT | PAUSED | 391.03 | 1113 clicks to IG profile | 0.35 | 16.05 | 4.57 | 4 | 0 / 0 |
| 2026-03-03 → 2026-03-04 (2 d) | `leads+ig-wide-jk-03.03.2026` · 120244213781560007 | LEADS / LEAD_GENERATION | PAUSED | 134.45 | 0 leads (IG Direct) | — | 13.86 | 0.66 | 0 | 0 / 0 |
| 2026-03-04 → 2026-03-05 (2 d) | `trffic+ig-fb-visits-narrow-aggressive-04.03.2026` · 120244283369500007 | TRAFFIC / PROFILE_VISIT | PAUSED | 451.46 | 841 clicks to IG profile | 0.54 | 10.47 | 1.95 | 4 | 0 / 0 |
| 2026-03-09 → 2026-03-10 (2 d) | `sales-website-narrow-aggressive-09.02.2026` · 120244285425410007 | LEADS / OFFSITE_CONVERSIONS SCHEDULE | PAUSED | 246.67 | 16 Schedule (pixel custom, 7d click) | 15.42 | 23.20 | 1.12 | 80 | 0 / 0 |
| 2026-03-10 → 2026-03-11 (2 d) | `sales-website-narrow-aggressive-10.03.2026` · 120244586996290007 | LEADS / OFFSITE_CONVERSIONS SCHEDULE | PAUSED | 600.28 | 13 Schedule (pixel custom, 7d click) | 46.18 | 31.88 | 1.03 | 143 | 0 / 0 |

Never delivered: `Инст |18-32 |бьюти| Маски| на профиль «Трафік» – копія` (120205072307770007, profile visits, 0 spend).

By objective: profile visits / link clicks 1,685.95 · DM conversations 514.04 · Page likes 402.83 ·
website ViewContent 293.47 · website Schedule 846.95 · IG-Direct lead form 134.45 = **3,877.69 PLN**.

## Three eras

**Dec 2023 (21 campaigns, 845.01 PLN).** These were Instagram-only, in RU/UA naming. Geo was Warsaw city key `1881861` +20 km.
Most used locales `[17, 52]` (Russian, Ukrainian); ages 18–32 up to 18–58 with interest stacks (nails, beauty, plus
luxury brands in the "Рич" sets). The goals were profile visits or Instagram Direct conversations, at 50–61 PLN/day per ad set,
mostly 1–2 days each. The API returns no conversation counts for these (EU messaging metrics are restricted, playbook §6),
so DM results cannot be read back. Profile-visit CTR was high (3–4.9 %) but led nowhere measurable. Note: this predates
`settings/brand.yaml → founded: 2025`. The account (created 2023-12-07) was in use before the current studio.

**Sep 2025 (1 campaign, 402.83 PLN).** This was a Page-like boost, Poland-wide, 18–65, Facebook only: 156 likes at 2.58 PLN, link
CTR 0.02 %. It bought audience for the Facebook Page and no bookings.

**Jan–Mar 2026 (9 campaigns, 2,629.85 PLN).** The current naming style appears here (with year typos: "09.01.2025" was created in
Jan 2026).
- *Website, ViewContent* (`sales+website-book-now-ua-*`, 293.47 PLN, 3 + 3 d): Warsaw +10 mi, locales `[17, 52, 54]`
  (RU, UA, Belarusian), women 18–65, Advantage+ audience. One of the two also delivered on Audience Network and Messenger. CTA
  `BOOK_TRAVEL` to `svora.place/`. Results: 61 LPV, 6 ViewContent. The optimisation event was 2 steps short of a booking, and
  `BOOK_TRAVEL` is the wrong CTA for a salon.
- *Profile visits* (`traffic+ig-fb-visits-*`, 1,354.98 PLN incl. the 04.03 "narrow-aggressive" one): 3,233 profile clicks
  at 0.35–0.54 PLN. These were the cheapest clicks in the account, but they leave the pixel, so no website or Fresha event can follow.
- *IG Direct lead form* (`leads+ig-wide-jk-03.03.2026`, 134.45 PLN, 2 d): a 4-mile place pin on Jana Kazimierza, with carousels
  `works-{classic,crazy,design}-carousel`. Result: **0 leads**, 1 messaging block.
- *Website, Schedule* (`sales-website-narrow-aggressive-*`, 846.95 PLN, 2 + 2 d): a 2-mile place pin
  "Warszawa Jana Kazimierza", **locale 15 (Polish)**, women 18–65. Results: 29 Schedule events (pixel custom conversion,
  7d click) at 29.21 PLN blended, and 223 LPV at 3.80 PLN. That is the closest thing to a conversion baseline the account has. It spent
  600.28 PLN in 2 days at 31.88 CPM (300 PLN/day). The ad sets were stopped after 2 days, so they never got near the 50 events learning needs.

Creatives seen (ad names): `classic-sparkles`, `video-9x16-black-hand`, `short-single-tone`, `short-coffee-tea`,
`long-inspector`, `video-9x16-karri-nails`, `crazy-single-1…5`, `classic-single-1…5`, `model-single-1…5`,
`design-single-1…5`, `design-hands-1`, `design-two-fingers`, `classic-blue-hands`, three `works-*-carousel`. Top spenders:
`classic-sparkles` 454.16 PLN (122 LPV), `video-9x16-black-hand` 330.76 + 166.78 PLN (profile visits, 3.3–4.5 % CTR).
None of these names follow the naming law, so they cannot be joined to a manifest.

## Why past spend did not turn into measurable bookings

1. **Wrong or no booking event.** Two thirds of the spend optimised on-platform actions. The website campaigns optimised
   ViewContent or Schedule on svora.place. Fresha's InitiateCheckout/Reservation/Purchase did not reach the pixel before
   2026-10-05, so Meta never saw a booking.
2. **Restarts instead of learning.** 31 campaigns in about 40 delivery days. Each new campaign started learning from zero; none ran 7 days.
3. **Loose audiences.** Ages ran to 65 and geo was Warsaw +10 mi / +20 km or all of Poland. **Ages 55+ took 374.74 PLN (9.7 %) and men
   439.50 PLN (11.3 %)** of lifetime spend (age×gender breakdown). The studio's buyers are women 18–44: 25–34 women took 1,421.96 PLN, 18–24 women 940.97.
4. **Placements.** Instagram Reels (1,183.95 PLN, CPM 15.28, link CTR 2.74 %) and Stories (1,307.20, CPM 21.75, CTR 2.09 %) carried
   the account. Instagram Feed was 516.50 at CPM 26.63 and CTR 1.55 %. Facebook Feed was 453.12 at CTR 1.06 %. Facebook Reels was 365.81 at CPM 9.03 but
   **CTR 0.24 %**, which is cheap reach that does not click. All figures are lifetime, all objectives mixed, so read them as directional.

## Timing patterns (for the launch schedule)

- **Hour of day** (account time zone, Jan 9–18 and Feb 26–Mar 11 2026, all objectives): link CTR is highest **10:00–16:59
  (2.9–3.2 %)** and lowest at 21, 00 and 02 h (1.5–1.9 %). Spend nevertheless concentrated 20:00–00:59 (Meta chasing cheap
  evening inventory for profile visits). The 29 Schedule events are too few to read by hour.
- **Weekday:** each weekday has 2–3 delivery days with different objectives. There is **no usable weekday signal**.
- **Organic pixel, last 7 days** (not ads): Fresha InitiateCheckout clusters at 08, 12, 15–16, 19 and 21 h Warsaw, consistent with
  the 9–21 opening hours. Bookings happen across the day, so dayparting is not warranted. A daily budget cannot daypart anyway.

## Pixel 1194380562291350 today (the baseline for 001/002)

`/{pixel}/stats`, aggregation by event; the endpoint returns about 28 days (since 2026-09-12):

| event | last 7 d | last 28 d | fires on |
| --- | ---: | ---: | --- |
| PageView | 150 | 314 | svora.place, www.fresha.com, pl.svora.place |
| InitiateCheckout | 88 | 88 | www.fresha.com, **first seen 2026-10-05** |
| AddPaymentInfo | 9 | 9 | Fresha |
| Reservation | 6 | 6 | Fresha |
| Purchase | 6 | 6 | Fresha |
| Schedule | 7 | 50 | svora.place (the old site event; last fired 2026-10-05) |
| BookingClick | 5 | 5 | svora.place (custom, replaces Schedule) |
| ViewContent | 5 | 5 | svora.place |
| Contact | 0 | 3 | svora.place |

The Fresha pixel add-on works: about 18 InitiateCheckout and about 1 Reservation per day, all organic (no ads running), so
IC→Reservation ≈ 6.8 % on 88 IC (small sample). Two hits came from `localhost` (developer testing of svora-landing). A
second pixel `2337099316770915` "svora.place (Booksy)" is connected to the account and has never fired; do not select it.
