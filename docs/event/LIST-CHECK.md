# Open Morning: invite list check

Denise's invite list (a CSV file, from the CEO's email of Sun 15 Nov, 23:09), checked Tue 17 Nov 2026 (task 16).
**The list itself is not in this repository:** it holds people's names, emails and phone numbers. The original stays on my computer exactly as it came, next to the working copy I checked. This file holds only counts and row numbers.

**Updated Wed 18 Nov:** Denise sent the right addresses for the 5 invalid rows (her email, forwarded by the CEO on 18 Nov, 08:00); row 81 stays off the email list, her front desk phones that guest. The addresses themselves are only in my working copy.

## How I checked

On the copy, in a spreadsheet, every row was checked the same way, one formula per check:

- **The email** is first trimmed of spaces and put in lower case, so `Dana@…` and ` dana@…` count as the same address.
- **No email:** the email cell is empty.
- **Invalid email:** not exactly one `@`, no dot after the `@`, or a space inside.
- **Duplicate:** the same email already appeared on a row above; the first row is kept.
- **Said no to email:** the list's `email_ok` column is `no`. No consent, no email.
- **Reachable:** a valid email, not a duplicate, and `email_ok` is `yes`.
- **By eye:** I also read through the 103 reachable addresses one by one, to catch what a formula can't (an address that looks valid but is clearly wrong, such as a name typed into the email cell). None was found.

**Row numbers** count the people on the list: row 1 is the first person under the header (in the spreadsheet, that's line 2).

## The counts

| | Rows |
|---|---|
| Rows on the list | 120 |
| No email | 1 |
| Invalid email | 0 (5 on Tue 17; Denise sent the right addresses on Wed 18) |
| Duplicates (extra copies of an email already on the list) | 3 |
| Said no to email | 8 |
| **Reachable contacts** | **108** |
| … of them patients | 93 |
| … of them neighbours | 15 |

No row has more than one problem: 1 + 3 + 8 = 12 rows left out, and 120 − 12 = 108. The 5 corrected addresses passed the same checks (valid, not a duplicate, `email_ok` yes).
Every valid address uses the list's own domain (`example.com`); no typo of it was found.

## The problem rows, and what I do with each

| Row | Problem | What I do |
|---|---|---|
| 24 | said no to email | left out; not asked again |
| 36 | invalid email | fixed by Denise (18 Nov): invited |
| 50 | duplicate of row 21 | invited once, as row 21 |
| 53 | duplicate of row 40 | invited once, as row 40 |
| 54 | invalid email | fixed by Denise (18 Nov): invited |
| 58 | duplicate of row 10 | invited once, as row 10 |
| 61 | said no to email | left out; not asked again |
| 63 | said no to email | left out; not asked again |
| 72 | said no to email | left out; not asked again |
| 80 | said no to email | left out; not asked again |
| 81 | no email | left out of the emails; Denise's front desk phones this guest (18 Nov) |
| 83 | said no to email | left out; not asked again |
| 91 | invalid email | fixed by Denise (18 Nov): invited |
| 95 | said no to email | left out; not asked again |
| 98 | invalid email | fixed by Denise (18 Nov): invited |
| 105 | said no to email | left out; not asked again |
| 108 | invalid email | fixed by Denise (18 Nov): invited |

## What this means for the target

- Target (D1): **30 registered**. Reachable: **108** contacts (103 before Denise's fixes), so about **1 in 3.6** invited people must register (28 %). Still a lot for one invitation and one reminder, so the poster QR and the website banner matter.
- The 15 neighbours are the smaller group; the 93 patients are most of the reach.

## What Denise fixed (Wed 18 Nov)

- **5 rows:** the right addresses for rows 36, 54, 91, 98 and 108. Sent by email, never on the ticket; all 5 now invited.
- **Row 81:** no email; her front desk phones this guest.
- **8 rows said no to email:** they stay off the email list. We don't ask them again.
- **3 duplicates:** nothing to do; each person gets one invitation.

The reply to Denise: [#114](https://github.com/eitan-dardik/northline-dental-website/issues/114#issuecomment-6950048179), Tue 17 Nov; the update with her fixes: [#114](https://github.com/eitan-dardik/northline-dental-website/issues/114#issuecomment-6972731691), Wed 18 Nov.