# Ad copy

One file per concept × language: `copy/<concept>/<lang>.yaml` (`concept` from `settings/concepts.yaml`,
`lang` ∈ pl · ua · ru · en). `scripts/launch.mjs` reads `headlines`, `primaries`, `descriptions` by id;
`render-overlay.mjs` takes `overlays`/`ctas` text through `--var`.

```yaml
concept: crazy
lang: ua
tone: "informal, first-person client voice; Ukrainian default for the diaspora; no Russian loanwords"
headlines:        # ≤ 40 chars; the first 27 are what Reels shows — front-load the point
  h01: "…"
primaries:        # ≤ 125 chars before Instagram truncates; line 1 is the hook; \n allowed; ≤ 2 emoji
  p01: "…"
descriptions:     # ≤ 30 chars; Facebook feed/link ads only
  d01: "…"
overlays:         # on-video text, ≤ 6 words, reads in 1.5 s, UPPERCASE-safe; <b>…</b> colours a word orange
  o01: "…"
ctas:             # the orange pill under the hook, ≤ 3 words
  c01: "…"
```

Rules (from `settings/brand.yaml` and `research/creative-playbook.md` §5):

- Only facts in `settings/brand.yaml`: prices, hours, address, Fresha, team, languages. No awards, no guarantees, no
  "best in Warsaw", no invented discounts or codes. A price in copy must equal the price list.
- No personal-attribute phrasing ("you have ugly nails", "are you Ukrainian?") — Meta policy. Say "for Ukrainians in
  Warsaw" about the studio, never about the reader.
- UA is the default Cyrillic language; RU copy is for a clearly separate RU ad set and stays neutral in tone.
- PL uses informal "Ty"; EN is for expats (British spelling, "book online").
- Every id is stable once a campaign has used it (the ledger records ids, not text). Add new ids; never rewrite an old one.
