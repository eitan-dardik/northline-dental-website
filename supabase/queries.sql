-- Open Morning event kit: the queries you run with the team's access (psql on the server).
-- These read guests' details. Run them on the server, never from the browser, and never commit their output.
-- How to run one on the server (replace <db> with your Supabase database container):
--   docker exec -i <db> psql -U postgres -d postgres -c "<one query>"

-- 1. Set the desk code (README step 5). Use 10 or more characters, not a word from the event.
--    Run it once per environment, with a DIFFERENT code on staging and production.
--    Do not save the code in the repository; give it to the desk on the day, by phone or on paper.
insert into public.event_desk (event_id, code_hash)
values ('2026-11-open-morning', extensions.crypt('<the desk code>', extensions.gen_salt('bf')))
on conflict (event_id) do update set code_hash = excluded.code_hash;

-- 2. The newest registrations (to read your test row back). verified_at is empty until the guest opens the link.
select created_at, name, email, guests, utm_source, verified_at, checked_in_at
from public.registrations where event_id = '2026-11-open-morning'
order by created_at desc limit 5;

-- 3. The funnel counts: registered, confirmed (the email link was opened), arrived, walk-ups.
select count(*) filter (where not walk_up)                            as registered,
       count(*) filter (where not walk_up and verified_at is not null) as confirmed,
       count(*) filter (where checked_in_at is not null)               as arrived,
       count(*) filter (where walk_up)                                 as walk_ups
from public.registrations where event_id = '2026-11-open-morning';

-- 4. Where people came from, signed up and came. Guests from the poster and the website were not on Denise's list.
--    Walk-ups came without signing up; some of them may have been invited, and the data cannot tell.
select case when walk_up then 'walk-up' else coalesce(utm_source, '(no tag)') end as source,
       count(*) filter (where not walk_up) as registered,
       count(checked_in_at) as came
from public.registrations where event_id = '2026-11-open-morning'
group by 1 order by 3 desc, 2 desc;

-- 5. The printed list for the desk, as a CSV file on the server. Print it, then delete the file:
--    docker exec -i <db> psql -U postgres -d postgres -c "\copy (select name, email, guests from public.registrations where event_id = '2026-11-open-morning' and not walk_up order by lower(name)) to stdout with csv header" > desk-list.csv

-- 6. Who still needs the confirmation email (what your mailer looks for). The token goes into the link:
--    https://<event host>/confirm/?t=<token>&utm_source=confirmation&utm_medium=email&utm_campaign=2026-11-open-morning
select r.id, r.email, r.token from public.registrations r
where r.event_id = '2026-11-open-morning' and r.email is not null and not r.walk_up
  and not exists (select 1 from public.registration_emails e where e.registration_id = r.id and e.kind = 'confirmation')
order by r.created_at;

-- 7. Visit requests from the booking page.
-- One request can be for a whole family, so "visits" counts people: a parent with two children is 1 request and 3 visits.
select count(*) as requests, coalesce(sum(patients), 0) as visits from public.visit_requests where event_id = '2026-11-open-morning';
select office, doctor, count(*) as requests, sum(patients) as visits, sum(children) as children_visits,
       coalesce(sum(patients) filter (where is_patient = 'no'), 0) as new_patient_visits from public.visit_requests where event_id = '2026-11-open-morning' group by 1, 2 order by 4 desc;
-- Conversion: of the guests who came, how many asked for a visit, and for how many people, per dentist.
-- Someone who gave no email at the desk cannot be matched: count the requests above that are missing here.
select v.doctor, count(distinct lower(v.email)) as guests_who_asked, sum(v.patients) as visits, sum(v.children) as children_visits,
       coalesce(sum(v.patients) filter (where v.is_patient = 'no'), 0) as new_patient_visits,
       (select count(*) from public.registrations where event_id = '2026-11-open-morning' and checked_in_at is not null) as guests_who_came
from public.visit_requests v
join public.registrations r on lower(r.email) = lower(v.email) and r.event_id = v.event_id and r.checked_in_at is not null
where v.event_id = '2026-11-open-morning'
group by v.doctor order by 2 desc;

