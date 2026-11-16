# Week 7 Evidence

| # | Item | Proof |
|---|---|---|
| 1 | Incident review | To do: incident-review.md; the agenda message: [see below](#row-1-incident-review) (sent Sun 15 Nov, 21:30) |
| 2 | Board and week-start comment | To do: img/23-board.png; link to the comment on #114 |
| 3 | Ops log | To do: [#140](https://github.com/eitan-dardik/northline-dental-website/issues/140), one comment for each day Mon–Thu |
| 4 | Kit configured, staging, CI | Kit as it came: [PR #150](https://github.com/eitan-dardik/northline-dental-website/pull/150); configured: [22b66db](https://github.com/eitan-dardik/northline-dental-website/commit/22b66db) ([#152](https://github.com/eitan-dardik/northline-dental-website/issues/152)), [diff against the kit](https://github.com/eitan-dardik/northline-dental-website/compare/5b699eb...22b66db); decision record line: [PR #153](https://github.com/eitan-dardik/northline-dental-website/pull/153); staging and CI: [PR #155](https://github.com/eitan-dardik/northline-dental-website/pull/155), [green CI run on `event`](https://github.com/eitan-dardik/northline-dental-website/actions/runs/43943229108); the main site's deploy unchanged; details: [see below](#row-4-kit-configured-staging-ci) |
| 5 | Releases v0.1.0, v0.2.0, v0.3.0, v1.0.0 | [event-v0.1.0](https://github.com/eitan-dardik/northline-dental-website/releases/tag/event-v0.1.0) (Mon 16 Nov, on `76af798`). To do: event-v0.2.0, event-v0.3.0, event-v1.0.0 |
| 6 | Migration, rules proof, phone read-back | To do: link to the migration; the 201 / 401 proof; the row (time, utm_source) |
| 7 | Confirmation, confirm link and deliverability | To do: email-check.md; the `verified_at` time of `+og003`; the `+og006` reminder to confirm (time sent) |
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
| 16 | Invite list check | To do: link to LIST-CHECK.md (the counts, each problem row and what I do with it, the reachable contacts; no list in the repository); link to the reply on #114 |
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

**Open on [#152](https://github.com/eitan-dardik/northline-dental-website/issues/152):** two CSS lines for the mobile layout, and whether to ask guests for their office on the registration form.

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