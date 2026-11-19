# Open Morning: what we measure

What Umami counts at each step, the four links that tell us where a guest came from, and what never goes to Umami.
The kit's real event names differ in a few places; every difference is in **What the kit does differently** below (checked Tue 17 Nov).

## Events, by funnel step

**Names are permanent:** I reuse them and never rename them. The kit's `analytics.js` (not changed, as its README asks) sends them with a `form` property that keeps the event's forms apart from Northline's contact form (`form: 'contact'`): `event_registration`, `event_verification`, `event_questionnaire`, `event_checkin`, `visit_booking`, `event_feedback`.

| Funnel step | What counts it | Event / source | Properties |
|---|---|---|---|
| Invited | the send log of task 46 | `invitations.md`: how many were sent, how many arrived (counts only; no table of invited people, so nobody who never signed up is stored) | — |
| Opened the page | Umami page view, with the link's UTM tags | page view (automatic) | the UTM tags |
| Started the form | Umami | `form_start` | `form: 'event_registration'` |
| Registered | Umami, **only after the row is saved** | `form_submit` | `form: 'event_registration'` |
| Registration failed | Umami (never together with `form_submit`) | `form_error` | `form: 'event_registration'` |
| Called the clinic from the page | Umami | `cta_click` | `label: 'call'`, `location`: where the phone link sits (`header`, `footer`, …) |
| Confirmed | the database; Umami counts it too, without the token | `registrations.verified_at`; `form_submit` with `form: 'event_verification'` | — |
| Reminded | the send log | `registration_emails`, `kind = reminder` | — |
| Attended | the database (the desk's check-in) | `registrations.checked_in_at` | — |
| Answered the survey | the database (the kit's feedback page) | query 10 of the kit | — |
| Booked a visit | Denise's count, 7 days after | — | — |

**Check (W7 task 37):** the staging `form_submit` count must match the number of `registrations` rows for the same time range.

**Found in task 37 (Wed 18 Nov):** Umami can undercount, so the database stays the real count.

- **Google Lens** opens a scanned QR in a preview first: one view with Google's own tags and no events. The registration is still stored under `poster`.
- **A browser that kept an old `config.js`** sent nothing to Umami (2 of 4 test registrations missing). Fixed for Thursday by the kit's `.htaccess` (#193, #191).

## The four links

Every link I hand out carries its own tags. A link without tags makes the funnel blind: the guest counts as "direct" and we can't tell what brought them.

| Link | `utm_source` | `utm_medium` | `utm_campaign` |
|---|---|---|---|
| Invitation email | `invitation` | `email` | `2026-11-open-morning` |
| Reminder email | `reminder` | `email` | `2026-11-open-morning` |
| Poster QR | `poster` | `qr` | `2026-11-open-morning` |
| Banner on Northline's website | `website` | `banner` | `2026-11-open-morning` |

The full links (the address is the event page's, `<event-page>` here):

```
https://<event-page>/?utm_source=invitation&utm_medium=email&utm_campaign=2026-11-open-morning
https://<event-page>/?utm_source=reminder&utm_medium=email&utm_campaign=2026-11-open-morning
https://<event-page>/?utm_source=poster&utm_medium=qr&utm_campaign=2026-11-open-morning
https://<event-page>/?utm_source=website&utm_medium=banner&utm_campaign=2026-11-open-morning
```

- **The poster QR** is made from the poster link exactly, then scanned and checked in Umami before the file goes to Denise (Wed 18 Nov).
- **Walk-ups** (no link at all) are counted at the desk, not in Umami.
- **The website banner** is counted by its UTM tags when the visitor reaches the event page; no click event on Northline's main site. It shows only when `VITE_EVENT_URL` is set for that site in hPanel, and disappears by itself when the event starts (#192).
- The tags are also saved on the registration row (`utm_source`, `utm_medium`, `utm_campaign`, see CAPTURE.md), so the report counts **registrations** per source, not only visits.

## What the kit does differently (checked Tue 17 Nov)

| Planned here | In the kit | What I do |
|---|---|---|
| `form: 'open_morning'` | `form: 'event_registration'`, plus five more forms (above) | use the kit's names; `analytics.js` stays as it came |
| `call_click` from the event page | `cta_click` with `label: 'call'` (also `calendar`, `register`, `book`, `book_online`) | use the kit's; the call button is one of its calls to action |
| survey counted from the database only | also `feedback_submit` in Umami, with the rating only | both; the database is the real count |
| invitations counted in `registration_emails` | that table only has rows for registered guests | invitations are counted in `invitations.md` (task 46), from the mailer's send log |
| three UTM tags | the kit also stores `utm_content`, in lower case | allowed; my four links don't use it |
| — | the confirm link carries `utm_source=confirmation`, the reminder to confirm `verify-reminder`, the survey links `thank-you` and `missed-you` | more sources in the report; the token is never sent to Umami (the page removes it before Umami loads) |

## Never sent to Umami

- **Names, email addresses, phone numbers** — not in an event, not in a property, not in a page address.
- **What a guest typed** in any field.
- **The confirm or survey token** (`t=…`): the confirm page removes it from the address before Umami sees the page view.
- **Anything that identifies a guest**, even indirectly: no token, no row `id`, nothing that could be matched back to one person.

Allowed: the page, the office, where a link sits, the UTM tags, and counts.

**Check (W7 task 37):** open the details of one event in Umami and confirm that no name, email or phone number appears anywhere.
