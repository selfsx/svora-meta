# Sources

| path | what | git |
| --- | --- | --- |
| `instagram/index.json` | every known @svora.nails post: shortcode, date, caption, counts, media files, fetched flag | yes |
| `instagram/raw/<code>/` | full-resolution originals + `post.json` (from `scripts/ig-fetch.mjs posts`) | **no** (gitignored, re-downloadable) |
| `instagram/selected/` | the production shortlist, copied from raw by concept | git-lfs |
| `legacy/videos/` | 4 AI ads made in an earlier attempt (beauty, black-hand, kiss-me, rich: 720×1280, 15–24 s, audio) + 5 reels | git-lfs |
| `legacy/works/`, `legacy/models/` | 41 work photos and 11 model photos from the earlier attempt (`karriinails_*` are NOT SVORA's — never use) | git-lfs |

Ingest: `/ingest` → `node scripts/ig-fetch.mjs profile` (12 posts anonymously; full archive after
`node scripts/ig-login.mjs`) → `node scripts/ig-fetch.mjs posts --pending`. Details: `.claude/other/tools.md`.
