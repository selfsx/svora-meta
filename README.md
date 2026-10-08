# svora-meta

Meta (Facebook/Instagram) acquisition for **SVORA NAILS** (svora.place), Warsaw Wola — research,
creative production, copy, campaign launches and reporting, operated by Claude Code agents with the
operator holding the GO.

## Setup

```bash
mise trust && mise install && mise run setup   # node 22, python 3.13 + Meta Ads CLI in .venv, npm deps, Playwright Chromium, git-lfs, .env
$EDITOR .env                                   # OPENROUTER_API_KEY, ACCESS_TOKEN (System User), AD_ACCOUNT_ID
mise run doctor                                # every tool and credential, one line each
mise run verify                                # account readiness; pin META_PAGE_ID / META_INSTAGRAM_ACTOR_ID / META_PIXEL_ID in .env
```

Then open the folder in Claude Code and run `/status`. The agent brief is `AGENTS.md`.

## Layout

```
AGENTS.md · CLAUDE.md     the brief (CLAUDE.md → @AGENTS.md)
.claude/                  specs (mission, plans, backlog) · rules · other (the model) · agents · commands · skills · memory
settings/                 brand · audiences · funnels · concepts · defaults  — the only facts
research/                 sourced documents the decisions rest on
brand/                    logos, fonts (Antonio, Roboto Condensed w/ Cyrillic, Smile Power), palette   [lfs]
sources/                  instagram/ (index + raw dump, selected) · legacy/                             [lfs; raw ignored]
creatives/                <batch>/manifest.json + finished files · templates/*.html                     [lfs]
copy/                     <concept>/<lang>.yaml — headlines, primaries, descriptions, overlays, CTAs
campaigns/                specs/*.yaml · ledger.yaml · reports/
scripts/                  doctor · verify · list · launch · ig-login · ig-fetch · gen-image · gen-video · render-overlay · video-finish · creatives · copy-lint
```

## Scripts

```bash
node scripts/doctor.mjs                         # readiness
node scripts/verify.mjs                         # Meta account, pages, pixels, targeting keys (read-only)
node scripts/list.mjs [campaigns|adsets|ads|tree] -d last7 -f active     # performance, 7-day click
node scripts/ig-fetch.mjs profile | posts --pending                      # Instagram ingest
node scripts/gen-image.mjs / gen-video.mjs       # OpenRouter: Nano Banana / Seedance 2.5
node scripts/render-overlay.mjs                  # HTML template → PNG (brand fonts, PL/UA/RU/EN)
node scripts/video-finish.mjs                    # ffmpeg: crop, overlay, trim, encode for Meta
node scripts/creatives.mjs list|validate|stats|batch|add|set
node scripts/copy-lint.mjs                       # Meta limits + facts check on copy/
node scripts/launch.mjs spec|build|verify|activate|pause campaigns/specs/<n>.yaml [--dry-run]
node --test scripts/lib/*.test.mjs
```

Everything that writes to Meta goes through `launch.mjs` → the official `meta` CLI, builds PAUSED,
and needs an explicit GO (`.claude/skills/svora-launch/SKILL.md`).
