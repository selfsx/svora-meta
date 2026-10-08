---
description: Performance listing on a pinned 7-day-click basis — campaigns, ad sets, ads or the tree.
argument-hint: "[campaigns|adsets|ads|tree] [-d last7|last14|last30|yyyy-mm-dd:yyyy-mm-dd] [-f active|paused|all] [-s name] [-o spend|cpa|ic|purch] [-l 30] [-m 0]"
---

List performance for **$ARGUMENTS** (default `campaigns -d last7 -f active`):

```bash
node scripts/list.mjs $ARGUMENTS
```

Run the script; do not re-implement it with a hand-rolled Graph call or `meta ads insights get` — those
return numbers on an unstated attribution basis, which is the mistake this command exists to prevent.
Use it for conversational questions too ("how is the crazy campaign doing?" → `-s crazy`).

Reading the result:
- Lead with the number asked for, then the table, then one watch item. State the basis (window,
  filter, attribution) every time — it is in the output's first lines.
- `ic` = InitiateCheckout (the optimisation event), `purch` = Purchase (fires on booking confirmation,
  before payment, consent-gated). `cp-ic` / `cp-purch` are blended.
- Fewer than ~10 events on a row means its cost-per numbers are noise. Say so instead of quoting them.
- `-f active` hides paused ads that spent earlier in the window, so child totals can be below the
  parent's. Re-run with `-f all` before concluding.
- No verdicts beyond the decision rules in `research/meta-ads-playbook.md` §7; the operator decides.
