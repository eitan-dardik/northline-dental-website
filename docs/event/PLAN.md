# Open Morning: event plan

- **Goal:** past patients and neighbors, especially families, come to a free Open Morning, and as many as possible book a visit afterwards.
- **When:** Tue 24 Nov 2026, 10:00–12:00 clinic time (Eastern) = 17:00–19:00 Israel
- **Where:** Northline's main office, Maple Ridge: 1847 Maple Ridge Road, Suite 200 (D3)
- **Phone on the day:** (440) 555-0140, for guests who need the clinic (D3)
- **For whom:** past patients and neighbors, especially families with children. Reachable contacts: ❓ after the list check; the list comes next week with the event kit (D2, task 16 due Tue 17 Nov)
- **Targets (approved by Denise, D1):** 30 registered · 20 attend · 8 book a visit within 7 days
- **Timetable (D3):** 10:00 doors open and free smile checks (10-minute slots) · 10:30 a short talk on caring for children's teeth · 11:00 meet the team · 12:00 close
- **Offer for guests who came:** given by Denise at the go/no-go call on Mon 23 Nov (D8); until then a placeholder in the email texts
- **Desk staff:** named by Denise at the go/no-go call on Mon 23 Nov (D7); I rehearse the desk myself on Wed 18 Nov
- **Poster:** goes to print **Wed 18 Nov**; the QR code file must reach Denise by then (D6)
- **Debrief:** Wed 25 Nov, 10:00 her time = 17:00 Israel (D9)
- **Client ticket:** #114

## What a guest does

1. Gets the invitation email (Thu 19 Nov), or sees the poster QR or the banner on Northline's site
2. Opens the event page
3. Registers (as few fields as possible, see CAPTURE.md)
4. Confirms the email address with one press of the link (their place is kept either way; one reminder to confirm after 24 h)
5. Gets a reminder (Mon 23 Nov)
6. Comes to the clinic and is checked in at the desk (Tue 24 Nov)
7. Gets a thank-you with a short survey and the booking offer (Wed 25 Nov); guests who registered but didn't come get "sorry we missed you"
8. Books a visit within 7 days

## Milestones

