# Invitations: the Open Morning (W7 task 46, #175)

Thu 19 – Fri 20 Nov 2026, Israel time (Toronto is 7 hours behind). Counts only: no names and no addresses in this file.

## The counts

| | |
|---|---|
| Reachable contacts ([LIST-CHECK.md](https://github.com/eitan-dardik/northline-dental-website/blob/dev/docs/event/LIST-CHECK.md)) | **108** |
| Sent (accepted by the mail server, `250 2.0.0 OK`) | **106** of 108 |
| Arrived (counted in the receiving mailbox) | **101** counted at 00:05 (guests 1–101, all in the Inbox; guest 081 arrived about 30 min after it was sent); 102–106 were sent after that count |
| Not sent yet | **2**: guests **107, 108**, refused by Hostinger's sending limit (`451 4.7.1 Ratelimit "hostinger_out_ratelimit" exceeded`); a `451` means the email was never sent, so nobody gets a duplicate. They go out on Fri 20 Nov, in the morning |
| Failed for any other reason | 0 |
| Sent to an `example.com` address, or with a `+og` tag | 0 (the script refuses both) |

## When

| Run | Guests | Israel | Result |
|---|---|---|---|
| First try | 1–5 | Thu 23:09 | refused by the mail server **before sending**: I had mistyped my own address (`504 5.5 … need fully-qualified address`); 0 sent |
| First batch | 1–5 | Thu 23:11:45–23:11:58 | 5 sent; all 5 in the Inbox; the **Save your place** button of `+guest001` opened the live page, and Umami counted the view (23:14:40) |
| Second batch | 6–55 | Thu 23:17:19–23:21:41 | 50 sent, 0 failed |
| Third batch | 56–108 | Thu 23:23:30–23:28:07 | 46 sent (56–101); 102–108 refused from 23:27:36: Hostinger's sending limit, after about 100 emails |
| Retry | 102 | Thu 23:41:14 | sent |
| Retry | 103–108 | Fri 00:02 | 103 sent; 104–108 refused |
| Retry | 104–108, 3 min apart | Fri 00:08–00:21 | 105 sent (00:11:52); 104, 106, 107, 108 refused |
| Retry | 104, then 106, 107, 108 one by one | Fri 00:30 | 104 sent; 106, 107, 108 refused |
| Retry | 106, 107, 108 one by one | Fri 00:58 | 106 sent; 107, 108 refused |

**Delay notices:** on #175 and to the CEO on Telegram, before 23:59 and again after 00:15, each with the new time.

## How they were sent

- **After v1.0.0 was live and checked** on production (20:35), as the workbook asks.
- **The text Denise approved:** EMAILS.md email 1, word for word ([#114](https://github.com/eitan-dardik/northline-dental-website/issues/114), Tue 17 Nov), with "Hi `<first name>`" and the **Save your place** button.
- **The link:** the invitation link from MEASURE.md, `https://event.holistech.tech/?utm_source=invitation&utm_medium=email&utm_campaign=2026-11-open-morning`.
- **One invitation per reachable contact,** guest 1 to 108 in LIST-CHECK.md's order, each **to my own address with its guest tag** (`+guest001` … `+guest108`), never to a real contact and never to `example.com`.
- **A first batch of five,** checked in the Inbox with the link opened, then the rest in two batches, 5 s apart.

### The script

A one-off Node.js script, `invite.mjs` (about 120 lines), run **inside the production mailer's container** (`northline-prod-mailer-1`) with `docker exec`. That way it uses the mailer's own sender, mail server and settings (`mailer.env`): the same sender whose SPF, DKIM and DMARC passed in task 35 ([email-check.md](email-check.md)). The mailer itself doesn't send invitations: it only emails people who already registered (rows in `registrations`), and by design no table holds invited people (MEASURE.md).

- **Input:** `names.csv`, one line per reachable contact: the guest number and the **first name only** (no emails, no surnames), for "Hi `<first name>`".
- **Chosen at run time, never in the file:** the destination address (`INVITE_TO`), the batch (first and last guest number) and the pause between emails (`PAUSE_MS`).
- **Safety checks:** it refuses `example.com` and an address that already has a `+tag` (so a `+og` test tag can't slip in); a dry run first prints the batch size and the link and sends nothing.
- **The log:** one line per email with the guest number and the mail server's reply, never a name or an address; at the end, `done: N sent, N failed`. An email counts as sent only when the server accepted it.
- **Where:** in `~/invite/` on the VPS (`chmod 600`) and in the container's `/app` for the runs. They stay until the last 2 are sent, then both copies and `names.csv` are deleted (on the server and on my PC).

### Why my Gmail, not a mailbox on our domain

I first tried a mailbox on our own domain (`guests@holistech.tech`), to keep 108 test emails out of my personal inbox. A test to `guests+test@holistech.tech` bounced: `550 5.1.1 Recipient address rejected: User unknown in virtual mailbox table`. Our mail host doesn't accept `+tag` addresses, so `+guest001` … `+guest108` would all have bounced. Gmail accepts them (every `+og` test this week arrived), so the invitations went to my Gmail with the guest tags, as the workbook asks.

## Found

- **Hostinger limits how many emails one account sends:** about 100 in an hour, and after that it frees up more slowly than one per minute. Every `451` was refused before sending, so no guest got two.
- **The production mailer sends from the same account**, so while the limit is reached, a guest's confirmation can wait too (the mailer tries 3 times, then waits for a restart). Checked at 00:00: the only registration on production is my `+og006` test, and it has its confirmation; no guest was affected.
- **For Monday's reminders (task 50) and Wednesday's follow-ups:** fewer than 100 emails each, but the reminder must not run in the same hour as anything else from that account. Before Monday: ask Hostinger for the exact limit, or send in batches with a longer pause.
- **Gmail delays:** guest 081 arrived about 30 minutes after the server accepted it (as on Tuesday, a delay after our server).

## Proof

- The script's output, per run (the table above): `done: 5 sent, 0 failed, of 5` · `done: 50 sent, 0 failed, of 50` · `done: 46 sent, 7 failed, of 53` · `done: 1 sent, 0 failed, of 1` · `done: 1 sent, 5 failed, of 6` · `done: 1 sent, 4 failed, of 5` · 00:30: 104 sent; 106, 107, 108 refused · 00:58: 106 sent; 107, 108 refused.
- Gmail, conversation view off, `in:anywhere subject:"You're invited: Northline Open Morning"`: 100, then 101 when guest 081 arrived (00:05).
- Umami (`Open Morning – production`): the view from the first invitation's button, 23:14:40.
