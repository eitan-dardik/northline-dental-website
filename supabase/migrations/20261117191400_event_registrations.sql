-- Open Morning event kit: the registrations table, the email check, the desk check-in and the guest survey.
-- Copy this file into supabase/migrations/ as <timestamp>_event_registrations.sql and apply it with the CLI,
-- the same way you applied your leads migration (staging first, production on Thursday after the backup).
--
-- The rules, in plain words:
--   * Visitors (the anon role, the publishable key) may ADD a registration or a visit request. Nothing else:
--     no read, no change, no delete. This is your leads pattern: row level security on, one insert policy.
--   * Visitors may only fill the guest's own fields. They cannot set checked_in_at or walk_up, so nobody can
--     check themselves in from home (column grants below, and the policy's check).
--   * The front desk checks guests in through three database functions. Each one needs the desk code, which
--     is stored only as a hash in a table nobody outside the team can see. The functions can mark a guest as
--     arrived, add a walk-up, and count; they never return the guest list.
--   * You and the mailer read rows with the team's access (psql on the server, or the secret key on the
--     server only). The publishable key in the browser never can.
--   * The email check (double opt-in): each registration gets a random token, made by the database. Only the
--     confirmation email carries it (confirm/?t=...). The confirm page calls event_verify(), which sets
--     verified_at once. Visitors cannot set the token or verified_at themselves.
--   * The guest survey: visitors may ADD one answer per token to event_feedback. Nothing else. The answer holds
--     no name and no email: only the token links it to a registration, and only the team can follow that link.

