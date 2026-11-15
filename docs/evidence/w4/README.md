# Week 4 Evidence

Rebuilt for the final project's task 18 from my original Week 4 pack.

Domains, IDs, keys and my own inboxes are replaced with `<…>`.

| # | Item | Proof |
|---|---|---|
| 1 | Gate | Waived by the CEO, 8 Nov. |
| 2 | Settings per site | [#45](https://github.com/eitan-dardik/northline-dental-website/pull/45) (feat/site-settings → dev) and [#46](https://github.com/eitan-dardik/northline-dental-website/pull/46) (dev → main). Same site tree on both sites, the `import.meta.env` grep, and the setting names per site: [below](#row-2-settings-per-site) |
| 3 | Tables and seed | [content tables migration](https://github.com/eitan-dardik/northline-dental-website/blob/dev/supabase/migrations/20261020101326_content_tables.sql), [seed.sql](https://github.com/eitan-dardik/northline-dental-website/blob/dev/supabase/seed.sql), [#47](https://github.com/eitan-dardik/northline-dental-website/pull/47). `db reset` output and row counts: [below](#row-3-tables-and-seed) |
| 4 | Content from the database | [#54](https://github.com/eitan-dardik/northline-dental-website/pull/54); `config.json` keys: [below](#row-4-content-from-the-database) |
| 5 | Loading and failure | Staging with the database stopped: the message with the fallback phone, and the commands: [below](#row-5-loading-and-failure) |
| 6 | Two rules | [docs/data/model.md, section 9](https://github.com/eitan-dardik/northline-dental-website/blob/dev/docs/data/model.md#9-why-does-anon-read-the-content-tables-but-only-insert-into-leads); the `set local role anon` output: [below](#row-6-two-rules) |
| 7 | Analytics | [measurement plan](https://github.com/eitan-dardik/northline-dental-website/blob/dev/docs/analytics/measurement-plan.md); the two Umami websites, the six events, the desktop/mobile table and the reconciliation: [below](#row-7-analytics) |
| 8 | Environments apart | Ten staging sessions, production empty in the same range: [below](#row-8-environments-apart) |
| 9 | Emails | [#62](https://github.com/eitan-dardik/northline-dental-website/pull/62) (7.4 s and 9.4 s); both emails with full headers ([alert](9-gmail-alert-headers.txt), [confirmation](9-outlook-confirmation-headers.txt)), SPF/DKIM/DMARC: [below](#row-9-emails) |
| 10 | Baseline | [docs/perf/baseline.md](https://github.com/eitan-dardik/northline-dental-website/blob/dev/docs/perf/baseline.md) (W6 task 13) |
| 11 | The Break | Sent by the CEO as client ticket [#96](https://github.com/eitan-dardik/northline-dental-website/issues/96) ("This is Week 4 work", 3 Nov). [Closing report](https://github.com/eitan-dardik/northline-dental-website/issues/96#issuecomment-6719472805): staging had lost the `anon` read policy on `team_member_locations` outside the repo; recreated exactly as in the migration (staging only), both sites checked, and what stops it happening again |
| 12 | Safety checks | Checks 2–4 print nothing; check 1 matches two comments that name the key format, no key: [below](#row-12-safety-checks) |
| 13 | What I got wrong | [below](#row-13-what-i-got-wrong) |

---

## Row 2: settings per site

The same site folder in both deployed commits (staging `640fa118`, from #45; production `080f8ffd`, from #46):

```
$ git rev-parse 640fa118:apps/web 080f8ffd:apps/web
53fd8d0b9c2a861275e6d3251ef7e80c1ded05d5
53fd8d0b9c2a861275e6d3251ef7e80c1ded05d5
```

Only `lib/config/env.js` reads `import.meta.env`:

```
$ git grep -n "import.meta.env" -- apps/web/src
apps/web/src/lib/config/env.js:1:// this is the ONLY file that reads import.meta.env
apps/web/src/lib/config/env.js:2:// Vite copies each import.meta.env.VITE_... into the JavaScript at build time.
apps/web/src/lib/config/env.js:7:  supabaseUrl:            clean(import.meta.env.VITE_SUPABASE_URL),
apps/web/src/lib/config/env.js:8:  supabasePublishableKey: clean(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY),
apps/web/src/lib/config/env.js:9:  umamiScriptUrl:         clean(import.meta.env.VITE_UMAMI_SCRIPT_URL),
apps/web/src/lib/config/env.js:10:  umamiWebsiteId:         clean(import.meta.env.VITE_UMAMI_WEBSITE_ID),
```

Each site's deployment in hPanel, with its commit:

| Site | Branch | Commit | Deployed (as hPanel shows it) |
|---|---|---|---|
| staging | `dev` | `640fa118`, merge of #45 | 19 Oct 2026, 11:08 |
| production | `main` | `080f8ffd`, merge of #46 (release: per-site settings, self-hosted fonts) | 19 Oct 2026, 11:34 |

The four setting names per site in hPanel, values hidden. Staging, then production:

![hPanel staging](img/2-hpanel-staging-names.png)
![hPanel production](img/2-hpanel-production-names.png)

**Note:** after #48 was merged into `dev` (`5cb6784`), Hostinger's auto-deploy didn't start. I redeployed by hand and checked that the build used `5cb6784` and Vite 7.3.7.

## Row 3: tables and seed

I dropped the `frequency` field from `location_hours`; the reason is in `docs/data/model.md`.

`npx supabase db reset` (local), then the row count of each content table. I checked that the counts match `seed.sql` and `config.json`:

![db reset](img/3-db-reset.png)
![row counts](img/3-row-counts.png)

The brief's L1 test, hours for an office that doesn't exist, is refused by the foreign key:

```
insert into location_hours (location_id, days, opens, closes, sort_order)
values ('nowhere', 'Mon', '09:00', '17:00', 1);

ERROR:  23503: insert or update on table "location_hours" violates foreign key constraint "location_hours_location_id_fkey"
DETAIL:  Key (location_id)=(nowhere) is not present in table "locations".
```

**On the servers:** the migrations went through an SSH tunnel, staging first, with a dry run before the real push, and `migration list` afterwards; then the same for production:

```
read -rs PGPW_stage
DB_STG="postgresql://postgres:${PGPW_stage}@127.0.0.1:54329/postgres?sslmode=disable"
npx supabase db push --db-url "$DB_STG" --dry-run
npx supabase db push --db-url "$DB_STG"
npx supabase migration list --db-url "$DB_STG"
```

The content was applied on the VPS the same way, staging first and checked by the counts, then production; never `db reset` on a server. I ran the seed twice, to show it is safe to run again:

```
cd ~/northline/stage/supabase
docker compose exec -T db psql -U postgres -v ON_ERROR_STOP=1 < ~/seed.sql
```

The same counts on production on 15 Nov, from the restore test in #147: `locations` 3, `location_hours` 6, `team_members` 3, `team_member_locations` 4, `services` 10, `site_notice` 1.

## Row 4: content from the database

`config.json` keeps only these keys:

```
$ node -p "Object.keys(require('./landing-template/config.json')).join(', ')"
customer, brand, images, contact, social-media
```

The search for `config.json` outside `lib/config/` prints 4 lines, all comments that mention it by name; none is an import, so `config.json` is imported only in `src/lib/config/`. The Week 2 searches 2 and 3 print nothing.

knip flagged `supabase` as an unused package. That was a false positive: knip only counts a package as used if it sees it used in the project's files, and the Supabase CLI is only run with `npx supabase`. Fixed in [#52](https://github.com/eitan-dardik/northline-dental-website/issues/52).

Moving the content found and fixed three bugs (in #54): `formatHours` always printed "first and third Saturday", now built from `occurrences`; one bio repeated the office list the page already shows (fixed in `seed.sql`); `tools/generate-llms.js` broke when the content moved to the database.

## Row 5: loading and failure

On staging (`~/northline/stage/supabase`):

```
docker compose stop db
docker compose start db
```

Left: database up. Right: database down: the message with the fallback phone, no white page.

![contact page, db up and down](img/5-contact-db-up-and-down.png)
![about page, db up and down](img/5-about-db-up-and-down.png)

## Row 6: two rules

Locally, in `psql` after `npx supabase db reset`, as a visitor (`set local role anon`): content is readable (`locations` 3), `leads` returns no rows (0, filtered, not refused), and an insert into `locations` is refused by row-level security.

I changed the brief's test slightly: it first inserts one lead as the owner, so `leads` really has a row. Then "0 rows as `anon`" proves the rule hides it, not that the table is empty.

![anon rules](img/6-anon-rules.png)

The refused insert also leaves out `sort_order`, which is `not null`, but the error names only row-level security: Postgres checks the policy before the column rules, so `anon` is refused before the data is even looked at.

Why the same role gets opposite rules: content is meant to be shown to every visitor, so `anon` may read it; a visitor may send a lead, but never read the leads table, because it holds other people's private data.

## Row 7: analytics

The two Umami websites (domains and IDs hidden) and the six events on staging:

![umami websites](img/7-umami-websites.png)
![six events](img/7-six-events.png)

Desktop: Firefox, 1 Nov 07:20:32–07:30:12 UTC. Mobile: Chrome device mode (Galaxy S25), 07:32:50–07:50:10 UTC. Each event checked in the Network → Payload tab and in Umami's Activity tab.

| Test | Desktop | Mobile | Counted once? | Notes |
|---|---|---|---|---|
| `cta_click` (Book an appointment) | ✅ | ✅ | yes | location banner, label book |
| `form_start` | ✅ | ✅ | yes | once per form view |
| `form_error`, validation (email "abc") | ✅ | ✅ | yes, no `form_submit` | one event per failed field |
| `form_submit` (double-click) | ✅ | ✅ | yes, one `form_submit` | button disabled while sending |
| `call_click` (office card) | ✅ | ✅ | yes | office_card + office |
| `whatsapp_click` | ✅ | ✅ | yes | footer |
| `form_error`, network | ✅ | not tested | yes, no `form_submit` | staging api-gw stopped, then started |
| `call_click` (failure message) | ✅ | not tested | yes | failure_message, no office |
| `form_error`, rejected | — | — | — | not tested: would need breaking the leads insert policy |

Reconciliation, staging, 1 Nov 07:20:32–07:50:10 UTC:

| | Desktop | Mobile | Total |
|---|---|---|---|
| `leads` row saved | 07:24:21.253 | 07:49:02.862 | 2 |
| Umami `form_submit` | 07:24:21.398 | 07:49:02.957 | 2 |

Equal: each double-click test gave one lead and one `form_submit`; the network-failure test gave a `form_error` and no row. Umami's own `website_event` table has the two `form_submit` rows about 0.1 seconds after the lead rows (145 ms and 95 ms): the event is sent right after the save succeeds.

Mobile was first tried in Firefox's responsive mode, but Umami still counted it as the same laptop: the requests kept the desktop User-Agent and reused the desktop session. Chrome's device mode changes both, so Umami counted it as mobile.

The website-ID search across all of history prints nothing: no Umami website ID is in committed code; each site gets its own from hPanel.

## Row 8: environments apart

Same range (last 24 hours) on both websites. Production runs the same code (release v0.4.4, the same site tree as staging) with its own website ID from hPanel.

Staging: 10 sessions (8 from Chrome device mode, a different device each time; 2 from the event tests). Some devices in Chrome's list send the same User-Agent and merged into one session; new sessions only appeared once I picked different Android devices. Production: no data. Each site sends only its own website ID.

![staging vs production](img/8-staging-vs-production.png)

**If production had shown three events in that range:** staging would be sending its events to the production website ID, so test visits would count as real patients. Denise's decisions would then rest on visits that never happened.

## Row 9: emails

**Setup:** the mailer is built from `services/mailer` and runs as a service in the staging stack (`deploy/supabase/docker-compose.yml`). Its settings and secrets are in `mailer.env` on the server only; the template in the repo is `services/mailer/mailer.env.example`. Before its first run, the 9 existing leads were marked as handled (`status = 'sent'`, `sent_at` empty), so only new leads are emailed. A phone-only lead gets the internal alert only, because there is no address to confirm to.

`lead_emails` has row-level security on and no policies, so visitors can't read or write it (`\d lead_emails` on staging):

![lead_emails on staging](img/9-lead-emails-rls.png)

One test lead on staging, Mon 2 Nov. The internal alert went to Gmail (playing the practice), the confirmation to Outlook (playing the patient).

| | Gmail (alert) | Outlook (confirmation) |
|---|---|---|
| SPF | pass | pass |
| DKIM | pass (d=`<domain>`, selector hostingermail-a) | pass (d=`<domain>`) |
| DMARC | pass (p=NONE) | pass (action=none) |
| Delivered to | Inbox | Junk (SCL 5) |

| | Time (UTC) | After the lead |
|---|---|---|
| Lead `created_at` | 15:17:05.594 | — |
| Alert `Date` (Gmail) | 15:17:13 | ≈ 7.4 s |
| Confirmation `Date` (Outlook) | 15:17:15 | ≈ 9.4 s |
| `lead_emails.sent_at` | 15:17:15.437 | ≈ 9.8 s |

Both within 10 seconds, under the 60 asked for. The order matches the code: the alert first, then the confirmation, then `status = 'sent'`. The mailer checks every 15 seconds, so the worst case is about 15 seconds plus sending time. Finding: Outlook put the confirmation in Junk although all three checks passed; a new domain has no sending reputation yet.

Full headers of both emails, one header per line (my test inboxes, the sending domain and the VPS hostname and IP are replaced with `<…>`):

- the alert, from Gmail: [9-gmail-alert-headers.txt](9-gmail-alert-headers.txt)
- the confirmation, from Outlook: [9-outlook-confirmation-headers.txt](9-outlook-confirmation-headers.txt) (`X-MS-Exchange-Organization-SCL: 5` and `RF:JunkEmail` are why it landed in Junk)

## Row 12: safety checks

Run on 15 Nov, on all branches:

```
$ git log --all -S "sb_secret_" --oneline
c33749a feat(mailer): email each new lead once, from the server
38ac3a6 feat(deploy): add trimmed Supabase compose file and .env.example
$ git log --all -E -G "eyJ[A-Za-z0-9_-]{10,}\.eyJ" --oneline
$ git log --all --name-only --format="" | grep -E "(^|/)\.env(\.local)?$"
$ git rev-list --objects --all | grep -iE "\.csv$"
```

Checks 2, 3 and 4 print nothing. Check 1 prints two commits, so I looked at what matched (cut after 12 characters, so a real key could not be printed in full):

```
$ git show c33749a | grep -n "sb_secret_" | sed -E 's/(sb_secret_.{0,12}).*/\1…/'
199:+# That stack's sb_secret_... key, cop…
$ git show 38ac3a6 | grep -n "sb_secret_" | sed -E 's/(sb_secret_.{0,12}).*/\1…/'
53:+# Secret key (sb_secret_...) - BYPAS…
```

Both matches are **comments** that name the key's format (`sb_secret_...`) to explain where a setting comes from. No key value follows the prefix in either commit, so no secret key is in the history. The real keys live only in the server's `.env` files, which were never committed (check 3).

## Row 13: what I got wrong

In Part 1 I tested a missing setting with `VITE_SUPABASE_URL=" "` (a single space). The build passed and the page showed the failure message, so I thought the step was done. It only passed because `vite.config.js` checked `!env[key]`, and a space counts as a value. With a truly empty value, `vite.config.js` threw "failed to load config" before Vite compiled anything: on Hostinger, a missing setting would have stopped the deploy, and visitors would never get the version with the failure state.

I changed the throw to a warning and used the same rule as `clean()` in `env.js` (`!(env[key] ?? '').trim()`), so `""` and `" "` both warn and the build finishes. What I learned: `vite.config.js` runs at build time for the developer, `env.js` runs in the visitor's browser; and a passing test proves little unless it can also fail, so I now try each check against a case where it should fail first.
