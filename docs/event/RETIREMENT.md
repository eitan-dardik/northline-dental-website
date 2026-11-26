# Open Morning: retirement note, Thu 26 Nov 2026

What was switched off when the event closed, what still runs, and who owns it (W8 task 64). Times are Israel time; the clinic is 7 hours behind.

| Part | Now | Date | Owner | How to check |
|---|---|---|---|---|
| Event page (`event.holistech.tech`) | **archived:** "The Open Morning has ended", **Book your visit**, no form; since Tue 24 Nov, 12:00 Toronto by itself (`endsAt`), made final in event-v1.1.0 (#227). **Comes down** by Sun 29 Nov: every event address redirects to the main site (step 8) | Thu 26 Nov, 16:45 (archived); by Sun 29 Nov (redirect) | me | open it on a phone |
| Event staging (`event-stage.holistech.tech`) | archived (#226); redirected with production in step 8 | Thu 26 Nov; by Sun 29 Nov | me | open it |
| Registration form | **off** (no form on the page) | Tue 24 Nov 12:00 Toronto; final Thu 26 Nov | me | the page shows no form |
| Visitor insert rules on `registrations`, `visit_requests`, `event_feedback` (rows sent straight to the API) | **still open** tonight; **to be dropped** by one migration, staging first, PRs approved by the CEO (his decision, Thu 21:34): closing step 9 below | by Sun 29 Nov | me, approved by the CEO | a `POST` to `/rest/v1/registrations` with the publishable key: `201` = still open, `401`/`403` = refused |
| Desk code (check-in) | **removed** on both databases (`delete from public.event_desk;`) | staging Thu 26 Nov, before 16:30; production Thu 26 Nov, 16:33 | me | `select count(*) from public.event_desk;` = 0 on both |
| Registrations, their email log, survey answers, visit requests | exported to Denise (the CEO) by email: the 24 sign-ups as an Excel file with a summary (Thu 26 Nov 16:43), the call-back list of 7 visit requests and 1 "contact me" (Thu 19:31); every copy of mine deleted after sending. **The rows are deleted** by Sun 29 Nov (closing step 7 below): the purpose the page promised is over | Thu 26 Nov (exports); by Sun 29 Nov (rows) | me | the email dates; `select count(*)` = 0 in each table after step 7 |
| Confirmation and reminder emails (the mailer's event emails) | **off**: `EVENT_URL` removed from the mailer's `mailer.env` on production (21:49) and staging (21:50); the log says `event emails off (no EVENT_URL)`; the leads emails keep working (the CEO's request, Thu 21:34) | Thu 26 Nov, 21:49 | me | `docker compose logs mailer \| grep 'mailer started'` → `event emails off`. **Undo:** `cp -p mailer.env.bak-2026-11-26 mailer.env`, then `docker compose up -d --no-deps mailer` |
| Follow-up emails | **sent once**, Wed 25 Nov 16:00 (6 thank-you, 18 "sorry we missed you"); the one-off scripts (`remind.mjs`, `followup.mjs`) and the send log deleted from the server and the mailer container, Thu 26 Nov | Wed 25 Nov | me | `ls ~/remind` (no such folder); `docker exec northline-prod-mailer-1 ls /app` (no `remind`, no `followup`) |
| Survey (`feedback/`) | **open until the report is final**, then its answers are deleted with the registrations (on delete cascade) and the page comes down with the rest (closing steps 7–8) | by Sun 29 Nov | me | query 10 = 0 after step 7 |
| Booking page (`book/`) and `visit_requests` | **closes with the rest** (the CEO, Thu 21:34): `book/` redirects to the main site's contact page (step 8); the 7 requests are with Denise's team (Thu 19:31), who answer the guests and count the bookings by Sun 29 Nov | by Sun 29 Nov | Denise's team (bookings), me (the page) | open `book/` → the contact page |
| Umami events for the event | **kept**: they hold no names or addresses (the CEO, Thu 21:34) | — | me | Umami → Open Morning – production |
| Poster QR | points to the event address, which redirects to the main site after step 8 | by Sun 29 Nov | Denise | scan it → the main site |
| Website banner on the main site | **gone**: `EventBanner.jsx` hides itself at the event's start (Tue 24 Nov, 10:00 Toronto), on staging and production; the component stays in the code, to remove in a later cleanup | Tue 24 Nov | me | open northline.holistech.tech: no Open Morning line |
| Test addresses and test rows | my 6 test registrations and 1 test survey answer: deleted with every other row in step 7; my own copies (files, screenshots with addresses, logs) checked and deleted too | by Sun 29 Nov | me | the tables are empty; no export or list on my PC or the server |
| Event-count helper (`event_count.py`) | **off**: its cron line removed Tue 24 Nov 19:04; its settings and state deleted from the server Thu 26 Nov; the script stays in the repository (#221, #224) for the next event | Tue 24 Nov | me | `crontab -l` |
| Monitoring bot (#182) | **still running**, on purpose: it watches the whole server, not only the event | — | me, then the CEO | the 08:30 status on Telegram |

## Closing steps, by Sun 29 Nov 2026, 20:00 Israel (the CEO, Thu 26 Nov 21:34)

| # | Step | Date | Who | Undo |
|---|---|---|---|---|
| 6 | **Reboot** for the waiting kernel update: a morning window 08:00–10:00 Israel, after the nightly backup; a note to Denise on #114 first, ops-log lines before and after | Fri 27 Nov, 08:00–10:00 Israel (01:00–03:00 Toronto) | me | none needed: the containers come back by their restart policy; if one doesn't, the 502 entry in RUNBOOK.md |
| 7 | **Delete the event's personal data:** the rows of `registrations`, `registration_emails`, `event_feedback` (cascades from registrations), `visit_requests`; the original invite list; every copy of mine. Rows, not tables: the next event needs the tables. The report is final first | ⟨date⟩ | me | none by design. The nightly dumps on the VPS hold copies until ⟨date + 7 days⟩; Hostinger's weekly backups until ⟨date⟩ |
| 8 | **The page comes down:** every event address redirects to the main site, `/book/` to the contact page, unknown addresses too (no 404). Proposed to the CEO first, with the undo | ⟨date⟩ | me | ⟨from the proposal⟩ |
| 9 | **Close the API:** one migration that drops the visitor insert rules on `registrations`, `visit_requests` and `event_feedback`; staging first, PRs approved by the CEO | ⟨date⟩ | me, approved by the CEO | a migration that re-creates the three rules |

**Still running, on purpose:** the monitoring bot. Umami keeps the event's statistics (no names or addresses). Everything else of the event is closed or comes down in the steps above.


**Who to ask:** the CEO for the server, the repository and the releases; Denise for the guest data, the bookings and the offer.
