create extension if not exists pgcrypto;

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('main', 'youth')),
  title text not null,
  body text not null,
  starts_at timestamptz not null default timezone('utc', now()),
  ends_at timestamptz,
  sort_order integer not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists announcements_lookup_idx
  on public.announcements (category, is_published, starts_at, ends_at, sort_order);

create table if not exists public.scriptures (
  id uuid primary key default gen_random_uuid(),
  audience text not null check (audience in ('main', 'youth')),
  reference text not null,
  verse_text text not null,
  week_start date not null,
  week_end date not null,
  is_published boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  constraint scriptures_week_window check (week_end >= week_start)
);

create index if not exists scriptures_lookup_idx
  on public.scriptures (audience, is_published, week_start desc, week_end desc);

create table if not exists public.youth_banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  image_url text,
  cta_label text,
  cta_url text,
  starts_at timestamptz not null default timezone('utc', now()),
  ends_at timestamptz,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists youth_banners_lookup_idx
  on public.youth_banners (is_active, starts_at, ends_at, sort_order);

create table if not exists public.livestreams (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  embed_url text not null,
  fallback_video_url text,
  watch_cta_label text not null default 'Watch Live Now',
  is_active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists livestreams_lookup_idx
  on public.livestreams (is_active, starts_at, ends_at, created_at desc);

create table if not exists public.prayer_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  request_text text not null,
  is_private boolean not null default false,
  status text not null default 'new',
  submitted_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.visit_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  preferred_service text,
  party_size integer not null default 1,
  message text,
  submitted_at timestamptz not null default timezone('utc', now()),
  constraint visit_requests_party_size check (party_size > 0)
);

create table if not exists public.sermons (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  video_url text not null,
  preached_on date,
  is_published boolean not null default true,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists sermons_lookup_idx
  on public.sermons (is_published, preached_on desc);

alter table public.announcements enable row level security;
alter table public.scriptures enable row level security;
alter table public.youth_banners enable row level security;
alter table public.livestreams enable row level security;
alter table public.prayer_requests enable row level security;
alter table public.visit_requests enable row level security;
alter table public.sermons enable row level security;

drop policy if exists announcements_public_read on public.announcements;
create policy announcements_public_read
on public.announcements
for select
to anon, authenticated
using (
  is_published = true
  and starts_at <= timezone('utc', now())
  and (ends_at is null or ends_at >= timezone('utc', now()))
);

drop policy if exists scriptures_public_read on public.scriptures;
create policy scriptures_public_read
on public.scriptures
for select
to anon, authenticated
using (
  is_published = true
  and week_start <= current_date
  and week_end >= current_date
);

drop policy if exists youth_banners_public_read on public.youth_banners;
create policy youth_banners_public_read
on public.youth_banners
for select
to anon, authenticated
using (
  is_active = true
  and starts_at <= timezone('utc', now())
  and (ends_at is null or ends_at >= timezone('utc', now()))
);

drop policy if exists livestreams_public_read on public.livestreams;
create policy livestreams_public_read
on public.livestreams
for select
to anon, authenticated
using (
  is_active = true
  and (starts_at is null or starts_at <= timezone('utc', now()))
  and (ends_at is null or ends_at >= timezone('utc', now()))
);

drop policy if exists sermons_public_read on public.sermons;
create policy sermons_public_read
on public.sermons
for select
to anon, authenticated
using (is_published = true);

drop policy if exists prayer_requests_public_insert on public.prayer_requests;
create policy prayer_requests_public_insert
on public.prayer_requests
for insert
to anon, authenticated
with check (true);

drop policy if exists visit_requests_public_insert on public.visit_requests;
create policy visit_requests_public_insert
on public.visit_requests
for insert
to anon, authenticated
with check (true);
