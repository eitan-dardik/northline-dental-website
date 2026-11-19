# Open Morning: run of show, Tue 24 Nov 2026 (times Israel; Toronto is 7 hours behind)
 
First draft, Wed 18 Nov (W7 task 42). Finished on Mon 23 (W8 task 55). The last column is filled in on the day.
 
**The event:** 10:00–12:00 clinic time = **17:00–19:00 Israel**, at 1847 Maple Ridge Road, Suite 200. Clinic phone on the day: (440) 555-0140.  
**At the desk:** Denise's team; the names come from Denise at the go/no-go call (Mon 23 Nov, 16:00, D7).  
**Me:** in Israel, watching the page, the database, Umami and the ticket; reachable on Telegram the whole time.  
**Freeze:** from Mon 23, 17:00 until Tue 24, 19:00, nothing changes on production except a revert.
 
| Time | What happens | Who | Check | What happened (fill in on the day) |
|---|---|---|---|---|
| Mon 23, after the go/no-go | **The printed list** made on the server (query 5), sent to Denise by email for the desk (never on the ticket); the file deleted from the server | me | the list's line count = registrations (query 3) | |
| Mon 23, after the go/no-go | **The production desk code** given to the desk **by phone**, never written in an email or the ticket | me | the desk opens `checkin/` on their device and checks in my test guest | |
| Tue 24, 16:00 | **Late registrations:** query 5 again, only guests who registered after Monday's list; sent to Denise for the desk (never on the ticket); the file deleted | me | the two lists together = registrations (query 3) | |
| 16:30 | **Final check:** the page, the form, check-in, Umami, the backup | me | the five lines below | |
| 16:30 | the page opens on my phone (mobile data), showing the event and the form | me | page OK | |
| 16:35 | a test registration (`+og…`) is stored and read back (query 2); its confirmation arrives | me | the row and the email | |
| 16:40 | check-in marks that test guest as arrived (production desk code) | me | "Checked in" | |
| 16:45 | Umami shows my visit in Realtime, with its tags; then tracking off on my own browsers and phone | me | the visit is there | |
| 16:50 | today's backup exists: its file name, time and size | me | the line in `backup.log` says `ok` | |
| **17:00** | **Doors open** at the clinic (10:00 there); online registration closes by itself; the banner on the main site disappears | Denise's desk | the first check-in arrives | |
| 17:15 | Count | me | registrations · check-ins · walk-ups (query 3, minus my `+og` test) · visitors on the page (Umami Realtime) | |
| 17:30 | Count (the talk on children's teeth starts at the clinic) | me | the same four numbers | |
| 17:45 | Count | me | the same four numbers | |
| 18:00 | Count (meet the team) | me | the same four numbers | |
| 18:15 | Count | me | the same four numbers | |
| 18:30 | Count | me | the same four numbers | |
| 18:45 | Count | me | the same four numbers | |
| **19:00** | **The event ends** (12:00 there) | the desk | final counts; the last check-in; walk-ups written on the list are entered | |
| 19:30 | **Note to Denise** on the ticket: how many registered, came, walk-ups; anything that happened | me | posted | |
 
**If the check-in page stops working:** the desk carries on with the printed list: they tick each guest who arrives and write walk-ups at the bottom; nobody waits. They tell me (how: settled with Denise on Mon 23); I check the page, the API and the database. Afterwards the ticked list is entered into the check-in page (or I mark the arrivals on the server), so the counts are complete.
 
**The two desk lines** (from the rehearsal, Wed 18 Nov):
 
1. **A guest on the list:** find their name on the printed list, type their email exactly as printed into "The guest's email", and press **Check in**. The page says "Checked in" with their first name and group size; tick them on the list. Not on the list: add them as a walk-up (name, new or existing patient, how many).
2. **If the page stops working** (no internet, or "The desk code is not right"): carry on with the printed list. Tick each guest who arrives and write walk-ups at the bottom; nobody waits. Tell Eitan; the list is entered afterwards.

**If something breaks on our side:** I save the evidence first (the time, a screenshot, the logs), then tell the CEO **within 10 minutes**. If the production version causes it, I revert to the last good tag; nothing else changes until 19:00 (the freeze).
 
**Who I call, and how:**
 
- **The desk / the clinic:** (440) 555-0140, or Denise on the ticket (#114).
- **The CEO:** Telegram, straight away for anything that stops guests registering or checking in.

**Before the day (to settle by Mon 23):** the desk staff's names (Denise, D7); how the desk reaches me on the day; when the desk needs the late list (16:00 here = 9:00 there, or earlier); which device the desk uses (a laptop or tablet types faster than a phone: 22 s and 35 s in the rehearsal); setting the production desk code with a length check against the password manager (the staging code failed once because of a paste error).
 
## Problems
 
| Heard at | What | What I did | Solved at |
|---|---|---|---|
| | | | |
 