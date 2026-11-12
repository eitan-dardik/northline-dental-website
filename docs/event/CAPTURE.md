# Open Morning: what we capture

What the registration form stores, why, where, and a test that a row really arrives.
The real tables come with the event kit (W7 task 32); on Sun 15 Nov I check the kit's tables against this file and write any difference here.

## The fields

As few as possible. Nothing that the event doesn't need.

| Field | Required | Why we need it |
|---|---|---|
| Full name | yes | the desk finds the guest on the printed list |
| Email | yes | the confirmation link, the reminder and the thank-you |
| Phone | optional | to reach a guest on the day if something changes |
| How many will come for a check-up | yes, default 1, from 1 to 7 | to plan the 10-minute smile-check slots and the chairs; the cap stops typos |

**Not asked:** date of birth, address, insurance, health details. The event doesn't need them, and every extra field is personal data we would have to protect.

## Where a row is stored

Two tables, copied from the `leads` / `lead_emails` pattern. Both are **separate from `leads`**: `leads` is the contact form's inbox (questions to the clinic), a registration is a different thing, so there is **no foreign key** between them.

### Table 1: `registrations`, one row per guest: what the guest did (registered, confirmed, arrived)

| Column | Type | Rules | Filled when |
|---|---|---|---|
| `id` | `uuid` | **primary key**, default `gen_random_uuid()` | the row is created |
| `token` | `text` | not null, **unique**, random | the row is created (the confirm and survey links use it, never the `id`) |
| `name` | `text` | not null, 1–100 characters, not blank | the guest registers |
| `email` | `text` | not null, **unique** (lower-case), valid email format, max 254 characters | the guest registers |
| `phone` | `text` | optional, max 30 characters, digits, spaces, `+ - ( )` only | the guest registers |
| `party_size` | `smallint` | not null, default **1**, between **1 and 7** | the guest registers |
| `utm_source` | `text` | optional, max 50 characters | the guest registers (from the link) |
| `utm_medium` | `text` | optional, max 50 characters | the guest registers (from the link) |
| `utm_campaign` | `text` | optional, max 50 characters | the guest registers (from the link) |
| `created_at` | `timestamptz` | not null, default `now()` | the guest registers |
| `verified_at` | `timestamptz` | optional (null until confirmed) | the guest presses the confirm link |
| `checked_in_at` | `timestamptz` | optional (null until arrival) | the desk marks the guest as arrived |

- **`email` unique:** registering twice makes no second row (stored in lower case, so `Dana@…` and `dana@…` count as the same person).
- **`token`:** a random secret that only goes into the guest's emails. The confirm and survey links use it instead of the `id`, because the `id` is copied everywhere (foreign keys, queries, exports, screenshots) and is not treated as a secret. A token can also be replaced if a link leaks; the `id` can't, because other rows point to it.
- **The UTM columns** save which link brought the guest (invitation, reminder, poster, website banner), so the funnel report counts registrations per source. All links use `utm_campaign=2026-11-open-morning`, in lower case.
- **The text limits** follow the same idea as the contact-form limits in #35 and #36: the database refuses what the form would refuse.

### Table 2: `registration_emails`, one row per email sent, so several per guest: what the mailer did

