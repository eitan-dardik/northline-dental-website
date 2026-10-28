# Runbook

What to do when a specific thing goes wrong.
Add an entry every time something surprises you.

Placeholders used in the commands below — replace them before running:

| Placeholder | Replace with |
|---|---|
| `<your-domain>` | the client's domain the APIs and sites run under |
| `<stage\|prod>` | `stage` or `prod`: the stack folder of the environment that's down |
| `<service>` | the container's service name in that stack, e.g. `api-gw`, `db` |
| `<api-host>` | `northline-api-stage` (staging) or `northline-api` (production) |
| `<port>` | the service's local port: `8000` staging API, `8100` production API, `3100` Umami |
| `$PUB_KEY` | a shell variable holding the publishable key of the environment you're testing; never the secret key |

Set the key with `read`, so it's typed at a prompt instead of written into a command.
A key written into a command line is saved in the shell history (`~/.bash_history`),
where anyone or anything that reads the history can find it:
```bash
read -rs -p "Publishable key: " PUB_KEY; echo   # -s: not shown on screen, -r: taken as typed
# ... run the commands that use $PUB_KEY ...
unset PUB_KEY                                     # remove it from the shell when done
```
The history then shows only `$PUB_KEY`, never the key itself.

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

## Entry: The contact form stopped saving enquiries

### Symptoms

- "Someone said they filled in the form, and we checked — there's no matching row."
- "The site shows an error and a phone number instead of saying thank you." The form shows this
  on purpose whenever a submit fails, so it tells you the save failed, not why.
 
### Investigate
Stop as soon as one step explains it.
 
1. **If the database is a hosted service, check the provider's status page.**
   Rules out an upstream outage — nothing to fix on your end. (Not relevant
   for Northline today: its Supabase runs on our own VPS. A down API there
   shows as `502` — see step 3.)
2. **Reproduce live, dev tools open.** Network tab → submit the form with a
   made-up name → watch the request. Tells you if it's even sent, and what
   comes back.
3. **Check the response status** of that request:
   - `401`/`403` → blocked by the row-level security policy — most likely
     cause, go to step 5.
   - `502` → the API behind Caddy is down — see the entry
     "A container is stopped and the site returns 502" below.
   - No request at all → form JS isn't wired up or fails before the network
     call (check Console first).
   - `201 Created` but no row where you're looking → the insert worked, but
     somewhere else: check the request URL — the site may be pointing at the
     other environment's API (staging vs production settings in hPanel).
   - `200` → not a leads insert at all (a successful insert always returns
     `201`): the form is posting to a leftover test or old endpoint. Check
     the request URL.
4. **Check Console for a JS error.** Tells you if it's failing in the browser
   before any network call.
5. **Check the policy on `leads`:**
```sql
   select * from pg_policies where tablename = 'leads';
```
   Compare against what the migrations say. The policy was created in
   `supabase/migrations/20260928105035_create_leads.sql`, but a later migration
   may have changed it. To find every migration that touches it:
   `grep -ln "leads" supabase/migrations/*.sql`
   Missing, narrowed, or RLS toggled off is the cause.
6. **Check the table shape:**
```sql
   select column_name, data_type from information_schema.columns
   where table_name = 'leads';
```
   A renamed/dropped column (e.g. edited by hand instead of via migration)
   will break the insert even with the policy intact.
 
### Resolve
- **Policy missing/wrong (most common):** re-apply exactly, with psql on the
  server (or Studio through the SSH tunnel). Use the policy name from the
  migration, so you replace it instead of adding a second one:
```sql
  alter table leads enable row level security;

  drop policy if exists "anon may insert leads" on leads;
  create policy "anon may insert leads"
    on leads for insert
    to anon
    with check (true);
```
  Don't loosen it (e.g. add a select policy) to make the symptom disappear —
  that reopens the exposure this table exists to prevent.
- **Table shape changed outside a migration:** create a new migration
  (`npx supabase migration new fix_leads_column`), apply it, commit it.
  Never edit a migration that has already been applied.
- **Form JS error / wrong endpoint:** fix in code, redeploy.
- **After any fix:** re-run the live test with a fresh made-up lead and
  confirm the row appears. Then test a failure on purpose (e.g. go offline
  and submit) to confirm the error message and phone number still show.
### Rollback
1. Re-run the policy block above. It's safe to run more than once.
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

## Entry: A container is stopped and the site returns 502

### Symptoms

