# Week 7 Evidence

| # | Item | Proof |
|---|---|---|
| 1 | Incident review | To do: incident-review.md; the agenda message: [see below](#row-1-incident-review) (sent Sun 15 Nov, 21:30) |
| 2 | Board and week-start comment | To do: img/23-board.png; link to the comment on #114 |
| 3 | Ops log | To do: [#140](https://github.com/eitan-dardik/northline-dental-website/issues/140), one comment for each day Mon–Thu |
| 4 | Kit configured, staging, CI | Kit as it came: [PR #150](https://github.com/eitan-dardik/northline-dental-website/pull/150); configured: [22b66db](https://github.com/eitan-dardik/northline-dental-website/commit/22b66db) ([#152](https://github.com/eitan-dardik/northline-dental-website/issues/152)), [diff against the kit](https://github.com/eitan-dardik/northline-dental-website/compare/5b699eb...22b66db); details: [see below](#row-4-kit-configured-staging-ci). To do: the decision record line, the staging pull request, a green CI run, the main site's deploy |
| 5 | Releases v0.1.0, v0.2.0, v0.3.0, v1.0.0 | To do: links to the four GitHub releases (`event-v…`) |
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