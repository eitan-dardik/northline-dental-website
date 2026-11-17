# Incident review: on-call shift, Wed 11 Nov

**Agenda (sent Sun 15 Nov, 21:30, on Telegram and on [#149](https://github.com/eitan-dardik/northline-dental-website/issues/149); due 20:00, so 1.5 h late):** timeline 2 min · what helped / what slowed me 3 min · cause 3 min · actions 7 min
**The call:** Tue 17 Nov, 16:45–18:17 Israel (moved by the CEO from Mon 16 Nov, 17:15; his message of Mon 16 Nov, 21:19). The review itself took about 15 min; the rest of the call was the week and the kit questions.
**Rule:** no blame. We look at what let it happen, not at who.

Nothing broke during the shift. As the workbook asks, I reviewed my checks the same way: how I watched, and what I would change.
Sources: the shift log on [#129](https://github.com/eitan-dardik/northline-dental-website/issues/129) and the report `docs/evidence/w6/on-call.md` (PR [#145](https://github.com/eitan-dardik/northline-dental-website/pull/145)).

## Timeline (Israel time, Wed 11 Nov)

| Time | What happened | Source |
|---|---|---|
| 16:00 | shift started; check: the three sites 200, containers 17/17 healthy, disk 12 % | #129 |
| 17:00 | check, all the same (posted 15:00:16 UTC) | #129 |
| 18:00 | check, all the same (16:00:26 UTC) | #129 |
| 19:00 | check, all the same (17:01:16 UTC) | #129 |
| 20:00 | **last check missed**: I was away from the computer, still reachable on Telegram | #129 (shift summary) |
| 20:00 | shift ended | #129 |
| 22:02 | check after the shift, nothing changed (20:02:22 UTC) | #129 |

From the 19:00 check to the 22:02 check, about **3 hours**, nobody looked at the servers. A fault starting at 19:01 could have stayed unseen that long.

## What helped / what slowed me

- **Helped:** the same five checks every time (sites, containers, restarts, disk, anything odd), so each check was quick and comparable; each check posted on #129 at once, so the log shows exactly what was checked and when, and it shows the missed one too.
- **Slowed me:** checks only happen when I run them by hand. Nothing reminds me when a check is due, and nothing alerts me if something fails between checks or while I'm away from the computer.

## Cause (one sentence)

The checks depended only on me remembering to run them by hand, with no reminder and no automatic check, so one missed check left about 3 hours in which a fault would have gone unseen.

## Actions (approved by the CEO on #149, Tue 17 Nov)

| # | Action | Owner | By |
|---|---|---|---|
| 1 | A phone alarm for every check, set before the shift starts | Eitan | Tue 24 Nov, before 17:00 (the event, task 57: a line every 15 min, 17:00–19:00) |
| 2 | An automatic check (monitoring bot) on the VPS: the four sites, the containers and the backups every 5 minutes, a Telegram message when a check fails, and a morning status message ([#182](https://github.com/eitan-dardik/northline-dental-website/issues/182)). A time estimate on its card before any code | Eitan | Tue 24 Nov |
| 3 | Restart the server for the waiting kernel update ("System restart required" since Sun 15 Nov), in the window the CEO set on [#140](https://github.com/eitan-dardik/northline-dental-website/issues/140): Wed 18 Nov, 08:00–10:00 Israel, after the nightly backup. Before: the start time on #140. After: all 17 containers up, the backup cron in place, the four sites answering 200, the end time on #140 | Eitan | Wed 18 Nov, 10:00 |

**Known gap, no work this week:** the nightly backup is kept on the VPS only; a copy outside the VPS comes later (the CEO, #149). Written in RUNBOOK.md as a known gap.