- The site shows the failure message and phone number instead of its content; the form can't save.
- An API URL answers **`502 Bad Gateway`**, usually in one environment only.

### Investigate
Don't start, restart or edit anything yet. Once a container is started again, its
exit code, OOM flag and stop time are gone, and those are what explain the cause.

1. **Confirm the 502 and find which environment it is.** Check each API, and Umami:
```bash
   curl -I -H "apikey: $PUB_KEY" https://<api-host>.<your-domain>/rest/v1/leads?select=id
   curl -I https://analytics.<your-domain>
```
   `502` with `Server: Caddy` and no TLS error → DNS, the certificate and Caddy are fine;
   the fault is in a container behind Caddy. The one that answers `502` is the stack to look at.
2. **Save the state of that stack:**
```bash
   date -u
   cd ~/northline/<stage|prod>/supabase
   docker compose ps -a
   docker inspect --format '{{.Name}} status={{.State.Status}} exit={{.State.ExitCode}} oom={{.State.OOMKilled}} started={{.State.StartedAt}} finished={{.State.FinishedAt}} restarts={{.RestartCount}} policy={{.HostConfig.RestartPolicy.Name}}' $(docker compose ps -aq)
   df -h ; free -m
   sudo ss -tlnp
```
3. **Find the container that isn't running** in the `ps -a` output, and save its logs:
```bash
   docker compose logs --tail 200 <service> > ~/incident-$(date +%F-%H%M)-<service>.log
```
   If every container is running, the problem is between Caddy and the stack: see step 6.
   
4. **Why did it stop?** Read its `docker inspect` line and the log:

   | You see | It means |
   |---|---|
   | `exit=0`, `oom=false`, `SIGTERM` in the log | Someone stopped it (`docker stop` / `docker compose stop`) |
   | `oom=true` | It ran out of memory: compare `free -m` with its memory limit |
   | another exit code | It crashed: the log says why |
   | `df -h` shows a disk at 100% | A full disk stopped it |
   | `policy=` is not what the compose file says (e.g. `no` instead of `unless-stopped`) | Someone changed it outside compose (`docker update`): part of the cause, because then it won't come back after a crash or reboot either |

5. **If someone stopped it, who was on the server at that time?**
```bash
   # from about 30 minutes before finished= (step 2) to a few minutes after
   sudo journalctl -u ssh --since "<YYYY-MM-DD HH:MM> UTC" --until "<YYYY-MM-DD HH:MM> UTC" | grep -i accepted
```
   Match the login times against `finished=`. This shows who was logged in, not who ran the
   command: Docker commands aren't recorded per user.

6. **Every container is running but it's still 502:** check Caddy's log for the address it can't reach,
   then whether anything answers there:
```bash
   cd ~/northline/edge
   docker compose logs --since 10m caddy | grep -iE "dial|upstream" | tail -5
   curl -I http://127.0.0.1:<port>
```
   The `ss -tlnp` output from step 2 shows whether anything listens on that port at all.
   Nothing answers on that port → check `API_GW_HTTP_PORT` in the stack's `.env` against the Caddyfile,
   and ask what changed recently (an edit, an update, a deploy).

### Resolve
- **Start only the container that stopped**, from its stack's folder: `docker compose up -d <service>`.
  Not `down` and `up` for the whole stack: that wipes the evidence and restarts things that were fine.
- **Restart policy was changed:** start it from the compose file, so the policy is reset to what's committed:
  `docker compose up -d --force-recreate <service>` (only after step 2: recreating replaces the container
  and its state). Check `policy=` again with the `docker inspect` line.
- **Out of memory:** raise its limit in the compose file through a PR, then `docker compose up -d <service>`.
- **Port mismatch:** fix `.env` or the Caddyfile so they agree, then restart that one service or reload Caddy.
- **Check:** `docker compose ps` shows it `healthy`, the `curl -I` from step 1 answers `200`, and the site shows its content.

### Rollback
- Starting the container only puts it back the way it was, so there's nothing to undo.
- If a config change caused it, revert that change and restart the one service.

### Escalate
- **Production is down**, or step 4 doesn't explain it: escalate straight away with the saved output and log file.
- **It was stopped and nobody announced it:** raise it with the team.
- **The same container stops again:** treat it as a defect and escalate with both incidents' captures.
- **Always confirm back** once the site works again.

---

## Entry: (add the next one here)
 
### Symptoms
### Investigate
### Resolve
### Rollback
### Escalate