# Open Morning: run of show, Tue 24 Nov 2026 (times Israel; Toronto is 7 hours behind)

First draft, Wed 18 Nov (W7 task 42). Finished on Mon 23 (W8 task 55). Filled in on the day, Tue 24 (W8 tasks 56–58). Counts from the event-count message on Telegram (registrations and check-ins from the database, my test rows left out; visitors from Umami's database; also on [#207](https://github.com/eitan-dardik/northline-dental-website/issues/207#issuecomment-7138767090)), checked against the database by hand.

**The event:** 10:00–12:00 clinic time = **17:00–19:00 Israel**, at 1847 Maple Ridge Road, Suite 200. Clinic phone on the day: (440) 555-0140.  
**At the desk:** Maria, at the front desk, on the clinic's tablet (Denise, [#114](https://github.com/eitan-dardik/northline-dental-website/issues/114), Mon 23 Nov, D7).  
**Me:** in Israel, watching the page, the database, Umami and the ticket; reachable on Telegram the whole time. A phone alarm is set for every time in the table below (#184).  
**Freeze:** from Mon 23, 17:00 until Tue 24, 19:00, nothing changes on production except a revert ([the notice and the revert steps](https://github.com/eitan-dardik/northline-dental-website/issues/114#issuecomment-7103090834)).  
**Live:** event-v1.0.0 (`57dd9a8`) on event.holistech.tech; the main site v0.7.0 (`2fa77a8`).

## Monday 23 Nov (done)

| Time | What | Result |
|---|---|---|
| 14:48 | **Reminders sent** (EMAILS.md email 3, to every registered guest; `registration_emails`, kind `reminder`) | **1 sent, 0 bounced** (the only registration then was my `+og006` test; it arrived in the Inbox at 14:48). 24 guests registered later, Mon 19:14–19:16; no second reminder (the CEO knows) ([#200](https://github.com/eitan-dardik/northline-dental-website/issues/200#issuecomment-7101764386)) |
| 15:03–15:18 | Phone test of every link and the QR, on mobile data | all passed: invitation, reminder, poster QR, banner, confirm, check-in, survey ([#201](https://github.com/eitan-dardik/northline-dental-website/issues/201#issuecomment-7102526024)) |
| 16:00 | Go/no-go | **GO**, all eight rules pass ([the note on #114](https://github.com/eitan-dardik/northline-dental-website/issues/114#issuecomment-7103072549)) |
| 17:00 | Freeze starts | until Tue 19:00 |

## Tuesday 24 Nov

| Time | What happens | Who | Check | What happened (fill in on the day) |
|---|---|---|---|---|
| Mon 23, after the call | **The printed list** made on the server (query 5), sent to Denise by email for the desk (never on the ticket); no file kept | me | the list's line count = registrations (query 3) | **sent Mon 22:55**: 24 guests (my test rows left out) = the 24 guest registrations (all registered Mon 19:14–19:16); one guest's email spelled "mose", flagged to Denise |
| Mon 23, after the call | **The production desk code:** given when Denise asks for it, never on the ticket or in an email (Denise, #114); sent to the CEO by Telegram, Mon 23 | me | the desk opens `checkin/` on their device and checks in my test guest | sent to the CEO by Telegram, Mon evening |
| Tue 24, 16:00 | **Late registrations:** query 5 again, only guests who registered after Monday's list (sent Mon 22:55); sent to Denise by email for the desk (never on the ticket); no file kept | me | the two lists together = registrations (query 3) | 0 late sign-ups after Mon 22:55 (still 24); told Denise by email and [on #114](https://github.com/eitan-dardik/northline-dental-website/issues/114#issuecomment-7133652099) at 15:59 |
| 16:30 | **Final check:** the page, the form, check-in, Umami, the backup | me | the five lines below | all five passed (below; [#206](https://github.com/eitan-dardik/northline-dental-website/issues/206#issuecomment-7134777786)) |
| 16:30 | the page opens on my phone (mobile data), showing the event and the form | me | page OK | ✅ 16:29:58 on my phone, mobile data (Umami: Android, Chrome, mobile) |
| 16:35 | a test registration (planned `+og2401`, typed as `+2401`) is stored and read back (query 2); its confirmation arrives | me | the row and the email | ✅ stored 16:31:15 as `+2401` (typed without "og"), read back; "You are registered"; confirmed 16:32 ("Your email is confirmed") |
| 16:40 | check-in marks that test guest as arrived (production desk code) | me | "Checked in" | ✅ "Checked in" 16:35:09 (production desk code); the row shows arrived. The first try at 16:33 said "not on the list" (Problems, 16:33) |
| 16:45 | Umami shows my visit in Realtime, with its tags; then tracking off on my own browsers and phone | me | the visit is there | ✅ one visitor in Umami with every step (`cta_click`, `form_start`, `form_submit`, `/confirm/`, `/checkin/`); then tracking off on my PC (`umami.disabled`), and the phone kept off the event page. The count with my tests left out: 24 · 0 · 0 |
| 16:50 | today's backup exists: its file name, time and size | me | the line in `backup.log` says `ok` | ✅ `2026-11-24T02:30:02Z ok nightly-prod-2026-11-24-0230.dump 232K` |
| **17:00** | **Doors open** at the clinic (10:00 there); online registration closes by itself; the banner on the main site disappears | Denise's desk | the first check-in arrives | **17:00:** registered 24 · check-ins 0 · on the page 0 (last 15 min) · servers: all checks pass. First check-ins 17:05 (5 in 24 s on the tablet) |
| 17:15 | Count | me | registrations · check-ins · walk-ups (query 3, minus my test rows: `+og006`, `+og2301`, `+og2302`, `+2303`, `+og2304`, `+2401`) · visitors on the page (Umami Realtime) | registered 24 · check-ins 5 (5 arrived, 0 walk-ups) · on the page 5 (last 15 min) · all checks pass |
| 17:30 | Count (the talk on children's teeth starts at the clinic) | me | the same four numbers | registered 24 · check-ins 5 · on the page 0 · all checks pass. Problem at 17:21 answered |
| 17:45 | Count | me | the same four numbers | registered 24 · check-ins 5 on the tablet, none since 17:05 · on the page 0 · all checks pass. Problem at 17:35 |
| 18:00 | Count (meet the team) | me | the same four numbers | registered 24 · check-ins 5 on the tablet · on the page 0 · all checks pass |
| 18:15 | Count | me | the same four numbers | registered 24 · check-ins 5 on the tablet; the walk-up from the 17:35 problem isn't in the database · on the page 0 · all checks pass |
| 18:30 | Count | me | the same four numbers | registered 24 · check-ins 5 on the tablet, none since 17:05 (Umami: no check-in page activity 17:18–18:33, no form errors: not a page fault) · on the page 0 · all checks pass. Problem at 18:25 |
| 18:45 | Count | me | the same four numbers | registered 24 · check-ins 5 on the tablet · on the page 0 · all checks pass |
| **19:00** | **The event ends** (12:00 there); the freeze ends | the desk | final counts; the last check-in; walk-ups written on the list are entered | **19:00:** registered 24 · check-ins 5 on the tablet (none after 17:05), the rest on the paper list (the count asked from Denise on #114; added when she sends it) · 5 visitors on the page 17:00–19:00 · servers: no alerts, no incidents. 18:59–19:00: the page switched from "happening now" to "The Open Morning has ended" on time ✅ || walk-ups written on the list are entered | **19:00:** registered 24 · check-ins 5 on the tablet (all at 17:05) · 5 visitors on the page 17:00–19:00 · servers: no alerts, no incidents. 18:59–19:00: the page switched from "happening now" to "The Open Morning has ended" on time ✅. **Final, from Denise's paper list (#114, Tue evening): 5 people on paper:** the two neighbours (2), the guest with the email typo (1, a sign-up), the dad and son (2); everyone else who came is on the tablet. **10 people came:** 6 of the 24 sign-ups (5 on the tablet + the guest with the typo) and 4 walk-ups in 2 groups |
| 19:30 | **Note to Denise** on the ticket: how many registered, came, walk-ups; anything that happened | me | posted | ✅ [posted on #114](https://github.com/eitan-dardik/northline-dental-website/issues/114#issuecomment-7138605472), before 19:30: counts, tonight's questions, tomorrow's follow-ups; asked for the paper count |

**If the check-in page stops working:** the desk carries on with the printed list: they tick each guest who arrives and write walk-ups at the bottom; nobody waits. Denise tells me on the ticket (#114), as she asked on Mon 23; I check the page, the API and the database. Afterwards the ticked list is entered into the check-in page (or I mark the arrivals on the server), so the counts are complete.

**The two desk lines** (from the rehearsal, Wed 18 Nov):

1. **A guest on the list:** find their name on the printed list, type their email exactly as printed into "The guest's email", and press **Check in**. The page says "Checked in" with their first name and group size; tick them on the list. Not on the list: add them as a walk-up (name, new or existing patient, how many).
2. **If the page stops working** (no internet, or "The desk code is not right"): carry on with the printed list. Tick each guest who arrives and write walk-ups at the bottom; nobody waits. Tell Eitan; the list is entered afterwards.

**If something breaks on our side:** I save the evidence first (the time, a screenshot, the logs), then tell the CEO **within 10 minutes**. If the production version causes it, I revert to the last good tag (event-v1.0.0), following the revert steps in the freeze notice; nothing else changes until 19:00 (the freeze).

**Who I call, and how:**

- **Denise:** on the ticket (#114), as she asked. The clinic's phone: (440) 555-0140.
- **The CEO:** Telegram, straight away for anything that stops guests registering or checking in.

## Settled on Mon 23

| Question | Answer |
|---|---|
| The desk staff's names (D7) | Maria, at the front desk |
| How the desk reaches me on the day | Denise, on the ticket (#114); she asks for anything she needs (a number, the list, the desk code) and I give it then |
| When the desk needs the late list | Tue 16:00 here = 9:00 there, to Denise by email (as in the status email) |
| Which device the desk uses | the tablet (faster than a phone for typing emails: 22 s and 35 s on a phone in the rehearsal) |
| Who gets the printed list | Denise, by email |
| The offer for guests who came | a free check-up in the first two weeks of December (Denise's email, 15 Nov): **stands** (Denise, #114, Mon 23) |
| The production desk code | set Thu 19 Nov with a length check against the password manager (23 characters); worked in the phone test, Mon 23, 15:15 |

## Problems

| Heard at | What | What I did | Solved at |
|---|---|---|---|
| 16:33 | Final check: my test check-in said "not on the list" | the registration was stored as `+2401` (my typo when registering); checked in with the stored address; added `2401` to the count's test filter | 16:35 |
| 17:21 | Denise (#114): two neighbours walked in without signing up; can they be added? | [answered on #114](https://github.com/eitan-dardik/northline-dental-website/issues/114#issuecomment-7135899651): yes, as walk-ups on the check-in page, or on the paper list if busy | 17:21 |
| 17:35 | [Denise (#114)](https://github.com/eitan-dardik/northline-dental-website/issues/114#issuecomment-7136271413): a guest says she signed up but got none of our emails | found her registration: her address had a typo (the one flagged to Denise on Mon), so the confirmation was sent but never reached her, and she couldn't confirm; no reminders went to Monday's sign-ups (agreed Mon). Asked Denise privately (Telegram) for the address she used; [answered on #114](https://github.com/eitan-dardik/northline-dental-website/issues/114#issuecomment-7137164141) without personal data: a typo in her address, let her in as a walk-up | by 18:00 (Denise confirmed the right address with her, on Telegram) |
| 18:15 | Walk-ups still 0 although the desk added walk-ups; no tablet check-ins since 17:05 | checked Umami's check-in page events (read only): no activity 17:18–18:33 and no form errors, so not a page fault; the walk-ins were going on the paper list; asked Denise for the paper count (in the 18:28 answer). Denise later: Maria went to paper when it got busy; only the walk-ins and the guest with the typo are on paper, so no other sign-up arrived after 17:05 | 18:33 (cause found; count from Denise, Tue evening) |
| 18:25 | Denise (#114): a dad and his son walked in; same as before? | [answered](https://github.com/eitan-dardik/northline-dental-website/issues/114#issuecomment-7137715436): one walk-up for 2, or the paper list; asked whether the desk was on paper | 18:28 |

## After 19:00

| Time | What | Result |
|---|---|---|
| 19:04 | The event count's cron line removed; the monitor's status back to 08:30 only | `crontab -l`: the backup and the monitor only; `check --dry-run`: 0 failing |
| 19:14 | The guest from the 17:35 problem: her address corrected (as Denise confirmed with her) and her registration marked arrived at 18:00 (the CEO's time), so she gets the thank-you, not "sorry we missed you"; she wasn't in the database as a walk-up, so she's counted once | dry run (`ROLLBACK`), then `COMMIT`: `UPDATE 1`; read back: 1 row. Check-ins on the system: 6 |

**Still open:** the 4 walk-ups from the paper list (2 groups of 2) are not in the database; they have no email, so they get no follow-up. They are counted in the report (task 61), and entered as walk-up rows only if the CEO wants the database to match.
