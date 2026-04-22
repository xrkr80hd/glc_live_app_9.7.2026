alter table if exists public.announcements
  add column if not exists image_url text,
  add column if not exists image_alt text;
