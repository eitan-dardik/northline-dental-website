# Open Morning: run of show, Tue 24 Nov 2026 (times Israel; Toronto is 7 hours behind)

First draft, Wed 18 Nov (W7 task 42). Finished on Mon 23 (W8 task 55). The last column is filled in on the day.

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
| Tue 24, 16:00 | **Late registrations:** query 5 again, only guests who registered after Monday's list (sent Mon 22:55); sent to Denise by email for the desk (never on the ticket); no file kept | me | the two lists together = registrations (query 3) | |
| 16:30 | **Final check:** the page, the form, check-in, Umami, the backup | me | the five lines below | |
| 16:30 | the page opens on my phone (mobile data), showing the event and the form | me | page OK | |
| 16:35 | a test registration (`+og2401`) is stored and read back (query 2); its confirmation arrives | me | the row and the email | |
| 16:40 | check-in marks that test guest as arrived (production desk code) | me | "Checked in" | |
| 16:45 | Umami shows my visit in Realtime, with its tags; then tracking off on my own browsers and phone | me | the visit is there | |
| 16:50 | today's backup exists: its file name, time and size | me | the line in `backup.log` says `ok` | |
| **17:00** | **Doors open** at the clinic (10:00 there); online registration closes by itself; the banner on the main site disappears | Denise's desk | the first check-in arrives | |
| 17:15 | Count | me | registrations · check-ins · walk-ups (query 3, minus my test rows: `+og006`, `+og2301`, `+og2302`, `+2303`, `+og2304`, `+og2401`) · visitors on the page (Umami Realtime) | |
| 17:30 | Count (the talk on children's teeth starts at the clinic) | me | the same four numbers | |
| 17:45 | Count | me | the same four numbers | |
| 18:00 | Count (meet the team) | me | the same four numbers | |
| 18:15 | Count | me | the same four numbers | |
| 18:30 | Count | me | the same four numbers | |
| 18:45 | Count | me | the same four numbers | |
| **19:00** | **The event ends** (12:00 there); the freeze ends | the desk | final counts; the last check-in; walk-ups written on the list are entered | |
| 19:30 | **Note to Denise** on the ticket: how many registered, came, walk-ups; anything that happened | me | posted | |

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
| | | | |
