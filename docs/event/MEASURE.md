# Open Morning: what we measure

What Umami counts at each step, the four links that tell us where a guest came from, and what never goes to Umami.
The kit has its own event table (W7 task 37); on Sun 15 Nov I check its names against this file and write any difference here.

## Events, by funnel step

The event names are the ones from Week 4 (AutonoMoose's standard, `object_action`, lower case). **Names are permanent:** I reuse them and never rename them; the property `form: 'open_morning'` keeps the event apart from Northline's contact form (`form: 'contact'`).

| Funnel step | What counts it | Event / source | Properties |
|---|---|---|---|
| Invited | the send log | `registration_emails`, `kind = invitation` | — |
| Opened the page | Umami page view, with the link's UTM tags | page view (automatic) | the UTM tags |
| Started the form | Umami | `form_start` | `form: 'open_morning'` |
| Registered | Umami, **only after the row is saved** | `form_submit` | `form: 'open_morning'` |
| Registration failed | Umami (never together with `form_submit`) | `form_error` | `form: 'open_morning'` |
| Called the clinic from the page | Umami | `call_click` | `location: 'event_page'` |
| Confirmed | the database (Umami only sees the confirm page, without `t=`) | `registrations.verified_at` | — |
| Reminded | the send log | `registration_emails`, `kind = reminder` | — |
| Attended | the database (the desk's check-in) | `registrations.checked_in_at` | — |
| Answered the survey | the database (the kit's feedback page) | query 10 of the kit | — |
| Booked a visit | Denise's count, 7 days after | — | — |

**Check (W7 task 37):** the staging `form_submit` count must match the number of `registrations` rows for the same time range.

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
- **The website banner** is counted by its UTM tags when the visitor reaches the event page; no click event on Northline's main site (the banner PR stays one line).
- The tags are also saved on the registration row (`utm_source`, `utm_medium`, `utm_campaign`, see CAPTURE.md), so the report counts **registrations** per source, not only visits.

## Never sent to Umami

- **Names, email addresses, phone numbers** — not in an event, not in a property, not in a page address.
- **What a guest typed** in any field.
- **The confirm or survey token** (`t=…`): the confirm page removes it from the address before Umami sees the page view.
- **Anything that identifies a guest**, even indirectly: no token, no row `id`, nothing that could be matched back to one person.

Allowed: the page, the office, where a link sits, the UTM tags, and counts.

**Check (W7 task 37):** open the details of one event in Umami and confirm that no name, email or phone number appears anywhere.