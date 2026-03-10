create extension if not exists pgcrypto;

create table if not exists public.ministries (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.seasonal_features (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text,
  scripture_reference text,
  scripture_text text,
  media_url text,
  media_type text check (media_type in ('video', 'image')),
  cta_label text,
  cta_url text,
  season_tag text,
  starts_at timestamptz not null default timezone('utc', now()),
  ends_at timestamptz,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists ministries_lookup_idx
  on public.ministries (is_published, sort_order, created_at desc);

create index if not exists seasonal_features_lookup_idx
  on public.seasonal_features (is_active, starts_at, ends_at, sort_order, created_at desc);

alter table public.ministries enable row level security;
alter table public.seasonal_features enable row level security;

drop policy if exists ministries_public_read on public.ministries;
create policy ministries_public_read
on public.ministries
for select
to anon, authenticated
using (is_published = true);

drop policy if exists seasonal_features_public_read on public.seasonal_features;
create policy seasonal_features_public_read
on public.seasonal_features
for select
to anon, authenticated
using (is_active = true);

