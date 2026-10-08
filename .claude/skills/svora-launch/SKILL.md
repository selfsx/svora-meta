---
name: svora-launch
description: Build and launch SVORA Meta campaigns through scripts/launch.mjs and the Meta Ads CLI — spec → GO → build PAUSED → verify → second GO → activate. Use when the operator asks to launch, build, publish, clone, activate or pause a campaign. Not for performance questions (/list) or readiness checks (/verify).
---

# Launching a campaign

`scripts/launch.mjs` is the repo's only write path to Meta. It resolves a spec against `settings/`,
the creative manifests and `copy/`, prints the GO table, creates everything PAUSED through the
official `meta` CLI (media uploaded through Graph first), verifies by reading back, and activates on
a separate command. This skill is the judgment layer around it.

## 0. Refuse before doing anything

- `node scripts/verify.mjs` is not "launchable" → relay its problems; the fix is in Business
  Settings / Events Manager, not here.
- No approved creatives for the concept/language (`node scripts/creatives.mjs list --status approved --lang <l>`).
- No copy ids in `copy/<concept>/<lang>.yaml` for the headline/primary asked.
- Budget outside 50–500 PLN/day, or not stated by the operator. Never default a budget.
- Audience `retarget-30` without `custom_audience_ids` (the owner creates the audiences in Ads Manager).
- The operator asked for `purchase` optimisation on a prospecting campaign with no event history → say
  why `ic` first (`research/meta-ads-playbook.md` §1), offer `ic`, build `purchase` only if they insist.

## 1. Write the spec — `campaigns/specs/<NNN>-<slug>.yaml`

`NNN` = highest number in `campaigns/ledger.yaml` + 1. Schema and examples: `campaigns/specs/README.md`.
Fields map to the naming law (`.claude/rules/naming-conventions.md`). Pick creatives by name or glob
(`"crazy_*_ua"`), copy by id, audience/geo/lang/optgoal from `settings/`.

## 2. `node scripts/launch.mjs spec <file>` → GO #1

Show the printed table **in full**: campaign name, account/page/pixel, objective + optimisation event,
destination + url_tags, DSA, each ad set's name, budget, targeting JSON, copy text, and every creative
name. Then ask for `GO`. Do not build on "ok", "sure", or silence — the word GO for this spec.

## 3. `node scripts/launch.mjs build <file>`

Creates campaign → ad sets → (upload media) → creatives → ads, all PAUSED. State is saved after every
object in `scratch/<spec>.build.json`; a failure stops with Meta's message. **Re-running `build` resumes**
— it skips what exists. Never retry a failed create by hand.

Then `node scripts/launch.mjs verify <file>`: reads back names, statuses, targeting, DSA, CTA, link and
url_tags, and counts ads. Quote mismatches; do not proceed with any.

## 4. GO #2 → `node scripts/launch.mjs activate <file>`

Ask again, separately, with the verified ids. Activation flips ads → ad sets → campaign to ACTIVE.
`node scripts/launch.mjs pause <file>` pauses the campaign (needs its own GO).

## 5. Record

`launch.mjs` appends to `campaigns/ledger.yaml`. You append the operator's reasons and anything the
configs should have told you to `.claude/memory/journal.md` (`.claude/other/memory.md`). Set the launched
creatives to `status=live` with `scripts/creatives.mjs set`.

## Known Meta traps

- CBO campaign + ad set budget → "more than one budget specified". The spec's `budget.type` decides; the script never sets both.
- EU delivery without DSA beneficiary/payor → rejected. The script always sets them from `settings/funnels.yaml`.
- `BOOK_NOW` is not in the CLI's `--call-to-action` list → the script passes `object_story_spec`. Don't "simplify" to `--title/--body`.
- `url_tags` can only be set at creative creation. Getting it wrong means a new creative, not an update.
- A Page without a linked Instagram account can still run on Instagram placements, but under the Page identity. `verify.mjs` shows the link.
- The optimisation event must have fired at least once on the pixel for Meta to accept it; Fresha fires `InitiateCheckout` only after cookie consent. Check Events Manager → Test Events before the first build.
