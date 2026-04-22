alter table if exists public.scriptures
  add column if not exists title text,
  add column if not exists devotional_text text;