-- ---------------------------------------------------------------- tables
create table public.registrations (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  event_id      text not null check (char_length(event_id) between 1 and 60),
  name          text not null check (char_length(btrim(name)) between 1 and 120),
  email         text check (email is null or (char_length(email) <= 254 and email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$')),
  phone         text check (phone is null or phone ~ '^[0-9+().[:space:]-]{7,20}$'),
  guests        smallint not null default 1 check (guests between 1 and 10),
  utm_source    text check (char_length(utm_source) <= 100),
  utm_medium    text check (char_length(utm_medium) <= 100),
  utm_campaign  text check (char_length(utm_campaign) <= 100),
  utm_content   text check (char_length(utm_content) <= 100),
  walk_up       boolean not null default false,
  -- Only the desk sets this, for a walk-up, through event_walk_up(). Those who signed up answer on the confirmed page.
  is_patient    text not null default 'unknown' check (is_patient in ('yes', 'no', 'unknown')),
  checked_in_at timestamptz,
  -- The guest's private key for two links: confirm/?t=<token> (confirmation email) and feedback/?t=<token>
  -- (follow-up emails). Random (122 bits from gen_random_uuid), made here. Never the id, never typed by a visitor.
  token         uuid not null default gen_random_uuid() unique,
  verified_at   timestamptz,               -- set once by event_verify(), when the guest opens the confirmation link
  -- a registration from the page always has an email; only a walk-up added at the desk may have none
  constraint registrations_email_needed check (email is not null or walk_up)
);
comment on table public.registrations is 'Open Morning sign-ups and walk-ups. Insert-only for visitors; desk check-in through event_check_in().';

-- One registration per email per event. A second sign-up with the same email gets "409", and the page
-- shows the same "you are registered" message: it never tells anyone who else is on the list.
create unique index registrations_one_per_email on public.registrations (event_id, lower(email)) where email is not null;
create index registrations_event_created on public.registrations (event_id, created_at);

create table public.visit_requests (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  event_id     text not null check (char_length(event_id) between 1 and 60),
  name         text check (name is null or char_length(btrim(name)) between 1 and 120),
  email        text not null check (char_length(email) <= 254 and email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  phone        text check (phone is null or phone ~ '^[0-9+().[:space:]-]{7,20}$'),
  preferred    text not null default 'any' check (preferred in ('any', 'morning', 'afternoon', 'evening')),
  office       text not null default 'any' check (char_length(office) between 1 and 40),
  doctor       text not null default 'any' check (char_length(doctor) between 1 and 40),
  patients     int  not null default 1 check (patients between 1 and 10),
  children     int  not null default 0 check (children between 0 and 9),
  is_patient   text not null default 'unknown' check (is_patient in ('yes', 'no', 'unknown')),
  check (children <= patients),
  utm_source   text check (char_length(utm_source) <= 100),
  utm_medium   text check (char_length(utm_medium) <= 100),
  utm_campaign text check (char_length(utm_campaign) <= 100),
  utm_content  text check (char_length(utm_content) <= 100)
);
comment on table public.visit_requests is 'Booking-page "please call me" requests after the Open Morning. Insert-only for visitors.';

-- One row per email sent, like your lead_emails table: the primary key stops a second send of the same kind.
create table public.registration_emails (
  registration_id uuid not null references public.registrations (id) on delete cascade,
  kind            text not null check (kind in ('confirmation', 'verify_reminder', 'reminder', 'thank_you', 'missed_you')),
  sent_at         timestamptz not null default now(),
  primary key (registration_id, kind)
);

-- The guest survey (feedback/?t=<token>, linked from the thank-you and the "sorry we missed you" emails).
-- One answer per registration: the token is unique here, so a second answer is refused (the page says
-- "we already have your answers"). The token must belong to a registration (the foreign key).
-- No name, no email: the team links an answer to a guest only through the token, on the server.
create table public.event_feedback (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  event_id    text not null constraint event_feedback_event_id check (char_length(event_id) between 1 and 60),
  token       uuid not null unique references public.registrations (token) on delete cascade,
  kind        text not null default 'came' constraint event_feedback_kind check (kind in ('came', 'missed')),
  rating      smallint constraint event_feedback_rating check (rating between 1 and 5),
  most_useful text constraint event_feedback_most_useful check (most_useful ~ '^[a-z0-9_]{1,40}$'),
  recommend   text constraint event_feedback_recommend check (recommend in ('yes', 'no', 'maybe')),
  kept_away   text constraint event_feedback_kept_away check (kept_away ~ '^[a-z0-9_]{1,40}$'),
  comment     text constraint event_feedback_comment check (char_length(comment) <= 500),
  contact_me  boolean not null default false,
  -- a guest who came gives a rating; a guest who missed it answers only "what kept you away"
  constraint event_feedback_answers check (
    (kind = 'came' and rating is not null and kept_away is null) or
    (kind = 'missed' and rating is null and most_useful is null and recommend is null and kept_away is not null))
);
comment on table public.event_feedback is 'Open Morning guest survey. Insert-only for visitors, one answer per registration token, no name or email.';

-- The desk code, as a hash. Set it by hand on the server (README step 5); it is never in the repository.
create table public.event_desk (
  event_id  text primary key,
  code_hash text not null
);
-- Wrong desk codes, so a guesser is locked out after 20 tries in 10 minutes.
create table public.event_desk_failures (
  id       bigserial primary key,
  event_id text not null,
  at       timestamptz not null default now()
);

-- ---------------------------------------------------------------- who may do what
alter table public.registrations       enable row level security;
alter table public.visit_requests      enable row level security;
alter table public.registration_emails enable row level security;
alter table public.event_desk          enable row level security;
alter table public.event_desk_failures enable row level security;
create table public.event_questionnaire (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  event_id      text not null check (char_length(event_id) between 1 and 60),
  token         uuid not null unique references public.registrations (token) on delete cascade,
  is_patient    text not null check (is_patient in ('yes', 'no')),
  with_children text not null check (with_children in ('yes', 'no'))
);
comment on table public.event_questionnaire is 'The two questions on the confirmed page: new or existing patient, and children. Insert-only for visitors, one answer per registration token. No name or email.';
alter table public.event_questionnaire enable row level security;
alter table public.event_feedback      enable row level security;

-- Supabase gives anon and authenticated every privilege on new tables by default. Take them all back,
-- then give back only "insert these columns".
revoke all on public.registrations, public.visit_requests, public.registration_emails,
              public.event_desk, public.event_desk_failures, public.event_feedback from anon, authenticated;
revoke all on sequence public.event_desk_failures_id_seq from anon, authenticated;

grant insert (event_id, name, email, phone, guests, utm_source, utm_medium, utm_campaign, utm_content)
  on public.registrations to anon;
grant insert (event_id, name, email, phone, preferred, office, doctor, patients, children, is_patient, utm_source, utm_medium, utm_campaign, utm_content)
  on public.visit_requests to anon;
-- The registrations list above leaves out token and verified_at: the database makes the token,
-- and only event_verify() sets verified_at.
grant insert (event_id, token, kind, rating, most_useful, recommend, kept_away, comment, contact_me)
  on public.event_feedback to anon;

-- The only policies: visitors may add a row. There is no select, update or delete policy, so a read with the
-- publishable key returns an empty list, and a change is refused.
create policy registrations_visitor_insert on public.registrations
  for insert to anon with check (walk_up = false and checked_in_at is null and verified_at is null);
create policy visit_requests_visitor_insert on public.visit_requests
  for insert to anon with check (true);
revoke all on public.event_questionnaire from anon, authenticated;
grant insert (event_id, token, is_patient, with_children) on public.event_questionnaire to anon;
create policy event_questionnaire_visitor_insert on public.event_questionnaire
  for insert to anon with check (true);
create policy event_feedback_visitor_insert on public.event_feedback
  for insert to anon with check (true);

-- ---------------------------------------------------------------- the desk functions
create extension if not exists pgcrypto with schema extensions;

-- Internal: is this the right desk code? Returns 'ok', 'wrong_code' or 'locked'. Visitors cannot call it directly.
create or replace function public.event_desk_state(p_event text, p_code text)
returns text language plpgsql security definer set search_path = '' as $$
declare
  v_hash  text;
  v_fails int;
begin
  select count(*) into v_fails from public.event_desk_failures
    where event_id = p_event and at > now() - interval '10 minutes';
  if v_fails >= 20 then return 'locked'; end if;
  select code_hash into v_hash from public.event_desk where event_id = p_event;
  if v_hash is null or p_code is null or char_length(p_code) < 8
     or extensions.crypt(p_code, v_hash) <> v_hash then
    insert into public.event_desk_failures (event_id) values (p_event);
    return 'wrong_code';
  end if;
  return 'ok';
end $$;

-- Check in a guest on the list, by email. Returns only the first name, the group size and whether they
-- were already checked in.
create or replace function public.event_check_in(p_event text, p_code text, p_email text)
returns json language plpgsql security definer set search_path = '' as $$
declare
  v_state text := public.event_desk_state(p_event, p_code);
  v_row   public.registrations%rowtype;
begin
  if v_state <> 'ok' then return json_build_object('ok', false, 'reason', v_state); end if;
  select * into v_row from public.registrations
    where event_id = p_event and lower(email) = lower(btrim(p_email)) limit 1;
  if not found then return json_build_object('ok', false, 'reason', 'not_found'); end if;
  if v_row.checked_in_at is null then
    update public.registrations set checked_in_at = now() where id = v_row.id;
  end if;
  return json_build_object('ok', true, 'first_name', split_part(btrim(v_row.name), ' ', 1),
    'guests', v_row.guests, 'already', v_row.checked_in_at is not null);
end $$;

-- Add a walk-up and check them in. If the email is already registered, that registration is checked in instead.
create or replace function public.event_walk_up(p_event text, p_code text, p_name text,
  p_email text default null, p_phone text default null, p_guests int default 1, p_is_patient text default 'unknown')
returns json language plpgsql security definer set search_path = '' as $$
declare
  v_state text := public.event_desk_state(p_event, p_code);
  v_email text := nullif(lower(btrim(coalesce(p_email, ''))), '');
  v_res   json;
begin
  if v_state <> 'ok' then return json_build_object('ok', false, 'reason', v_state); end if;
  if v_email is not null and exists (select 1 from public.registrations
       where event_id = p_event and lower(email) = v_email) then
    v_res := public.event_check_in(p_event, p_code, v_email);
    return (v_res::jsonb || '{"matched": true}'::jsonb)::json;
  end if;
  begin
    insert into public.registrations (event_id, name, email, phone, guests, walk_up, checked_in_at, is_patient)
    values (p_event, btrim(p_name), v_email, nullif(btrim(coalesce(p_phone, '')), ''),
            greatest(1, least(coalesce(p_guests, 1), 10)), true, now(), coalesce(p_is_patient, 'unknown'));
  exception when check_violation or not_null_violation then
    return json_build_object('ok', false, 'reason', 'bad_input');
  end;
  return json_build_object('ok', true, 'first_name', split_part(btrim(p_name), ' ', 1),
    'guests', greatest(1, least(coalesce(p_guests, 1), 10)), 'already', false);
end $$;

-- The desk's live count: numbers only, never names.
create or replace function public.event_desk_count(p_event text, p_code text)
returns json language plpgsql security definer set search_path = '' as $$
declare
  v_state text := public.event_desk_state(p_event, p_code);
begin
  if v_state <> 'ok' then return json_build_object('ok', false, 'reason', v_state); end if;
  return (select json_build_object('ok', true,
      'registered', count(*) filter (where not walk_up),
      'arrived',    count(*) filter (where checked_in_at is not null),
      'walk_ups',   count(*) filter (where walk_up))
    from public.registrations where event_id = p_event);
end $$;

-- ---------------------------------------------------------------- the email check (double opt-in)
-- The confirm page sends the token from the link. Returns only {"status": "ok" | "already" | "invalid"}:
-- never a name, an email or anything else about the guest. Sets verified_at once; a second call says "already".
-- Guessing is useless: a token is 122 random bits, so a guesser finds nothing, and a wrong token changes nothing.
create or replace function public.event_verify(p_token text)
returns json language plpgsql security definer set search_path = '' as $$
declare
  v_id uuid;
  v_at timestamptz;
  v_n  int;
begin
  if p_token is null or p_token !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
    return json_build_object('status', 'invalid');
  end if;
  select id, verified_at into v_id, v_at from public.registrations where token = p_token::uuid;
  if not found then return json_build_object('status', 'invalid'); end if;
  if v_at is not null then return json_build_object('status', 'already'); end if;
  update public.registrations set verified_at = now() where id = v_id and verified_at is null;
  get diagnostics v_n = row_count;
  return json_build_object('status', case when v_n = 1 then 'ok' else 'already' end);
end $$;

-- Functions are callable by everyone by default. Close them all, then open only the three desk functions
-- and the email check.
revoke all on function public.event_desk_state(text, text) from public, anon, authenticated;
revoke all on function public.event_check_in(text, text, text) from public, anon, authenticated;
revoke all on function public.event_walk_up(text, text, text, text, text, int, text) from public, anon, authenticated;
revoke all on function public.event_desk_count(text, text) from public, anon, authenticated;
revoke all on function public.event_verify(text) from public, anon, authenticated;
grant execute on function public.event_check_in(text, text, text) to anon;
grant execute on function public.event_walk_up(text, text, text, text, text, int, text) to anon;
grant execute on function public.event_desk_count(text, text) to anon;
grant execute on function public.event_verify(text) to anon;

-- Tell the API about the new tables and functions now, not at its next restart.
notify pgrst, 'reload schema';
