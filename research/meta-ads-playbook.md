# Meta Ads Playbook for SVORA NAILS (Warsaw, Wola)

Research date: 2026-10-08. Scope: Meta (Facebook/Instagram) paid social for a single-location premium nail studio whose bookings run through Fresha (no API), with a site (svora.place) that fires `BookingClick`, `Contact` and `ViewContent`. Every figure below carries its source URL; figures are labelled **global** or **Poland** where it matters. Several official Meta Help Center pages render client-side and could not be read directly; where that happened the Meta URL is cited alongside the secondary source that quotes it.

---

## 1. Campaign objectives and optimization for a local salon with a third-party booking system

### 1.1 Which objective

| Objective / conversion location | What Meta optimizes toward | Fit for SVORA |
|---|---|---|
| **Sales → Website**, event `Purchase` or `Reservation` (Fresha pixel) | People likely to complete a Fresha booking | Best signal, but lowest volume; Fresha's `Purchase` fires when "the client reaches the Payment Method confirmation screen", not on a completed charge ([Fresha help](https://www.fresha.com/help-center/knowledge-base/online-presence/448-track-meta-pixel-ads)) |
| **Sales → Website**, event `InitiateCheckout` | People likely to open the Fresha booking flow ("Triggered at the first step of the booking flow", [Fresha help](https://www.fresha.com/help-center/knowledge-base/online-presence/448-track-meta-pixel-ads)) | Realistic learning-phase volume at 100–500 PLN/day; recommended launch event (see 1.2) |
| **Leads → Instant form** (optionally "Conversion Leads" goal) | Form submissions; with CRM feedback, quality leads | Adds a manual step (staff must book the client); useful only if Fresha tracking proves too thin. Meta says CAPI-for-CRM "is not a requirement to begin running campaigns" with the Conversion Leads goal but "you will see better results if it is fully integrated" ([Meta developer docs](https://developers.secure.facebook.com/docs/marketing-api/conversions-api/conversion-leads-integration/crm-integration/2-getting-started-with-integration)); the goal is unavailable on personal ad accounts (same source) |
| **Engagement → Messages (Instagram Direct)** | Conversations started | Natural for a UA/RU-speaking audience that already books by DM; Meta's own 2024 experiments (734K businesses, 3 weeks, H2 2024) reported that offering multiple message destinations gave "9% lower cost per message and 11% higher conversion rate" than a single destination, with Instagram Direct showing a 22.8% lower median cost per message ([Meta](https://www.facebook.com/business/ads/click-to-message-ads)). Ads that click to Instagram Direct cannot target under-18s ([Meta help](https://en-gb.facebook.com/business/help/198088077975174)) |
| **Traffic** | Link clicks / landing-page views | Cheapest clicks, weakest intent; only as a 1–2 week "pixel warm-up" if the account has zero event history |

Practitioner guidance for salons converges on: define a confirmed booked appointment as the primary conversion, and treat "a message or form [as] evidence of interest, not a client" ([GoHighLevel salon playbook](https://help.gohighlevel.com/support/solutions/articles/155000005250-boosts-over-balayage-the-local-ads-playbook-for-beauty-salons)); choose the objective "that matches the earliest reliable record your staffed handoff creates" ([The Stacc](https://thestacc.com/blog/nail-salon-facebook-ads/)); run Instagram Reels/Stories as primary placements and expect retargeting to "produce the most bookings per dollar spent" ([Insidea](https://insidea.com/blog/marketing/beauty-salon/facebook-and-instagram-ads-strategy-for-beauty-salons)).

### 1.2 Learning phase and low event volume

- Meta's threshold: an ad set "usually exit[s] the learning phase after around 50 optimization events since its last significant edit" ([Meta help, as quoted by Scalemate](https://www.scalemate.co/blog/meta-ads-learning-phase-reset); Meta page: https://www.facebook.com/business/help/112167992830700). The "7-day window" framing is the common paraphrase ([Jetfuel](https://jetfuel.agency/what-is-the-meta-ads-learning-phase-how-to-exit-it-faster-in-2026/)). The count is **per ad set and only for the chosen event**.
- Meta's definition of a significant edit: "when you pause your ad set or make a change to optimization event, audience or creative"; budget/bid changes "may also be significant, but it depends on the magnitude" — Meta publishes no percentage; the widely repeated "20%" rule is third-party ([Scalemate](https://www.scalemate.co/blog/meta-ads-learning-phase-reset)).
- Jon Loomer observed a test UI showing progress toward "10 events in 3 days", but Meta's documentation still says 50 ([Jon Loomer](https://www.jonloomer.com/qvt/learning-phase-10-or-50-events/)). Some 2026 vendor posts claim Meta lowered Advantage+ Sales to 25 purchases/week; this is unverified against Meta documentation ([1ClickReport](https://www.1clickreport.com/blog/advantage-plus-shopping-25-conversions-2026-guide)).
- Low-volume ladder (e-commerce framing, transferable): under ~10 purchases/week optimize for the add-to-cart equivalent, 10–25/week for begin-checkout, switch to purchase only when a single ad set clears ~50 purchases in a rolling 7 days; "consolidating spend into fewer ad sets matters more than the event choice at low volume" ([WeltPixel](https://weltpixel.com/blogs/news/which-event-should-a-low-volume-shopify-store-optimize-for)). Jetfuel recommends "optimizing for a lower-funnel event with real signal" when purchases are too scarce, and consolidation over new ad sets ([Jetfuel](https://jetfuel.agency/what-is-the-meta-ads-learning-phase-how-to-exit-it-faster-in-2026/)).
- Worked arithmetic (derived, not a benchmark): 50 `InitiateCheckout`/week at 150 PLN/day (1,050 PLN/week) requires a cost per InitiateCheckout of ≤21 PLN. Splitting into two ad sets halves each set's events and likely leaves both "Learning Limited".

### 1.3 Advantage+ Sales vs manual; CBO vs ABO

- A campaign only gets Advantage+ status when Advantage+ budget, Advantage+ audience and Advantage+ placement are all on; `geo_locations` (location) and custom-audience exclusions remain allowed; interests/custom audiences are only allowed as relaxed suggestions ([Meta developer docs](https://developers.facebook.com/docs/marketing-api/advantage-campaigns)). In the 2025 setup flow Advantage+ is on by default with a "Campaign Score of 100"; most customizations lower the score but "any ability you had to limit your audience before will remain" ([Jon Loomer](https://www.jonloomer.com/qvt/advantage-plus-campaign-setup-is-here/)).
- Agency consensus: at very low budgets Advantage+ "do[es] not generate enough conversion volume to optimize effectively" ([AI Advantage Agency](https://aiadvantageagency.com/meta-advantage-campaigns/)); below ~25–50 weekly purchases run a consolidated manual conversion campaign first, but still "one well-funded campaign instead of multiple underfunded ones" ([1ClickReport](https://www.1clickreport.com/blog/advantage-plus-shopping-best-practices-2026)).
- CBO (Advantage campaign budget) vs ABO: ABO is "Best Use Case: Testing / Small Budgets", CBO for scaling ([HyperFX](https://www.hyperfx.ai/blog/abo-vs-cbo-meta-ads-2026)); "five ad sets at $40 a day, each below the volume needed to stabilise, produces five permanently learning cells" ([Segwise](https://segwise.ai/blog/abo-cbo-meta-ads-budget-strategies)); per-ad-set floors of 2–3x target CPA/day (up to 5x for stability) ([Webtonic](https://www.webtonic.io/blog/cbo-vs-abo-which-to-use)); if using CBO, keep min-spend floors to 10–20% of budget and use sparingly ([Adamigo](https://www.adamigo.ai/blog/cbo-vs-abo-choosing-the-right-budget-strategy)).

### 1.4 Advantage+ audience vs manual; radius; language

- Advantage+ audience treats inputs as suggestions; the hard "audience controls" are **minimum age, location, language and custom-audience exclusions** ([Meta help](https://www.facebook.com/business/help/273363992030035); [Meta Advantage+ leads page](https://www.facebook.com/business/ads/meta-advantage-plus/leads)). So a radius and a language list hold in either mode.
- Vendor rule of thumb: prefer detailed/original targeting when under ~50 weekly conversions, under ~$30/day, or "hyper-local" (small radius) because "the AI does not have enough audience room to explore" ([Conversios](https://www.conversios.io/blog/meta-advantage-audience-vs-detailed-targeting-2026-guide/)). Meta's own claim of "CPA down up to 32%" for Advantage+ audience is for e-commerce/lead-gen, not local services (same source). Jon Loomer's 30-day split test found only a 36% chance detailed targeting would beat Advantage+ (cited in the same source).
- Location: the "living in / recently in" dropdown was removed; only "Living in or recently in this location" remains ([Search Engine Land](https://searchengineland.com/new-update-to-meta-ads-location-targeting-404124); [Jon Loomer glossary](https://www.jonloomer.com/glossary/location-targeting/)). Selecting a city by name adds a default ~40 km radius ([Grow with Sakib](https://growwithsakib.com/meta-ads-for-local-business/)); use a pin drop. Salon guides recommend 5–15 km because "clients rarely travel more than 10–15 km for routine services" ([Insidea](https://insidea.com/blog/marketing/beauty-salon/facebook-and-instagram-ads-strategy-for-beauty-salons)). One tutorial claims the Advantage+ Sales flow enforces a 10-mile minimum radius unless you untick "Reach more people likely to respond to your ads" ([Foreplay](https://www.foreplay.co/post/how-to-launch-a-geo-targeted-ads-in-facebook)) — verify in Ads Manager, since a manual ad set in Warsaw should accept a smaller pin radius.
- Language: the ad-set Languages field matches people's language settings and is an audience control in Advantage+ ([Meta help](https://www.facebook.com/business/help/273363992030035)). Alternatively one ad can carry a default plus up to 48 more languages and "people automatically see your ad in the correct language", avoiding one ad set per language ([Meta help](https://en-gb.facebook.com/business/help/1852644738394400); [setup page](https://en-gb.facebook.com/business/help/594069204359830)) — check current objective/placement support before relying on it.
- Reaching UA/RU speakers: ethnicity-based interest targeting was removed globally from 19 Jan 2022 ([Hindustan Times/PressReader](https://www.pressreader.com/india/hindustan-times-east-up/20211111/281947431090766)), so the levers are **language settings**, the **"Expats from [country]"** behaviour segment, and diaspora-adjacent interests (home-country media, remittance, cultural associations), with "one ad set per segment" and language as "a proxy, not a direct measure" ([AdStellar](https://www.adstellar.ai/blog/meta-ads-manager-expat-targeting-how-to-set-up-step-by-step)). Audience size is large: Warsaw had 301,200 foreign residents (14.5%) at end-2025 per GUS, 73% of Poland's 2.3M foreign nationals are Ukrainian citizens, and Mazowieckie hosts 346,100 Ukrainian citizens ([Notes from Poland](https://notesfrompoland.com/2026/07/03/foreigners-now-account-for-15-of-warsaws-population/); [TVP Info](https://www.tvp.info/94136248/raport-gus-na-podstawie-tak-zwanych-sladow-zycia-na-koniec-2025-r-w-polsce-przebywalo-ok-388-mln-osob-w-tym-ok-23-mln-cudzoziemcow)). A self-reported freelancer case ran a separate campaign "targeting Ukrainians in Poland" for a language school at €5.3 per client ([Freelancehunt](https://freelancehunt.com/en/showcase/work/reklama-targetowana-meta-ads-dla/1877651.html)).

---

## 2. Attribution and tracking specifics

**Fresha pixel events** (browser-only, same Pixel ID as svora.place): `PageView` (entering the booking flow), `InitiateCheckout` ("first step of the booking flow"), `AddPaymentInfo` (Payment Method screen), `Purchase` (Payment Method confirmation screen), `Reservation` (Confirm button) and legacy `Schedule` (same as Reservation) ([Fresha help](https://www.fresha.com/help-center/knowledge-base/online-presence/448-track-meta-pixel-ads)). The article says nothing about consent or Conversions API. `Reservation` is not a Meta standard event; `Schedule` is ("When a person books an appointment to visit one of your locations") and `InitiateCheckout` is "When a person enters the checkout flow prior to completing the checkout flow" ([Meta pixel reference](https://developers.facebook.com/docs/meta-pixel/reference)). Fresha's API/developer program is oriented to approved partners, with no self-serve API ([Supergood](https://supergood.ai/docs/fresha-api)), so **no Conversions API for bookings is possible** today.

**Cross-domain continuity (svora.place → fresha.com).** The Pixel "automatically saves the fbclid query parameter to an _fbc cookie for that website domain"; cookies are domain-scoped and `_fbc` expires after 90 days ([Meta CAPI docs](https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/fbp-and-fbc)). A `_fbc` set on svora.place is invisible on fresha.com; the Fresha pixel will set its own `_fbp` and can only set `_fbc` if `fbclid` is present in the Fresha URL ([PixelFlow](https://pixelflow.so/features/cross-domain-cookies); [Datanostro](https://datanostro.com/en/docs/learn/what-are-fbp-and-fbc-cookies/)). Practical implication (inference from the above): the site's booking links should append the inbound `fbclid` (and UTMs) to the Fresha venue URL so the Fresha-side events can be click-attributed; otherwise Meta falls back to weaker matching (same `_fbp` is not shared across domains either). Ads pointing **directly** to the Fresha page avoid the hop but lose the site's `BookingClick`/`ViewContent` signals and retargeting pool.

**Cookie consent.** Meta's Business Tools Terms require that in the EU "an end user provides all necessary consents before you use Meta Business Tools to enable the storage of and access to Meta cookies" ([Meta](https://www.facebook.com/legal/technology_terms)); `fbq('consent','revoke')` "pause[s] sending Pixel fires" until `grant` ([Meta pixel GDPR doc](https://developers.facebook.com/docs/meta-pixel/implementation/gdpr)). One vendor estimates EEA rejection rates "often run between 30–50%" (unsourced estimate) and notes the result is inflated CPA in reporting ([Adamigo](https://www.adamigo.ai/blog/meta-pixel-gdpr-advertisers-guide)). Both svora.place's banner and Fresha's banner gate events, so **Ads Manager will undercount bookings**; Fresha's own appointment report must be the source of truth.

**Aggregated Event Measurement.** Advertisers no longer need to rank 8 web events, verify the domain or configure value sets; the AEM tab was removed, though Meta says AEM continues on the back end for iOS opt-outs ([Jon Loomer](https://www.jonloomer.com/meta-announces-big-changes-to-website-conversion-campaigns/); [Jon Loomer](https://www.jonloomer.com/qvt/aggregated-event-measurement-tab-is-gone/)). Nothing to configure for SVORA.

**Conversions outside the website.** Meta's path is the Conversions API (offline parameters; the standalone Offline Conversions API was deprecated in late 2024 per [Flighted](https://www.flighted.co/blog/meta-ads-offline-conversions-guide-for-b2b-saas)) or a custom conversion keyed to a confirmation URL you control ([Bookedin guide](https://support.bookedin.com/hc/en-us/articles/45719519271700-How-to-setup-Ad-Tracking-with-Meta-Facebook-Instagram)). Without Fresha API access, a periodic manual CSV upload of confirmed bookings (email/phone hashed) to a CRM dataset is the only CAPI route; evaluate it in month 2, not month 1.

**What to report on.** Primary: Fresha-confirmed new-client bookings per week vs spend (offline reconciliation). In Ads Manager: cost per `InitiateCheckout` (optimization event), `Reservation`/`Purchase` count as a directional lower bound, and `BookingClick` on svora.place as the top-of-funnel check. Use 7-day click / 1-day view and compare to Fresha weekly.

---

## 3. Creative best practice for nail salons on Reels / Stories / Feed (2025–2026)

| Element | Guidance | Source |
|---|---|---|
| Format | 9:16, 1440×2560, MP4/MOV, ≤4 GB, up to 15 min; primary text ~44 characters; captions "optional but recommended"; sound "optional but strongly recommended"; avoid licensed music, GIFs, face effects, product tags; use original audio or Meta Sound Collection | [Meta Reels ad spec](https://www.facebook.com/business/ads-guide/update/video/instagram-reels) |
| Safe zones | Leave "at least 14% at the top, 35% at the bottom and 6% on both sides" free of text/logos (Reels); Stories 14/20/6; design to the Reels margin when running both; use the Safe Zone Guardrail in Ads Manager | [Meta Reels ad spec](https://www.facebook.com/business/ads-guide/update/video/instagram-reels); [Meta help 980593475366490 via 1ClickReport](https://www.1clickreport.com/blog/meta-ads-creative-safe-zones-2026-guide) |
| Feed images | 4:5 (1080×1350) for single image/carousel; 1:1 described as legacy | [1ClickReport](https://www.1clickreport.com/blog/meta-ads-creative-safe-zones-2026-guide) |
| Hook | "nail the hook within the first few seconds"; three hook types: value promise, statement of intent, question/invitation; A/B test hooks; Reels with music or voiceover deliver "up to 13% higher incremental conversions" (Meta claim) | [Meta via Social Media Today, Dec 2025](https://socialmediatoday.com/news/meta-shares-tips-on-reels-hooks-creative-diversification-in-ads-and-threa/808182) |
| Length and content | 15–30 s Reels showing a transformation in progress; time-lapse nail-art sessions; phone-shot client testimonials (UGC); clean before/after of real work; one offer, one CTA; avoid stock photos and carousels without a focal point | [Insidea](https://insidea.com/blog/marketing/beauty-salon/facebook-and-instagram-ads-strategy-for-beauty-salons) |
| Diversification | Meta recommends "a broad portfolio of assets that take more creative liberty across text, image, and video" rather than a fixed count, because the system matches creative to people | [Social Media Today](https://socialmediatoday.com/news/meta-shares-tips-on-reels-hooks-creative-diversification-in-ads-and-threa/808182) |
| Flexible ad format | Up to 10 images/videos per ad, up to 3 creative groups, Meta picks image/video/auto-carousel per placement; replaces Dynamic Creative for Sales/App campaigns; unavailable with Advantage+ catalogue ads | [Metricool](https://metricool.com/flexible-ads-meta/); [Signal](https://signalinc.com/meta-is-replacing-dynamic-creative-with-flexible-ad-format/) |
| Advantage+ creative enhancements | Can swap text, adjust brightness, add music/templates, turn images into video; "standard enhancements" bundle replaced by individual toggles in Marketing API v22 (Jan 2025); practitioner view: keep off, enable case by case; check account-level "Test New Optimizations" | [Meta developers blog](https://developers.facebook.com/blog/post/2025/01/17/marketing-api-v22-impacts-to-advantage-plus-creative-enhancements/); [Jon Loomer](https://www.jonloomer.com/qvt/4-reasons-advantage-creative-is-on/) |
| Placements | Advantage+ placements are the API default ([Meta developer docs](https://developers.facebook.com/docs/marketing-api/advantage-campaigns)); Reels CPM ~$13.90 vs Stories $16.20 cross-vertical, Instagram Stories 3.1% CTR among top beauty performers ([MHI, global](https://mhigrowthengine.com/blog/meta-ads-benchmarks-ecommerce-2026/)); Beauty & Fashion Reels CPM $6.40–11.20 vs Instagram Feed $10.80–17.20 ([Stackmatix, unsourced ranges](https://stackmatix.com/blog/meta-ads-cpm-beauty-fashion-benchmarks)); no published head-to-head of Advantage+ vs Instagram-only for local businesses ([Adamigo](https://www.adamigo.ai/blog/advantage-placements-vs-manual-placements)) |

Creative set for SVORA (recommendation, grounded in the above): (1) 15–20 s process ASMR Reel with value-promise hook ("190 zł — what you actually get"), (2) 10–15 s transformation reveal (nails only, no body-shaming copy), (3) crazy-art/3D showcase with "statement of intent" hook, (4) carousel of 6–8 recent works in 4:5, (5) phone-shot testimonial in Ukrainian/Russian, (6) static 4:5 price-anchor image. Build each with text inside the 14/35/6 safe area, native captions in the ad's language, Sound Collection audio.

---

## 4. Budget and testing methodology at 100–500 PLN/day

- **Spend per concept before judging:** minimum 3x target CPA, 5x preferred; keep after 3+ conversions, yellow at 2, cut at 0–1; default test window ~7 days, 10–14 days for small budgets/long cycles; "limit concepts so each receives at least 3x CPA over the test window" ([Flighted](https://www.flighted.co/blog/how-to-calculate-your-meta-ads-creative-testing-budget)).
- **How many ads:** Meta is cited as recommending "no more than six ads per ad set" ([Adamigo](https://www.adamigo.ai/blog/how-to-lower-creative-testing-costs-in-meta-ads)); for small budgets test ~3 well-designed variations each with a clear hypothesis ([Extuitive](https://extuitive.com/articles/meta-ads-creative-testing-framework)); single-ad-set 3–5 ad approach with manual budget review after 3–5 days ([Madgicx](https://madgicx.com/blog/meta-creative-ab-testing)); low-budget campaigns need "4–6 weeks minimum" where well-funded ones show results in 7–10 days ([Extuitive](https://extuitive.com/articles/meta-ads-minimum-budget-for-testing)).
- **Structure at this budget:** one campaign, 1–2 ad sets, consolidate events (Section 1.2). Platform minimums are far below SVORA's range (Shopify Polska cites ~4 zł/day minimum, ~20 zł/day recommended for traffic/sales, [Shopify PL](https://www.shopify.com/pl/blog/ile-kosztuje-reklama-na-facebooku)).
- **KPIs to watch weekly:** CPM (auction cost, by placement), CTR (link) — target above 1%, "below 0.5% suggests the creative or offer needs changing" ([Insidea](https://insidea.com/blog/marketing/beauty-salon/facebook-and-instagram-ads-strategy-for-beauty-salons)), CPC, cost per `InitiateCheckout`, `InitiateCheckout`→`Reservation` rate (Fresha), cost per Fresha-confirmed booking, frequency (rotate at 4–5, refresh creative after 3–4 weeks per Insidea).
- **Scaling rules:** Meta treats budget changes as possibly significant "depending on the magnitude" (no published percentage; [Scalemate](https://www.scalemate.co/blog/meta-ads-learning-phase-reset)); practitioners use ≤20%/day steps; graduate winners with 3+ conversions at ≥3x CPA spend, and an ad set still "learning" can be scaled if it has 5x CPA in spend and strong results ([Flighted](https://www.flighted.co/blog/how-to-calculate-your-meta-ads-creative-testing-budget)).

---

## 5. Benchmarks (flagged Poland vs global)

| Metric | Value | Geography / basis | Source |
|---|---|---|---|
| CPM | ~51 zł; CPC ~2.9 zł; CPL ~130 zł (Nov 2024) | PLN figures from bir.ch/Revealbot, not confirmed Poland-only | [Shopify PL](https://www.shopify.com/pl/blog/ile-kosztuje-reklama-na-facebooku) |
| CPM €2.50–6.00; CPC €0.15–0.45; CPL €2–8; CPA €5–30 | **Poland**, 2025 "mid-market averages", sources unnamed | [SoBirds](https://www.sobirds.com/how-much-do-facebook-ads-cost/) |
| CPM $5.55 (Germany $9.05, Czechia $5.70, UK $11.81, US $16.08) | **Poland**, e-commerce, 2026, no sample stated | [Lebesgue](https://lebesgue.io/facebook-ads/facebook-cpm-by-country) |
| CPM $5.50 (range $4.50–6.80); CPC $0.75 | **Poland**, 2026 projection from late-2025 data | [Adamigo](https://www.adamigo.ai/blog/meta-ads-cpm-cpc-benchmarks-by-country-2026) |
| CPM $14.19 (+20% YoY), CTR 2.19%, CPA $38.19; Beauty: CPA $37.92, CTR 2.27%, CVR 1.94%, ROAS 1.57 | **Global**, ~35,000 accounts, 2025, DTC-weighted | [Triple Whale via Influee](https://influee.co/pl/blog/facebook-ads-benchmarks); [Triple Whale](https://triplewhale.com/blog/facebook-ads-benchmarks) |
| Beauty & Cosmetics: CPM $21.40, CPC $0.96, CTR 2.23%, CVR 3.2%, CPA $30 (top 10%: CTR 4.24%, CPC $0.49) | **Global**, 1,247 accounts, $87M, 2025 | [MHI](https://mhigrowthengine.com/blog/meta-ads-benchmarks-ecommerce-2026/) |
| Beauty & Personal Care: Traffic CPC $0.50, CTR 2.73%; Leads CPC $2.97, CTR 1.35%, CPL $50.91, CVR 5.63% (all-industry leads CPL $27.39) | **Global/US-weighted**, LocaliQ + WordStream, updated Sep 2026 | [LocaliQ](https://localiq.com/blog/facebook-advertising-benchmarks/) |
| Beauty & Fashion by placement: Reels CPM $6.40–11.20 / CTR 1.5–2.4%; Stories $7.60–12.80 / 1.4–2.2%; IG Feed $10.80–17.20 / 1.0–1.6% | **Global**, unsourced ranges | [Stackmatix](https://stackmatix.com/blog/meta-ads-cpm-beauty-fashion-benchmarks) |
| Beauty CPC $1.81, CTR 1.16% | **Global**, 2025 | [TrendTrack](https://www.trendtrack.io/blog-post/meta-ad-spend-by-industry) |
| All-industry CPC $0.82, CPM $5.97 | **Global**, 5,200+ accounts, 2025 | [Vaizle](https://insights.vaizle.com/facebook-ad-benchmarks/) |

Salon-specific cost-per-booking data (all self-reported, small samples):

| Case | Numbers | Source |
|---|---|---|
| Premium nail & lash studio, NYC (Mar 2025) | $10,501 spend, $7.04 per conversation; 597 appointments is an estimate at an assumed 40% DM-to-booking rate (~$17.60/booking, derived) | [Teletype](https://teletype.in/@growth_marketing/2lY7ChFyGQ9) |
| Beauty salon, France | €160 spend, €0.18 CPC, 894 profile visits, 26 bookings (~€6/booking) | [Freelancehunt](https://freelancehunt.com/en/showcase/work/salon-krasi-frantsiyi/1936925.html) |
| Manicure master | $345.77 spend, CPL $2.23, "100 sales" | [Freelancehunt](https://freelancehunt.com/en/showcase/work/case-manicure-master/1889844.html) |
| PMU/lash salon, USA | $520 spend, 103 inquiries, $33 per acquired client | [Freelancehunt](https://freelancehunt.com/en/showcase/work/magiclook-beauty-salon-the/2008929.html) |
| Language school, Poland, Ukrainian-targeted campaign | €5.3 per client | [Freelancehunt](https://freelancehunt.com/en/showcase/work/reklama-targetowana-meta-ads-dla/1877651.html) |

Reading: Poland CPMs cluster around $5–6 / €2.5–6 (roughly a third of US levels), beauty CTRs of 1.5–2.5% are typical, and lead-objective CPLs for beauty are high ($51) versus traffic CPCs under $1. No reliable Poland-specific salon cost-per-booking exists; expect to build it from the first 4 weeks of data.

---

## 6. Policy pitfalls for beauty ads

- **Personal attributes.** Meta: "we don't allow advertisers to run ads that assert or imply the personal attributes of their audience" — including "direct or indirect assertions or implications about a person's race, ethnicity, religion, beliefs, age, sexual orientation…" ([Meta Ad Standards](https://transparency.meta.com/policies/ad-standards/objectionable-content/personal-attributes); mirrored by [ConductAtlas](https://conductatlas.com/platform/meta-ads/meta-advertising-policies/provision/CA-P-053227/prohibition-on-asserting-personal-attributes-in-ads/)). The trigger is "you" plus a protected attribute; rewrite with the offer as subject ([Stackmatix](https://www.stackmatix.com/blog/meta-ads-personal-attributes-policy)). For SVORA: write "Манікюр у Варшаві, обслуговуємо українською" (the salon's attribute), never "Ти українка у Варшаві?" (the viewer's). Language-matched copy is fine; nationality call-outs are not.
- **Personal health and appearance / before-after.** Meta's non-compliant examples centre on weight loss; "Ads for cosmetics, hair extensions, other similar cosmetic or non-permanent beauty products or digital editing apps aren't within scope of this policy" ([Meta Ad Standards](https://transparency.meta.com/policies/ad-standards/objectionable-content/personal-health-and-appearance)). Third-party reading: general cosmetics/hair/non-permanent beauty "may show before-and-after transformations provided they do not employ negative self-perception tactics", while weight-loss and injectables cannot use side-by-side comparisons; "idealized results" and copy that shames current appearance are barred for all ([AuditSocials](https://www.auditsocials.com/blog/meta-beauty-cosmetic-ads-before-after-photos-body-image-policy-2026)). A July 2026 policy revision reportedly replaced explicit body-image wording with a reference to unnamed prohibited claims, creating ambiguity ([ConductAtlas change log](https://conductatlas.com/change/2026-07-23-meta-ads-meta-advertising-policies-3936/)). Practical line for nails: before/after of nails is low-risk; avoid zoom-ins on "bad" hands with shaming copy ("ugly nails?"), avoid promising permanent results, and keep brow work (semi-permanent) framed as service, not correction of a defect.
- **Special ad categories.** Housing, employment, credit, and social issues/elections/politics; they strip age/gender/detailed targeting and widen location ([Meta help](https://www.facebook.com/business/help/298000447747885); [AuditSocials glossary](https://www.auditsocials.com/knowledge/glossary/sensitive-categories)). A nail studio falls in none. EU ads must declare a beneficiary and payer under the DSA ([Social Media Today](https://www.socialmediatoday.com/news/meta-implements-new-updates-eu-advertisers-evolving-requirements/653046/)); the DSA also bans profiling-based ads on special-category data, consistent with Meta's 2022 removal of ethnicity interests.
- **Minors.** No detailed/custom/lookalike targeting for under-18s ([Meta help](https://www.facebook.com/business/help/128066880933676)); click-to-Instagram-Direct ads cannot target under-18s ([Meta help](https://en-gb.facebook.com/business/help/198088077975174)). Set minimum age 18.
- **Advantage+ restrictions.** Advantage+ Sales previously allowed only country-level locations ([Jon Loomer](https://www.jonloomer.com/advantage-plus-shopping-campaigns/)); the 2025 flow allows location, min age, language and exclusions as controls, and some messaging metrics/features are unavailable "for businesses and ads delivered to and from Europe" ([Meta](https://www.facebook.com/business/ads/ad-objectives/lead-generation/lead-ads-with-messaging)). Advantage+ creative may add music/templates automatically; licensed music in Reels ads is discouraged by Meta's spec ([Meta Reels ad spec](https://www.facebook.com/business/ads-guide/update/video/instagram-reels)).

---

## 7. Recommended starting structure for SVORA (first month)

Assumptions: 150–250 PLN/day total in weeks 1–2, up to 300–400 PLN/day by week 4 if decision rules pass; Pixel installed on both svora.place (with consent gating) and Fresha; Fresha links carry `fbclid` + UTM.

**Pre-flight (week 0)**
1. Verify in Events Manager Test Events that `InitiateCheckout`, `AddPaymentInfo`, `Reservation`, `Purchase` arrive from fresha.com after consent, and `BookingClick`, `ViewContent`, `Contact` from svora.place.
2. Create custom audiences: site visitors 30d, Instagram engagers 90d, `InitiateCheckout` 14d excluding `Reservation` 14d (same Pixel ID, so Fresha events are usable).
3. Ad account: set Advantage+ creative "Test New Optimizations" and automatic adjustments off; min age 18 as an account-level control; EU beneficiary/payer filled.
4. Target cost per booking: set from unit economics (e.g., ≤ first-visit price of a 190 PLN hybrid manicure; tighten later). This is a business decision, not a benchmark.

**Campaign A — Prospecting (Sales objective, website, ~70% of budget)**
- Manual (non-Advantage+) campaign setup, ABO, **one ad set** so events pool (Sections 1.2–1.3).
- Optimization event: Fresha `InitiateCheckout`. Switch to `Reservation`/`Purchase` only when the ad set logs ~50 of those in 7 days (WeltPixel ladder) — unlikely in month 1; treat `Reservation` as the reported KPI meanwhile.
- Audience: pin drop on the studio, 6 km radius to start (within Insidea's 5–15 km), widen to 10 km if "Learning Limited" after 7 days; age 18–45; Advantage+ audience **on** with controls (location, min age) and interests only as suggestions (Conversios: manual targeting is suggested for hyper-local, but Meta's controls already hard-cap the radius; test both only if budget allows in month 2).
- Language: if the multi-language ad feature is available for Sales → Website, run one ad set with PL default + UK + RU + EN variants. If not, run Languages = Ukrainian, Russian as a control in this ad set and serve Polish/English via Advantage+ default in a second ad set only once budget reaches ≥300 PLN/day (otherwise both will be Learning Limited).
- Creative: 6 assets (Section 3 list) in one flexible-format ad plus 2 standalone Reels, so Meta can pick per placement while two hooks stay isolated for reading. Advantage+ placements on; review Reels vs Feed CPM/CTR breakdown weekly.
- Landing: svora.place service page with the Fresha deep link that carries `fbclid`; test a direct-to-Fresha variant in week 3 (expect lower CPC, worse retargeting pool).

**Campaign B — Retargeting (Sales objective, ~15%)**
- One ad set: site visitors 30d + IG engagers 90d + `InitiateCheckout`-not-`Reservation` 14d; exclude `Reservation` 30d. Optimize for `Reservation`/`Purchase` (volume will be small; "most bookings per dollar" per Insidea). Carousel of works + testimonial; cap frequency by rotating creative when frequency passes 4–5.

**Campaign C — DM test (Engagement → Instagram Direct, ~15%, weeks 2–4)**
- UA/RU-language Reels with "Напишіть нам — підберемо дизайн" CTA; optimize for Conversations; log every DM → booking manually in a sheet. This is the control arm for the hypothesis that immigrants book by DM rather than through Fresha (Meta's own data shows 22.8% lower median cost per message for Instagram Direct destinations, but no salon booking data exists).

**Decision rules (read every Monday; Fresha report is the source of truth)**

| Signal | Threshold | Action |
|---|---|---|
| Link CTR | <0.5% after 3 days | Replace hook/creative ([Insidea](https://insidea.com/blog/marketing/beauty-salon/facebook-and-instagram-ads-strategy-for-beauty-salons)) |
| Spend per creative ≥ 3x target cost per booking and 0–1 `InitiateCheckout` | at 7 days | Cut ([Flighted](https://www.flighted.co/blog/how-to-calculate-your-meta-ads-creative-testing-budget)) |
| Ad set "Learning Limited" | after 7 days | Widen radius / merge ad sets / keep IC as event; do not add ad sets ([Jetfuel](https://jetfuel.agency/what-is-the-meta-ads-learning-phase-how-to-exit-it-faster-in-2026/)) |
| Cost per Fresha-confirmed booking ≤ target for 2 consecutive weeks | week 3+ | Raise budget ≤20%/day steps (third-party rule; Meta says magnitude matters) |
| Campaign C cost per confirmed booking < Campaign A by >25% | week 4 | Shift 20% of A's budget to C and build a second DM creative set |
| Frequency > 4–5 in retargeting | any | Rotate creative |
| Week 4 review | — | Decide on Advantage+ Sales campaign only if a single ad set reached ~25–50 `Reservation` events/week; otherwise stay manual and consolidated |

Expected month-1 output: a Poland-specific CPM/CTR baseline per placement, a measured `InitiateCheckout`→`Reservation` rate, a first cost-per-booking figure reconciled against Fresha, and a verdict on DM vs Fresha booking paths for the UA/RU audience, which then sets month-2 scaling.

---

## Sources

- https://www.fresha.com/help-center/knowledge-base/online-presence/448-track-meta-pixel-ads
- https://developers.facebook.com/docs/meta-pixel/reference
- https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/fbp-and-fbc
- https://developers.facebook.com/docs/meta-pixel/implementation/gdpr
- https://www.facebook.com/legal/technology_terms
- https://developers.facebook.com/docs/marketing-api/advantage-campaigns
- https://developers.secure.facebook.com/docs/marketing-api/conversions-api/conversion-leads-integration/crm-integration/2-getting-started-with-integration
- https://developers.facebook.com/blog/post/2025/01/17/marketing-api-v22-impacts-to-advantage-plus-creative-enhancements/
- https://www.facebook.com/business/help/112167992830700
- https://www.facebook.com/business/help/273363992030035
- https://www.facebook.com/business/help/980593475366490
- https://www.facebook.com/business/help/298000447747885
- https://www.facebook.com/business/help/128066880933676
- https://en-gb.facebook.com/business/help/198088077975174
- https://en-gb.facebook.com/business/help/1852644738394400
- https://en-gb.facebook.com/business/help/594069204359830
- https://www.facebook.com/business/ads-guide/update/video/instagram-reels
- https://www.facebook.com/business/ads/click-to-message-ads
- https://www.facebook.com/business/ads/ad-objectives/lead-generation/lead-ads-with-messaging
- https://www.facebook.com/business/ads/meta-advantage-plus/leads
- https://transparency.meta.com/policies/ad-standards/objectionable-content/personal-attributes
- https://transparency.meta.com/policies/ad-standards/objectionable-content/personal-health-and-appearance
- https://conductatlas.com/platform/meta-ads/meta-advertising-policies/provision/CA-P-053227/prohibition-on-asserting-personal-attributes-in-ads/
- https://conductatlas.com/change/2026-07-23-meta-ads-meta-advertising-policies-3936/
- https://www.auditsocials.com/blog/meta-beauty-cosmetic-ads-before-after-photos-body-image-policy-2026
- https://www.auditsocials.com/knowledge/glossary/sensitive-categories
- https://www.stackmatix.com/blog/meta-ads-personal-attributes-policy
- https://stackmatix.com/blog/meta-ads-cpm-beauty-fashion-benchmarks
- https://www.scalemate.co/blog/meta-ads-learning-phase-reset
- https://jetfuel.agency/what-is-the-meta-ads-learning-phase-how-to-exit-it-faster-in-2026/
- https://www.jonloomer.com/qvt/learning-phase-10-or-50-events/
- https://www.jonloomer.com/meta-announces-big-changes-to-website-conversion-campaigns/
- https://www.jonloomer.com/qvt/aggregated-event-measurement-tab-is-gone/
- https://www.jonloomer.com/qvt/advantage-plus-campaign-setup-is-here/
- https://www.jonloomer.com/advantage-plus-shopping-campaigns/
- https://www.jonloomer.com/qvt/4-reasons-advantage-creative-is-on/
- https://www.jonloomer.com/glossary/location-targeting/
- https://searchengineland.com/new-update-to-meta-ads-location-targeting-404124
- https://weltpixel.com/blogs/news/which-event-should-a-low-volume-shopify-store-optimize-for
- https://aiadvantageagency.com/meta-advantage-campaigns/
- https://www.1clickreport.com/blog/advantage-plus-shopping-25-conversions-2026-guide
- https://www.1clickreport.com/blog/advantage-plus-shopping-best-practices-2026
- https://www.1clickreport.com/blog/meta-ads-creative-safe-zones-2026-guide
- https://www.conversios.io/blog/meta-advantage-audience-vs-detailed-targeting-2026-guide/
- https://www.adstellar.ai/blog/meta-ads-manager-expat-targeting-how-to-set-up-step-by-step
- https://www.pressreader.com/india/hindustan-times-east-up/20211111/281947431090766
- https://www.socialmediatoday.com/news/meta-implements-new-updates-eu-advertisers-evolving-requirements/653046/
- https://socialmediatoday.com/news/meta-shares-tips-on-reels-hooks-creative-diversification-in-ads-and-threa/808182
- https://www.foreplay.co/post/how-to-launch-a-geo-targeted-ads-in-facebook
- https://growwithsakib.com/meta-ads-for-local-business/
- https://insidea.com/blog/marketing/beauty-salon/facebook-and-instagram-ads-strategy-for-beauty-salons
- https://help.gohighlevel.com/support/solutions/articles/155000005250-boosts-over-balayage-the-local-ads-playbook-for-beauty-salons
- https://thestacc.com/blog/nail-salon-facebook-ads/
- https://metricool.com/flexible-ads-meta/
- https://signalinc.com/meta-is-replacing-dynamic-creative-with-flexible-ad-format/
- https://www.adamigo.ai/blog/advantage-placements-vs-manual-placements
- https://www.adamigo.ai/blog/how-to-lower-creative-testing-costs-in-meta-ads
- https://www.adamigo.ai/blog/cbo-vs-abo-choosing-the-right-budget-strategy
- https://www.adamigo.ai/blog/meta-pixel-gdpr-advertisers-guide
- https://www.adamigo.ai/blog/meta-ads-cpm-cpc-benchmarks-by-country-2026
- https://www.flighted.co/blog/how-to-calculate-your-meta-ads-creative-testing-budget
- https://www.flighted.co/blog/meta-ads-offline-conversions-guide-for-b2b-saas
- https://support.bookedin.com/hc/en-us/articles/45719519271700-How-to-setup-Ad-Tracking-with-Meta-Facebook-Instagram
- https://pixelflow.so/features/cross-domain-cookies
- https://datanostro.com/en/docs/learn/what-are-fbp-and-fbc-cookies/
- https://supergood.ai/docs/fresha-api
- https://extuitive.com/articles/meta-ads-creative-testing-framework
- https://extuitive.com/articles/meta-ads-minimum-budget-for-testing
- https://madgicx.com/blog/meta-creative-ab-testing
- https://www.hyperfx.ai/blog/abo-vs-cbo-meta-ads-2026
- https://segwise.ai/blog/abo-cbo-meta-ads-budget-strategies
- https://www.webtonic.io/blog/cbo-vs-abo-which-to-use
- https://mhigrowthengine.com/blog/what-is-campaign-budget-optimization/
- https://mhigrowthengine.com/blog/meta-ads-benchmarks-ecommerce-2026/
- https://www.shopify.com/pl/blog/ile-kosztuje-reklama-na-facebooku
- https://www.sobirds.com/how-much-do-facebook-ads-cost/
- https://lebesgue.io/facebook-ads/facebook-cpm-by-country
- https://influee.co/pl/blog/facebook-ads-benchmarks
- https://triplewhale.com/blog/facebook-ads-benchmarks
- https://localiq.com/blog/facebook-advertising-benchmarks/
- https://www.trendtrack.io/blog-post/meta-ad-spend-by-industry
- https://insights.vaizle.com/facebook-ad-benchmarks/
- https://teletype.in/@growth_marketing/2lY7ChFyGQ9
- https://freelancehunt.com/en/showcase/work/salon-krasi-frantsiyi/1936925.html
- https://freelancehunt.com/en/showcase/work/case-manicure-master/1889844.html
- https://freelancehunt.com/en/showcase/work/magiclook-beauty-salon-the/2008929.html
- https://freelancehunt.com/en/showcase/work/reklama-targetowana-meta-ads-dla/1877651.html
- https://notesfrompoland.com/2026/07/03/foreigners-now-account-for-15-of-warsaws-population/
- https://www.tvp.info/94136248/raport-gus-na-podstawie-tak-zwanych-sladow-zycia-na-koniec-2025-r-w-polsce-przebywalo-ok-388-mln-osob-w-tym-ok-23-mln-cudzoziemcow
