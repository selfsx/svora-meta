# Naming conventions — SVORA Meta

The source of truth for every name created in the ad account. `scripts/lib/naming.mjs` implements
it; `scripts/launch.mjs` refuses anything that does not fit. Humans and agents read names in Ads
Manager, in `scripts/list.mjs` output and in `campaigns/ledger.yaml` — a name must say what the
thing is without opening it.

## 0. Universal rules

1. **Lowercase**, except the Instagram shortcode inside a creative name (it is case-sensitive).
2. **`_` separates tags.** Nothing else does. `-` is allowed inside a value (`wola-6km`, `before-after`).
3. **No empty slots.** An optional tag that is empty is omitted, never left as a doubled `_`.
4. **Dates are `yyyy-mm-dd`**, one tag.
5. **200 characters hard.** Over it: drop the comment, then shorten the concept. Never drop a structural tag.
6. `slug()` = lowercase → drop everything but `[a-z0-9]`, space and `-` → spaces to `-` → collapse → trim.

## 1. Campaign

```
{number}_{camptype}_{budget}_{optgoal}_{geo}_{lang}_{concept}_{date}[_{comment}]

001_test_abo_ic_wola6km_uaru_mix_2026-10-20
002_retarget_abo_purchase_warsaw25km_multi_mix_2026-10-20
003_test_abo_msgs_wola10km_ua_crazy_2026-10-27_dm-arm
```

| tag | values | note |
| --- | --- | --- |
| `number` | 001, 002 … | launch sequence, zero-padded to 3; next = last in `campaigns/ledger.yaml` + 1 |
| `camptype` | `test` · `bau` · `retest` · `retarget` | test = a hypothesis with a decision date; bau = proven setup kept running |
| `budget` | `cbo` · `abo` | where the budget lives |
| `optgoal` | `purchase` · `ic` · `lpv` · `clicks` · `msgs` · `reach` | `settings/funnels.yaml → optgoals`; `ic` = InitiateCheckout |
| `geo` | `wola6km` · `wola10km` · `warsaw` · `warsaw25km` | `settings/audiences.yaml → geo` |
| `lang` | `pl` · `ua` · `ru` · `uaru` · `en` · `multi` | the **targeting** language; creatives in the campaign must match (§4) |
| `concept` | `classic` · `art` · `crazy` · `pedi` · `brows` · `brand` · `mix` | `settings/concepts.yaml` |
| `date` | launch date | the day the spec was approved, not the day the file was written |
| `comment` | free, slugged | optional; what the test is about (`dm-arm`, `ig-only`) |

## 2. Ad set

```
{audience}_{geo}_{lang}_{concept}_{type}{count}_{date}[_{comment}]

broad_wola6km_uaru_mix_vd6_2026-10-20
retarget-30_warsaw25km_multi_mix_cr8_2026-10-20
```

| tag | values |
| --- | --- |
| `audience` | `broad` · `broad-all` · `int-nails` · `retarget-30` (`settings/audiences.yaml → audiences`) |
| `type` + `count` | `vd6` six videos · `st4` four statics · `cr8` eight mixed/carousel assets — the count of ads in the set |

Geo, lang, concept and date repeat the campaign's. One ad set per audience; the budget note lives in
the campaign name (`abo`/`cbo`), not here.

## 3. Creative — and the ad name is the creative name

```
{concept}_{hook}_{source}_{type}_n{nnn}_v{n}_{format}_{lang}

crazy_reveal_DaxwkGBtqcU_vd_n012_v1_9x16_ua
classic_price_legacy-rich_st_n003_v2_4x5_pl
mix_social_DYFSTrxMrVw_cr_n021_v1_1x1_en
```

| tag | meaning |
| --- | --- |
| `concept` | as campaign |
| `hook` | `settings/concepts.yaml → hooks` (`reveal`, `process`, `before-after`, `pov`, `social`, `found`, `price`, `speed`, `art-closeup`, `team`) |
| `source` | the Instagram shortcode the asset came from (case kept), or `legacy-<stem>` for files from `sources/legacy/`, or `gen` for pure AI generations |
| `type` | `vd` video · `st` static · `cr` carousel card |
| `n` | counter inside the batch, 3 digits |
| `v` | iteration of the same n (new overlay text, re-cut) |
| `format` | `9x16` · `4x5` · `1x1` |
| `lang` | `pl` · `ua` · `ru` · `en` — the language **on** the creative (overlay/voice). Always one. |

The file is `creatives/<batch>/<name>.<ext>`; the manifest entry's `name` equals the file stem; the
Meta ad is named exactly that. Nothing appended, nothing stripped — the name is how insights join
back to the manifest (model, prompt, cost, source post).

## 4. Language matching

A creative may go into a campaign only when its `lang` fits the campaign's `lang`:
`pl→pl`, `ua→ua`, `ru→ru`, `en→en`, `uaru→ua|ru`, `multi→any`. `launch.mjs` enforces it.

## 5. Vocabularies (keep in sync with settings/)

```
camptype  test · bau · retest · retarget
budget    cbo · abo
optgoal   purchase · ic · lpv · clicks · msgs · reach
geo       wola6km · wola10km · warsaw · warsaw25km
lang      pl · ua · ru · uaru · en · multi          (creative lang: pl · ua · ru · en)
concept   classic · art · crazy · pedi · brows · brand · mix
audience  broad · broad-all · int-nails · retarget-30
type      vd · st · cr
format    9x16 · 4x5 · 1x1
batch     yyyy-mm-bNN-<topic>, e.g. 2026-10-b01-crazy
```

## 6. Checklist before a GO

- [ ] Campaign name assembled by `launch.mjs spec`, not by hand.
- [ ] `number` is the next in the ledger.
- [ ] Every ad name is a manifest creative with status `approved`.
- [ ] Creative `lang` fits campaign `lang`.
- [ ] `url_tags` set on every creative (`settings/funnels.yaml → utm`); the link itself carries no UTM.
- [ ] DSA beneficiary/payor on every ad set.
- [ ] ≤ 200 characters.
