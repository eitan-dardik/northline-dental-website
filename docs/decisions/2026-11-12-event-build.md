# Decision: how the Open Morning page is built

**Date:** Thu 12 Nov 2026 · **Status:** proposed (for the CEO's review in the evidence/w6 pull request)

## The question

The event kit is a ready-made static page (no build step). Three things are mine to decide, inside the CEO's fixed rules: the kit lives in the Northline repository on its own branch and its own subdomain; a failed event deploy must never block or break Northline's main site; production changes only 16:00–22:00 Israel, by pull request, CI green, the CEO's approval as code owner.

1. How the kit goes to staging and production: branches, subdomains, deploy.
2. Where the registrations are stored, and how visitors are kept from reading them.
3. How the emails are sent (about 120 invitations at once, then confirmations and reminders), and how I test that they arrive.

## 1. How the kit goes live

| Option | Time to build | Risk to the main site | Other |
|---|---|---|---|
| **A. Two event branches, each deployed by Hostinger's Git deployment to its own subdomain:** `event` → the staging subdomain, `event-main` → the production subdomain. A release is a pull request from `event` into `event-main` | ~1 h: two subdomains in hPanel, two Git deployments, one small CI job | **low**: separate branches, separate sites; the main site's branches and deploy are never touched | the same Git deployment I set up in Week 1, so nothing new to learn. `event-main` gets the same protection as `main` (pull request, CI green, the CEO's approval) |
| B. The kit served from the VPS by Caddy, on the same two subdomains, copied there by a CI job | ~1.5 h: two DNS records, two Caddy site blocks, a deploy job with a server key | low for the main site, but **medium for the VPS**: a wrong Caddy change could take down the database API and Umami, which also run there | a new deploy path and a new secret in CI, a week before the event |
| C. The event page as a new route inside the main site's build | ~1 h | **high**: a broken event page breaks the main site's build and deploy | against the fixed rules (own branch, own subdomain); rejected |

**Names:** event and event-main are general names, because this program has one event. For a client with several events a year I would name the branches and subdomains after each event (for example open-morning, open-morning-stage), so the next event doesn’t clash with this one.

**How the kit goes on the branch:** the kit exactly as it came, in its own first commit; my changes (only `config.js` and `assets/brand.css`) in a second commit. So the diff shows only what I changed.

**CI:** a small job for the event branches only (`node --check` on the kit's scripts, and a search that fails if `config.js` holds a secret key). It doesn't build or touch the Vite site.

## 2. Where the registrations are stored

| Option | Time to build | Risk | Other |
|---|---|---|---|
| **A. A new `registrations` table (and `registration_emails`) in the existing Supabase stacks, staging and production, by migration**, copied from the `leads` pattern | ~45 min | low: new tables; `leads` is not changed | visitors may only insert, never read, change or delete (row-level security); the page holds only the publishable key. Same backups as Northline (#141) and the restore drill before v1.0.0 (task 43). Details: [CAPTURE.md](../event/CAPTURE.md) |
| B. A separate new Supabase stack only for the event | ~3 h | low for Northline, but a second database to back up, watch and shut down | more containers on the same VPS, for a page that lives two weeks |

## 3. How the emails are sent

| Option | Time to build | Risk | Other |
|---|---|---|---|
| **A. My Week 4 mailer** (the same container per environment, Hostinger mail), pointed at `registrations`, with `registration_emails` as its "already sent" list | ~1.5 h: new queries, the texts, the confirm link with the token | medium: ~120 invitations at once may hit the mail account's sending limit, so I send them in small batches, and check the limit in hPanel before Thu 19 Nov | SPF, DKIM and DMARC already set up and checked in Week 4; one mailer to watch, already in my runbook. The rules for each email: [CAPTURE.md](../event/CAPTURE.md) |
| B. An outside email-sending service | ~2–3 h: new account, new DNS records, a new API key to keep secret | low for limits, but new DNS records and a new secret a week before the event | a new tool to learn under time pressure |

**How I test that emails arrive:** every test registration uses my own address with `+og…`; the invitations go to `+guest001`, `+guest002` … (the invite list's own addresses end in `example.com` and never deliver). Before Thu 19 Nov: the deliverability check (task 35: SPF, DKIM, DMARC, the headers, two inboxes) and one test send. The mailer will also log the mail server's reply for each email, because on 12 Nov one alert was accepted by the server but never arrived ([CAPTURE.md](../event/CAPTURE.md), Test).

## Decision

I choose **A, A and A**: two event branches deployed by Hostinger's Git deployment to their own subdomains, with releases as pull requests into `event-main`; the registrations in a new table in the existing Supabase stacks, insert-only for visitors; the emails through my Week 4 mailer, the invitations in batches.

Each one reuses something I already built and proved (the Week 1 Git deployment, the `leads` rules and backups, the Week 4 mailer and its DNS records), none of them touches the main site's build, and Week 7 has no time to learn a new tool.

## What would make me change it

- **Deploy:** if Hostinger's Git deployment can't serve a second subdomain from a branch, or is slow to update, I move the page to option B (Caddy on the VPS) before `event-v0.1.0`, with a config check before every Caddy reload.
- **Data:** if the CEO wants the event data fully apart from Northline's (for example, to delete it all in one step after the event), I use option B, a separate stack.
- **Emails:** if the mail account's limit is below one batch, or the test send lands in spam after the deliverability fixes, I switch to option B, a sending service, before Thu 19 Nov, and tell Denise if the invitations move.
