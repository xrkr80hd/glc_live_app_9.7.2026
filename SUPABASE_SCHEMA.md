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

create table if not exists public.member_feedback (
  id uuid primary key default gen_random_uuid(),
  member_id uuid,
  name text,
  email text,
  route text,
  category text not null default 'bug' check (category in ('bug', 'ui', 'idea', 'other')),
  severity text not null default 'medium' check (severity in ('low', 'medium', 'high')),
  message text not null,
  created_at timestamptz not null default timezone('utc', now())
);

alter table if exists public.announcements
  add column if not exists category text,
  add column if not exists title text,
  add column if not exists body text,
  add column if not exists starts_at timestamptz,
  add column if not exists ends_at timestamptz,
  add column if not exists sort_order integer,
  add column if not exists is_published boolean,
  add column if not exists created_at timestamptz;

alter table if exists public.scriptures
  add column if not exists audience text,
  add column if not exists reference text,
  add column if not exists verse_text text,
  add column if not exists week_start date,
  add column if not exists week_end date,
  add column if not exists is_published boolean,
  add column if not exists created_at timestamptz;

alter table if exists public.youth_banners
  add column if not exists title text,
  add column if not exists subtitle text,
  add column if not exists image_url text,
  add column if not exists cta_label text,
  add column if not exists cta_url text,
  add column if not exists starts_at timestamptz,
  add column if not exists ends_at timestamptz,
  add column if not exists sort_order integer,
  add column if not exists is_active boolean,
  add column if not exists created_at timestamptz;

alter table if exists public.livestreams
  add column if not exists title text,
  add column if not exists embed_url text,
  add column if not exists fallback_video_url text,
  add column if not exists watch_cta_label text,
  add column if not exists is_active boolean,
  add column if not exists starts_at timestamptz,
  add column if not exists ends_at timestamptz,
  add column if not exists created_at timestamptz;

alter table if exists public.prayer_requests
  add column if not exists name text,
  add column if not exists email text,
  add column if not exists phone text,
  add column if not exists request_text text,
  add column if not exists is_private boolean,
  add column if not exists status text,
  add column if not exists submitted_at timestamptz;

alter table if exists public.visit_requests
  add column if not exists name text,
  add column if not exists email text,
  add column if not exists phone text,
  add column if not exists preferred_service text,
  add column if not exists party_size integer,
  add column if not exists message text,
  add column if not exists submitted_at timestamptz;

alter table if exists public.sermons
  add column if not exists title text,
  add column if not exists video_url text,
  add column if not exists preached_on date,
  add column if not exists is_published boolean,
  add column if not exists created_at timestamptz;

alter table if exists public.archived_sermons
  add column if not exists title text,
  add column if not exists media_url text,
  add column if not exists thumbnail_url text,
  add column if not exists preached_on date,
  add column if not exists speaker text,
  add column if not exists description text,
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

drop index if exists public.member_feedback_lookup_idx;
create index if not exists member_feedback_lookup_idx
  on public.member_feedback (created_at desc, category, severity);

drop index if exists public.member_feedback_member_idx;
create index if not exists member_feedback_member_idx
  on public.member_feedback (member_id, created_at desc);

alter table public.announcements enable row level security;
alter table public.scriptures enable row level security;
alter table public.youth_banners enable row level security;
alter table public.livestreams enable row level security;
alter table public.prayer_requests enable row level security;
alter table public.visit_requests enable row level security;
alter table public.sermons enable row level security;
alter table public.archived_sermons enable row level security;
alter table public.member_feedback enable row level security;

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

drop policy if exists archived_sermons_public_read on public.archived_sermons;
create policy archived_sermons_public_read
on public.archived_sermons
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

drop policy if exists member_feedback_authenticated_insert on public.member_feedback;
create policy member_feedback_authenticated_insert
on public.member_feedback
for insert
to authenticated
with check (true);
