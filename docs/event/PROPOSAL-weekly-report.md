# Proposal for Denise: a weekly "where your patients come from" email

In your first email you asked for a weekly update. This is what I'd offer as a follow-on service after the Open Morning: one short email every Monday morning, with where last week's website visitors and enquiries came from.

## 1. What you get (an example)

> **Subject: Northline website, week of 30 Nov – 6 Dec**
>
> **Visitors:** 412 (last week 388)
> **Enquiries from the contact form:** 9 (last week 7)
> **Calls from the website's phone links:** 5
>
> | Where they came from | Visitors | Enquiries |
> |---|---|---|
> | Google search | 231 | 5 |
> | Typed the address / bookmark | 96 | 2 |
> | Facebook | 48 | 1 |
> | A newsletter or poster link | 37 | 1 |
>
> | Office | Enquiries | Calls |
> |---|---|---|
> | Maple Ridge | 5 | 3 |
> | Fairview | 3 | 1 |
> | Grandon | 1 | 1 |
>
> Questions? Reply to this email.

(The numbers above are made up, to show the layout. No names or addresses are ever in it, only counts.)

## 2. How it works

- **Where the numbers come from:** Umami, the visitor statistics already running for your website: each visit, where it came from (Google, Facebook, a typed address, or a tagged link like the Open Morning's invitation, poster and banner), and the contact form's enquiries and phone clicks, each with its office. All of this is collected today.
- **What collects and sends them:** a small script on our server, every Monday at 07:00 your time: it reads last week's counts from Umami's own database (read only) and sends the email through the same sender as the confirmation emails you approved.
- **Where it runs:** on Northline's server, next to the monitoring that already checks it every 5 minutes.
- **What can fail, and what happens then:** the server or the statistics are down on Monday (the monitor alerts me, and the email goes out when it's back); a week with unusual numbers (e.g. a bot visiting many times: I check the numbers before the first weeks go out); the email lands in spam (the sender passes the same SPF, DKIM and DMARC checks as the event emails).

## 3. How long

- **To build:** about 5 hours of work (the script, the email's layout, a test week to my own address, the monitor's check that it ran). Assumed: Umami stays as it is, and the email is plain counts like the example, with no charts.
- **To run each week:** nothing by hand; about 10 minutes a week for me to glance at it in the first month, then only when the monitor says it didn't go out.

How I got there: my plain estimate is 6 hours to build; with my multiplier from Week 5 (× 0.8, from comparing my estimates with my actual times) that's about 5 hours.

## 4. Why it's worth having: the Open Morning's own numbers

The Open Morning showed how much "where people came from" tells you:

- **The invitation brought 14 of the 24 sign-ups**, and 4 of the 6 who came.
- **The poster and the website banner brought 7 more** (3 and 4), people who weren't on the invite list.
- **The booking page brought 7 visit requests for 11 people** in the day after the follow-up email.

Without the tags on each link, all of that would have been one number: "24 signed up". A weekly email gives you the same view of your normal week: which channel brings patients, and which office they ask for, so you can spend where it works.
