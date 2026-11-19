# On-call report: Wed 11 Nov 2026, 16:00–20:00 Israel

**Result: nothing broke.** All three sites answered, all 17 containers stayed healthy, no container restarted, the disk stayed at 12 %. I made no changes to the servers during the shift. One planned check (20:00) was missed; the next check, at 22:02, shows nothing changed.

All checks were posted on [#129](https://github.com/eitan-dardik/northline-dental-website/issues/129) at the time they were made.

## What I checked each time

| Check | How | Healthy means |
|---|---|---|
| Sites | an HTTP request to production, staging and analytics; read the status code | `200` from all three |
| Containers | `docker ps` (status), and the restart count of each container | 17 of 17 `healthy`; restart counts the same as at the start |
| Disk | `df -h /` | well below the 70 % line in RUNBOOK.md ("The VPS disk is filling up") |
| Odd | anything unexpected in the outputs | nothing |

## The checks

| Time (Israel) | UTC | Sites | Containers | Restarts | Disk | Odd |
|---|---|---|---|---|---|---|
| 16:00 | 14:00 | 200 · 200 · 200 | 17/17 healthy | unchanged | 12 % | nothing |
| 17:00 | 15:00:16 | 200 · 200 · 200 | 17/17 healthy | unchanged | 12 % | nothing |
| 18:00 | 16:00:26 | 200 · 200 · 200 | 17/17 healthy | unchanged | 12 % | nothing |
| 19:00 | 17:01:16 | 200 · 200 · 200 | 17/17 healthy | unchanged | 12 % | nothing |
| 20:00 | — | **missed** | | | | |
| 22:02 (after the shift) | 20:02:22 | 200 · 200 · 200 | 17/17 healthy | unchanged | 12 % | nothing |

**Restarts "unchanged":** prod-auth 1, stage-auth 1, all others 0. Both auth restarts are one old event (17 Oct, 18:13 UTC), from before the shift.

## The missed check

The 20:00 check, the last of the shift, was not made: I was away from the computer, though still reachable on Telegram the whole time. I said so on #129 when I closed it. The 22:02 check shows the same state as 19:00, so nothing was missed in the result, but for about three hours nobody looked.

## What I would add

The checks are by hand, so they only happen when I look. A small scheduled check (every 5 minutes: the three status codes and the number of healthy containers, with a message to me if one fails) would have covered the gap at 20:00.


## Not part of the shift

On the same day, outside the shift, I found that there were no backups of the Northline databases ([#141](https://github.com/eitan-dardik/northline-dental-website/issues/141)). With the CEO's approval I took the first ones at 22:17 Israel (production and staging, `chmod 600`, kept off the repository); they are listed in the ops log (#140). This was not an incident: nothing was lost.