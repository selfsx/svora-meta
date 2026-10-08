---
description: Build and launch a campaign from a spec — spec → GO → build PAUSED → verify → second GO → activate.
argument-hint: "campaigns/specs/<NNN>-<slug>.yaml  (or describe the campaign and I will write the spec first)"
---

Follow `.claude/skills/svora-launch/SKILL.md` exactly for **$ARGUMENTS**.

Short form:
1. `node scripts/verify.mjs` must say launchable. If a spec file was not given, write one under
   `campaigns/specs/` from the operator's brief (number = ledger max + 1; `campaigns/specs/README.md`).
2. `node scripts/launch.mjs spec <file>` — show the full table. Ask for **GO**. Stop here until it comes.
3. `node scripts/launch.mjs build <file>` → everything PAUSED. `node scripts/launch.mjs verify <file>`.
4. Show the verification. Ask for a **second GO**. Only then `node scripts/launch.mjs activate <file>`.
5. Append the decision and reason to `.claude/memory/journal.md`.

A GO covers one action and one spec. Never collapse build and activate. Budgets in the spec are PLN
per day; the script converts to grosze. Quote Meta errors verbatim and stop — `build` resumes from the
state file when re-run.
