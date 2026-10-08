# Memory — the ledger and the journal

Two kinds of durable memory, both committed:

## `campaigns/ledger.yaml` — written by `launch.mjs`

Append-only. One entry per `built` / `activated` / `paused` event with every id. Never edit by hand
except to add a `decision:` line under an entry (why it was paused, what it taught). The next campaign
`number` is the highest in the ledger + 1.

## `.claude/memory/journal.md` — written by agents

Append a dated entry when something happened that the configs cannot tell the next context:

- a GO the operator gave and **why** (budget, audience, creative choice);
- a refusal and the fact that caused it;
- a result that changed a decision (a creative killed, an event switched, a radius widened);
- a question you had to ask that `settings/` or `.claude/other/` should have answered — then fix the file.

Shape:

```
## 2026-10-20 — campaign 001 built and activated
- GO (operator, 10:40): 150 PLN/day, uaru broad, 6 videos from 2026-10-b01-crazy. Reason: start with the
  signature concept for the core audience.
- Refused: `retarget-30` ad set — no custom audience ids yet; operator will create them in Ads Manager.
- Note: Fresha IC events confirmed in Test Events after consent.
```

Keep it to facts and decisions. Performance numbers belong in `/report` output, not here.
