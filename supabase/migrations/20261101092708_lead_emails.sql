create table lead_emails (
  lead_id    uuid primary key references leads(id) on delete cascade,  -- one-to-one with leads
  status     text not null check (status in ('sending', 'sent', 'failed')),
  error      text,
  created_at timestamptz not null default now(),
  sent_at    timestamptz
);

alter table lead_emails enable row level security;
-- no policies at all: visitors can do nothing here