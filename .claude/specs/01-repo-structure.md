# 01 — Repository structure and toolchain

**Status:** shipped 2026-10-08. Verified: naming tests pass; overlay render → video finish → manifest →
`launch.mjs spec`/`build --dry-run` produce correct CLI commands, targeting JSON and object_story_spec;
Instagram post fetch works anonymously (profile limited to 12); `meta` CLI 1.2.0 installs under
Python 3.13 via mise. Not verified (no credentials yet): `verify.mjs`, `list.mjs`, a real `build`, any
OpenRouter call.

## Layout

```
AGENTS.md / CLAUDE.md      the agent brief (CLAUDE.md is @AGENTS.md)
mise.toml · package.json   toolchain: node 22, python 3.13 (meta CLI in .venv), jq; deps: playwright, yaml
.env(.example)             secrets; mise loads .env into the shell
.gitattributes             git-lfs for every binary type
.claude/
  specs/                   this folder — mission, plans, backlog
  rules/naming-conventions.md
  other/                   the model: context, tools, creatives, memory
  agents/                  researcher · creative-producer · copywriter · creative-director · campaign-manager · analyst
  commands/                /status /verify /list /launch /ingest /creatives /copy /report /research
  skills/                  svora-launch · svora-creative-pipeline · svora-brand (ours); ads · ad-creative · ffmpeg (installed via npx skills)
  memory/journal.md        decisions and facts the configs cannot hold
settings/                  brand.yaml · audiences.yaml · funnels.yaml · concepts.yaml · defaults.yaml
research/                  sourced documents (playbook, competitors, creative)
brand/                     logos, fonts (incl. Roboto Condensed for Cyrillic), palette
sources/                   instagram/{index.json, raw/ (ignored), selected/} · legacy/
creatives/                 <batch>/manifest.json + files (lfs) · templates/*.html · _work/ (ignored)
copy/                      <concept>/<lang>.yaml — 7 concepts × pl/ua/ru/en
campaigns/                 specs/*.yaml · ledger.yaml · reports/
scripts/                   doctor verify list launch ig-login ig-fetch gen-image gen-video render-overlay video-finish creatives copy-lint · lib/
scratch/                   launch state (ignored)
```

## Decisions

| decision | why |
| --- | --- |
| Node ESM scripts, two deps | operator preference; Playwright is needed anyway (Instagram, HTML rendering); `yaml` beats a hand-rolled parser |
| Meta writes through the official `meta` CLI, media through Graph | the brief asks for the CLI; CLI 1.2.0 covers targeting JSON, DSA, pixel events, url_tags and raw object_story_spec, which is how BOOK_NOW is set; it cannot pair a file upload with object_story_spec, so `adimages`/`advideos` go through Graph first |
| Insights through Graph, not the CLI | `insights get` has no per-entity level and no pinned attribution window; every number must state its basis |
| Optimise prospecting on InitiateCheckout | Purchase volume cannot reach the learning threshold at 100–500 PLN/day (research playbook §1) |
| Default landing: svora.place/<lang>, not Fresha | the site forwards fbclid + UTM to Fresha and builds a retargeting pool; a direct-to-Fresha arm is a week-3 test |
| Everything built PAUSED, two GOs | money moves only on an explicit operator word, twice |
| Names carry the whole setup | Ads Manager and insights become readable without opening objects; the ad name is the creative name, which joins back to prompt/model/cost in the manifest |
| Instagram raw dump gitignored, selected + finished in LFS | a few hundred posts × 3 MB would exhaust LFS quotas; raw is re-downloadable, finished creatives are the asset |
| Roboto Condensed added to the kit | the kit's Antonio has no Cyrillic; the site already uses Roboto Condensed |
| Seedance 2.5 + Nano Banana via OpenRouter | one key, async video API with `usage.cost`; `gemini-2.5-flash-image` was retired on 2026-10-02 so the pipeline defaults to 3.1-flash / 3-pro |
| Skills kept: `ads`, `ad-creative` (coreyhaines31), `ffmpeg` (digitalsamba) | self-contained; `agricidaniel/claude-ads` stubs needed their own orchestrator and `hyperfx` needed a paid MCP — removed |

## Where a fact lives (state once, point everywhere)

| fact | owner file |
| --- | --- |
| business facts, prices, colours, fonts | `settings/brand.yaml` |
| audiences, geo radii, locale ids | `settings/audiences.yaml` |
| destinations, optimisation goals, UTM, DSA, attribution | `settings/funnels.yaml` |
| concepts, hooks, formats | `settings/concepts.yaml` |
| budget limits, placements, CTA defaults | `settings/defaults.yaml` |
| the naming law | `.claude/rules/naming-conventions.md` (+ `scripts/lib/naming.mjs`) |
| creative pipeline and manifest schema | `.claude/other/creatives.md` |
| tool facts and traps | `.claude/other/tools.md` |
| what shipped to Meta | `campaigns/ledger.yaml` |
