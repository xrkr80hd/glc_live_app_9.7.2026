alter table if exists public.announcements
  add column if not exists starts_at timestamptz,
  add column if not exists ends_at timestamptz,
  add column if not exists sort_order integer,
  add column if not exists is_published boolean,
  add column if not exists created_at timestamptz;

alter table if exists public.scriptures
  add column if not exists audience text,
  add column if not exists week_start date,
  add column if not exists week_end date,
  add column if not exists is_published boolean,
  add column if not exists created_at timestamptz;

alter table if exists public.youth_banners
  add column if not exists starts_at timestamptz,
  add column if not exists ends_at timestamptz,
  add column if not exists sort_order integer,
  add column if not exists is_active boolean,
  add column if not exists created_at timestamptz;

alter table if exists public.livestreams
  add column if not exists starts_at timestamptz,
  add column if not exists ends_at timestamptz,
  add column if not exists watch_cta_label text,
  add column if not exists is_active boolean,
  add column if not exists created_at timestamptz;

alter table if exists public.prayer_requests
  add column if not exists request_text text,
  add column if not exists is_private boolean,
  add column if not exists status text,
  add column if not exists submitted_at timestamptz;

alter table if exists public.visit_requests
  add column if not exists preferred_service text,
  add column if not exists party_size integer,
  add column if not exists message text,
  add column if not exists submitted_at timestamptz;

alter table if exists public.sermons
  add column if not exists preached_on date,
  add column if not exists is_published boolean,
  add column if not exists created_at timestamptz;

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

alter table if exists public.archived_sermons
  add column if not exists preached_on date,
  add column if not exists sort_order integer,
  add column if not exists is_published boolean,
  add column if not exists created_at timestamptz;

alter table if exists public.announcements
  alter column starts_at set default timezone('utc', now()),
  alter column sort_order set default 0,
  alter column is_published set default false,
  alter column created_at set default timezone('utc', now());

alter table if exists public.scriptures
  alter column is_published set default true,
  alter column created_at set default timezone('utc', now());

alter table if exists public.youth_banners
  alter column starts_at set default timezone('utc', now()),
  alter column sort_order set default 0,
  alter column is_active set default true,
  alter column created_at set default timezone('utc', now());

alter table if exists public.livestreams
  alter column watch_cta_label set default 'Watch Live Now',
  alter column is_active set default true,
  alter column created_at set default timezone('utc', now());

alter table if exists public.prayer_requests
  alter column is_private set default false,
  alter column status set default 'new',
  alter column submitted_at set default timezone('utc', now());

alter table if exists public.visit_requests
  alter column party_size set default 1,
  alter column submitted_at set default timezone('utc', now());

alter table if exists public.sermons
  alter column is_published set default true,
  alter column created_at set default timezone('utc', now());

alter table if exists public.archived_sermons
  alter column sort_order set default 0,
  alter column is_published set default true,
  alter column created_at set default timezone('utc', now());

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'announcements'
      and column_name = 'start_date'
  ) then
    update public.announcements
    set starts_at = coalesce(starts_at, start_date::timestamptz)
    where starts_at is null
      and start_date is not null;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'announcements'
      and column_name = 'end_date'
  ) then
    update public.announcements
    set ends_at = coalesce(ends_at, end_date::timestamptz)
    where ends_at is null
      and end_date is not null;
  end if;
end
$$;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'prayer_requests'
      and column_name = 'prayer_request'
  ) then
    update public.prayer_requests
    set request_text = coalesce(nullif(request_text, ''), prayer_request)
    where prayer_request is not null;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'prayer_requests'
      and column_name = 'request'
  ) then
    update public.prayer_requests
    set request_text = coalesce(nullif(request_text, ''), "request")
    where "request" is not null;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'prayer_requests'
      and column_name = 'created_at'
  ) then
    update public.prayer_requests
    set submitted_at = coalesce(submitted_at, created_at)
    where created_at is not null;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'prayer_requests'
      and column_name = 'is_prayed'
  ) then
    update public.prayer_requests
    set status = case
      when is_prayed = true then 'prayed'
      else coalesce(nullif(status, ''), 'new')
    end
    where status is null or status = '';
  end if;
end
$$;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'visit_requests'
      and column_name = 'created_at'
  ) then
    update public.visit_requests
    set submitted_at = coalesce(submitted_at, created_at)
    where created_at is not null;
  end if;
end
$$;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'sermons'
      and column_name = 'sermon_date'
  ) then
    update public.sermons
    set preached_on = coalesce(preached_on, sermon_date)
    where preached_on is null;
  end if;
end
$$;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'archived_sermons'
      and column_name = 'sermon_date'
  ) then
    update public.archived_sermons
    set preached_on = coalesce(preached_on, sermon_date)
    where preached_on is null;
  end if;
end
$$;

drop index if exists public.announcements_lookup_idx;
create index if not exists announcements_lookup_idx
  on public.announcements (category, is_published, starts_at, ends_at, sort_order);

drop index if exists public.scriptures_lookup_idx;
create index if not exists scriptures_lookup_idx
  on public.scriptures (audience, is_published, week_start desc, week_end desc);

drop index if exists public.youth_banners_lookup_idx;
create index if not exists youth_banners_lookup_idx
  on public.youth_banners (is_active, starts_at, ends_at, sort_order);

drop index if exists public.livestreams_lookup_idx;
create index if not exists livestreams_lookup_idx
  on public.livestreams (is_active, starts_at, ends_at, created_at desc);

drop index if exists public.sermons_lookup_idx;
create index if not exists sermons_lookup_idx
  on public.sermons (is_published, preached_on desc);

drop index if exists public.archived_sermons_lookup_idx;
create index if not exists archived_sermons_lookup_idx
  on public.archived_sermons (is_published, preached_on desc, sort_order);

alter table public.archived_sermons enable row level security;

drop policy if exists archived_sermons_public_read on public.archived_sermons;
create policy archived_sermons_public_read
on public.archived_sermons
for select
to anon, authenticated
using (is_published = true);
