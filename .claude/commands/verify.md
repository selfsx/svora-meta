---
description: Meta account readiness (read-only) — token, ad account, page + Instagram identity, pixel, targeting keys.
---

```bash
node scripts/verify.mjs
```

Report the table it prints and the verdict line verbatim ("launchable" / "NOT launchable"). If it lists
`pin in .env`, tell the operator to add those lines (page id, Instagram actor id, pixel id) — do not
edit `.env` yourself. If a locale or city key differs from `settings/audiences.yaml`, propose the
exact change to the YAML and wait for a yes.

Never work around a blocker here (wrong account, disconnected pixel, missing page): the fix is in
Business Settings / Events Manager by the owner. Say which screen.
