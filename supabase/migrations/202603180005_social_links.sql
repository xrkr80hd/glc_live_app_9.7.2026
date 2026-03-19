create extension if not exists pgcrypto;

create table if not exists public.social_links (
  id uuid primary key default gen_random_uuid(),
  platform_key text not null unique,
  label text not null,
  url text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint social_links_platform_key_format check (platform_key ~ '^[a-z0-9]+(?:_[a-z0-9]+)*$')
);

create index if not exists social_links_lookup_idx
  on public.social_links (is_active, sort_order, created_at);

create or replace function public.set_social_links_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists social_links_set_updated_at on public.social_links;
create trigger social_links_set_updated_at
before update on public.social_links
for each row
execute function public.set_social_links_updated_at();

alter table public.social_links enable row level security;

drop policy if exists social_links_public_read on public.social_links;
create policy social_links_public_read
on public.social_links
for select
to anon, authenticated
using (is_active = true and url is not null and length(trim(url)) > 0);

insert into public.social_links (platform_key, label, url, sort_order, is_active)
values
  ('facebook', 'Facebook', 'https://www.facebook.com/CenlaChurch/', 10, true),
  ('youtube', 'YouTube', 'https://www.youtube.com/@libertychurchcenla', 20, true)
on conflict (platform_key) do update
set
  label = excluded.label,
  url = excluded.url,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active,
  updated_at = timezone('utc', now());