| Column | Type | Rules | Filled when |
|---|---|---|---|
| `id` | `uuid` | **primary key**, default `gen_random_uuid()` | the email is sent |
| `registration_id` | `uuid` | optional, **foreign key** → `registrations.id`; the only link between the two tables, so nothing is stored twice | the email goes to a registered guest; empty for invitations (sent before the guest registered, so find those by `recipient`) |
| `recipient` | `text` | not null | always (invitations go to contacts who haven't registered, so they have no `registration_id`) |
| `kind` | `text` | not null, one of: `invitation`, `confirmation`, `verify_reminder`, `reminder`, `thank_you`, `missed_you` | the email is sent |
| `status` | `text` | not null, one of: `sent`, `bounced`, `failed` | the mailer gets the result |
| `sent_at` | `timestamptz` | not null, default `now()` | the email is sent |

- **`kind`** says *which* email it was. **`status`** says *what happened* to it. Two different questions, so two columns.
- This table is also the mailer's "already sent" list: before sending, it checks for a row with the same guest and `kind`, so no one gets the same email twice.

### When each step happened

| Step | Where the time is saved |
|---|---|
| Invited | `registration_emails.sent_at`, `kind = invitation` |
| Registered | `registrations.created_at` |
| Confirmation sent | `registration_emails.sent_at`, `kind = confirmation` |
| Confirmed | `registrations.verified_at` |
| Reminder to confirm sent | `registration_emails.sent_at`, `kind = verify_reminder` |
| Reminder sent | `registration_emails.sent_at`, `kind = reminder` |
| Arrived | `registrations.checked_in_at` |
| Thank-you / missed-you sent | `registration_emails.sent_at`, `kind = thank_you` / `missed_you` |

### Who may do what (row-level security)

| Table | Visitors (publishable key) | The team, on the server |
|---|---|---|
| `registrations` | **insert only**: never read, change or delete | read, update `verified_at` / `checked_in_at` |
| `registration_emails` | **nothing at all** | read, insert, update `status` |

The confirm page sets `verified_at` only for the row whose `token` matches. The check-in page sets `checked_in_at` only with the desk code.

### The mailer's rules (Israel time)

| Email (`kind`) | Sent to | When | Only if |
|---|---|---|---|
| `invitation` | every reachable contact on Denise's list | Thu 19 Nov | — |
| `confirmation` | the guest | right after registering, within 60 seconds | — |
| `verify_reminder` | the guest | once, 24 h after registering | `verified_at` is still empty |
| `reminder` | every registered guest | Mon 23 Nov, 15:00 | — |
| `thank_you` (survey + offer) | guests who came | Wed 25 Nov, 16:00 | `checked_in_at` is set |
| `missed_you` (survey + offer) | guests who registered and didn't come | Wed 25 Nov, 16:00 | `checked_in_at` is empty |

**Note:** `missed_you` is on the drop list in PLAN.md. It stays in the design, but it's sent only if there is time to build and test it before Wed 25 Nov.

**Confirming doesn't decide the place.** A guest who never presses the link keeps their place, still gets the reminder, and is checked in like anyone else on the day. Confirming only proves the email address is real; confirmed guests are counted as their own step in the funnel report (`verified_at` has a time). Registration stays open until Thu 26 Nov (W8 task 63), and the desk also counts walk-ups who never registered.
On Sun 15 Nov I check that the kit's printed desk list (query 5) includes unconfirmed guests.

### Not stored here

- **Booked a visit:** Northline has no online booking (#1). Denise reports how many guests booked within 7 days, and that number goes in the funnel report.
- **Survey answers:** stored by the kit's feedback page, reached through the guest's own `token` in the follow-up email. The report shows the answers and the response rate with no names.

## The privacy line (what the guest sees)

> We keep your name, email and (if you give it) phone number only to manage the Open Morning and to send you the confirmation, a reminder and one promotional offer the day after; we never share your data or use it outside the event.

## Test: a lead from my phone, read back

The event form isn't built yet, so the test uses the same pattern: Northline's contact form on **staging**, which stores into `leads`.

- **Sent:** Thu 12 Nov, 13:58 Israel, from my phone (mobile data), as `Test OG001` / `…+og001@gmail.com`, location Fairview, message "W6 task 17 test". The page showed "Thanks — we've got your message and will be in touch soon."
- **Read back** on the staging server (read only):

```sql
select id, created_at, name, email, location from leads
where email like '%+og001%' order by created_at desc limit 1;
```

```
                  id                  |          created_at           |    name    |       email        | location
--------------------------------------+-------------------------------+------------+--------------------+----------
 5cb76089-e336-4731-897f-496a1748a0c3 | 2026-11-12 11:58:43.529724+00 | Test OG001 | …+og001@gmail.com  | Fairview
(1 row)
```

- **Result:** the row was stored at 11:58:43 UTC = **13:58:43 Israel**, in the same minute I sent it (13:58 on my phone's clock), with the right name, email and location. The automatic "We received your message" email also arrived in the inbox at 13:58.
- **The practice alert** ("New inquiry — Fairview", to the staging alert mailbox `MAIL_TO`, my own inbox) did not arrive for this lead: not in the inbox, spam or trash, and no bounce to the sender. The mailer sends it before the confirmation and stops if it fails, so the mail server accepted it. Two more tests delivered **both** emails: `Test OG002` (Grandon, 14:14 Israel) and `Test OG003` (Fairview, the same office as OG001, 14:16). So the alert works for every office, and the first one was a one-off loss. Logged in the ops log (12 Nov). For W7, the mailer will log the mail server's reply for each email, so a missing one can be traced.

## Why may a visitor add a registration, but never read one?

Each row holds a guest's name and email: if visitors could read the table, anyone could download every guest's details.