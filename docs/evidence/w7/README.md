# Week 7 Evidence

| # | Item | Proof |
|---|---|---|
| 1 | Incident review | [incident-review.md](incident-review.md) (the review of Tue 17 Nov; actions [#184](https://github.com/eitan-dardik/northline-dental-website/issues/184), [#182](https://github.com/eitan-dardik/northline-dental-website/issues/182), [#183](https://github.com/eitan-dardik/northline-dental-website/issues/183)); the agenda message: [see below](#row-1-incident-review) (sent Sun 15 Nov, 21:30) |
| 2 | Board and week-start comment | [img/23-board.png](img/23-board.png) (task 27, Tue 17 Nov, before 16:00); [the comment on #114](https://github.com/eitan-dardik/northline-dental-website/issues/114#issuecomment-6945254828) |
| 3 | Ops log | To do: [#140](https://github.com/eitan-dardik/northline-dental-website/issues/140), one comment for each day Mon–Thu |
| 4 | Kit configured, staging, CI | Kit as it came: [PR #150](https://github.com/eitan-dardik/northline-dental-website/pull/150); configured: [22b66db](https://github.com/eitan-dardik/northline-dental-website/commit/22b66db) ([#152](https://github.com/eitan-dardik/northline-dental-website/issues/152)), [diff against the kit](https://github.com/eitan-dardik/northline-dental-website/compare/5b699eb...22b66db); decision record line: [PR #153](https://github.com/eitan-dardik/northline-dental-website/pull/153); staging and CI: [PR #155](https://github.com/eitan-dardik/northline-dental-website/pull/155), [green CI run on `event`](https://github.com/eitan-dardik/northline-dental-website/actions/runs/43943229108); the main site's deploy unchanged; details: [see below](#row-4-kit-configured-staging-ci) |
| 5 | Releases v0.1.0, v0.2.0, v0.3.0, v1.0.0 | [event-v0.1.0](https://github.com/eitan-dardik/northline-dental-website/releases/tag/event-v0.1.0) (Mon 16 Nov, on `76af798`). To do: event-v0.2.0, event-v0.3.0, event-v1.0.0 |
| 6 | Migration, rules proof, phone read-back | [the migration](https://github.com/eitan-dardik/northline-dental-website/blob/dev/supabase/migrations/20261117191400_event_registrations.sql) (PR [#185](https://github.com/eitan-dardik/northline-dental-website/pull/185)); insert `201` / read `401`; the row: 22:49:40 Israel, `utm_source invitation`; details: [see below](#row-6-migration-rules-proof-phone-read-back) |
| 7 | Confirmation, confirm link and deliverability | the confirmation for `+og003`: accepted 12 s after registering, `verified_at` 10:16:00 Israel; details: [see below](#row-7-confirmation-confirm-link-and-deliverability). To do: email-check.md (task 35); the `+og006` reminder to confirm (due after 00:05 Thu) |
| 8 | Umami events, UTM links, QR | To do: Umami screenshots; img/34-qr.png |
| 9 | Desk rehearsal | To do: times; the count against query 3; the two desk lines |
| 10 | Screenshots and Denise's approval | To do: link to the ticket comment |
| 11 | Run of show draft | To do: link to RUN-OF-SHOW.md |
| 12 | Restore drill and decision brief | To do: restore.md; decision-brief.md |
| 13 | Production release | To do: times merged, live, checked |
| 14 | Invitations and status email | To do: invitations.md; status-email.md |

**Moved from Week 6** (W6 scorecard on feedback #7, 15 Nov: task 16 to Tue 17, task 14 to Wed 18, task 18 to Thu 19; task 16's time confirmed by the CEO's email of 15 Nov, 23:09: Tue 17, 23:59):

| Task | Item | Proof |
|---|---|---|
| 16 | Invite list check | [LIST-CHECK.md](https://github.com/eitan-dardik/northline-dental-website/blob/dev/docs/event/LIST-CHECK.md) (PR [#180](https://github.com/eitan-dardik/northline-dental-website/pull/180): the counts, each problem row and what I do with it, 103 reachable contacts; no list in the repository); [the reply on #114](https://github.com/eitan-dardik/northline-dental-website/issues/114#issuecomment-6950048179); updated Wed 18 with Denise's fixes: 108 reachable ([PR #188](https://github.com/eitan-dardik/northline-dental-website/pull/188)) |
| 14 | Contact form limits | To do: the PR into `dev` with each rule's refused insert and its error code; one refused insert repeated on staging; both names in other languages accepted; #35 and #36 closed with the proof |
| 18 | Week 4 evidence pack | [PR #148](https://github.com/eitan-dardik/northline-dental-website/pull/148) |

**Actual (h)** is filled in on every finished card on the [Open Morning board](https://github.com/users/eitan-dardik/projects/7).

## Row 1: incident review

**The agenda** was due Sun 15 Nov, 20:00 Israel. I sent it by Telegram at **21:30**, 1 h 30 min late, and said so on [#149](https://github.com/eitan-dardik/northline-dental-website/issues/149).

![agenda sent by Telegram](img/26-agenda-sent.png)

## Row 4: kit configured, staging, CI

**The kit as it came:** [PR #150](https://github.com/eitan-dardik/northline-dental-website/pull/150), merged without changes (5b699eb).

**My changes, in a second commit:** [22b66db](https://github.com/eitan-dardik/northline-dental-website/commit/22b66db). Compared with the kit, only `config.js` and `assets/brand.css` changed, plus the five font files that `brand.css` loads, which the kit README (step 2) allows: [the diff against the kit](https://github.com/eitan-dardik/northline-dental-website/compare/5b699eb...22b66db).

| What | Changed to | Why |
|---|---|---|
| Event details | from PLAN.md and Denise's email (forwarded by the CEO on 15 Nov): the offer, "nothing to bring" | Denise's answers |
| Privacy line | names everything the form keeps (name, email, phone if given, the two answers), the offer email and the survey | the kit README asks for the survey; CAPTURE.md asks for every field |
| Logo | hero image; the header shows the name only | the kit's header logo is small; the hero shows it at a readable size |
| `registration` | `'soon'` | the form opens on Tue 17 Nov (task 33) |
| `--brand-ink` | `#2b2724`, darker than the site's `#6b6560` | the event-day notice failed contrast: accessibility 96, `#phase-notice` 2.03:1 ([before](lighthouse/29-before.json)); after the fix, accessibility 100 ([after](lighthouse/29-after.json)). Lighthouse, mobile, Incognito, on localhost with the event set to "now" for the test |
| Fonts | Inter and Fraunces, self-hosted woff2 | the same fonts as the main site, without a call to an outside server |

**Checked:** with `npx serve .` on my laptop, desktop and mobile view.

**Answered on [#152](https://github.com/eitan-dardik/northline-dental-website/issues/152) (Tue 17 Nov):** the two mobile CSS lines were a defect in the kit; the CEO fixed it on the kit side ([PR #181](https://github.com/eitan-dardik/northline-dental-website/pull/181), merged into `event`), so my diff against the kit stays `config.js` and `brand.css`. The office question: no; the booking page asks it after the event.

**Decision record:** the line `Event branch: event` (asked on feedback #8), merged in [PR #153](https://github.com/eitan-dardik/northline-dental-website/pull/153) with CI green.

**Staging (task 30):** [PR #155](https://github.com/eitan-dardik/northline-dental-website/pull/155) into `event`: the staging block in `config.js` (the existing staging API and publishable key, as in the decision record), a CI job for `event` and `event-main`, and a minimal `package.json`, because Hostinger's Git deployment stopped without one (first try, 21:31). `event` → `event-stage` by Hostinger's Git deployment, with no build: `76af798` Completed at 21:49.

| Check | Result |
|---|---|
| The event on my phone | over 4G, 21:51–21:53: the event, the timetable, the offer and "Registration opens soon"; HTTPS valid; no sideways scroll |
| CI green on `event` | on PR #155 and on [the push to `event`](https://github.com/eitan-dardik/northline-dental-website/actions/runs/43943229108) (`76af798`) |
| The main site's deploy unchanged | production still on `e18483f` (8 Nov, 10:54); northline-stage only deployed `dev` merges (#153 at 17:25, #154 at 18:18), all before the event work |

**The main site's deploys** (hPanel, Mon 16 Nov, after the event deploy): production's newest is still `e18483f1` from 8 Nov; northline-stage's newest are the `dev` merges of #154 and #153.

<img width="400" alt="production deployments" src="img/30-main-prod-deploys.png" /> <img width="400" alt="northline-stage deployments" src="img/30-main-stage-deploys.png" />

<img width="250" alt="phone: the top of the event page" src="img/30-staging-phone-top.jpg" /> <img width="250" alt="phone: Registration opens soon" src="img/30-staging-phone-soon.jpg" />

## Row 6: migration, rules proof, phone read-back

**The migration (task 32, [#163](https://github.com/eitan-dardik/northline-dental-website/issues/163)):** the kit's `supabase/migration.sql`, copied unchanged (`diff` against the kit prints nothing) as `20261117191400_event_registrations.sql`, by [PR #185](https://github.com/eitan-dardik/northline-dental-website/pull/185) into `dev`. Applied to staging from `dev` with the CLI, through the SSH tunnel, Tue 17 Nov. `dev` has every migration staging has (task 14's moved to Wed 18), so no merge into `event` was needed.

```
$ npx supabase migration list --db-url "$DB"
   Local            | Remote           | Time (UTC)
  ------------------|------------------|-----------------------
   `20260928105035` | `20260928105035` | `2026-09-28 10:50:35`
   `20260928105129` | `20260928105129` | `2026-09-28 10:51:29`
   `20261020101326` | `20261020101326` | `2026-10-20 10:13:26`
   `20261101092708` | `20261101092708` | `2026-11-01 09:27:08`
   `20261117191400` | ` `              | `2026-11-17 19:14:00`

$ npx supabase db push --db-url "$DB" --dry-run
DRY RUN: migrations will *not* be pushed to the database.
Would push these migrations:
 • 20261117191400_event_registrations.sql

$ npx supabase db push --db-url "$DB"
Applying migration 20261117191400_event_registrations.sql...
Finished supabase db push.

$ npx supabase migration list --db-url "$DB"
   Local            | Remote           | Time (UTC)
  ------------------|------------------|-----------------------
   `20260928105035` | `20260928105035` | `2026-09-28 10:50:35`
   `20260928105129` | `20260928105129` | `2026-09-28 10:51:29`
   `20261020101326` | `20261020101326` | `2026-10-20 10:13:26`
   `20261101092708` | `20261101092708` | `2026-11-01 09:27:08`
   `20261117191400` | `20261117191400` | `2026-11-17 19:14:00`
```

`$DB` is the tunnel address with `?sslmode=disable`: the connection is already encrypted by SSH, and the database behind it has no TLS of its own.

**The rules, through the public API with the publishable key** (Tue 17 Nov, 21:52 Israel; the kit README's two `curl`s, without the `Authorization` header for an `sb_publishable_` key):

```
$ curl … -X POST "https://<staging API>/rest/v1/registrations" …   # insert
201
$ curl … "https://<staging API>/rest/v1/registrations?select=*"    # read
{"code":"42501","details":null,"hint":"…","message":"permission denied for table registrations"}
401
```

**Staging desk code:** set at 22:15 with query 1 of the kit's `queries.sql`, the code passed in a variable so it isn't in the server's history; stored only as a hash. The code is in my password manager, never in the repository.

**The phone test (task 33, [#164](https://github.com/eitan-dardik/northline-dental-website/issues/164)):** after [PR #186](https://github.com/eitan-dardik/northline-dental-website/pull/186) (`registration: 'open'`, `maxGuests: 7`), on staging, Chrome private tab, mobile data, Tue 17 Nov.

| Check | Result |
|---|---|
| Registered from the invitation link, as `…+og1711@…`, 2 people (`+og001` was used for the W6 lead test) | 22:49 on the phone; "You are registered" |
| Read back (query 2) | stored **20:49:40 UTC = 22:49:40 Israel**, `guests 2`, `utm_source invitation`, `utm_medium email`, `utm_campaign 2026-11-open-morning`; `verified_at` empty (task 34) |
| The same email again | the same "You are registered"; still one `+og1711` row |
| Airplane mode, as `…+og171102@…`, 3 people, 22:59 | "We could not save this just now. Please call (440) 555-0140 and we will do it for you.", under the button; no row stored |
| The CEO's kit fix [#181](https://github.com/eitan-dardik/northline-dental-website/pull/181) | the timetable time stays on one line; space between "Save my place" and the image |
| Found | the phone's normal tab kept the old page ("Registration opens soon") from its cache; a private tab showed the new one |

**The read-back after both tests** (23:21 Israel, 21:21:48 UTC, `date` on top): one `+og1711` row, stored at 20:49:40 UTC with `utm_source invitation`, and no `+og171102` row.

<img width="700" alt="the server after both tests: one +og1711 row, no +og171102, email masked" src="img/33-readback.png" />

**On the phone:**

| 1. Registered (22:49) | 2. Airplane mode (22:59) | 3. #181: the time on one line | 4. #181: space above the image |
|---|---|---|---|
| <img width="200" alt="phone: You are registered" src="img/33-registered.jpg" /> | <img width="200" alt="phone: airplane mode, the message under the button" src="img/33-airplane.jpg" /> | <img width="200" alt="phone: the timetable after #181" src="img/33-phone-layout-time.jpg" /> | <img width="200" alt="phone: space above the image after #181" src="img/33-phone-layout-hero.jpg" /> |
| "You are registered" for `…+og1711@…`, 2 people | "We could not save this just now…" with the phone number; no row stored | "10:00" no longer breaks onto two lines | space between "Save my place" and the logo |


## Row 7: confirmation, confirm link and deliverability

**The mailer (task 34, [#165](https://github.com/eitan-dardik/northline-dental-website/issues/165)):** [PR #187](https://github.com/eitan-dardik/northline-dental-website/pull/187) into `dev`. It sends the confirmation to every page registration without one (the kit's query 6) and one reminder to confirm 24 h later if the link was never pressed (query 8), with `registration_emails` as its "already sent" table, claim-first like `lead_emails`. It logs the mail server's reply for each email. Event emails only where `mailer.env` has `EVENT_URL`: on staging since Tue 17 Nov, 23:5x; production on Thursday. Deployed on staging only (staging and production build from the same clone; production not rebuilt).

The mailer's log when it started (Tue 17 Nov; ids only, no personal data):

```
mailer started; event emails on
sent: registration f3ecf737-… confirmation: 250 2.0.0 OK ids=540cdeb2… (accepted 1, rejected 0)
sent: registration 602b54f3-… confirmation: 250 2.0.0 OK ids=546866b7… (accepted 1, rejected 0)
```

| Check (`+og003`, from my phone) | Result |
|---|---|
| Registered | 21:57:20 UTC (Tue 23:57:20 Israel) |
| Confirmation accepted by the mail server (`sent_at`) | 21:57:32 UTC: **12 s** after registering; arrived in Gmail the same minute |
| The email | Denise's approved text (EMAILS.md 2), the link as a button |
| Pressed "Confirm my place" | Wed 18 Nov, 10:16: "Your email is confirmed"; `verified_at` **08:16:00 UTC** |
| The address after the page loaded | `https://<event staging>/confirm/?utm_source=confirmation&utm_medium=email&utm_campaign=2026-11-open-morning`: **no `t=`** |
| Pressed it again | 10:17: "Already confirmed"; `verified_at` unchanged |
| `registration_emails` | one `confirmation` row for each of the 4 registrations |
| `+og006` | registered Wed 00:05 Israel, link not pressed: its reminder to confirm is due after 00:05 Thu |
| Found | the first two test emails, sent in the same second, arrived about 2 minutes apart in Gmail; the server accepted both at once (`250 OK`), so the delay was after my server |

<img width="700" alt="read-back: +og003 verified_at 08:16:00 UTC, one confirmation row each, emails masked" src="img/34-readback.png" />

| 1. The email (23:57) | 2. Confirmed (10:16) | 3. Pressed again (10:17) |
|---|---|---|
| <img width="250" alt="the confirmation email in Gmail" src="img/34-confirmation-email.png" /> | <img width="200" alt="phone: Your email is confirmed" src="img/34-confirmed.jpg" /> | <img width="200" alt="phone: Already confirmed" src="img/34-already-confirmed.jpg" /> |