-- 8. Who needs ONE reminder to confirm: the confirmation went out 24 hours ago or more, the link is still not
--    opened, and no reminder was sent yet. Send the same link again (utm_source=verify-reminder), then insert
--    (registration_id, 'verify_reminder') into registration_emails. Stop sending these when the event starts.
select r.id, r.email, r.token from public.registrations r
join public.registration_emails c on c.registration_id = r.id and c.kind = 'confirmation'
where r.event_id = '2026-11-open-morning' and r.verified_at is null and not r.walk_up
  and c.sent_at <= now() - interval '24 hours'
  and now() < timestamptz '2026-11-24 10:00:00-05'
  and not exists (select 1 from public.registration_emails e where e.registration_id = r.id and e.kind = 'verify_reminder')
order by r.created_at;

-- 9. The follow-up lists for Week 8, with the survey link for each guest:
--    came    -> thank-you,             https://<event host>/feedback/?t=<token>&utm_source=thank-you&utm_medium=email&utm_campaign=2026-11-open-morning
--    missed  -> "sorry we missed you", https://<event host>/feedback/?t=<token>&k=missed&utm_source=missed-you&utm_medium=email&utm_campaign=2026-11-open-morning
select case when r.checked_in_at is not null then 'came' else 'missed' end as list, r.id, r.email, r.token
from public.registrations r
where r.event_id = '2026-11-open-morning' and r.email is not null
  and (r.checked_in_at is not null or not r.walk_up)
order by 1, r.created_at;

-- 10. Survey: how many answered, against how many got the survey link (the response rate).
select count(*) filter (where f.kind = 'came')   as answers_came,
       (select count(*) from public.registration_emails e join public.registrations r on r.id = e.registration_id
          where r.event_id = '2026-11-open-morning' and e.kind = 'thank_you') as thank_you_sent,
       count(*) filter (where f.kind = 'missed') as answers_missed,
       (select count(*) from public.registration_emails e join public.registrations r on r.id = e.registration_id
          where r.event_id = '2026-11-open-morning' and e.kind = 'missed_you') as missed_you_sent,
       round(avg(f.rating), 1)                   as average_rating
from public.event_feedback f where f.event_id = '2026-11-open-morning';

-- 11. Survey: the count for each answer (the same table works for most_useful, recommend and kept_away:
--     change the column name in the two places).
select f.rating, count(*) from public.event_feedback f
where f.event_id = '2026-11-open-morning' and f.kind = 'came' group by 1 order by 1 desc;
select coalesce(f.most_useful, '(no answer)') as most_useful, count(*) from public.event_feedback f
where f.event_id = '2026-11-open-morning' and f.kind = 'came' group by 1 order by 2 desc;
select coalesce(f.recommend, '(no answer)') as recommend, count(*) from public.event_feedback f
where f.event_id = '2026-11-open-morning' and f.kind = 'came' group by 1 order by 2 desc;
select f.kept_away, count(*) from public.event_feedback f
where f.event_id = '2026-11-open-morning' and f.kind = 'missed' group by 1 order by 2 desc;

-- 12. Survey: the comments for the report. No names: quote them as "a guest". Leave out your own +og tests.
select f.created_at, f.kind, f.rating, f.comment from public.event_feedback f
join public.registrations r on r.token = f.token
where f.event_id = '2026-11-open-morning' and f.comment is not null and btrim(f.comment) <> ''
  and r.email not ilike '%+og%'
order by f.created_at;

-- 13. Survey: who asked to be contacted about booking (for Denise's team to call). Personal data: never commit it.
select r.name, r.email, r.phone from public.event_feedback f
join public.registrations r on r.token = f.token
where f.event_id = '2026-11-open-morning' and f.contact_me
order by f.created_at;

-- 14. The two questions on the confirmed page: new or existing patients, and families, among those who answered and those who came.
select q.is_patient, q.with_children, count(*) as answered, count(r.checked_in_at) as came
from public.event_questionnaire q join public.registrations r on r.token = q.token
where q.event_id = '2026-11-open-morning' group by 1, 2 order by 3 desc;
-- Walk-ups never saw those questions. The desk asked them one: new or existing patient.
select case is_patient when 'no' then 'new' when 'yes' then 'existing' else 'did not say' end as patient,
       count(*) as walk_ups, sum(guests) as people
from public.registrations where event_id = '2026-11-open-morning' and walk_up group by 1 order by 2 desc;
