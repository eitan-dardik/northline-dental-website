# Runbook

what to do when a specific thing goes wrong. 
Add an entry every time something surprises you.

---

## Shared hosting or a VPS?

**Shared hosting** is the right choice when a client only needs a website:
pages, photos and a contact form. The hosting company (Hostinger) owns and
runs the computer (server) the site lives on, keeps it secure and installs its
updates, so there is nothing for us to maintain there. Every time we publish
a change, the site updates itself automatically, and HTTPS is
included. It is the cheapest option, about $17/month, and one plan can hold
several websites. The trade-off: the server is shared with other
customers. On a busy day, the hosting company's limits can make the site
slower, and we can only use the features it offers. We cannot run programs
of our own on it, such as the database that stores Northline's enquiries.
Northline's website itself lives here.

**A VPS** (a private server) is needed when a client wants more than a
website: somewhere to store enquiries, visitor statistics, or other programs
of their own. That is why Northline has one: its database and analytics run
there, because shared hosting cannot run them. The client gets full control,
and their data stays on a server we manage instead of on someone else's
service. In return, we take over the jobs the hosting company did before:
security updates, backups, checking the backups really work, and watching
that everything stays up. The server costs about $17/month, plus about
2 hours a month of our time, which is part of the monthly retainer. Other
customers cannot slow it down, but it has a fixed size. If too much runs at
once, it can run out of memory, so we cap how much each part may use and
keep an eye on it. Today Northline uses about two thirds of it.

---
---

## Entry: The contact form stopped saving enquiries

### Symptoms

- "Someone said they filled in the form, and we checked — there's no matching row."
- "The site shows an error and a phone number instead of saying thank you." - this is by design when something is wrong upon submit.
 
### Investigate
Stop as soon as one step explains it.
 
1. **Check the database provider's status page.** Rules out an upstream
   outage — nothing to fix on your end.
2. **Check the response status.**
   - `401`/`403` → blocked by the row-level security policy — most likely
     cause, go to step 4.
   - No request at all → form JS isn't wired up or fails before the network
     call (check Console first).
   - `200` but no row → wrong table/project, or a leftover test endpoint.
3. **Check Console for a JS error.** Tells you if it's failing in the browser
   before any network call.
4. **Check the policy on `leads`:**
```sql
   select * from pg_policies where tablename = 'leads';
```
   Compare against `db/migrations/001_create_leads.sql`. Missing, narrowed,
   or RLS toggled off is the cause.
5. **Check the table shape:**
```sql
   select column_name, data_type from information_schema.columns
   where table_name = 'leads';
```
   A renamed/dropped column (e.g. edited by hand instead of via migration)
   will break the insert even with the policy intact.
6. **Reproduce live, dev tools open.** Network tab → submit the form with a
   made-up name → watch the request. Tells you if it's even sent, and what
   comes back.
 
### Resolve
- **Policy missing/wrong (most common):** re-apply exactly, via SQL editor:
```sql
  alter table leads enable row level security;
 
  create policy "anon may insert leads"
    on leads for insert
    to anon
    with check (true);
```
  Don't loosen it (e.g. add a select policy) to make the symptom disappear —
  that reopens the exposure this table exists to prevent.
- **Table shape changed outside a migration:** write a new numbered migration
  (e.g. `002_fix_leads_column.sql`), apply it, commit it. Never hand-edit
  `001`.
- **Form JS error / wrong endpoint:** fix in code, redeploy.
- **After any fix:** re-run the live test with a fresh made-up lead and
  confirm the row appears. Then re-run the offline/failure-path test to
  confirm honest failures still show correctly.
### Rollback
1. Re-run the exact policy block above — idempotent, safe to repeat.
2. If a new migration caused the regression, don't delete it — write another
   migration that reverses it, noting which one it undoes.
3. Re-run the live test before calling it fixed.
### Escalate
- **Immediately:** if a `select` policy on `leads` was ever present, treat as
  a data exposure, not a bug — escalate right away with how long it was
  wrong and whether `select * from leads` returns rows now.
- **After 30 minutes stuck**, or if the fix needs more than re-applying the
  documented policy or a simple migration — escalate with: the Network tab
  response, the two SQL query outputs above, and whether it's reproducible
  now.
- **Always confirm back** once fixed or confirmed as an outage — whoever's
  fielding "did you get my enquiry?" calls needs to know.
---
 
## Entry: (add the next one here)
 
### Symptoms
### Investigate
### Resolve
### Rollback
### Escalate

