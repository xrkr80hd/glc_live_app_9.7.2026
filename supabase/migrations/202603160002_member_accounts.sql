create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
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
  add column if not exists full_name text,
  add column if not exists email text,
  add column if not exists phone text,
  add column if not exists password_hash text,
  add column if not exists last_login_at timestamptz,
  add column if not exists is_superuser boolean not null default false,
  add column if not exists is_active boolean not null default true,
  add column if not exists notes text,
  add column if not exists created_at timestamptz not null default timezone('utc', now());

create index if not exists team_members_lookup_idx
  on public.team_members (is_active, is_superuser, created_at desc);

alter table if exists public.team_members enable row level security;
