# Open Morning: results (T+1, read Wed 25 Nov 16:10)

**In one line:** 24 registered against a goal of 30, and 10 people came against 20 (6 of the sign-ups and 4 walk-ups); **7 visit requests for 11 people** came in after the follow-ups, against a goal of 8 bookings, which Denise's team counts at T+7 (Tue 1 Dec).

## The funnel (guests only; tests taken out, see the table below)

| Step | Guests | From the step before | Source | Read at |
|---|---|---|---|---|
| Invited | 108 | — | the send log (W7 task 46: 108 sent, 108 arrived) | Fri 20 Nov 10:38 |
| Opened the page | 66 | 36 of them came in from the invitation link (36 of 108 invited) | Umami, sessions in Toronto (mine are in Israel) | Wed 25, 14:20 |
| Registered | 24 | 24 of 66 who opened | registrations table, my tests left out | Wed 25, 14:20 |
| Confirmed (pressed the link) | 21 | 21 of 24 | registrations, `verified_at` (query 3) | Wed 25, 14:20 |
| Reminded | 0 | 0 of 24 | `registration_emails`, `reminder` | Wed 25, 14:20 |
| Attended | 6 sign-ups + 4 walk-ups = **10 people** | 6 of 24 sign-ups (5 of the 21 who confirmed, and 1 who couldn't confirm because of a typo in her address) | check-in on the tablet (5), corrected after the event (1), Denise's paper list (4 walk-ups) | Wed 25, 14:20; paper list Tue evening |
| Followed up | 6 thank-yous + 18 "sorry we missed you" = 24 of 24 sign-ups, 0 failed | — | `registration_emails`, `thank_you` / `missed_you` | Wed 25, 16:05 |
| Asked for a visit (booking page) | **7 requests, 11 people** | 7 requests after 24 follow-ups | `visit_requests` | Thu 26, 18:15 |
| Booked a visit | not yet (goal 8) | | Denise, at T+7 | |

**Why "Reminded" is 0:** the day-before reminder went out on Mon 23 at 14:48 Israel, as planned, but the guests signed up later that day (19:14–19:16), and no second reminder was sent (agreed with the CEO on Mon 23).

## Where people came from

| Source | Opened | Registered | Confirmed | Attended |
|---|---|---|---|---|
| Invitation | 36 | 14 | 14 | 4 |
| Reminder link | 13 | 3 | 2 | 0 |
| Poster QR | 9 | 3 | 2 | 1 |
| Northline website banner | 13 | 4 | 3 | 1 |
| Walk-up (no link) | — | — | — | 4 (2 groups of 2) |

"Opened" counts visitors (sessions) per link; a visitor who opened two links counts under both, so the column adds up to 71, not 66. Came is never a share of Invited: the poster, the banner and the walk-ups reached people who were not invited.

## Visit requests (the booking page)

**7 requests for 11 people** (read Thu 26 Nov 18:15, my tests left out; the last one Wed 25 Nov 19:26), all after the follow-ups at 16:00. Against the goal of **8 bookings**, these are requests, not yet bookings: Denise's team confirms each visit and counts the bookings at T+7.

| | Requests | People |
|---|---|---|
| **All** | 7 | 11 (4 of them children) |
| New patients | 4 | |

**By office and dentist:**

| Office | Dentist | Requests | People |
|---|---|---|---|
| Maple Ridge | Dr. Patel | 3 | 4 |
| Fairview | Dr. Patel | 2 | 4 |
| Fairview | Dr. Feld | 1 | 1 |
| Grandon | Dr. Feld | 1 | 2 |

The requests' contact details go to Denise's team by email (query 13), never into this report.

## What guests said (the survey, read Thu 26 Nov 16:55)

- **Answers:** 4 of 24 guests who got a survey link: **2 of 6** from the thank-you, **2 of 18** from "sorry we missed you" (my own test answer left out).
- **Average rating:** **4.5 out of 5** (2 answers: a 5 and a 4).
- **Most useful:** not answered (0 of 2).
- **Would recommend:** yes 2, maybe 0, no 0.
- **What kept them away:** forgot 1, the time 1.
- **Asked to be contacted about booking:** 1 (the details went to Denise's team by email, not into this report).
- **In their words** (no names):
  - "The smile check was quick and friendly. Thank you!" (a guest who came)
  - "Lovely morning. I never got your emails before the event, so I was not sure I was on the list." (a guest who came)
  - "I forgot, and I did not get a reminder." (a guest who didn't come)
  - "Work ran late. Is there another date?" (a guest who didn't come)

## Where people dropped off

- **Invited → opened:** 36 of 108 opened the invitation link.
- **Opened → registered:** 24 of 66.
- **Registered → confirmed:** 21 of 24. One of the 3 who didn't had a typo in her address, so the confirmation never reached her; she came anyway.
- **Registered → came: the biggest drop, 6 of 24.** No reminder reached any guest (see above), and 18 sign-ups didn't come. One of them says so in the survey: "I forgot, and I did not get a reminder."

## What worked (at most three)

1. **The invitation:** 14 of the 24 sign-ups and 4 of the 6 who came.
2. **The desk's fallback:** when it got busy, the walk-ins went on the paper list; nobody waited, and every question from the desk had an answer within minutes.
3. **The follow-ups:** all 24 sign-ups heard from Northline within 24 hours, 0 failed; the servers had no alerts or incidents during the event.

## What to change next time (at most three)

1. **A reminder for everyone, the evening before or the morning of the event,** sent after the last sign-ups, not at a fixed time before them.
2. **Catch address typos at sign-up:** show the address back on the "You are registered" page ("We sent it to …; not right? Fix it").
3. **Walk-ups on the tablet, or the paper list entered the same day,** with the new/existing question asked, so the numbers are complete without asking afterwards.

## Not measurable this time, and why

- **Bookings:** the 7 requests are counted here; which of them became booked visits, Denise's team counts at T+7.
- **The 4 walk-ups:** no names and no new/existing answer on the paper list, so they are counted here but not in the database.
- **Why the reminder link brought 13 visitors and 3 sign-ups** although no guest got the reminder email: the link may have been shared; the data can't tell.
- **People vs devices:** Umami counts devices (sessions), not people.

## Test and own traffic taken out

Read Wed 25 Nov, 14:20 Israel (task 60), on production: the `registrations` and `registration_emails` tables (event `2026-11-open-morning`), and Umami's own database (website "Open Morning – production"). Read only; nothing was deleted: the test rows stay as the proof of the tests.

**What counts as mine:** every registration whose address has my test tag (`+og…`, and the two I typed without "og": `+2303`, `+2401`), and every Umami session from Israel (no guest is in Israel; every guest session is in Toronto).

| Step | All | Test and own | Guests |
|---|---|---|---|
| Opened the page (Umami sessions) | 73 | 5 (+ 2 outside the area, below) | **66** |
| Registered (sign-ups) | 30 | 6 | **24** (24 distinct addresses) |
| Confirmed (pressed the confirm link; `verified_at` set) | 24 | 3 | **21** |
| Confirmation email sent | 30 | 6 | 24 |
| Reminder sent (task 50, Mon 14:48) | 1 | 1 | **0**: sent before any guest had registered; no second reminder (agreed with the CEO, Mon 23) |
| Reminder to confirm (`verify_reminder`) | 3 | 3 | 0 |
| Checked in, sign-ups (on the tablet, plus one corrected after the event) | 9 | 3 | **6** |
| Walk-ups | 0 in the database | 0 | **4 people in 2 groups**, on Denise's paper list (#114) |
| Thank-you sent (Wed 16:00) | 6 | 0 (tests left out by the script) | **6** |
| "Sorry we missed you" sent (Wed 16:00) | 18 | 0 | **18** |
| Survey answers (read Thu 26, 16:55) | 5 | 1 (`+og2301`, the phone test, Mon 15:18) | **4** of 24 links sent: 2 of 6 thank-you, 2 of 18 "missed you" |

**Confirmed is counted from `verified_at`,** the time a guest pressed the link, never from the confirmation email being sent: 24 emails went to guests, 21 guests pressed the link.

**Rows and distinct addresses agree** (24 and 24), so no guest is counted twice. The guest whose address had a typo is one row: corrected on Tue 19:14, and counted once, as a sign-up who came (she is also on the paper list).

**Umami sessions outside the area, left out of the guests:** 2 single page views, from São Paulo (an iPhone, Fri 20 Nov 12:38) and France (Linux, Sun 22 Nov 12:10), far from the clinic and with no other step: most likely link previews or crawlers.

### Every test I made

| Test | Task | When (Israel) | Registered | Confirmed | Checked in | Umami session |
|---|---|---|---|---|---|---|
| `+og006` | W7 release check | Thu 19 Nov 20:28–20:54 | 20:30 | ✅ | ✅ | 3 (laptop Firefox, phone, laptop Chrome; Tel Aviv) |
| reminder test (no row) | 50 | Mon 23 Nov 09:35–09:36 | — | — | — | phone (the same session as the phone test) |
| `+og2301` | 51 phone test, invitation link | Mon 23 Nov 15:03 | 15:03 | ✅ | ✅ | phone, 15:03–15:18 |
| `+og2302` | 51, reminder link | Mon 23 Nov 15:05 | 15:05 | — | — | |
| `+2303` | 51, poster QR (typed without "og") | Mon 23 Nov 15:11 | 15:11 | — | — | |
| `+og2304` | 51, website banner | Mon 23 Nov 15:12 | 15:12 | — | — | |
| `+2401` | 56 final check (typed without "og") | Tue 24 Nov 16:29–16:35 | 16:31 | ✅ | ✅ | phone, 16:29 |

After the final check, Umami tracking was off on my PC (`umami.disabled`) and my phone stayed off the event page, so the page checks at 18:59–19:00 aren't in the count.
