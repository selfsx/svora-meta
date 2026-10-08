---
description: Where things stand — toolchain, credentials, account readiness, creatives, copy, live campaigns.
---

Run, in order, and summarise each in one or two lines (do not paste raw output):

```bash
node scripts/doctor.mjs
node scripts/verify.mjs            # only if doctor shows ACCESS_TOKEN + AD_ACCOUNT_ID
node scripts/creatives.mjs stats
ls copy/*/ 2>/dev/null | head -40
tail -40 campaigns/ledger.yaml
tail -30 .claude/memory/journal.md 2>/dev/null
```

Then say: what is blocked (missing credential, no approved creatives, account not launchable), what is
live (campaign names + ids + since when), and the single most useful next step. If `verify.mjs` printed
`pin in .env`, tell the operator exactly which lines to add.
