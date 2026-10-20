create table locations (
  id text primary key,
  name text not null check (btrim(name) <> ''),
  is_primary boolean not null default false,
  active boolean not null default true,
  address text not null check (btrim(address) <> ''),
  phone text not null check (btrim(phone) <> ''),
  sort_order int not null unique,
  
  constraint locations_only_one_primary
    exclude using btree (is_primary with =) where (is_primary = true)
);

alter table locations enable row level security;

create policy "anon may read locations"
  on locations for select
  to anon
  using (true);


create table location_hours (
  id bigint generated always as identity primary key,
  location_id text not null references locations(id) on delete cascade,
  days text not null check (btrim(days) <> ''),
  opens time not null,
  closes time not null,
  occurrences smallint[],
  sort_order int not null,
  
  constraint location_hours_unique_order unique (location_id, sort_order),
  constraint location_hours_closes_after_opens check (closes > opens),
  constraint location_hours_occurrences_not_empty check (occurrences is null or cardinality(occurrences) > 0),
  constraint location_hours_occurrences_range check (occurrences <@ array[1, 2, 3, 4, 5]::smallint[])
);

alter table location_hours enable row level security;

create policy "anon may read location hours"
  on location_hours for select
  to anon
  using (true);


create table team_members (
  id text primary key,
  name text not null check (btrim(name) <> ''),
  role text not null check (btrim(role) <> ''),
  image_key text,
  bio text,
  sort_order int not null unique
);

alter table team_members enable row level security;

create policy "anon may read team members"
  on team_members for select
  to anon
  using (true);


create table team_member_locations (
  team_member_id text not null references team_members(id) on delete cascade,
  location_id text not null references locations(id) on delete cascade,
  primary key (team_member_id, location_id)
);

alter table team_member_locations enable row level security;

create policy "anon may read team member locations"
  on team_member_locations for select
  to anon
  using (true);


create table services (
  id text primary key,
  name text not null check (btrim(name) <> ''),
  description text not null check (btrim(description) <> ''),
  sort_order int not null unique
);

alter table services enable row level security;

create policy "anon may read services"
  on services for select
  to anon
  using (true);


create table site_notice (
  id bigint generated always as identity primary key,
  active boolean not null default false,
  heading text not null check (btrim(heading) <> ''),
  body text check (btrim(body) <> ''),      -- optional, but never blank
  until date,      -- null = no end date (the banner stays until active = false)

  constraint site_notice_only_one_is_active
    exclude using btree (active with =) where (active = true)
);

alter table site_notice enable row level security;

create policy "anon may read site_notice"
  on site_notice for select
  to anon
  using (true);