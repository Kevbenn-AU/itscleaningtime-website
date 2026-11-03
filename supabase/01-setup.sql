-- It's Cleaning Time! - database setup
-- Run this once in Supabase: SQL Editor > New query > paste everything > Run.
-- Safe to run again: it won't duplicate anything or delete data.

-- 1. Enquiries table: one row per quote request from the website.
create table if not exists public.enquiries (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  status        text not null default 'new'
                check (status in ('new', 'contacted', 'quoted', 'booked', 'closed')),
  name          text not null,
  contact       text not null,
  contact_type  text not null check (contact_type in ('email', 'phone')),
  email         text,
  phone         text,
  service       text,
  suburb        text,
  frequency     text,
  note          text,
  source        text,
  page_url      text,
  submitted_at  timestamptz,
  user_agent    text,
  ip_hash       text,
  email_sent    boolean not null default false,
  email_error   text
);

create index if not exists enquiries_created_at_idx on public.enquiries (created_at desc);
create index if not exists enquiries_ip_hash_idx on public.enquiries (ip_hash, created_at desc);

-- 2. Heartbeat table: a daily ping updates this one row so Supabase sees activity
--    and doesn't pause the free project.
create table if not exists public.heartbeat (
  id         int primary key,
  last_ping  timestamptz not null default now()
);
insert into public.heartbeat (id) values (1) on conflict (id) do nothing;

-- 3. Lock both tables down. Only the website's backend function (service role)
--    can read or write them. Nobody can read enquiries from the public internet.
alter table public.enquiries enable row level security;
alter table public.heartbeat enable row level security;

revoke all on table public.enquiries from anon, authenticated;
revoke all on table public.heartbeat from anon, authenticated;

grant usage on schema public to service_role;
grant select, insert, update, delete on table public.enquiries to service_role;
grant select, insert, update on table public.heartbeat to service_role;

-- 4. Quick check: should return one row showing the heartbeat.
select * from public.heartbeat;
