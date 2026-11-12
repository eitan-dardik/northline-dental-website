# Week 7: my task list

I follow this list in order. Every step is 1 hour or less; times are the workbook's. Israel time throughout.
**Goal:** the kit on staging, `event-v1.0.0` on production on Thu 19 Nov, and the invitations sent.
**How:** as in the decision record: `event` → staging, `event-main` → production, both by Hostinger's Git deployment; the registrations table by migration; emails through my Week 4 mailer, invitations in batches.

**Load:** about 22 h in total: the 24 Week 7 steps (16.2 h) plus the three Week 6 tasks moved here with the CEO's OK (16, 14, 18: 5.25 h) and the Sunday kit check. The kit arrives on **Sun 15**, so I start then: everything that needs only the kit, or nothing at all, is done on Sunday and Monday, ahead of its due day. That leaves Wednesday and Thursday for the steps that can't move (the QR before the poster, Denise's screenshots, the backup drill and the production release). If a day runs over, I tell the CEO the same evening, with a new time.

| Day | Steps | Hours |
|---|---|---|
| Sun 15 | 1–7 | 4.75 |
| Mon 16 | 8–13 | 3.4 |
| Tue 17 | 14–20 | 4.4 |
| Wed 18 | 21–28 | 5.4 |
| Thu 19 | 29–36 | 4.2 |

| # | Day | Step (≤ 1 h) | Version | Done when |
|---|---|---|---|---|
| 1 | Sun 15 | Read Week 7 and the kit's README (task 25, 30 min) | — | my questions are sent to the CEO, or I have none |
| 2 | Sun 15 | Compare the kit's tables, event names and desk list with CAPTURE.md and MEASURE.md (30 min) | — | every difference is written in CAPTURE.md / MEASURE.md |
| 3 | Sun 15 | Check the invite list (task 16, 45 min; due Tue 17) | — | LIST-CHECK.md has the counts and problem rows, the reply to Denise is posted; the list itself is not in the repository |
| 4 | Sun 15 | Configure the kit (task 29, 45 min; due Mon): the kit as it came in one commit, then `config.js` and `assets/brand.css` in a second | v0.1.0 | the diff against the kit shows only those two files; the pages show Northline's look and Denise's details; `registration: 'soon'` |
| 5 | Sun 15 | W4 evidence pack, part 1: branch from `origin/main`, README with the 13 rows, link what exists (task 18, 1 h; due Thu 19) | — | every existing proof is linked |
| 6 | Sun 15 | W4 evidence pack, part 2: the "To do" rows and their proof (task 18, 1 h) | — | every row has its proof |
| 7 | Sun 15 | Send the agenda for Monday's review, by **20:00** (task 26, 15 min) | — | the agenda is sent and its time noted |
| 8 | Mon 16 | W4 evidence pack, part 3: the four safety checks, push, open the PR into `dev` (task 18, 30 min) | — | the checks print nothing; the PR is open, not merged |
| 9 | Mon 16 | Staging subdomain on `event` by Hostinger's Git deployment; CI job for the event branches (task 30, 45 min) | v0.1.0 | the event shows on my phone on the staging subdomain; CI green on `event`; the main site's last deploy unchanged |
| 10 | Mon 16 | Contact form limits, part 1: the database rules by a new migration on `dev`, applied to staging (task 14, 1 h; due Wed 18) | — | each rule has one refused insert with its error code |
| 11 | Mon 16 | **17:15** call: lead the review of my on-call shift (task 26, 30 min) | — | review held in ~20 min; incident-review.md written with three action items; the actions on my board |
| 12 | Mon 16 | Ops log (task 28, 10 min) | — | today's comment on the ops log issue |
| 13 | Mon 16 | Release `event-v0.1.0` on staging (task 31, 30 min) | v0.1.0 | tagged; release notes say what it contains, how I checked it, how to undo it |
| 14 | Tue 17 | Board and ticket comment, by **16:00** (task 27, 30 min) | — | the board shows the week; the comment is on #114 |
| 15 | Tue 17 | Ops log (task 28, 10 min) | — | today's comment |
| 16 | Tue 17 | The `registrations` table by migration, applied to staging (task 32, 45 min); merge `dev` into `event` first, because task 14's migration is already on staging | v0.2.0 | migration merged and applied; proof shows insert `201` and read `401` |
| 17 | Tue 17 | Connect the form; register from my phone as `+og001` (task 33, 45 min) | v0.2.0 | the row is read back with its time and `utm_source`; a second registration makes no new row; airplane mode shows the error with Northline's phone number |
| 18 | Tue 17 | The confirmation email through my mailer, with the token link and the reminder to confirm; the mailer logs the mail server's reply for each email (task 34, 1 h) | v0.2.0 | the confirmation arrives within 60 s; its link sets `verified_at`; one `confirmation` row in `registration_emails`; the reminder to confirm sent once |
| 19 | Tue 17 | Deliverability check (task 35, 45 min) | v0.2.0 | email-check.md shows the three DNS records and, for two inboxes, inbox or spam and the SPF, DKIM, DMARC results |
| 20 | Tue 17 | Release `event-v0.2.0` on staging (task 36, 30 min) | v0.2.0 | tagged; release notes name the migration |
| 21 | Wed 18 | **First:** the four UTM links, the poster QR, the website banner on staging (task 38, 1 h); the QR file to Denise before the poster prints | v0.3.0 | the QR opens the page with the poster tags; all four links show in Umami with their tags; the QR file is on #114 |
| 22 | Wed 18 | Umami for the event (task 37, 1 h) | v0.3.0 | every event shows from laptop and phone; `form_submit` count matches the rows; no personal data or token in any event |
| 23 | Wed 18 | Rehearse the check-in desk (task 39, 45 min) | v0.3.0 | a test guest checked in in under 30 s; a walk-up counted; the page's count matches query 3; the two desk lines written |
| 24 | Wed 18 | Screenshots to Denise, by **20:00** (task 40, 30 min) | v0.3.0 | the screenshots are on #114 |
| 25 | Wed 18 | Contact form limits, part 2: the same rules in the form; names in other languages accepted; close #35 and #36 (task 14, 1 h) | — | form and database agree; #35 and #36 closed with the proof |
| 26 | Wed 18 | Ops log (task 28, 10 min) | — | today's comment |
| 27 | Wed 18 | Release `event-v0.3.0` on staging (task 41, 30 min) | v0.3.0 | tagged, with release notes |
| 28 | Wed 18 | Run of show, first draft (task 42, 30 min) | — | times 16:30–19:30, who is at the desk, how the desk gets the code and the printed list, what to do if the page stops |
| 29 | Thu 19 | **Before 14:00:** open the release PR `event` → `event-main` with the production block of `config.js`; request the CEO's review (part of task 45) | v1.0.0 | the PR is open and the review requested |
| 30 | Thu 19 | Backup and restore drill, before the release (task 43, 45 min), by 21:00 | v1.0.0 | restore.md shows matching counts, with a backup time before the release |
| 31 | Thu 19 | Release decision brief (task 44, 30 min), by 21:00 | v1.0.0 | the brief is written, with a time before the release |
| 32 | Thu 19 | **From 16:00:** `event-v1.0.0` to production (task 45, 1 h): apply the migrations (task 14's and the registrations table), set the production desk code, merge the release PR, phone test as `+og006` (as the brief says), tag; release the banner PR to the main site (its release PR notes #111) | v1.0.0 | on production inside 16:00–22:00; every check passed; release notes with "How to undo"; times written: merged, on production, checked |
| 33 | Thu 19 | Send the invitations, in batches (task 46, 45 min), by **23:59** | v1.0.0 | every reachable contact got one; invitations.md has the counts |
| 34 | Thu 19 | Status email to Denise (task 47, 30 min) | — | the email is in the evidence PR, with no technical words |
| 35 | Thu 19 | Ops log (task 28, 10 min) | — | Mon–Thu each have a comment |
| 36 | Thu 19 | Week 7 evidence PR, by **23:59** (task 48, 30 min) | — | the PR is open |

**Rule from task 45:** if a production check fails and I can't fix it within 20 minutes, I revert the release and tell the CEO. After 22:00 nothing new goes to production; a revert is always allowed.