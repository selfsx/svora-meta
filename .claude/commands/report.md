---
description: Weekly performance review — numbers on a pinned basis, Fresha reconciliation, decision rules, written to campaigns/reports/.
argument-hint: "[-d last7] [--bookings <n confirmed on Fresha>] [--spend-fresha <optional>]"
---

Weekly review for **$ARGUMENTS** (default last 7 days).

Delegate to the **analyst** agent. It runs `node scripts/list.mjs tree -d <window> -f all`, adds a
placement breakdown, reconciles against the Fresha-confirmed bookings if the operator gave a number
(cost per confirmed booking is the KPI; Meta's Purchase is an indicator), applies the Monday decision
rules from `research/meta-ads-playbook.md` §7, and writes `campaigns/reports/yyyy-mm-dd.md`.

Relay: the KPI line, the table, which rule fired for which name (full names, ids), and the recommended
actions — the operator decides; nothing is paused or changed by this command.