| Date | Milestone | Done when |
|---|---|---|
| Mon 9 Nov | Kickoff, ticket, board | the ticket is an issue (#114) and the roadmap shows every milestone |
| Tue 10 Nov | First reply, event plan, release plan | the reply is on #114 and this plan is complete |
| Wed 11 Nov | Fields designed, on call | CAPTURE.md is written, the shift is logged |
| Thu 12 Nov | Decision record, emails, Week 7 list, plan to Denise | Denise has the plan for her OK; evidence/w6 is open |
| Mon 16 Nov | On-call review, event-v0.1.0 on staging | the kit runs on its staging subdomain, CI green |
| Tue 17 Nov | event-v0.2.0: registration stored, confirmation email; **invite list checked** | a registration from my phone is in the table and the email arrives; LIST-CHECK.md written |
| Wed 18 Nov | event-v0.3.0: Umami, UTM, **QR to Denise before the poster prints**, check-in rehearsal; Denise approves | the QR file is with Denise; the events show in Umami; Denise approved the screenshots |
| Thu 19 Nov | Restore drill, event-v1.0.0 on production, invitations | the restore is counted, production is live, the send log is complete |
| Mon 23 Nov | Reminders, phone test, go/no-go (desk staff and offer from Denise), freeze | every link and the QR work on a phone; Denise said go |
| Tue 24 Nov | The Open Morning, note to Denise | check-ins counted, note sent |
| Wed 25 Nov | Follow-ups, funnel report, debrief 17:00 Israel | report committed, debrief held |
| Thu 26 Nov | Close registration, export, archive, runbook, retro | everything closed; evidence/w8 open |

**Week 7 estimate:** 12.93 h for the 24 Week 7 steps (the workbook's time for each × 0.8, my factor from the Week 5 decision.md). The workbook's own figure is about 15 h; if my factor is too low, Week 7 is tight. Week 7 also now holds the invite-list check (task 16, Tue 17) and the W4 evidence pack (task 18, Thu 19).

## Release plan

Tags start with `event-` so they don't clash with the site's own tags (`v0.3.0` …), as agreed on #95.
Staging releases can happen any time. Production releases only inside the change window, **16:00–22:00 Israel**, with the CEO's approval.

| Version | Day | Contains | Where | How I check it |
|---|---|---|---|---|
| `event-v0.1.0` | Mon 16 Nov | the kit configured (brand, event details, privacy line from CAPTURE.md), its own staging subdomain, CI green, `registration: 'soon'` | staging | the page opens on my phone and laptop with "Registration opens soon", no sideways scroll; CI green; Northline's main site still on its previous deploy |
| `event-v0.2.0` | Tue 17 Nov | the `registrations` table by migration (insert-only for visitors), the form connected, the confirmation email with the token confirm link, the reminder to confirm | staging | a registration from my phone is read back on the server with its time and `utm_source`; a second one with the same email makes no new row; with airplane mode on, registering shows a clear error with Northline's phone number, never a blank page or a thank-you; the confirmation arrives within 60 s and its link sets `verified_at` |
| `event-v0.3.0` | Wed 18 Nov | Umami events, the four UTM links, the poster QR, the check-in page with the desk code | staging | each event fired once on laptop and phone and counted in Umami, with no names or emails in it; the QR opens the page with the poster tags; two test guests checked in in under 30 s each, the count matches the database; Denise approves the screenshots |
| `event-v1.0.0` | Thu 19 Nov | all of the above, approved by Denise | production | backup taken and restored first (task 43); after the release, one test registration from my phone on production, read back, and its confirmation arrives; then the invitations go out |
| `event-v1.0.1` | Mon 23 Nov, 16:30–17:00, only if the go/no-go allows it | fixes from the phone test only | production | the link or step that failed now works on my phone; nothing else changed in the diff |
| — | Mon 23 Nov 17:00 → Tue 24 Nov 19:00 | **freeze:** nothing changes except a revert | | |
| `event-v1.1.0` | Thu 26 Nov | registration closed (`registration: 'closed'`), the page archived or redirected | production | a new registration is refused on my phone; the old address shows the "event has taken place" page or the redirect |

**Undo for every release:** revert the release commit and deploy, as in RELEASE.md. Each release's notes say what it contains, how I checked it and how to undo it.

## Risks (top 5)

| Risk | Likelihood | What I do about it |
|---|---|---|
| The invite list comes next week and has many bad rows, so fewer than 30 can register, with little time to fix it before the invitations on Thu 19 | medium | check it the same day it arrives (by Tue 17); tell Denise at once how many are reachable and what she can fix |
| The QR code isn't ready when the poster prints on Wed 18, so the poster has no working link | medium | the QR points to a fixed UTM link that I create early on Wed 18 and test on a phone; send the file to Denise in the morning her time |
| Invitations land in spam, so few people open them | medium | deliverability check before sending (SPF, DKIM, DMARC, two inboxes) on Tue 17 Nov; a test send first |
| The production release slips past the 16:00–22:00 window on Thu 19 Nov, so the invitations go out late | medium | restore drill and decision brief early in the day; release at 16:00, not at the end of the window |
| Test registrations mix with real ones and spoil the numbers | medium | tests only with +og addresses, invitations with +guest; tests removed before the report |

Also watched: hosting maintenance during the event week (as on 11 Nov, 00:00–02:00 UTC). The printed check-in list at the desk works without the site.

## If time runs short, I drop first

1. Magic Link sign-in (optional; guests register without it)
2. The banner link on Northline's website (the invitation, the reminder and the poster QR still bring people)
3. The "sorry we missed you" email (the thank-you still goes to every guest who came)

## Denise's answers (#114, Wed 11 Nov)

- ✅ D1 Goal and targets approved: 30 / 20 / 8
- ⏳ D2 The invite list comes next week, with the event kit (task 16 moved to Tue 17 Nov)
- ✅ D3 Page text from her first message; address and phone above
- ✅ D4 Her OK on the email texts by Tue 17 Nov (we send them Thu 12 Nov)
- ✅ D5 Her OK on the screenshots by Thu 19 Nov, 08:00
- ✅ D6 The poster prints Wed 18 Nov; the QR file must reach her by then
- ⏳ D7 Desk staff: at the go/no-go call, Mon 23 Nov
- ⏳ D8 The offer: at the go/no-go call, Mon 23 Nov; a placeholder in the email texts until then
- ✅ D9 The debrief: Wed 25 Nov, 10:00 her time