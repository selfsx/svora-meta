# SVORA NAILS — Creative Playbook for AI-Generated Meta Ads

Research date: 2026-10-08. Scope: a few hundred Meta ad creatives for a premium nail studio in Warsaw, generated from @svora.nails photos (3024x4032, i.e. 3:4) and 720p reels, using Seedance 2.5 (OpenRouter `/api/v1/videos`), Nano Banana image models (OpenRouter), and ffmpeg / ImageMagick / headless Chrome for overlays. Languages: PL, UK, RU, EN.

Where a figure comes from a vendor blog rather than Meta/ByteDance/Google documentation, it is marked as such. Meta's own ads-guide pages block automated fetching; the official safe-zone help article exists ("Nakładki tekstowe i bezpieczna strefa w przypadku reklam w relacjach i rolkach", facebook.com/business/help/980593475366490) but its numbers had to be taken from third parties that cite it. Verify in Ads Manager's safe-zone preview before launch.

---

## 1. What nail/beauty creatives perform on Meta in 2025–2026

### Formats, ranked for a local nail studio

No published, nail-specific performance benchmark exists; the ranking below combines Meta's 2025 Reels guidance, beauty-category vendor data, and the observed ad library of a nail brand (Static Nails runs ~47 active Meta ads, ~3 new creatives/week, leaning on UGC/testimonial video and before/after visuals — motionapp.com/library/static-nails).

1. **Result close-ups with hand motion (9:16 video, 6–15 s)** — the nail design is the product; motion (fingers fanning, hand turning in light) is what Seedance adds cheaply to a still. Highest volume cell in the matrix.
2. **Transformation / before→after** — the most-recommended salon format in salon-marketing guides (Booksy, Pure Spa Direct); works as a 2-shot video (first_frame = bare/old nails, last_frame = finished set) or a split static.
3. **Process / ASMR** — filing, gel application, topcoat shine. No source measures ASMR nail ads; treat as a test cell. Meta's own data says Reels using both speech and music are 2× more likely to drive brand interest (Meta/Toluna study via houseofmarketers.com, Dec 2025), so pure ASMR without a voice line may underperform a VO version.
4. **"POV" / talking-head UGC** — Meta reports Partnership (creator-handle) ads outperforming standard creative (stackmatix.com beauty guide, vendor claim). Seedance 2.5 can generate a talking face with dialogue, but non-English lip-sync and pronunciation are weaker (videoai.me limitations, Apr 2026; MindStudio review Aug 2026 noted "I know" → "I low" style errors). Keep AI talking heads to EN, or use real client footage.
5. **Carousel of works (1:1, 2–10 cards)** — cheap, uses photos as-is; good for Feed retargeting with per-card price/offer.
6. **Static with price/offer (4:5 Feed, 9:16 Story)** — quick to produce with Nano Banana + overlays; best for warm audiences and promos.
7. **Testimonials** — screenshot-style reviews on brand background; low cost, moderate performance, strong for trust in a premium positioning.

Meta's 2025 message is creative *diversification*: give Advantage+ a broad portfolio of text/image/video rather than a fixed count (socialmediatoday.com, Dec 17 2025). That is the argument for the matrix in §6.

### Hook patterns (first 1–3 s)

Meta names three hook types: **value promise** (benefit first), **statement of intent** ("here is what you'll see"), and **question/invitation** (curiosity, "which one would you pick?") and tells brands to A/B test them (socialmediatoday.com, Dec 2025). Meta/Toluna: creatives showing brand + primary message within the first 5 s are 1.7× more likely to drive high purchase intent; a combined visual + audio hook is 1.5× more likely (houseofmarketers.com, Dec 3 2025). Practical hooks for nails:

- Value promise: "Manicure, który wytrzyma 4 tygodnie" / "Манікюр, що тримається 4 тижні".
- Statement of intent: "3 najczęściej wybierane kolory jesieni w Svora".
- Question: "Nude czy wiśnia? 👇" / "Який з трьох обрала б ти?"
- Visual hook: the finished set already in frame at t=0 (never start on a blank background).

### Length, captions, sound

- Reels: 15–30 s is the vendor consensus sweet spot; Meta's Reels guide says focus on one concept per video (websitebuilderexpert.com summary). For a product-on-screen ad, 6–12 s is enough and halves Seedance cost.
- Captions/overlay: Meta/Toluna reports subtitles + voiceover makes a creative 1.8× more likely to boost brand interest; music or voiceover is linked to up to 13% higher incremental conversions (socialmediatoday.com). Burn in captions — most viewing is sound-off.
- **Trending audio is not usable in ads.** Instagram's licensed music library is for personal, non-commercial use; ads, boosts and partnership ads need Meta Sound Collection, original audio, or a track licensed for advertising (usethirdchair.com, auditsocials.com 2026). Plan: Seedance `generate_audio: true` for ambient/SFX, or Sound Collection tracks added in ffmpeg.

