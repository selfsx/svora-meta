# Tools — what each one is authoritative for

| tool | for | never for |
| --- | --- | --- |
| **Meta Ads CLI** (`meta`, in `.venv/`) | every write to Meta: campaigns, ad sets, creatives, ads, status changes; quick reads of one object | per-entity performance (its `insights get` has no `level`), pinned attribution |
| **Graph API** via `scripts/lib/graph.mjs` | insights per level with `action_attribution_windows`, media upload (`adimages`, `advideos`), read-back verification, targeting search | ad-hoc writes — `launch.mjs` is the only writer |
| **OpenRouter** via `scripts/lib/openrouter.mjs` | Seedance 2.5 video, Nano Banana images, small text jobs | logos, brand text, anything that must be pixel-exact (render it) |
| **Playwright** (`node_modules/playwright`) | Instagram ingest, HTML→PNG overlay rendering | — |
| **ffmpeg / ImageMagick** | finishing, crops, posters, composites | — |
| **git-lfs** | every binary under `brand/`, `sources/`, `creatives/` | — |

## Scripts (`scripts/`)

Plain Node 22 ESM, two dependencies (`playwright`, `yaml`), Google JavaScript style. Every script
has a `@fileoverview` stating what it reads and whether it writes. `node --test scripts/lib/*.test.mjs`.

| script | reads | writes | purpose |
| --- | --- | --- | --- |
| `doctor.mjs` | tools, `.env` names, two live reads | — | is this machine ready |
| `verify.mjs` | Graph (token, account, pages, pixels, targeting keys) | — | is the account launchable; what to pin in `.env` |
| `list.mjs` | Graph insights | — | performance on a pinned basis (`/list`) |
| `launch.mjs` | settings, manifests, copy | **Meta** (build/activate/pause), `scratch/*.build.json`, `campaigns/ledger.yaml` | the write path (`/launch`) |
| `ig-login.mjs` | — | `.secrets/ig-state.json` | one-time Instagram session (operator types the password) |
| `ig-fetch.mjs` | Instagram | `sources/instagram/index.json`, `sources/instagram/raw/` | collect post codes, download full-res media |
| `gen-image.mjs` | OpenRouter | a PNG + sidecar JSON | Nano Banana edits |
| `gen-video.mjs` | OpenRouter | an MP4 + sidecar JSON | Seedance 2.5 image-to-video |
| `render-overlay.mjs` | `creatives/templates/*.html`, `brand/` | a PNG + sidecar | hook/CTA/logo overlays and full statics, any script |
| `video-finish.mjs` | ffmpeg | an MP4 + sidecar | crop to format, composite overlay, trim, music, encode |
| `creatives.mjs` | manifests | `creatives/<batch>/manifest.json` | add/approve/list/validate creatives |

## Meta Ads CLI — the parts that matter

- Package `meta-ads` (PyPI, Meta), binary `meta`, Python 3.12/3.13 only. Installed by `mise run setup`
  into `.venv/`. Docs: <https://developers.facebook.com/documentation/ads-commerce/ads-ai-connectors/ads-cli/command-reference>.
- Reads `ACCESS_TOKEN`, `AD_ACCOUNT_ID`, `BUSINESS_ID` from the environment (mise loads `.env`).
  `meta auth status` shows the masked token. There is no `meta auth login` for system users.
- Pattern: `meta -o json --no-input ads <resource> <action> …`. Resources: `adaccount`, `page`,
  `campaign`, `adset`, `ad`, `creative`, `dataset` (pixels), `insights`, `guidance`, catalogs, studies.
- **Budgets are in minor units** (PLN grosze): 150 PLN/day = `15000`.
- **Everything defaults to PAUSED** on create. Keep it that way; activation is a separate GO.
- `campaign create --execution-options validate_only` is a free dry run of the campaign object.
- Ad set: `--targeting @file.json` (full spec), `--pixel-id` + `--custom-event-type INITIATED_CHECKOUT|PURCHASE`,
  `--dsa-beneficiary/--dsa-payor` (required in the EU), `--advantage-audience/--no-advantage-audience`.
- Creative: the shortcut `--call-to-action` list has **no BOOK_NOW**, so `launch.mjs` passes
  `--object-story-spec @file.json` (page id, Instagram identity, media id, copy, CTA) plus
  `--url-tags` (the UTM block). Media is uploaded first through Graph (`adimages`/`advideos`).
- Ad: `--conversion-domain fresha.com` for OUTCOME_SALES; `--pixel-id` builds tracking specs.
- `list` commands default to `--limit 10` — pass a high limit and filter yourself.

## Graph API notes

- Version pinned in `scripts/lib/graph.mjs` (`GRAPH_VERSION`). Bump deliberately.
- Insights: `level=campaign|adset|ad`, `action_attribution_windows=['7d_click']`, `filtering` on
  `effective_status`. `purchase` and `initiate_checkout` action types are the pixel standard events.
- Targeting search: `/search?type=adlocale|adgeolocation|adinterest` — `verify.mjs` re-checks the
  keys in `settings/audiences.yaml` (uk_UA 52, ru_RU 17, pl_PL 34, en_GB 24, en_US 6).
- Errors: quote `message`, `error_user_title`, `error_user_msg` verbatim — they are specific.

## OpenRouter notes (Oct 2026)

- Video: `POST /api/v1/videos` → poll `GET /api/v1/videos/{id}` → `GET …/content?index=0`.
  Seedance 2.5: 4–30 s, 480p/720p, sizes 720×1280 (9:16), 960×960 (1:1), 834×1112 (3:4); **no 4:5,
  no 1080p** — video is delivered at 720×1280 as generated (decision 2026-10-09: 720p is enough for ads; no upscaling). First frame via `frame_images[].frame_type=first_frame`;
  `input_references` is ignored when `frame_images` is set. ≈ $0.23/s at 720p (8 s ≈ $1.8), ≈ $0.11/s at 480p.
- Images: `POST /api/v1/images` with `input_references` for edits, `aspect_ratio`, `resolution`.
  `google/gemini-2.5-flash-image` is retired (2026-10-02); use `gemini-3.1-flash-image` (~$0.07) or
  `gemini-3-pro-image` (~$0.13). Text and logos are rendered by `render-overlay.mjs`, never generated.
- Every response's `usage.cost` is written into the sidecar JSON and summed into the manifest.

## Instagram ingest

Instagram shows 12 posts of a public profile without login and refuses to paginate; individual
post pages are readable anonymously and embed full-resolution media URLs. So: `ig-fetch.mjs profile`
anonymous = latest 12; with `.secrets/ig-state.json` (from `ig-login.mjs`, the operator logs in by
hand) it scrolls the whole grid. `ig-fetch.mjs posts --pending` then downloads each post, 2–5 s apart.
Fallback tools if Instagram changes its markup: `instaloader --login <user>` (Python) or
`yt-dlp --cookies-from-browser chrome <post url>`. It is our own content; be a polite client anyway.

## What agents do not have

- No Fresha API (partner-only). Bookings are read from Fresha's dashboard by the owner.
- No Conversions API (Fresha fires browser events only). Expect consent-driven undercounting.
- No way to create custom audiences from scripts yet — create them in Ads Manager and put the ids
  in the campaign spec (`custom_audience_ids`).
