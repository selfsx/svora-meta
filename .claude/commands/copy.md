---
description: Write or extend ad copy for a concept in one or more languages (copy/<concept>/<lang>.yaml).
argument-hint: "<concept> --langs ua,ru,pl,en [--add 4] [--brief '…']"
---

Copy for **$ARGUMENTS**.

Delegate to the **copywriter** agent with: the concept, the languages, how many new variants per section
(default: 4 headlines, 4 primaries, 2 descriptions, 4 overlays, 2 CTAs), and any brief (an offer the owner
confirmed, a hook that won, a tone note). The agent follows `copy/README.md`: only facts from
`settings/brand.yaml`, Meta limits, append-only ids, three tones.

Then show the operator a 10-line sample (two per language), the file list, and anything the agent could
not write because a fact was unconfirmed. Copy ids used by a built campaign are frozen (`campaigns/ledger.yaml`).
