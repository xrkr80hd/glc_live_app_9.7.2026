create table if not exists public.archived_sermons (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  media_url text not null,
  thumbnail_url text,
  preached_on date,
  speaker text,
  description text,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists archived_sermons_lookup_idx
  on public.archived_sermons (is_published, preached_on desc, sort_order);

alter table public.archived_sermons enable row level security;

drop policy if exists archived_sermons_public_read on public.archived_sermons;
create policy archived_sermons_public_read
on public.archived_sermons
for select
to anon, authenticated
using (is_published = true);