### Aspect ratios, safe zones, specs

- Reels/Stories: 9:16, 1080×1920, MP4/MOV, H.264, ≤30 fps, ≤4 GB (keep <1 GB), Reels up to 90 s, Stories up to 120 s (tryvizup.com 2026 spec guide; bestever.ai). Feed: 4:5 1080×1350 (or 1:1 1080×1080); carousel 1:1. Images ≤30 MB JPG/PNG.
- **Safe zone at 1080×1920** (most-cited, attributed to Meta's help article): top 14% = **269 px**, bottom 35% = **672 px**, sides 6% = **65 px**; bottom-right rail 40% (768 px) — working area ≈ 950×979 px from y=269 to y=1248 (adsuploader.com, updated Jul 31 2026). AdKit's independent measurement (Sep 2026) gives top 268.8 / bottom 672 / sides 64.8 px plus a 226.8 px right-hand exclusion below y=1152 for the engagement rail. Ads with a disclaimer must keep the bottom 40% clear. Facebook Stories video is more lenient (bottom 384 px).
- 4:5 Feed: keep ~250 px top/bottom margin (adsuploader, not Meta-attributed).
- Text-on-image: the 20% text rule was dropped in September 2020; Meta still says images with <20% text perform better and heavy text can reduce delivery (adzooma.com, socialmediatoday.com). Keep one headline or one offer per creative.

---

## 2. Seedance 2.5 prompting (OpenRouter `bytedance/seedance-2.5`)

### API facts (OpenRouter model page + `/api/v1/videos/models`)

- `duration` 4–30 s (integer). `resolution` 480p or 720p only (no 1080p via OpenRouter today). `aspect_ratio` 16:9, 4:3, 1:1, 3:4, 9:16, 21:9. Sizes: 480×854 / 720×1280 (9:16), 640×640 / 960×960 (1:1), 560×752 / 834×1112 (3:4).
- **There is no 4:5.** For Feed 4:5 either generate 3:4 (834×1112 — which matches the 3024×4032 source photos natively) and letterbox/crop to 1080×1350, or generate 9:16 and centre-crop.
- `frame_images` (array of `{type:"image_url", image_url:{url}, frame_type:"first_frame"|"last_frame"}`), `input_references` (array of image_url), `generate_audio` (bool, defaults true where supported), `seed` (not guaranteed deterministic), `callback_url`, passthrough `watermark`, `req_key`, `output_format`. If both `frame_images` and `input_references` are sent, `frame_images` takes precedence (OpenRouter video docs). `prompt` is optional when `frame_images` is set.
- Async: POST returns 202 + `id`; poll `GET /api/v1/videos/{id}` (pending → in_progress → completed/failed); download `GET /api/v1/videos/{id}/content?index=0` with the Authorization header. Poll every ~30 s; generations take 30 s to several minutes.
- **Cost.** OpenRouter bills per video token: `video_tokens` $0.0000107, `video_tokens_with_video_input` $0.0000064; the model page summarises as "from $0.1028/s". MindStudio's measured rates: ≈$0.10–0.12/s at 480p, ≈$0.23/s at 720p (~52% above Seedance 2.0). So a 6 s 720p 9:16 clip ≈ $1.4, 10 s ≈ $2.3, 30 s ≈ $6.5+. Each poll response carries `usage.cost` — log it per creative. For 300 clips at 8 s/720p budget ≈ $550; at 480p ≈ $280. Test at 480p, render finals at 720p.
- 720p → Meta wants 1080p "recommended; higher downscaled". Upscale 720×1280 → 1080×1920 with ffmpeg `scale=1080:1920:flags=lanczos` (acceptable for phone playback) or run finals through a proper upscaler.

### What ByteDance says about 2.5

Announced at Volcano Engine FORCE (June 2026), public from ~31 Jul/7 Aug 2026: 30 s in a single run, multi-turn extension, up to 30 images + 10 videos + 10 audio references, rolled out via Jimeng/Doubao with API on Volcano Ark/BytePlus (technode.com, Jul 31 2026). No official prompt guide for 2.5 was retrievable; the community guides below are for 2.0 and still apply to the prompt grammar.

### Prompt structure for hands/nails image-to-video

Community consensus (dev.to/xapm, blog.picassoia.com, redreamality.com, fliki.ai): the image already defines appearance — the prompt should describe **motion, camera, light, sound, constraints**, in that order, and name one subject, one action, one camera move. Extra adjectives and a second action are the top causes of mushy output (hooked.so/prompts/seedance).

Template (first_frame = the nail photo):

```
Slow 3-second dolly-in on the hand, then hold. The hand rotates gently
from palm-down to a 30° tilt so the gel topcoat catches a soft studio
key light; fingers stay relaxed and slightly fanned. Nail design, colour
and length stay exactly as in the reference image. Shallow depth of
field, warm cream background, no camera shake, no cuts.
Audio: quiet salon ambience, soft gel-brush sound, no music, no speech.
```

Rules that matter for nails specifically:

- **Hands are a known failure zone**: "hand drift in extreme close-up", extra/merged/backward fingers (videoai.me limitations, Apr 2026). Mitigate by: medium-close framing (whole hand in frame, not two fingertips); slow, single-direction motion ("flicker usually means the motion prompt is too complex", wavespeed.ai); explicit constraints "five fingers, fingers do not cross or overlap, nails do not change shape"; budget 2–3 takes per hero clip and auto-reject with a quick VLM check for finger count.
- **Design fidelity**: use the photo as `first_frame` (not only as a reference) — frame mode copies pixels at t=0; reference mode only approximates ("output is only an approximation of the intended composition", pixo.video). Add the same image as `input_references` is pointless on OpenRouter (frame wins), and ByteDance's native API rejects mixing first-frame with reference media (docs.apiyi.com, Sep 2026). Keep motion short so the nails never leave frame; the longer the clip the more the pattern drifts.
- **Source quality sets the ceiling**: clean, well-lit, uncluttered, no text overlays, no compression artefacts on the input (seedance.tv, sagnikbhattacharya.com). Pre-clean with Nano Banana (§3) before animating.
- **First + last frame** for before/after: `first_frame` = prep/bare nails, `last_frame` = finished set, prompt "hard cut / time-lapse to the finished manicure, same hand position, locked tripod". Match aspect ratio and hand position between the two stills (seedance.tv first-and-last-frame guide).
- **Multi-shot** (videoai.me multi-shot guide): one global style sentence, then `Shot 1:` / `Shot 2:` / `Hard cut to` blocks, one camera + one action + one lighting recipe each, a shared anchor (same hand, same cream backdrop), global render notes **at the end** (model follows closing notes best), max 5 shots, 200–300 words. For nails: Shot 1 hook close-up → Shot 2 process beat → Shot 3 finished hand with CTA space left empty for an overlay.
- **Audio prompting**: dialogue in quotes inside a shot block; SFX named explicitly ("ceramic ping"); negative cues in closing notes ("No music"). One guide reports Volcengine syntax using `{dialogue}` and `<sfx>` brackets (hooked.so) — unverified; plain quotes work across providers. Reference tags are `@Image1`/`@Video1` in English front-ends, `图片1` on Volcengine (seedance2.so).
- **Resolution/duration tradeoff**: 480p for all exploration and for Stories that will be heavily overlaid; 720p for finals. 4–8 s for close-ups; 10–15 s for before/after or 3-shot; 30 s only for narrative UGC.

### What Seedance does badly → mitigation

| Weakness (2.0 docs; 2.5 reviews concur) | Mitigation |
|---|---|
| Text rendering = "glyph soup"; logos unreliable | Never ask for on-screen text; render all text and logos in post (§4). Prompt "no text, no logo, no watermark". |
| Extra/merged fingers in extreme close-up | Medium framing, slow motion, 2–3 takes, automated finger-count QA. |
| Gesture misreads (hand near face → kiss) (MindStudio 2.5 review) | Keep hands away from faces; hands-only scenes. |
| Non-English speech/lip-sync weaker | EN only for AI VO; PL/UK/RU via TTS or burned captions. |
| Fast complex motion warps | "slow", "gentle", single direction. |
| Reflections/mirrors wrong | Avoid mirrors and glossy tables in the source photo. |
| Non-determinism (`seed` not guaranteed) | Store prompt + seed + job id; re-roll rather than expect reproduction. |

---

## 3. Nano Banana (Gemini image) for ad statics

### Models and cost (ai.google.dev pricing, Oct 2026)

| Model (OpenRouter id) | Google list price / image | Notes |
|---|---|---|
| `google/gemini-2.5-flash-image` | $0.039 (1K only) | **Deprecated; Google shut it down 2 Oct 2026** — do not build on it. |
| `google/gemini-3.1-flash-image` (Nano Banana 2) | $0.045 (0.5K), $0.067 (1K), $0.101 (2K), $0.151 (4K) | Workhorse. Up to 14 reference images; 512/1K/2K/4K. |
| `google/gemini-3-pro-image` (Nano Banana Pro) | $0.134 (1K/2K), $0.24 (4K); ~$0.0011 per input image | Best text and complex composition; 6 object + 4 character + 3 style refs. Thinking always on and billed. |

Google's docs now list `gemini-nano-banana-2.1` as the recommended default and `gemini-3.1-flash-lite-image` as cheapest (1K only, weak at multi-reference) — check whether OpenRouter exposes them. OpenRouter endpoint: `POST /api/v1/images` with `model`, `prompt`, `n`, `aspect_ratio`, `resolution`, `input_references` (≤14 URLs/base64); response is `data[i].b64_json`; `usage.cost` per call. Google batch tier is half price if you can tolerate 24 h turnaround (not via OpenRouter).

### Capabilities relevant to product-photo editing

- **Background change / colour grading**: inpainting-style prompts — "Using the provided image, change only the background to a seamless matte cream (#F7F1EB) studio sweep; keep the hand, nails, lighting and composition exactly the same" (developers.googleblog.com prompting guide). Edits generally preserve the input aspect ratio; with multiple inputs the output takes the ratio of the **last** image — pass a correctly sized blank as the final reference when you need 4:5 or 9:16.
- **Brand colours**: the models follow named hex/colour descriptions well for backgrounds and props ("add a vivid orange (#FF8030) acrylic block behind the hand"), but do not expect pixel-exact brand colour — run a final ImageMagick `-fill`/`-colorize` pass or composite a brand-colour panel instead of generating it.
- **Consistency with references**: Pro keeps product/character identity across up to 14 refs; the docs still warn that strict consistency across many images and complex typography may need several follow-up rounds. For nails, the design is a fine texture — generate close-ups from the real photo (edit mode), never regenerate the nail art from text.
- **Text rendering**: Google says "Gemini excels at rendering text" and recommends Gemini 3 Pro Image for professional assets; put the exact string in quotes, describe the font, add "no other text". Reviews agree Pro ≫ 2.5 Flash on typography; Nano Banana 2 (3.1 Flash) is close to Pro in a fal.ai side-by-side, with the gap showing only at print magnification. Multilingual typography (incl. Cyrillic) is a stated Pro feature. **Still: for ad copy in four languages with diacritics (ą, ę, ł, ś, ź, ż / ї, є, ґ) and a fixed brand font, generated text is a QA liability** — one wrong glyph in 300 creatives is likely. Use Nano Banana for *imagery*, and render text programmatically (§4). Exception: decorative, non-critical "lettering" where you accept re-rolls.
- **Logos**: no source demonstrates exact logo reproduction, and the prompting guide lists complex typography as a limitation. Composite the SVORA logo variants with ImageMagick/HTML after generation.
- **Watermark**: all outputs carry SynthID (invisible). Meta has no rule against it; disclose AI content where Meta's "AI info" label applies.

### Prompt patterns

1. Clean plate: "Using the provided image, remove the towel and the stray hair; keep everything else exactly the same."
2. Hero static: "Studio product photo of the same hand and nails from the provided image on a matte cream (#F7F1EB) surface, soft three-point softbox lighting, peach (#FFBE98) gradient falloff in the corner, 4:5, shallow depth of field, nails tack-sharp, no text."
3. Variant pack: run the hero prompt with 3 backgrounds (cream, peach, black #1A1A1A) × 2 crops = 6 statics from one photo at ≈$0.40 on Nano Banana 2 (1K) or ≈$0.80 on Pro.
4. Avoid negative phrasing ("no X"); describe the positive scene instead, except the standard closing "no text, no logo".

---

## 4. Text overlay rendering

### Tool choice

| Tool | Use for | Caveats |
|---|---|---|
| **HTML/CSS → headless Chrome (Playwright)** | All headline/CTA/price layers, multi-line, mixed scripts, emoji, brand layout. Screenshot with `type:'png', omitBackground:true`, after `await page.evaluate(() => document.fonts.ready)` (and `document.fonts.load()` for unused weights). Use `deviceScaleFactor` 1 at 1080×1920 so pixels are exact. | Page CSS backgrounds stay opaque — set `body{background:transparent}`. Keep font files local (`@font-face` with `file://` or served) for reproducibility. |
| **ImageMagick** | Logo compositing, brand-colour panels, final crop/pad to 1080×1350 / 1080×1920, batch JPEG export ≤30 MB. Text via `pango:` coder for Unicode (`convert -background none -font ... pango:"Привіт" text.png`; `composite -gravity southeast -geometry +40+40 logo.png in.png out.png`). | `-annotate` is fine for basic Cyrillic/Polish with a proper font; Pango build required for markup. |
| **ffmpeg** | Compositing the PNG overlay onto video (`overlay` filter, optional `enable='between(t,0,3)'` for timed hooks), burned captions, audio mux, upscale. `drawtext` only for simple one-line stamps. | `drawtext` needs libfreetype (+libharfbuzz since 2023, libfribidi for `text_shaping`), a `fontfile` path, and painful escaping of `:` and `,` — avoid for designed layouts. Burn text at the final resolution; never scale text after rendering. |

Recommended pipeline: Seedance/Nano Banana → (video) ffmpeg upscale → Playwright renders `overlay_{lang}.png` per creative from one HTML template → ffmpeg `overlay` → ImageMagick/ffmpeg exports per placement.

### Fonts: Cyrillic and Polish coverage (Fontsource API, which mirrors Google Fonts subsets)

- **Antonio**: `latin, latin-ext` only — Polish OK, **no Cyrillic**. Cannot be used for UK/RU headlines.
- **Roboto Condensed**: `cyrillic, cyrillic-ext, greek, latin, latin-ext, vietnamese`, weights 100–900 — full PL/UK/RU/EN coverage. Make it the overlay workhorse.
- **Smile Power** (Ef Studio): Latin display font, 234 glyphs, no Cyrillic; licensing differs by source (free personal on some sites, commercial desktop licence on Fontspring) — confirm the kit's licence covers advertising before using it even for EN/PL.
- Condensed display fallbacks with Cyrillic: **Oswald** (`cyrillic, cyrillic-ext, latin, latin-ext`, 200–700) is the closest free match to Antonio's proportions. Bebas Neue and Anton are Latin-only.
- Rule: one `font-family` stack per language — `Antonio, Oswald` for PL/EN; `Oswald` (or Roboto Condensed 700) for UK/RU — and verify Ukrainian-specific glyphs ї, є, ґ render (cyrillic-ext not required for them, but test).

### Legibility rules

- Contrast ≥4.5:1 for normal text, ≥3:1 for large text (≥24 px or ≥18.5 px bold) per WCAG 2.2 — ads should exceed this: Cream #F7F1EB on Black #1A1A1A ≈ 16:1; Black on Peach #FFBE98 ≈ 11:1; **white on Vivid Orange #FF8030 is ≈2.5:1 — fails**; use Black #1A1A1A text on orange, or orange only as an accent/pill.
- Minimum sizes on 1080×1920: body/captions ≥48 px, headline 90–140 px, price/offer ≥72 px; max 2 lines per overlay, ≤6 words per line. Put a 40–60% black or cream scrim behind text over busy nail photos.
- Placement (9:16): hook headline at y≈300–500; price/offer badge y≈600–900 or centred; CTA ("Umów wizytę" / "Записатись") at y≈1050–1200, left-aligned, inside x 65–790 to clear the right rail; nothing below y=1248. Logo top-left at y≈300 (below the username band) or bottom-left at y≈1150. 4:5: CTA in the lower third but above y=1100.

---

## 5. Localization of ad copy — PL / UK / RU / EN

### Tone

- **Polish**: no data-backed study on "Pani" vs "Ty" in nail-studio ads was found; Booksy's own PL examples use informal second person ("czujesz się zmęczona…", biz.booksy.com). Industry practice: informal "Ty" dominates Instagram beauty communication; "Pani/Państwo" reads formal and suits transactional messages. For a premium studio: **"Ty" with polite, warm phrasing and feminine forms** ("Zarezerwuj", "Twoje paznokcie"), avoid slang, no imperatives in caps. Test one "Pani" variant for 35+ audiences.
- **Ukrainian**: informal "ти" is standard in beauty ads addressing women; "Ви" for confirmations. Use Ukrainian-specific vocabulary (манікюр, покриття, запис) and avoid Russian calques.
- **Russian**: informal "ты" for ads is common, but see sensitivity below.
- **English**: short, benefit-led; largely for expats — keep Warsaw/Mokotów location cues.

### Ukrainian vs Russian for the diaspora in Poland

No 2025 survey of Ukrainians in Poland on preferred advertising language was found. Context: in Ukraine, KIIS 2025 finds 63% speak Ukrainian at home, 13% Russian, 19% both (ukranews.com); 66% want Russian removed from official communication (KIIS Feb 2024 via visitukraine.today). Among refugees in Poland, Polish competence rose fast — only ~6% report no Polish, >23% at B1 (EWL/UW 2023 via demagog.org.pl). Ukrainian-language advertising by Polish banks, telcos and services has been a visible phenomenon since before 2022 and expanded after (Levchuk 2021/2023, Instytut Slawistyki PAN).

Recommendation: **UK is the default Cyrillic language**; it is understood by Russian-speaking Ukrainians and avoids the backlash risk a Russian-only ad carries post-2022. Run RU only as a separate, clearly RU ad set targeted by Meta language settings (Russian speakers include Belarusians and others in Warsaw), never in a mixed UK/RU creative, and never with Russian in the on-image text of a UK creative. Monitor comments on RU ads closely.

### Emoji

The often-quoted 241% CTR lift comes from one AdEspresso test its authors called non-significant; a Perspective test saw CTR fall but CPL drop. Treat emoji as a per-audience test variable: 0–2 emoji in primary text, none in headlines, none in overlay text (font coverage issues).

### Meta character limits (third-party references, Jan–Apr 2026; Meta pages not fetchable)

| Field | Visible before truncation | Hard max |
|---|---|---|
| Primary text (Feed, IG Reels caption) | ~125 chars, then "See more" | 2,200 (API up to 4,096) |
| Headline | 27 visible on mobile; keep ≤40 | 40 |
| Description | ~30 (Feed), 20 per carousel card | 30 |
| Facebook Reels | 72 primary / 10 headline (lettercounter.org) | — |
| Stories | 125 primary / 40 headline; CTA predefined | — |

Write the hook in the first 70 characters so it survives Facebook Reels; Polish and Ukrainian run ~15–25% longer than English, so draft EN last from the PL/UK length budget, not the other way round.

### Multiple languages in one ad

- **Multi-Language Ads** (Marketing API `asset_feed_spec` + `asset_customization_rules`; "Languages" in Ads Manager): per-language text *and* image/video assets, labelled with `adlabels`, delivered by viewer locale, one mandatory default rule, ≤49 assets per type, **single image or single video only** (no carousel), objectives `LINK_CLICKS`, `CONVERSIONS`, `APP_INSTALLS`, `REACH`, `BRAND_AWARENESS`, `VIDEO_VIEWS` (developers.facebook.com, updated Jun 2026). Ads Manager offers auto-translation of text; it does not translate text baked into creatives — hence the per-language overlay pipeline.
- **Advantage+ "Translate text"** (AI translation of primary text/headline into multiple languages) is in early release per Jon Loomer; editing of the translations appeared limited. Keep it off for PL/UK/RU (diacritics, gender, tone) and supply your own.
- Practical structure: one campaign, ad sets by language-based audience (PL default; UK; RU; EN), each with native-language creatives; use Multi-Language Ads only where a single video must serve all four. Landing/booking page language must match the ad (support.admanage.ai).

---

## 6. Creative matrix

### Dimensions

- **Concepts (8)**: C1 Hero close-up · C2 Before/After · C3 Process/ASMR · C4 Colour trio ("which one?") · C5 Offer/Price · C6 Testimonial · C7 Studio/POV ("your 90 min in Svora") · C8 Seasonal/trend set.
- **Hooks (3 per concept)**: H1 value promise · H2 statement of intent · H3 question/invitation.
- **Formats (5)**: F1 Reels/Stories video 9:16 (720×1280→1080×1920) · F2 Feed video 4:5 (from 3:4 834×1112) · F3 Static 9:16 · F4 Static 4:5 · F5 Carousel 1:1.
- **Languages (4)**: PL (default) · UK · RU · EN.

### Yield from 50–100 source assets

Not every cell is filled. Per source photo: 1 Seedance clip (C1 or C3) + 1 Nano Banana hero static → 1 video + 1 static = 2 masters. Each master gets 1 hook overlay × 4 languages = 8 creatives, with F1/F2 (or F3/F4) derived by crop, not regeneration. 60 photos × 8 = 480 creatives from 60 video jobs (≈$140 at 8 s/720p) + 60 image jobs (≈$5) + overlay renders (free). Add 10 before/after pairs (C2, 2 frames each), 10 colour-trio composites (C4), 8 offers (C5), 8 testimonials (C6): ≈ +150. Roughly 600 creatives, ~350 of them Cyrillic/EN variants, for well under $300 of model spend. Cap the first launch at ~120 live ads (8 concepts × ~15) and promote winners.

### Naming scheme

`svr_{concept}_{hook}_{format}_{ratio}_{lang}_{src}_{model}_{v}`
e.g. `svr_c1_h2_f1_9x16_uk_ig20260914-03_sd25_v2.mp4`, `svr_c5_h1_f4_4x5_pl_kit-offer01_nb2_v1.jpg`. Lowercase, no diacritics, hyphen only inside `src`. The same stem is the Meta ad name so Ads Manager exports join back to metadata.

### Per-creative metadata (JSON, one file per creative, plus a Parquet/CSV roll-up)

```json
{
  "id": "svr_c1_h2_f1_9x16_uk_ig20260914-03_sd25_v2",
  "concept": "C1", "hook_type": "H2",
  "hook_text": "3 кольори, які обирають частіше за все",
  "format": "F1", "placement": ["ig_reels","ig_stories","fb_reels"],
  "ratio": "9:16", "size": "1080x1920", "duration_s": 8,
  "lang": "uk", "copy": {"primary": "...", "headline": "...", "description": "...", "cta": "BOOK_NOW"},
  "source": {"post": "https://instagram.com/p/...", "file": "ig20260914-03.jpg", "rights": "own"},
  "pipeline": [
    {"step": "clean", "model": "google/gemini-3.1-flash-image", "prompt": "...", "resolution": "1K", "cost_usd": 0.067, "job_id": "..."},
    {"step": "animate", "model": "bytedance/seedance-2.5", "prompt": "...", "frame_images": ["first_frame:ig20260914-03_clean.png"], "resolution": "720p", "generate_audio": true, "seed": 1842, "cost_usd": 1.84, "job_id": "..."},
    {"step": "overlay", "tool": "playwright+ffmpeg", "template": "hook_v3.html", "font": "Oswald 700"}
  ],
  "audio": {"type": "generated", "music": null},
  "qa": {"fingers_ok": true, "safe_zone_ok": true, "text_contrast": 11.2, "ai_label": true},
  "cost_usd_total": 1.91,
  "created": "2026-10-08T12:00:00Z", "version": 2
}
```

Keep `prompt`, `seed`, `job_id` and `usage.cost` from every API response; they are the only way to reproduce or audit a creative later, since Seedance seeds are not guaranteed and image models may be retired (as 2.5 Flash Image just was).

---

## Sources

- https://openrouter.ai/bytedance/seedance-2.5
- https://openrouter.ai/bytedance/seedance-2.5/llms.txt
- https://openrouter.ai/docs/features/multimodal/video-generation
- https://openrouter.ai/api/v1/videos/models
- https://openrouter.ai/google/gemini-3.1-flash-image
- https://openrouter.ai/google/gemini-3-pro-image
- https://ai.google.dev/gemini-api/docs/image-generation
- https://ai.google.dev/gemini-api/docs/pricing
- https://developers.googleblog.com/en/how-to-prompt-gemini-2-5-flash-image-generation-for-the-best-results/
- https://fal.ai/learn/tools/nano-banana-pro-vs-nano-banana-2
- https://www.bannerbear.com/blog/nano-banana-vs-nano-banana-pro-which-google-ai-image-generator-is-better/
- https://technode.com/2026/07/31/bytedance-launches-seedance-2-5-video-generation-model/
- https://www.mindstudio.ai/blog/seedance-2-5-review-pricing/
- https://www.yottalabs.ai/post/seedance-2-5-vs-seedance-2-0-differences-which-to-use-2026
- https://docs.apiyi.com/en/live/2026-09/seedance-first-frame-mixed-with-reference
- https://pixo.video/blog/seedance-2-first-frame-reference-image
- https://www.seedance.tv/blog/seedance-first-and-last-frame
- https://videoai.me/blog/seedance-2-0-limitations
- https://videoai.me/blog/seedance-2-0-multi-shot-prompts
- https://dev.to/xapm/how-to-use-seedance-20-a-practical-guide-to-image-to-video-3i1d
- https://blog.picassoia.com/seedance-2-0-prompts-for-image-to-video
- https://redreamality.com/blog/seedance-2-guide/
- https://fliki.ai/blog/seedance-2-prompting-guide
- https://www.hooked.so/prompts/seedance
- https://seedance2.so/de/blog/seedance-2-prompts-guide
- https://wavespeed.ai/blog/es/posts/blog-fix-flicker-jitter-seedance-2-0/
- https://www.capcut.com/create/seedance-2-0-mini-flicker-causes-and-fixes
- https://www.comfy.org/workflows/api_seedance2_0_r2v-64f4db9e3e33/
- https://motionapp.com/library/static-nails
- https://stackmatix.com/blog/beauty-industry-ad-creative-best-practices
- https://biz.booksy.com/en-us/blog/instagram-reels-hair-beauty-clients-guide
- https://purespadirect.com/blogs/pure-spa-direct-blog/the-best-ways-to-use-instagram-reels-to-showcase-your-services-and-book-more-clients
- https://socialmediatoday.com/news/meta-shares-tips-on-reels-hooks-creative-diversification-in-ads-and-threa/808182
- https://houseofmarketers.com/meta-shares-reels-tips-for-marketers-2026/
- https://www.websitebuilderexpert.com/news/meta-updates-reels-ads-guide/
- https://www.facebook.com/business/help/980593475366490
- https://adsuploader.com/blog/meta-ads-safe-zones
- https://adkit.so/tools/safe-zones/meta
- https://tryvizup.com/blog/meta-ad-specs-2026-every-dimension-size-you-need
- https://www.bestever.ai/post/meta-video-ad-specs
- https://lettercounter.org/blog/facebook-instagram-ads-character-limits/
- https://adsuploader.com/blog/meta-ad-copy-specs
- https://adzooma.com/blog/facebook-advertising-removes-20-text-rule-on-images
- https://www.socialmediatoday.com/news/facebooks-removing-its-restrictions-on-text-content-in-facebook-ad-images/
- https://usethirdchair.com/blog/instagram-reels-audio-library-what-brands-need-to-know
- https://www.auditsocials.com/blog/instagram-reels-ad-compliance-guide-2026
- https://developers.facebook.com/docs/marketing-api/multi-language-ads/
- https://www.jonloomer.com/qvt/translate-text-feature/
- https://support.admanage.ai/articles/2180743564-how-to-use-multi-language-ads-in-admanage-ai
- https://www.sprinklr.com/help/articles/facebook-ad-formats/language-customization-for-facebook-assets/645501920d27fc559bbeb59e
- https://adespresso.com/blog/how-to-use-emojis-in-facebook-ads-complete-guide/amp/
- https://www.perspective.co/artikel/hate-it-or-love-it-wie-emojis-in-facebook-ads-deinen-cpl-senken
- https://www.bestever.ai/post/emojis-for-facebook-ads
- https://biz.booksy.com/pl-pl/blog/jak-promowac-swoj-salon-urody-lub-gabinet-masazu-aby-trafic-w-serca-kobiet
- https://ukranews.com/en/news/1078925-13-of-citizens-speak-russian-at-home-another-19-speak-two-languages-kiis-survey
- https://visitukraine.today/pl/blog/3539/how-do-ukrainians-feel-about-the-russian-language-in-2024
- https://demagog.org.pl/analizy_i_raporty/jak-zyja-ukraincy-w-polsce-jezyk-praca-i-nastawienie-polakow/
- https://www.ceeol.com/search/article-detail?id=1208282
- https://www.ceeol.com/search/article-detail?id=1021646
- https://www.kyivpost.com/ukraine-politics/almost-third-of-ukrainians-speak-polish.html
- https://api.fontsource.org/v1/fonts/antonio
- https://api.fontsource.org/v1/fonts/roboto-condensed
- https://api.fontsource.org/v1/fonts/oswald
- https://api.fontsource.org/v1/fonts/bebas-neue
- https://fontsource.org/fonts/antonio/about
- https://befonts.com/smile-power-font.html
- https://www.fontspring.com/fonts/ef-studio/smile-power
- https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html
- https://playwright.dev/docs/screenshots
- https://macmyths.com/how-to-fix-transparent-pngs-when-capturing-html/
- https://htmlcsstoimage.com/blog/wait-for-page-before-screenshot
- https://developer.mozilla.org/docs/Web/API/FontFaceSet/ready
- https://ottverse.com/ffmpeg-drawtext-filter-dynamic-overlays-timecode-scrolling-text-credits/
- https://lists.ffmpeg.org/pipermail/ffmpeg-cvslog/2023-June/137892.html
- https://lists.ffmpeg.org/pipermail/ffmpeg-cvslog/2014-July/079302.html
- https://download.imagemagick.org/discourse-server/viewtopic.php?p=81566
- https://jqmagick.imagemagick.org/discourse-server/viewtopic.php?p=63441
