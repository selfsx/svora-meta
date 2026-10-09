# Andromeda and creative diversity — what it means for a 100–500 PLN/day local studio

Research date: 2026-10-09. Scope: Meta's ad retrieval/ranking stack (Andromeda, Lattice, GEM), what "creative diversity" means in practice, and portfolio sizing for SVORA NAILS. Complements `creative-playbook.md` (specs, pipeline, the 8-concept matrix) and `meta-ads-playbook.md` (objectives, structure, decision rules); this file does not repeat them.

Evidence grade: only §1 facts come from Meta. Everything about "entity IDs", similarity thresholds, ad counts and refresh cadence is practitioner interpretation; **Meta has published no document defining what counts as a duplicate** (searches for one found none; several agencies explicitly note this). Treat numbers as starting points to test in our own account.

## What this changes for SVORA

1. Build the first wave as **8–10 conceptually distinct ads in one broad ad set**, not 40 variants of 4 photos. Ten overlay/crop/colour variants of one shot are one ad to the system (practitioner claim, §2).
2. A translation (PL/UA/RU/EN overlay on the same clip) is **not a new concept**. Language variants earn their place because they reach a different language audience, not because they add diversity; do not stack translated twins inside one ad set.
3. The diversity axis that matters most is **concept/angle/persona and visual world**, then format and talent; hook, length, aspect ratio and sound are execution layers (§2).
4. Types that **cannot come from nail close-ups alone**: founder talking head, studio-life/POV, client UGC/testimonial, price/offer, meme/text-only, social-proof screenshots. Use the owner's real reels for these; do not generate faces (see `creative-playbook.md` §1, §2).
5. At 100–500 PLN/day keep **one prospecting ad set** (plus retargeting only if audience size allows); consolidation beats splitting, and 50 optimisation events/week per ad set is the stability benchmark practitioners quote (§3). IC (not purchase) is what makes that reachable.
6. Rotate **2–3 new distinct concepts every 1–2 weeks** rather than mass-producing; fatigue windows are reported at 2–4 weeks, but this is vendor data (§3, §4).
7. Group the matrix in the manifest by a `concept-angle` key (visual world + angle + persona) so "same ad" can be audited: if you can describe all live ads in one sentence, or the ads look identical with the overlay removed, the set is under-diversified (§2).
8. Do not treat Advantage+ enhancements (crop, brightness) or flexible-format asset mixing as diversity; they diversify delivery, not concepts (§3).
9. Language: default to **language-targeted ad sets with native creatives** (matches the naming law's `lang` tag); keep sibling concepts different across languages rather than translating 1:1 (§3, inference).
10. Read results at the concept level (hook type, persona, format) not ad level; a few thousand impressions per variant is the floor for a directional read (§4).

---

## 1. What Andromeda actually changed

Meta's engineering post (2 Dec 2024) describes Andromeda as the **retrieval** stage of ads: it narrows "tens of millions" of candidate ads to a few thousand for later ranking, handling roughly three orders of magnitude more candidates than later stages. Ranking still makes the final selection. It replaced retrieval built from isolated model stages and rule-based heuristics with a deeper network and a hierarchical index; Meta reports +6% recall and +8% ads quality on selected segments, a 10,000x increase in model capacity with sublinear inference cost, and >100x feature-extraction throughput. Earlier retrieval had "limited personalization"; Andromeda captures higher-order person–ad interactions. Meta says the index exists partly to cope with the growth in creatives from Advantage+ and GenAI tools (post cites >1 million advertisers creating >15 million ads in a month with GenAI). Source: https://engineering.fb.com/2024/12/02/production-engineering/meta-andromeda-advantage-automation-next-gen-personalized-ads-retrieval-engine/

Later layers:

- **GEM** (ranking foundation model). Meta's August 2026 engineering post reports, for GEM sequence modelling plus broader model work, a cumulative +6% conversions on Instagram, +3% on Facebook and +3.5% ad clicks on Facebook (Meta-attributed, not independently verified): https://engineering.fb.com/2026/08/05/ml-applications/from-user-sequences-to-scaling-laws-a-multi-stage-architecture-for-metas-ads-ranking/ .
- **Lattice**: descriptions conflict (consolidated ranking layer per https://www.moburst.com/blog-meta-advantage-andromeda-lattice-and-gem-explained/; infrastructure under Andromeda per the Motion talk). Meta's own Lattice post not retrieved; unverified, and it does not change the advice.
- **Meta's advice to advertisers.** In Dec 2025 Meta told advertisers to embrace "creative diversification as a foundational best practice": a broad asset portfolio across text, image and video rather than a fixed number of refined creatives, because more distinct options give the system more ways to match a message to a person; Advantage+ tools absorb the volume. Meta-reported lifts for image generation: +11% CTR, +7.6% CVR (https://www.socialmediatoday.com/news/meta-shares-tips-on-reels-hooks-creative-diversification-in-ads-and-threa/808182). This is the only primary-origin statement about creative diversity; the Social Media Today piece is a reporter's summary of Meta's guidance.

**Why "creative is the targeting".** The retrieval step must pick a few thousand ads per person before budget, bid or audience settings matter; the creative's content (what it shows, says, sounds like) is the main per-ad signal available to it. Jon Loomer relays Meta's line: "the levers you pull related to targeting are found in the ads now" (https://pubcast.jonloomer.com/do-you-need-separate-ad-sets-for-customer-personas/). Practitioners add that an ad outside the shortlist is unaffected by budget or structure (Motion talk); its "semantic fingerprint" mechanism is the speaker's interpretation.

## 2. What "creative diversity" means operationally

### Axes, ordered by how consistently practitioners rank them

No controlled evidence ranks the axes; this is the direction across sources (moderate confidence).

1. **Concept / angle / persona** (pain point or desire plus emotional trigger, for which customer). Motion's talk calls persona, segment, angle and funnel stage the "Main Creative Dimensions" and visual hook, style, format and talent the "Testing Dimensions" (executions of an angle) (https://motionapp.com/library/talk/andromeda-2-0-explained-how-meta-s-algorithm-actually-picks-your-winning-ads/). Common Thread: awareness stage, emotional state, format, use case, persona (https://commonthreadco.com/blogs/coachs-corner/meta-andromeda-roas-creative-strategy-2026). 303 London adds that "the thumb-stopping visual should differ radically" (https://www.303.london/blog/complete-guide-to-creative-diversity-for-meta-andromeda).
2. **Visual world / format**: UGC vs polished studio, talking head vs close-up vs static vs carousel vs partnership ad (Motion; https://www.superads.ai/blog/creative-diversity-in-ads).
3. **Who is on camera**: a testing dimension in Motion's taxonomy; partnership ads are their own layer.
4. **Hook**: videos with similar openings are said to read as near-identical (SuperAds, no source). Meta says to test value-promise, statement-of-intent and question hooks (`creative-playbook.md` §1).
5. **Length, aspect ratio, sound**: no source says these create a new concept; treat as placement fit.
6. **Copy, headline, overlay text**: consistently reported as not diversity.

### What counts as "the same ad"

- Similar-looking ads group and compete for one slot "even if the copy, CTA, or headline differs" (Recharm, which admits its Entity ID claim is uncited: https://www.recharm.com/blog/what-is-andromeda-and-creative-similarity).
- "Ten variations of one static product shot get one distribution slot" and "if all active ads can be described in one sentence" you have a clustering problem (Common Thread; internal data, no methodology; its "<40% similarity" figure is unexplained).
- Audit test: remove the overlays; if the ads still look the same they are near-duplicates (303 London).
- Colour, headline or CTA swaps, or the same creator in slightly different shots, are the same ad (https://ppchero.com/?p=31064).
- Loomer, via a search summary (page returned 403): similar variations are not diversity unless "distinctly different enough" (https://www.jonloomer.com/qvt/how-many-ads-is-too-many/).

**Do translated overlays help or hurt?** No source tests it. By the overlay-removed test, PL/UA/RU versions of one clip are the same ad, so inside one ad set they add no diversity and plausibly add redundancy. Spoken-language variants differ in audio, which the "semantic fingerprint" reportedly includes (Motion, interpretation), but nothing verifies it separates them. Inference: a translation reaches speakers of that language; it is not diversity (§3).

Caveat: "Entity ID" is, in the Motion speaker's words, "an industry term, not an official Meta one"; I found no Meta confirmation, nor whether Ads Manager shows it. Use it as a heuristic that agrees with Meta's own "diversify" advice, not as a mechanism to engineer against.

## 3. Portfolio sizing for a local service business at 100–500 PLN/day

**No source gives a number validated for budgets this small.** Synthesis:

| question | what sources say | confidence |
| --- | --- | --- |
| Distinct creatives live | Small business: 3–5 genuinely different (303 London). SuperAds: "a few distinct concepts" small, 15+ large. Motion: 15–20 per ad set (large accounts). Common Thread: 8–12 new per month under $10K/month. Loomer: beyond 2–3 is advised, he runs 50 in one ad set, but "only the largest budgets can sustain the higher ad volumes" (search summary of https://www.jonloomer.com/qvt/how-many-ads-is-too-many/). | low; sources differ 5x |
| Old "max 6 ads" guidance | Reported dropped in 2025 (SuperAds: early 2025; Loomer: February, probably Andromeda, never stated by Meta). | medium; date unclear |
| Structure | Few ad sets; split only for real audience/objective/geo differences or prospecting vs retargeting (https://ppchero.com/?p=31064; https://www.balistro.com/blog/meta-andromeda-budget-strategy-2026: 3–5 ad sets). Loomer: no ad set per persona, "only split them up because your results say that you should" (https://pubcast.jonloomer.com/do-you-need-separate-ad-sets-for-customer-personas/). Motion: no format-based splits. | medium |
| Learning | ~50 events per ad set per week is the common figure (Balistro). Meta's learning-phase page was not retrievable. Practitioner formula: daily budget ≈ target CPA x 50 / 7. | medium |
| Refresh | Fatigue window 2–4 weeks, 2–3 new distinct creatives per week at moderate spend (Common Thread, internal data); give new ads 4–7 days before kill decisions (search summary). | low |

SVORA arithmetic (my inference): 50 events/week is about 7/day, so 100 PLN/day needs a cost of at most ~14 PLN per optimisation event, 500 PLN/day at most ~70 PLN. No Polish salon CPA exists (`README.md` gaps); IC as the event (`meta-ads-playbook.md`) is what makes consolidation viable, and at the low end one ad set may stay in learning. Hence **one prospecting ad set with ~8–10 distinct ads** at the start: a compromise between the 3–5 small-business figure and the 15–20 large-account figure, justified by low production cost and by wave 1 being a test of which concepts get retrieved.

**Flexible format / Advantage+ Creative.** Flexible: up to 10 images/videos, 5 texts, 5 headlines, 5 descriptions; Loomer says it finds the best combination per person, so it is a fatigue/delivery tool, not a split test (search summary of https://www.jonloomer.com/flexible-ad-format/, 403). Dynamic Creative is reportedly restricted for new Sales ad sets (2026 comparison via search summary; verify for our objective). I could not confirm whether flexible and Advantage+ Creative stack. Count a flexible ad as one ad for diversity. Keep Advantage+ text translation off (`creative-playbook.md` §5).

**Languages: ad set or creative?** No source addresses language splits under Andromeda. Reasoning: language targeting is a real audience difference (the case consolidation advice accepts for splitting); translated twins are one signal repeated. Recommendation: **one ad set per language group (as the naming law's `lang` tag already does), each holding native creatives that are distinct concepts from each other.** A concept may repeat across language ad sets, never within one. If budget cannot carry two, run the dominant language first. Multi-language ads: limits in `creative-playbook.md` §5. An hypothesis for month 1, not settled.

## 4. Near-identical ads in one ad set

- **Meta documents nothing** on duplicate handling; its diversification advice only implies sameness limits reach. Editing/adding ads can restart learning per Meta's help centre, but I could not verify the current text; one practitioner test saw no restart (https://www.dataslayer.ai/blog/meta-ads-changes-2025-83-updates-that-changed-facebook-advertising-forever, via search summary).
- **Claimed (agency, mostly unsourced):** similar ads share one auction slot ("Dozens of similar ads = 1 entity ID = 1 ad = 1 auction opportunity", Motion slide summary). Similarity is structural; fatigue is time/frequency; rotation fixes only the second (Motion). "High creative similarity, higher CPMs" (SuperAds, unsourced); a +20–30% cost figure is attributed to Partner & Soehne but the quoted passage has no figure (303 London). Do not rely on either.
- **Learning fragmentation** is raised mainly for too many ad sets, not too many ads (PPC Hero; Balistro).
- **Fatigue size:** SuperAds cites Meta research of about -45% conversion likelihood after four repeat exposures and CTR -40% at similar frequency (no link). Intuition only; a Warsaw-radius audience at this budget will reach high frequency fast, which is the real reason to rotate concepts.
- **Read floor:** a few thousand impressions per variant for a directional read (SuperAds).

Net: near-duplicates waste slots and signal; nobody has measured a penalty. Avoiding them is cheap because the SVORA source pool already holds distinct visual worlds.

## 5. Diversity matrix for SVORA — first wave

Sources: owner's Instagram (nail close-ups, founder talking-head reels in Ukrainian, studio-life reels, client UGC). Each type below is a distinct *visual world + angle + persona* — what to separate so the overlay-removed test passes. For pipelines and prompts see `creative-playbook.md` §2–4; for which posts qualify see `instagram-archive-analysis.md`. Prices, offers and claims only from `settings/brand.yaml`; client UGC needs permission.

| # | type | one-line description | why it is a distinct retrieval signal | close-up-only? |
| --- | --- | --- | --- | --- |
| 1 | Hero close-up motion | Finished set, hand turning in light, 6–10 s, no talking | Product-aesthetic world; the baseline "this is the work" | Yes |
| 2 | Before / after | Bare or old nails → finished set, split or hard cut | Transformation angle, proof not beauty | Mostly (needs "before" photo; a mid-process still helps) |
| 3 | Process / ASMR | Filing, gel, topcoat, hands at work, tool sounds | Craft/expertise angle; different visuals and audio from #1 | Needs process footage (studio-life reels), not stills |
| 4 | Founder talking head (UA) | Owner speaks to camera about what to expect / why Svora | Person-led, trust angle; human face and speech are a very different frame from objects | **No** — real footage; AI non-English lip-sync is weak (`creative-playbook.md` §1) |
| 5 | Studio-life / POV "your 90 minutes" | Walk-in, chair, tea, atmosphere | Experience/convenience angle; environment replaces product | **No** — studio reels |
| 6 | Client UGC / reaction | Client shows the nails, reacts, tagged | Peer-proof angle, lo-fi vs polished; potential partnership ad (Motion: its own diversity layer) | **No** — needs permission |
| 7 | Review / testimonial card | Real review text on brand background, one quote | Social-proof angle in a text-led visual world | **No** — needs real reviews |
| 8 | Price / offer static | Single offer with the fact from `settings/brand.yaml`, nothing else | Value/transaction angle; text-led; for warm or price-sensitive users | Partly — photo background, offer is data |
| 9 | Colour/design choice ("which would you pick?") | Three sets side by side, question hook | Interaction/curiosity angle; carousel or static, comparison format | Yes |
| 10 | Location/convenience | Wola street, entrance, how to find us, hours, booking steps | Local-intent angle; geography and logistics, not looks | **No** — needs location footage |
| 11 | Meme / plain-text hook | Text on plain background, a relatable nail-day line | Native-feed lo-fi world; the least "ad-like" frame | **No** — copy-led (check tone vs premium positioning) |
| 12 | Seasonal / trend set | Autumn/winter palette, event nails | Occasion/timing angle (gift, party); refreshable cadence slot | Yes |

Wave 1 recommendation: build **#1, 2, 3, 4, 5, 6, 8, 9** (eight) as the minimum; add #7 and #10 if footage/reviews exist; hold #11 and #12 for week 2–3 refreshes. At most two of the eight may be close-up-derived stills or clips of the same photo — more than that and the set fails the "one sentence" test. Types #4–#7 and #10 cannot be made from product close-ups alone, so the first-wave plan depends on owner footage; if it does not exist yet, record it (a founder talking-head and a studio walkthrough on a phone is enough) before launch. Languages are applied afterwards per §3: each ad set is a language group with these types in that language, not 12 × 4 translated twins in one set.

Operator inputs needed: talking-head and location footage, UGC permissions, confirmed offers for #8 (`settings/brand.yaml`).

---

## Sources

Meta (primary):
- https://engineering.fb.com/2024/12/02/production-engineering/meta-andromeda-advantage-automation-next-gen-personalized-ads-retrieval-engine/
- https://engineering.fb.com/2026/08/05/ml-applications/from-user-sequences-to-scaling-laws-a-multi-stage-architecture-for-metas-ads-ranking/ (figures seen only via a search summary, not opened)
- https://www.facebook.com/business/help/112167992830700 (learning phase; body not retrievable, title only)

Meta guidance as reported:
- https://www.socialmediatoday.com/news/meta-shares-tips-on-reels-hooks-creative-diversification-in-ads-and-threa/808182

Practitioners (interpretation; none is Meta documentation):
- https://pubcast.jonloomer.com/do-you-need-separate-ad-sets-for-customer-personas/ (fetched)
- https://www.jonloomer.com/qvt/how-many-ads-is-too-many/ (403; used via search summary)
- https://www.jonloomer.com/flexible-ad-format/ and https://www.jonloomer.com/qvt/goal-of-dynamic-creative-flexible-ad-format/ (403; via search summary)
- https://motionapp.com/library/talk/andromeda-2-0-explained-how-meta-s-algorithm-actually-picks-your-winning-ads/ (talk summary, first 100k characters read)
- https://commonthreadco.com/blogs/coachs-corner/meta-andromeda-roas-creative-strategy-2026
- https://www.superads.ai/blog/creative-diversity-in-ads
- https://www.303.london/blog/complete-guide-to-creative-diversity-for-meta-andromeda
- https://www.recharm.com/blog/what-is-andromeda-and-creative-similarity
- https://ppchero.com/?p=31064
- https://www.balistro.com/blog/meta-andromeda-budget-strategy-2026
- https://www.moburst.com/blog-meta-advantage-andromeda-lattice-and-gem-explained/
- https://www.dataslayer.ai/blog/meta-ads-changes-2025-83-updates-that-changed-facebook-advertising-forever

Not verified / not found: Meta documentation of Entity ID or similarity grouping; Meta text on ad-count limits; any Andromeda-specific evidence for language splits or for budgets under ~$10K/month; Polish-language practitioner analyses (a Polish query returned only English/other-market agency blogs and an English-language summary; no Polish primary source was found).
