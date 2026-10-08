---
description: Run a sourced research task and store it under research/ (competitors, Meta features, benchmarks, creative trends, tooling).
argument-hint: "<question or topic>"
---

Research **$ARGUMENTS**.

Delegate to the **researcher** agent with the question, the file name to write (`research/<topic>.md`),
and what decision the answer feeds (a spec, a creative brief, a settings change). It cites a URL for
every claim, labels Poland vs global and 2026 vs older, and ends with "What this changes for SVORA".

Relay the "What this changes" bullets and the file path. If the answer implies a change to
`settings/*.yaml`, `copy/` or a spec, propose the exact edit and wait for a yes.

Existing documents (read before asking for a new one): `research/README.md`.
