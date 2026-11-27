-- Close the Open Morning's API to visitors (retirement note, step 9; the CEO, Thu 26 Nov 21:34).
-- The event is over and its page comes down: visitors (anon, the publishable key) may no longer add any row.
-- The kit (20261117191400_event_registrations.sql) gave visitors four insert rules; this drops all four.
-- Row level security stays on, and with no insert rule left, every insert from a visitor is refused.
-- The column grants stay as the kit set them (with no rule they let nothing in). The tables stay: the next
-- event uses them. The team's own access (psql on the server, the mailer's secret key) is not affected.
--
-- Undo (a new migration, never an edit of this one): re-create the four rules exactly as the kit made them:
--   create policy registrations_visitor_insert on public.registrations for insert to anon with check (walk_up = false and checked_in_at is null and verified_at is null);
--   create policy visit_requests_visitor_insert on public.visit_requests for insert to anon with check (true);
--   create policy event_feedback_visitor_insert on public.event_feedback for insert to anon with check (true);
--   create policy event_questionnaire_visitor_insert on public.event_questionnaire for insert to anon with check (true);
--   notify pgrst, 'reload schema';

drop policy if exists registrations_visitor_insert       on public.registrations;
drop policy if exists visit_requests_visitor_insert      on public.visit_requests;
drop policy if exists event_feedback_visitor_insert      on public.event_feedback;
drop policy if exists event_questionnaire_visitor_insert on public.event_questionnaire;

-- Tell the API now, not at its next restart.
notify pgrst, 'reload schema';