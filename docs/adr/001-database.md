# ADR 001 - The database

Status: accepted - 2026-10-13

## Context
Northline needs to record leads from people who try to reach the clinics
through the website. This reduces phone calls and makes sure no lead is lost
because nobody picked up the phone, so the leads must be stored in a database.
We store no medical information, but a lead (name, phone, message) is still
personal data and must be protected: we implement access control, and no copies in the
repo or in screenshots.
If the database is unavailable, the website shows the clinic's phone number instead, 
so the visitor always has a way to reach the clinic.
Constraints: the budget is for a small office, AutonoMoose runs the systems
on the retainer, and staging and production must use separate databases.

## Decision
We use Supabase because it is the platform we started experimenting with
and are familiar with. Underneath it is plain PostgreSQL, and the site talks
to it in one place only (the contact form's insert), so moving to another
database later would mean changing that one function and migrating the data.
We self-host Supabase on our own VPS instead of using Supabase's cloud.
There are two separate stacks, staging and production, each with its own
database. The API is reached only through Caddy over HTTPS, and Studio is
reachable only through an SSH tunnel.

## Alternatives considered
Hosted Supabase (supabase.com). Its advantage is that Supabase handles the
server for us: updates, security patches and automatic backups with
point-in-time recovery. It lost because Northline needs two projects
(staging and production): the free plan pauses inactive projects, and Pro
starts at $25/month plus the cost of a second project, so roughly $35/month
or more. Our VPS is already paid for and already runs Umami, and
self-hosting keeps the leads on our own server.

## Consequences
Easy: full control over configuration and versions, the leads stay on our
own server, there is no additional monthly bill, and the same setup can be
deployed for other clients with little configuration change (the compose
file and `.env.example` are in the repo).
Hard: we patch, back up and monitor it ourselves. The Break showed this:
the staging gateway was down for about 1.5 hours and nobody was alerted;
I found it by chance.
Cost per month: the KVM 2 VPS costs about $17/month at renewal
($203.88/year), shared by both Supabase stacks, Umami and Caddy. On top of
that, about 2 hours a month on the retainer for updates, backup checks and
monitoring.

## Revisit when
- Northline wants patient logins or to store medical information.
- The VPS runs out of memory (today the limits add up to about 5.5 GB of 8 GB).
- The VPS share plus our maintenance hours cost more than hosted Supabase
  would (about $35/month).
- Another outage like the Break happens despite monitoring.