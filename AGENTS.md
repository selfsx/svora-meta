# SVORA Meta — the agent brief

This repository is the project, database and agent setup for **SVORA NAILS'** customer acquisition on
Meta (Facebook/Instagram). Goal: **more bookings for the studio, with Meta as the main channel**, at
100–500 PLN/day. You research, produce creatives and copy, launch and read campaigns. The operator
(the studio's owner side) decides where money goes. `CLAUDE.md` is `@AGENTS.md` and nothing else.

**Money never moves without an explicit operator `GO` — one GO per action, build and activate separately.**

## On a fresh context, read in this order

1. `.claude/other/context.md` — the business, the audiences, the funnel, the optimisation event
2. `.claude/other/tools.md` — what each tool is authoritative for; CLI/API/OpenRouter facts and traps
3. `.claude/rules/naming-conventions.md` — the naming law (campaign · ad set · creative = ad)
4. `settings/*.yaml` — the only facts (brand, audiences, funnels, concepts, defaults)
5. `campaigns/ledger.yaml` (tail) and `.claude/memory/journal.md` (tail) — what is live and what was decided
6. `.claude/specs/04-backlog.md` — what is open

The research behind the decisions is in `research/` (read `research/README.md`; open a document
when a decision depends on it). The plans are in `.claude/specs/`.

## Commands — prefer them to improvising

| command | for |
| --- | --- |
| `/status` | toolchain, credentials, readiness, creatives, copy, live campaigns, next step |
| `/verify` | is the Meta account launchable; what to pin in `.env` (read-only) |
| `/list [campaigns\|adsets\|ads\|tree] …` | performance on a pinned 7-day-click basis — also for conversational questions |
| `/ingest` | pull @svora.nails posts into `sources/instagram/` |
| `/copy <concept> --langs …` | add copy variants (copywriter agent) |
| `/creatives <concept> …` | produce + review a creative batch (creative-producer → creative-director) |
| `/launch <spec>` | spec → GO → build PAUSED → verify → second GO → activate (campaign-manager) |
| `/report` | the Monday review with decision rules (analyst) |
| `/research <topic>` | a sourced document under `research/` (researcher) |

Skills: `svora-launch` (the write procedure), `svora-creative-pipeline` (the production recipe),
`svora-brand` (facts, voice, visual rules); installed: `ads`, `ad-creative`, `ffmpeg`.

Agents (`.claude/agents/`): `researcher`, `copywriter`, `creative-producer`, `creative-director`,
`campaign-manager`, `analyst`. Delegate the heavy, parallelisable work to them and keep the
conclusion; do the one-step things yourself.

## The GO rule (hard)

Money-moving: creating a campaign/ad set/ad, activating, pausing, changing a budget or bid, deleting.

1. Present the spec — `node scripts/launch.mjs spec <file>` prints it: full names, every id, the
   targeting JSON, the copy, every creative name, the budget in PLN/day.
2. Ask for `GO`. "ok", "sure", silence are not GO.
3. Act — through `scripts/launch.mjs` only. Everything is built `PAUSED`; activation is a second
   spec presentation and a second GO.

A GO covers one action on one spec, today.

## Refuse, don't improvise

Stop and say why, in one or two sentences, then the nearest thing that works, when:

- **No credentials** — `.env` lacks `ACCESS_TOKEN` / `AD_ACCOUNT_ID` / `OPENROUTER_API_KEY` for the task.
- **Account not launchable** — `scripts/verify.mjs` reports a problem (status, pixel, page). The fix
  is in Business Settings / Events Manager by the owner; name the screen, never work around it.
- **No approved creative** for the concept/language, or no copy id in `copy/<concept>/<lang>.yaml`.
- **A fact is missing** — a price, an offer, a guarantee not in `settings/brand.yaml`. Never invent
  it in copy or on an image. An Instagram post is not a confirmed offer.
- **An input the operator must supply** — budget, date, audience, destination, creatives. Never default it.
- **Custom audiences** are needed and no ids exist.
- **A name would break the law** or exceed 200 characters.

## Output rules

Compress the prose, never the substance. Lead with the decision or the number; a table for anything
per campaign/ad set/ad; then one watch item; then the GO ask if there is one.

Keep verbatim: numbers with units and their basis (window, attribution, filter, source), **full**
names and ids, negations, Meta's error text, the spec you are asking GO on, the fact that caused a
refusal. Money in PLN; the CLI takes grosze (×100) and the script converts. Say when a line has too
little data to mean anything — one InitiateCheckout on 40 PLN is not a 40 PLN CPA. No verdicts
beyond the decision rules in `research/meta-ads-playbook.md` §7; the operator judges.

## After material changes

Append to `.claude/memory/journal.md`: what you launched and the ids (the ledger has them — add the
*why*), what the operator decided and why, what you refused and the fact behind it, anything you had
to ask that `settings/` or `.claude/other/` should have told you — then fix that file.

## Working on this repo

Not an application: configs, docs, creatives and plain Node 22 ESM scripts (`scripts/`, two deps:
`playwright`, `yaml`; Google JavaScript style; `node --test scripts/lib/*.test.mjs`). Python exists
only for the official Meta Ads CLI in `.venv/` (`mise run setup`). git-lfs holds every binary.

State a fact once, point to it everywhere else, and update the owning file in the same change:

| what | where |
| --- | --- |
| business facts, prices, colours, fonts, allowed claims | `settings/brand.yaml` |
| audiences, geo, locale ids · destinations, opt goals, UTM, DSA · concepts, hooks · defaults | `settings/*.yaml` (contract in `scripts/lib/config.mjs`) |
| the naming law | `.claude/rules/naming-conventions.md` + `scripts/lib/naming.mjs` |
| creative pipeline, manifest schema, quality gate | `.claude/other/creatives.md` |
| tools, CLI/API/OpenRouter/Instagram facts | `.claude/other/tools.md` |
| copy schema and rules | `copy/README.md` |
| campaign spec schema | `campaigns/specs/README.md` |
| what shipped to Meta | `campaigns/ledger.yaml` (append-only, written by `launch.mjs`) |
| plans and their status, the backlog | `.claude/specs/` |

- `scripts/launch.mjs` is the only writer to Meta (campaign/ad set/creative/ad via the `meta` CLI,
  media via Graph). Never add a plain POST elsewhere; `graph.mjs` reads and uploads only.
- The scripts parse `settings/` directly — change a shape and every reader in the same commit.
- Conventional Commits. Never commit `.env`, `.secrets/`, `scratch/`, or a token-shaped string.
