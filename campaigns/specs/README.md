# Campaign specs

One YAML per campaign, `campaigns/specs/<NNN>-<slug>.yaml`. `scripts/launch.mjs spec` resolves it,
`build` creates it PAUSED, `activate` turns it on (two separate GOs — `.claude/skills/svora-launch/SKILL.md`).
`NNN` is the next number after the highest in `campaigns/ledger.yaml`. `000-smoke.yaml` is a dry-run
fixture; never build it.

## Schema

```yaml
number: 1                     # → campaign name prefix 001
camptype: test                # test · bau · retest · retarget
budget:
  type: abo                   # abo: daily_pln on each ad set · cbo: daily_pln here
  daily_pln: 150              # cbo only; 50–500
optgoal: ic                   # purchase · ic · lpv · clicks · msgs · reach   (settings/funnels.yaml → optgoals)
geo: wola6km                  # settings/audiences.yaml → geo
lang: uaru                    # targeting language: pl · ua · ru · uaru · en · multi
concept: mix                  # settings/concepts.yaml
date: 2026-10-20              # the approval date; goes into every name
destination: site-ua          # optional; default from settings/funnels.yaml → default_by_lang
placements: advantage         # optional: advantage · ig-only · ig-reels-stories
bid_strategy: LOWEST_COST_WITHOUT_CAP   # optional
comment: dm-arm               # optional, slugged into the campaign name
adsets:
  - audience: broad           # settings/audiences.yaml → audiences
    daily_pln: 150            # abo only; 25–500
    creatives:                # manifest names, or globs; must be status approved and lang-compatible
      - "crazy_*_ua"
      - "classic_found_DaxwkGBtqcU_vd_n003_v1_9x16_ru"
    copy: { headline: h01, primary: p03, description: d01 }   # ids in copy/<concept>/<lang>.yaml (uaru/multi → ua file)
    cta: BOOK_NOW             # optional; default per optgoal (settings/defaults.yaml)
    placements: ig-only       # optional override
    custom_audience_ids: ["120200000000000"]   # required for retarget-30
    comment: ""               # optional
```

## Month-1 set (from research/meta-ads-playbook.md §7 and competitors-warsaw.md §6)

| spec | what | budget | needs before build |
| --- | --- | --- | --- |
| `001-prospect-uaru.yaml` | Sales → svora.place/ua, optimise InitiateCheckout, 6 km, UA+RU UI, mixed concepts, 6–8 videos | 100 PLN/day | approved `ua`/`ru` creatives |
| `002-prospect-pl.yaml` | same for Polish UI, PL creatives, the art/crazy niche in the hook | 75 PLN/day | approved `pl` creatives |
| `003-retarget.yaml` | site visitors 30d + IG engagers 90d + IC-not-Reservation 14d, optimise Purchase, carousel/mix | 30 PLN/day | custom audience ids |
| `004-dm-arm-ua.yaml` | Engagement → Instagram Direct, UA reels with "напиши в Direct" | 30 PLN/day | approved `ua` creatives with DM CTA overlay |

Start 001 (and 002 if there are PL creatives) in week 1; add 003 when the pixel has an audience; 004 in
week 2. Decision rules every Monday: playbook §7.
