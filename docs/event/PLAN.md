# Open Morning: event plan

- **Goal:** past patients and neighbors, especially families, come to a free Open Morning, and as many as possible book a visit afterwards.
- **When:** Tue 24 Nov 2026, 10:00–12:00 clinic time (Eastern) = 17:00–19:00 Israel
- **Where:** Northline's main clinic, 210 Harbour Street (made-up address)
- **For whom:** past patients and neighbors, especially families with children. Reachable contacts: ❓ after the list check (task 16; the list hasn't arrived yet)
- **Targets:** 30 registered · 20 attend · 8 book a visit within 7 days
- **Timetable:** 10:00 doors open and smile checks (10-minute slots) · 10:30 a short talk on caring for children's teeth · 11:00 meet the team · 12:00 close
- **Offer for guests who came:** priority booking for a visit in December ❓ Denise to confirm (D8)
- **Client ticket:** #114

## What a guest does

1. Gets the invitation email (Thu 19 Nov), or sees the poster QR or the banner on Northline's site
2. Opens the event page
3. Registers (as few fields as possible, see CAPTURE.md)
4. Confirms the email address with one press of the link
5. Gets a reminder (Mon 23 Nov)
6. Comes to the clinic and is checked in at the desk (Tue 24 Nov)
7. Gets a thank-you with a short survey and the booking offer (Wed 25 Nov); guests who registered but didn't come get "sorry we missed you"
8. Books a visit within 7 days

## Milestones

| Date | Milestone | Done when |
|---|---|---|
| Mon 9 Nov | Kickoff, ticket, board | the ticket is an issue (#114) and the roadmap shows every milestone |
| Tue 10 Nov | First reply, event plan, release plan | the reply is on #114 and this plan is complete |
| Wed 11 Nov | Invite list checked, fields designed, on call | LIST-CHECK.md and CAPTURE.md are written, the shift is logged |
| Thu 12 Nov | Decision record, emails, Week 7 list, plan to Denise | Denise has the plan for her OK; evidence/w6 is open |
| Mon 16 Nov | On-call review, event-v0.1.0 on staging | the kit runs on its staging subdomain, CI green |
| Tue 17 Nov | event-v0.2.0: registration stored, confirmation email | a registration from my phone is in the table and the email arrives |
| Wed 18 Nov | event-v0.3.0: Umami, UTM, QR, check-in; Denise approves | the events show in Umami, Denise approved the screenshots |
| Thu 19 Nov | Restore drill, event-v1.0.0 on production, invitations | the restore is counted, production is live, the send log is complete |
| Mon 23 Nov | Reminders, phone test, go/no-go, freeze | every link and the QR work on a phone; Denise said go |
| Tue 24 Nov | The Open Morning, note to Denise | check-ins counted, note sent |
| Wed 25 Nov | Follow-ups, funnel report, debrief | report committed, debrief held |
| Thu 26 Nov | Close registration, export, archive, runbook, retro | everything closed; evidence/w8 open |

## Risks (top 5)

| Risk | Likelihood | What I do about it |
|---|---|---|
| The invite list arrives late or has many bad rows, so fewer than 30 can register | medium (it's already late) | asked on #114 and Telegram; check it the same day it arrives; tell Denise how many are reachable and what she can fix |
| Invitations land in spam, so few people open them | medium | deliverability check before sending (SPF, DKIM, DMARC, two inboxes) on Tue 17 Nov; a test send first |
| The production release slips past the 16:00–22:00 window on Thu 19 Nov, so the invitations go out late | medium | restore drill and decision brief early in the day; release at 16:00, not at the end of the window |
| Hosting maintenance or an outage during the event week (as on 11 Nov, 00:00–02:00 UTC) | low | watch Hostinger's emails; tell Denise; the printed check-in list at the desk works without the site |
| Test registrations mix with real ones and spoil the numbers | medium | tests only with +og addresses, invitations with +guest; tests removed before the report |

## If time runs short, I drop first

1. Magic Link sign-in (optional; guests register without it)
2. The banner link on Northline's website (the invitation, the reminder and the poster QR still bring people)
3. The "sorry we missed you" email (the thank-you still goes to every guest who came)

## Open questions for Denise

All asked on #114 (the needs list D1–D9, dates in her time). No answer yet on Wed 11 Nov, 16:00 Israel.

- ❓ D1 Her OK on the goal and the targets (by Thu 12 Nov)
- ❓ D2 The invite list (CSV): due Wed 11 Nov 09:00 her time, not received; asked again on #114
- ❓ D3 The page text: what happens, the timetable, the address (by Fri 13 Nov)
- ❓ D4 Her OK on the email texts (we send them Thu 12 Nov; by Tue 17 Nov)
- ❓ D5 Her OK on screenshots of the page (by Thu 19 Nov, 08:00)
- ❓ D6 The poster print deadline (sets the QR date)
- ❓ D7 Who checks guests in at the desk (by Tue 17 Nov)
- ❓ D8 The offer for guests who came: priority December booking? (by Thu 12 Nov)
- ❓ D9 The debrief, Wed 25 Nov 10:00 her time (by Thu 12 Nov)