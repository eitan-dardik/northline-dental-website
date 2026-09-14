-- Creates the leads table the contact form writes to.
--
-- This is a numbered migration: once it has been run against the
-- database, this file must never be edited. Any future change to this
-- table gets a new file (002_..., 003_...), never an edit to this one.

create table leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  phone text,
  email text,
  location text,
  message text,
  source text
);

alter table leads enable row level security;

create policy "anon may insert leads"
  on leads for insert
  to anon
  with check (true);

-- deliberately no select, update or delete policy for anon
