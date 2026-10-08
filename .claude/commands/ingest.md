---
description: Pull SVORA's Instagram posts into sources/instagram (index + full-resolution media).
argument-hint: "[profile|posts] [--max N] [shortcodes…]"
---

Instagram ingest for **$ARGUMENTS** (default: `profile` then `posts --pending --max 40`).

```bash
node scripts/ig-fetch.mjs profile            # collects shortcodes → sources/instagram/index.json
node scripts/ig-fetch.mjs posts --pending --max 40   # downloads media → sources/instagram/raw/<code>/
```

- Without `.secrets/ig-state.json` only the latest 12 posts are visible. For the full archive the
  operator runs `node scripts/ig-login.mjs` once (headed browser, they type the password; nothing is
  stored but the browser session). Say this when the index stops at 12.
- Post pages are readable anonymously; keep `--delay` ≥ 3000 ms and ≤ ~150 posts per run.
- After a run: report how many posts are indexed / fetched / failed, the date range, and how many are
  videos vs photos. Suggest which to copy into `sources/instagram/selected/` per concept (classic / art /
  crazy / pedi / brows / brand) — do the copy only when asked; `selected/` is git-lfs tracked.
