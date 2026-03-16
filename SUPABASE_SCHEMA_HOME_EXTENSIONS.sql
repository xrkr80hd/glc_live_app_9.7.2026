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
  display_seconds integer not null default 12 check (display_seconds between 5 and 120),
  enable_audio boolean not null default false,
  volume_percent integer not null default 25 check (volume_percent between 0 and 100),
  created_at timestamptz not null default timezone('utc', now())
);

alter table if exists public.seasonal_features
  add column if not exists display_seconds integer not null default 12,
  add column if not exists enable_audio boolean not null default false,
  add column if not exists volume_percent integer not null default 25;

create table if not exists public.prayer_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  request_text text not null,
  is_private boolean not null default false,
  status text not null default 'new' check (status in ('new', 'in_progress', 'prayed', 'closed')),
  submitted_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.visit_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  preferred_service text,
  party_size integer not null default 1 check (party_size > 0),
  message text,
  submitted_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.photo_albums (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  album_date date,
  description text,
  cover_photo_url text,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.album_photos (
  id uuid primary key default gen_random_uuid(),
  album_id uuid not null references public.photo_albums(id) on delete cascade,
  photo_url text not null,
  caption text,
  taken_on date,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.gallery_videos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  video_url text not null,
  thumbnail_url text,
  description text,
  recorded_on date,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.team_roles (
  id uuid primary key default gen_random_uuid(),
  role_key text not null unique,
  name text not null,
  description text,
  sort_order integer not null default 0,
  is_system boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid,
  username text not null unique,
  full_name text,
  email text unique,
  phone text,
  password_hash text,
  last_login_at timestamptz,
  is_superuser boolean not null default false,
  is_active boolean not null default true,
  notes text,
  created_at timestamptz not null default timezone('utc', now())
);

alter table if exists public.team_members
  add column if not exists auth_user_id uuid,
  add column if not exists password_hash text,
  add column if not exists last_login_at timestamptz;

create table if not exists public.team_member_roles (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.team_members(id) on delete cascade,
  role_id uuid not null references public.team_roles(id) on delete cascade,
  is_role_admin boolean not null default false,
  assigned_at timestamptz not null default timezone('utc', now()),
  unique (member_id, role_id)
);

alter table if exists public.team_member_roles
  add column if not exists is_role_admin boolean not null default false;

create table if not exists public.curriculum_library (
  id uuid primary key default gen_random_uuid(),
  role_id uuid references public.team_roles(id) on delete set null,
  title text not null,
  file_url text,
  topic text,
  starts_on date,
  ends_on date,
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  constraint curriculum_library_date_window check (ends_on is null or starts_on is null or ends_on >= starts_on)
);

create table if not exists public.service_song_lists (
  id uuid primary key default gen_random_uuid(),
  role_id uuid references public.team_roles(id) on delete set null,
  service_date date not null,
  title text not null,
  songs_json jsonb not null default '[]'::jsonb,
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.ministry_order_requests (
  id uuid primary key default gen_random_uuid(),
  role_id uuid not null references public.team_roles(id) on delete cascade,
  requested_by_member_id uuid references public.team_members(id) on delete set null,
  title text not null,
  request_details text not null,
  needed_by_date date,
  estimated_cost numeric(12,2),
  status text not null default 'new',
  pastor_notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint ministry_order_requests_status_chk check (
    status in ('new', 'reviewing', 'ordered', 'fulfilled', 'declined')
  )
);

create table if not exists public.bookkeeping_reports (
  id uuid primary key default gen_random_uuid(),
  report_date date not null default (timezone('utc', now()))::date,
  entry_type text not null default 'offering',
  title text not null,
  amount numeric(12,2) not null,
  notes text,
  submitted_by_member_id uuid references public.team_members(id) on delete set null,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint bookkeeping_reports_entry_type_chk check (
    entry_type in ('offering', 'tithe', 'expense', 'adjustment', 'other')
  )
);

create table if not exists public.team_member_password_resets (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.team_members(id) on delete cascade,
  token_hash text not null,
  request_ip text,
  requested_at timestamptz not null default timezone('utc', now()),
  expires_at timestamptz not null,
  used_at timestamptz
);

create table if not exists public.member_feedback (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references public.team_members(id) on delete set null,
  name text,
  email text,
  route text,
  category text not null default 'bug' check (category in ('bug', 'ui', 'idea', 'other')),
  severity text not null default 'medium' check (severity in ('low', 'medium', 'high')),
  message text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists ministries_lookup_idx
  on public.ministries (is_published, sort_order, created_at desc);

create index if not exists seasonal_features_lookup_idx
  on public.seasonal_features (is_active, starts_at, ends_at, sort_order, created_at desc);

create index if not exists prayer_requests_status_idx
  on public.prayer_requests (status, submitted_at desc);

create index if not exists visit_requests_submitted_idx
  on public.visit_requests (submitted_at desc);

create index if not exists photo_albums_lookup_idx
  on public.photo_albums (is_published, sort_order, album_date desc, created_at desc);

create index if not exists album_photos_lookup_idx
  on public.album_photos (album_id, is_published, sort_order, taken_on desc, created_at desc);

create index if not exists gallery_videos_lookup_idx
  on public.gallery_videos (is_published, sort_order, recorded_on desc, created_at desc);

create index if not exists team_roles_lookup_idx
  on public.team_roles (is_active, sort_order, created_at desc);

create index if not exists team_members_lookup_idx
  on public.team_members (is_active, is_superuser, created_at desc);

create unique index if not exists team_members_auth_user_id_uidx
  on public.team_members (auth_user_id)
  where auth_user_id is not null;

create index if not exists team_member_roles_lookup_idx
  on public.team_member_roles (member_id, role_id, assigned_at desc);

create index if not exists team_member_roles_admin_lookup_idx
  on public.team_member_roles (role_id, is_role_admin, assigned_at desc);

create index if not exists curriculum_library_lookup_idx
  on public.curriculum_library (role_id, starts_on desc, ends_on desc, created_at desc);

create index if not exists service_song_lists_lookup_idx
  on public.service_song_lists (role_id, service_date desc, created_at desc);

create index if not exists ministry_order_requests_lookup_idx
  on public.ministry_order_requests (status, role_id, needed_by_date desc, created_at desc);

create index if not exists ministry_order_requests_requester_idx
  on public.ministry_order_requests (requested_by_member_id, created_at desc);

create index if not exists bookkeeping_reports_lookup_idx
  on public.bookkeeping_reports (report_date desc, entry_type, created_at desc);

create index if not exists team_member_password_resets_lookup_idx
  on public.team_member_password_resets (member_id, requested_at desc);

create unique index if not exists team_member_password_resets_token_hash_uidx
  on public.team_member_password_resets (token_hash);

create index if not exists member_feedback_lookup_idx
  on public.member_feedback (created_at desc, category, severity);

create index if not exists member_feedback_member_idx
  on public.member_feedback (member_id, created_at desc);

alter table public.ministries enable row level security;
alter table public.seasonal_features enable row level security;
alter table public.prayer_requests enable row level security;
alter table public.visit_requests enable row level security;
alter table public.photo_albums enable row level security;
alter table public.album_photos enable row level security;
alter table public.gallery_videos enable row level security;
alter table public.team_roles enable row level security;
alter table public.team_members enable row level security;
alter table public.team_member_roles enable row level security;
alter table public.curriculum_library enable row level security;
alter table public.service_song_lists enable row level security;
alter table public.ministry_order_requests enable row level security;
alter table public.bookkeeping_reports enable row level security;
alter table public.team_member_password_resets enable row level security;
alter table public.member_feedback enable row level security;

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

drop policy if exists photo_albums_public_read on public.photo_albums;
create policy photo_albums_public_read
on public.photo_albums
for select
to anon, authenticated
using (is_published = true);

drop policy if exists album_photos_public_read on public.album_photos;
create policy album_photos_public_read
on public.album_photos
for select
to anon, authenticated
using (is_published = true);

drop policy if exists gallery_videos_public_read on public.gallery_videos;
create policy gallery_videos_public_read
on public.gallery_videos
for select
to anon, authenticated
using (is_published = true);

drop policy if exists member_feedback_authenticated_insert on public.member_feedback;
create policy member_feedback_authenticated_insert
on public.member_feedback
for insert
to authenticated
with check (true);

insert into public.team_roles (role_key, name, description, sort_order, is_system, is_active)
values
  ('superuser', 'Superuser', 'Full platform access.', -100, true, true),
  ('pastor', 'Pastor', 'Pastoral leadership and sermon coordination.', 0, true, true),
  ('media_team', 'Media Team', 'Media capture, editing, and publishing.', 10, true, true),
  ('worship_leader', 'Worship Leader', 'Leads worship sets and team direction.', 15, true, true),
  ('worship_team', 'Worship Team', 'Music ministry planning and execution.', 20, true, true),
  ('foh_sound', 'FOH Sound', 'Front of house audio team.', 30, true, true),
  ('kids_church', 'Kids Church', 'Kids church classroom and lesson support.', 40, true, true),
  ('childrens_church', 'Children''s Church', 'Children''s curriculum and classroom coordination.', 45, true, true),
  ('bookkeeper', 'Bookkeeper', 'Bookkeeping and offering reporting.', 47, true, true),
  ('youth_minister', 'Youth Minister', 'Youth ministry leadership and planning.', 50, true, true),
  ('youth_minister_assistant', 'Youth Minister Assistant', 'Supports youth ministry operations.', 55, true, true),
  ('youth_ministry', 'Youth Ministry', 'Legacy role for youth ministry operations.', 60, true, true)
on conflict (role_key) do nothing;

update public.team_roles
set name = 'Children''s Church'
where role_key = 'childrens_church'
  and name <> 'Children''s Church';

update public.team_roles
set name = 'Bookkeeper'
where role_key = 'bookkeeper'
  and name <> 'Bookkeeper';

insert into public.team_members (username, full_name, is_superuser, is_active, notes)
values ('xrkr80hdadmin', 'Primary Superuser', true, true, 'Bootstrap superuser account.')
on conflict (username)
do update set
  is_superuser = true,
  is_active = true;
