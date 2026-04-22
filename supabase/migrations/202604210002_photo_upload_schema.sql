create table if not exists public.photo_albums (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  album_date date,
  description text,
  cover_photo_url text,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  constraint photo_albums_title_not_blank check (char_length(trim(title)) > 0)
);

create table if not exists public.album_photos (
  id uuid primary key default gen_random_uuid(),
  album_id uuid not null references public.photo_albums(id) on delete cascade,
  photo_url text not null,
  caption text,
  taken_on date,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  constraint album_photos_photo_url_not_blank check (char_length(trim(photo_url)) > 0)
);

create index if not exists photo_albums_lookup_idx
  on public.photo_albums (is_published, sort_order, album_date desc, created_at desc);

create index if not exists album_photos_lookup_idx
  on public.album_photos (album_id, is_published, sort_order, taken_on desc, created_at desc);

alter table public.photo_albums enable row level security;
alter table public.album_photos enable row level security;

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
