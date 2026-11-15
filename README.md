# Open Morning event kit

The event pages for Northline's Open Morning, ready to use. **You do not build them. You run them**, the way a
client's operator would: put them live on your own subdomain, connect them to your database, your emails and
Umami, test them from your phone, and release them.

You change two files: **`config.js`** (the event, the form, your addresses and keys) and **`assets/brand.css`**
(Northline's colors and fonts). Everything else stays as it is.

## What is in the kit

| File | What it does | You edit it? |
|---|---|---|
| `index.html` | The event page: what, when, where, the timetable, the offer, then the registration form with the privacy line | No |
| `confirm/index.html` | The page your confirmation email links to. It confirms the guest's email address ("Your email is confirmed"), opens **Get ready for the morning** (shown only after that: two quick questions, what to do before coming), and shows "Add to my calendar" and the phone number to cancel | No |
| `checkin/index.html` | The front desk page: check in a guest by email, add a walk-up, see how many arrived. Needs the desk code | No |
| `book/index.html` | The booking page for after the event: the offer, "Call us", an optional "Book online" link, and a "please call me" form where the guest says if they are a new patient, how many people need a visit and how many are children, and picks the office, the dentist and the time of day. The front desk confirms the visit | No |
| `feedback/index.html` | The guest survey for after the event, linked from the thank-you email (and a one-question version from "sorry we missed you") | No |
| `config.js` | **Everything you set:** event details, timetable, phone, privacy line, form options, the survey questions, table names, UTM campaign, and one block per environment (staging, production) | **Yes** |
| `assets/brand.css` | **Northline's colors and fonts**, as CSS variables. Copy the values from your own tokens | **Yes** |
| `assets/kit.css` | The layout (phone first) | No |
| `assets/kit.js` | Fills the pages from `config.js`, checks the forms, sends them to Supabase, sends Umami events | No |
| `assets/analytics.js` | Loads Umami with the website id from `config.js` | No |
| `supabase/migration.sql` | The tables and rules: `registrations`, `visit_requests`, `registration_emails`, `event_feedback`, the email check and the desk check-in | Copy it, do not change the rules |
| `supabase/queries.sql` | The queries you run on the server: set the desk code, read rows back, the counts, the printed list, what the mailer sends, the survey results | Copy and run |

There is no build step. The files are the site: Hostinger serves them as they are.

## How it works, in seven lines

1. A guest opens the event page (from the invitation, the reminder, the poster or the banner on Northline's website) and sees the event **before** any form. No sign-in, ever.
2. The form sends one new row to the `registrations` table, through your Supabase API, with the **publishable key**.
3. The table is **insert-only** for visitors: they can add a row, never read, change or delete one. A second sign-up with the same email shows the same "you are registered" message, so the page never reveals who else is on the list.
4. The database gives each row a **token**: a long random key. Your Week 4 mailer sees the new row and sends the confirmation email. Its link carries the token: `confirm/?t=<token>`.
5. The guest presses the link. The confirm page sends the token to the database, which marks the row as **confirmed** (`verified_at`). This proves the email address works and belongs to the guest. This check is called **double opt-in**.
6. On the day, the front desk checks guests in on `checkin/` with the **desk code**.
7. After the event, the thank-you email links to the survey, `feedback/?t=<token>`. One answer per guest, stored without a name or an email. Umami counts every step, with no names, emails, phone numbers or tokens.

## Put it live: the 10 steps

Staging first (Mon–Wed). Production on Thursday, inside your change window, after the backup.

### 1. Put the kit on your event branch

The kit reaches you as a pull request into the branch your decision record named, at the top of the branch or in the
folder you named. All links inside the kit are relative, so both work. Review it and merge it as it came.

### 2. Brand

Open `assets/brand.css`. Copy each value from your Northline tokens (`apps/web/src/styles/tokens.css`). Keep the names on the
left. If your fonts are files in your repository, copy the `@font-face` lines and the font files too.

### 3. The event details

Open `config.js`. Check every line of the `event` block against Denise's details and your `PLAN.md`: the date,
the time (Eastern time, the same clock as Toronto), the address, the timetable, the offer, the phone number, and the
privacy line from your `CAPTURE.md`. The privacy line must name the survey, because the follow-up asks for one.
Check `questionnaire`, `beforeYouCome`, `highlights`, `team` and `faq` too: they are what guests read, and Denise approves them.
Check `logoUrl` and `siteUrl`, and the `booking.offices` list against your `locations` and `team_member_locations` tables.
Set `registration: 'soon'` if the form must not open yet.

Then check the `survey` block: the questions, and the "most useful" choices, which name the parts of your timetable.

The form fields come from your `CAPTURE.md`: `askPhone` and `askGuests` switch the optional fields on or off.
A change to what you store needs the CEO's yes first, like any change to what you capture.

### 4. The database, by migration

1. Copy `supabase/migration.sql` into your `supabase/migrations/` folder as `<timestamp>_event_registrations.sql`
   (the same naming as your other migrations).
2. Apply it to **staging** with the CLI, the way you applied your `leads` migration. Nothing clicked in Studio.
3. Prove the rules through the API (replace the address and the key with your staging ones):

```bash
API=https://<your staging API host>/rest/v1
KEY=<your staging publishable key>
# add a row: expect HTTP 201
curl -s -o /dev/null -w '%{http_code}\n' -X POST "$API/registrations" \
  -H "apikey: $KEY" -H "Authorization: Bearer $KEY" -H "Content-Type: application/json" -H "Prefer: return=minimal" \
  -d '{"event_id":"2026-11-open-morning","name":"Rule Test","email":"<you>+og000@<your domain>"}'
# read the table: expect 401 (refused)
curl -s -w '\n%{http_code}\n' "$API/registrations?select=*" -H "apikey: $KEY" -H "Authorization: Bearer $KEY"
```

If your publishable key starts with `sb_publishable_`, leave out the `Authorization` header (the pages do the same).

> **Why 401, and not an empty list like your `leads` table?** Your `leads` table lets visitors through to the
> table and then the rules hide every row, so a read returns `[]`. This migration also takes the read permission
> away from visitors completely, so the database refuses the read before it looks at any row. Both keep the
> guests' details private; this one says so out loud.

### 5. The desk code

The desk page needs a code, so only the team at the desk can check guests in. On the server, run step 1 of
`supabase/queries.sql` with your own code (10 characters or more, not a word from the event). Use a **different**
code on staging and production. The code never goes into the repository: give it to the desk on the day.

### 6. Connect the pages, and deploy to your staging subdomain

1. In `config.js`, in `environments`, replace the first `REPLACE-…` block with your staging values: the event's
   staging **hostname** (exactly as in the browser's address bar, without `https://`), your staging API address,
   and your staging publishable key. Never a secret key: this file is public.
2. Merge by pull request into the event branch. Connect the event's staging subdomain to the branch with
   Hostinger's Git deployment, as your decision record says. Northline's main site is not touched.
3. Open the staging address. You see the event, then the form. If you see "Online registration is not available
   right now", the hostname in `config.js` does not match the address bar, or a value still says `REPLACE`.

### 7. The confirmation email, with the confirm link

Point your Week 4 mailer at the new table, the same way it handles `leads` and `lead_emails`:

- New rows: `registrations` with no `confirmation` row in `registration_emails`. Query 6 in `queries.sql` gives each one's `id`, `email` and `token`.
- The link in the email: `https://<event host>/confirm/?t=<token>&utm_source=confirmation&utm_medium=email&utm_campaign=2026-11-open-morning`.
  Put the row's own `token` after `t=`. Never the `id`: the id is not a secret key.
- After sending, insert `(registration_id, 'confirmation')` into `registration_emails`. The primary key stops a second send.
- The text: the confirmation from your `EMAILS.md`, as Denise approved it, with one line that asks the guest to press the link (see "The email texts" below).

**The reminder to confirm.** Some guests never press the link. Once, 24 hours after the confirmation, send them the
same link again:

- Query 8 lists them: the confirmation went out 24 hours ago or more, `verified_at` is still empty, and no reminder was sent.
- Use `utm_source=verify-reminder` in this link, so Umami tells the two emails apart.
- After sending, insert `(registration_id, 'verify_reminder')`. Query 8 then leaves that guest out: one reminder only.
- A guest who never confirms keeps the place. You still send the day-before reminder. The funnel counts them as
  registered, not confirmed.

The same table holds `reminder`, `thank_you` and `missed_you` for Week 8.

**Why a token, and why it is safe.** The token is 122 random bits, made by the database, so nobody can guess one.
The page sends it to `event_verify`, which answers only `ok`, `already` or `invalid`: never a name or an email. A wrong
token changes nothing, so trying many tokens gets a guesser nothing. The page removes the token from the address bar
before Umami loads, so the token never reaches Umami. Treat it like a password in the email: never paste a guest's
link into a ticket, a chat or the repository.

### 8. Umami

1. In Umami, add a website for the event's staging address and one for production.
2. In `config.js`, set `umamiScriptUrl` (`https://<your analytics host>/script.js`) and that environment's `umamiWebsiteId`.
3. Open the page, register, and check in Umami that the page view and the events below arrived.

| Event | When it fires | Its data (never a name, email or phone) |
|---|---|---|
| page view | every page opens (with its UTM tags in the address) | automatic |
| `form_start` | first tap in a form | `form`: `event_registration`, `visit_booking` or `event_checkin` |
| `form_submit` | the row was stored | `form`, `channel: form` |
| `form_error` | a check failed, or the API could not be reached | `form`, `reason`: `validation`, `network` or `processor_error` |
| `cta_click` | "Save my place", "Add to my calendar", a phone link, "Book online" | `location`, `label` |
| `form_submit` with `form: event_verification` | the confirm link was accepted (the first time only) | `form` |
| `feedback_submit` | a survey answer from a guest who came was stored | `rating` (1 to 5), nothing else |

`form` is also `event_feedback` for the survey. The token is never in an event or in the page address Umami sees.

### 9. Links and the poster QR

Your four links from `MEASURE.md` (invitation, reminder, poster, website banner) use the event's **production** address, each with `utm_source`,
`utm_medium` and `utm_campaign=2026-11-open-morning`. Make the poster QR from the poster link (production address): that file goes to Denise for the
poster. Before Thursday, test with a second QR made from the same link with the **staging** address: scan it from one
meter away, and check the visit in Umami with the poster's `utm_source`. The page keeps the tags and stores them
on the guest's row, so you can count registrations by where they came from (query 4). The website link goes in one
short banner on Northline's main site, in its own small pull request (staging first, production after v1.0.0).

### 10. Production, on Thursday

After the backup and restore drill and your decision brief: apply the migration to production with the CLI,
set the production desk code (step 5), fill the production block in `config.js`, merge the release pull request,
and check production from your phone.

## Test it from your phone

Do this on staging after steps 1 to 8, and again on production.

| # | Do this on your phone | You should see |
|---|---|---|
| 1 | Open the invitation link | The event, the timetable and the offer first; the form further down. No sign-in. Nothing sideways |
| 2 | Press "Save my place" with the form empty | A red message under Name and under Email. Nothing is sent |
| 3 | Register as `<you>+og001@…` | "You are registered" |
| 4 | Read the row back on the server (query 2) | Your row, with `utm_source` from the link |
| 5 | Wait for the email | The confirmation, within 60 seconds. Its link opens `confirm/` |
| 6 | Register again with the same email | The same "You are registered". Still one row |
| 7 | Turn on airplane mode, then register as `+og002` | "We could not save this just now. Please call …" with Northline's number |
| 8 | Open `checkin/`, enter the desk code and `+og001` | "Checked in: …" in under 30 seconds |
| 9 | Add a walk-up, and choose new or existing patient | "Checked in: …"; the count goes up. Without a choice, the form asks for one |
| 10 | Look in Umami | The page views and events from your phone, with the right tags |
| 11 | Open the confirmation email from row 5, and press its link | "Your email is confirmed". The address bar shows no `t=` |
| 12 | Read the row back on the server (query 2) | `verified_at` has a time |
| 13 | Press the same link again | "Already confirmed". `verified_at` keeps its first time |
| 14 | Change one letter of the token in the link, and open it | "We could not confirm this link", with Northline's number |
| 15 | Open `feedback/?t=<token of +og001>` (copy the token from query 6). Press "Send my answers" with nothing chosen | A red message under the first question. Nothing is stored |
| 16 | Choose a rating and the other answers, then send | "Thank you! We have your answers" |
| 17 | Open the same survey link again, and send | "We already have your answers". Still one answer (query 10) |
| 18 | Open the survey link with `&k=missed` at the end | Only "What kept you away?" and the comment box |
| 19 | Scroll the survey page sideways | Nothing moves sideways |
| 20 | On the confirmed page of `+og001`, press "Send my answers" with nothing chosen, then answer both | A message asking for both, then the thank-you. Query 14 shows one answer |

Rows 15 to 19 test the survey before the event. Your test answers carry your `+og` tokens, and query 12 leaves them out.

To look at the pages on your laptop before they are online: run `npx serve .` in the kit folder and open
`http://localhost:3000`. You will see the "not available" box, because `localhost` is not in `config.js`; that is
the failure state working.

## The check-in, and why only the desk can do it

- Visitors can only **add** rows. They cannot set `checked_in_at` or `walk_up`, so nobody can check themselves in from home.
- The desk page calls three database functions: `event_check_in`, `event_walk_up` and `event_desk_count`. Each one
  first checks the desk code against a hash stored in `event_desk`, a table visitors cannot see.
- With the right code, they mark a guest as arrived, add a walk-up, or count. They return a first name and numbers,
  **never the list**.
- After 20 wrong codes in 10 minutes, the desk functions stop for 10 minutes, so nobody can guess the code.
- The desk works from the **printed list** (query 5) and types the guest's email from it. If the page stops working,
  the desk ticks the printed list and writes walk-ups at the bottom. Nobody waits.
- The printed list holds personal data: print it, then delete the file. Never in the repository.

## The page changes by itself

The event page follows `startsAt` and `endsAt` in `config.js`. You do nothing on the day.

| When | Guests see |
|---|---|
| Before | The event and the form |
| During | "Happening now" and the current timetable row marked. No form: the desk takes anyone who decides on the day |
| After | "Thank you", and a "Book your visit" button instead of the form |

`registration: 'closed'` after the event (below) is still your step, for the page's final state.

## Do not change

| What | Why |
|---|---|
| The element ids: `register-form`, `name`, `email`, `register-btn`, `register-ok`, `verify-ok`, `verify-already`, `verify-invalid`, `verify-error`, `desk-code`, `checkin-btn`, `checkin-ok`, `walkup-name`, `walkup-email`, `walkup-patient`, `walkup-btn`, `book-btn`, `book-ok`, `feedback-form`, `rating-1` to `rating-5`, `recommend-yes`, `recommend-maybe`, `recommend-no`, `comment`, `contact-me`, `feedback-btn`, `feedback-ok`, `feedback-already`, `feedback-invalid` | Our test tools and your own checks find the pages by these ids. If one changes, the tests fail |
| The rules in `migration.sql` (the grants, the policies, the desk functions) | They keep the guest list private. A rule that lets visitors read the table would show every guest's details to anyone |
| The order on the event page: the event first, the form after | No sign-in before value: a guest decides in seconds |
| The privacy line's place, next to the button | The guest reads what you store at the moment they decide |
| `analytics.js`, and the event names | Umami must never get a name, email, phone number or token |
| The order in `kit.js` and the `<head>` of each page: `kit.js` before `analytics.js` | `kit.js` removes the token from the address before Umami loads |
| A secret key or a password in `config.js` | It is published with the pages. Only the publishable key goes there |

## After the event (Week 8)

1. Send the follow-ups on Wed 25 Nov at 09:00 Toronto (16:00 Israel). Query 9 gives two lists, each with the guest's token:
   - **came** gets the thank-you, with the survey link `https://<event host>/feedback/?t=<token>&utm_source=thank-you&utm_medium=email&utm_campaign=2026-11-open-morning`.
   - **missed** gets "sorry we missed you", with `https://<event host>/feedback/?t=<token>&k=missed&utm_source=missed-you&utm_medium=email&utm_campaign=2026-11-open-morning`.
   - After each send, insert `(registration_id, 'thank_you')` or `(registration_id, 'missed_you')` into `registration_emails`.
2. Put these in your funnel report: how many registered (query 3); who came, by source (query 4), keeping those who were not invited (poster, website) and the walk-ups on their own rows, so Came is never read as a share of Invited; the visit requests by office and dentist, in requests, in visits, in children's visits and in new-patient visits, because one request can be for a whole family and children and new patients are more sales; each dentist's conversion of the guests who came (query 7, written as counts: "3 of 18"); and how many new and existing patients and families came (query 14: the first table is those who signed up and answered; the second is the walk-ups, whom the desk asks one question, new or existing). Then read the survey for your report: query 10 (how many answered, of how many links sent, and the average rating),
   query 11 (the count for each answer) and query 12 (the comments, without your `+og` tests). Quote guests without
   names. Query 13 lists who asked to be contacted: give it to Denise's team, never to the repository.
3. Set `registration: 'closed'` in `config.js` (the page then thanks guests and gives the phone number), export the
   data for Denise, and remove the desk code: `delete from public.event_desk;` on both databases.

The survey stays open after registration closes, because it uses its own table and rule.

## The email texts

Plain words, short lines. Denise approves the final texts (Week 6, `EMAILS.md`). These are the lines the kit needs:

**Confirmation (right after sign-up).** Subject: *Please confirm your place at the Open Morning*

> Thank you for signing up for the Northline Open Morning, Tuesday 24 November, 10:00 to 12:00, at 1847 Maple Ridge Road, Suite 200.
> Please press this link to confirm your email address: **Confirm my email** (the `confirm/?t=…` link).
> It takes one tap. Then we know our reminder will reach you.
> Can't come after all? Call (440) 555-0140.

**Reminder to confirm (once, 24 hours later, only if the link was not pressed).** Subject: *One tap to confirm your place*

> You signed up for the Open Morning on Tuesday 24 November. Please press this link to confirm your email address:
> **Confirm my email**. Your place is saved either way.

**Thank you (Wed 25 Nov, to everyone who came).** Subject: *Thank you for coming*

> Thank you for coming to the Open Morning. <the offer, and the booking link>.
> Three quick questions, under a minute: **Tell us what you think** (the `feedback/?t=…` link).

**Sorry we missed you (Wed 25 Nov, to those who registered and did not come).** Subject: *We missed you at the Open Morning*

> We are sorry we missed you. <the offer, and the booking link>.
> One quick question: **What kept you away?** (the `feedback/?t=…&k=missed` link).

## When something does not work

| You see | Most likely | Do this |
|---|---|---|
| "Online registration is not available right now" | The hostname in `config.js` does not match the address bar, or a value still says `REPLACE` | Compare them letter by letter |
| "We could not save this just now" on a working connection | The API refused the row. Open the browser's network tab and look at the request to `/rest/v1/registrations` | `401`: wrong key, or the migration is not applied. `404`: the API has not seen the new table yet (run `notify pgrst, 'reload schema';`). `400`: a field broke a rule (for example a phone number with letters) |
| The browser console says "CORS" | Your API host does not answer this address | Check your Caddy and API settings for the event's hostname |
| No events in Umami | Wrong website id, or the script address is wrong | Open `https://<analytics host>/script.js` in the browser: it must load |
| The desk says "The desk code is not right" | The code was set on the other database, or typed differently | Set it again with step 5, on this environment |
| The desk says "Too many wrong codes" | 20 wrong tries in 10 minutes | Wait 10 minutes; use the printed list meanwhile |
| The confirm link says "We could not confirm this link" | The mailer put the `id` in the link instead of the `token`, or the link was cut in two by the email program | Compare the link with query 6. Put the link on its own line, as a button |
| The confirm link says "We could not confirm your email just now" | The API could not be reached, or the address has no environment in `config.js` | The same checks as "Online registration is not available" |
| The survey says "This survey link does not work" after Send | The token in the link belongs to no registration (for example, staging's token on production) | Send the link from the same database the guest registered in |
