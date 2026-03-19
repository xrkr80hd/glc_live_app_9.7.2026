create table if not exists public.team_roles (
  id uuid primary key default gen_random_uuid(),
  role_key text not null,
  name text not null,
  description text,
  sort_order integer not null default 0,
  is_system boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now())
);

alter table if exists public.team_roles
  add column if not exists role_key text,
  add column if not exists name text,
  add column if not exists description text,
  add column if not exists sort_order integer not null default 0,
  add column if not exists is_system boolean not null default false,
  add column if not exists is_active boolean not null default true,
  add column if not exists created_at timestamptz not null default timezone('utc', now());

create unique index if not exists team_roles_role_key_uidx
  on public.team_roles (role_key);

create index if not exists team_roles_lookup_idx
  on public.team_roles (is_active, sort_order, name);

create table if not exists public.team_member_roles (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.team_members(id) on delete cascade,
  role_id uuid not null references public.team_roles(id) on delete cascade,
  is_role_admin boolean not null default false,
  assigned_at timestamptz not null default timezone('utc', now())
);

alter table if exists public.team_member_roles
  add column if not exists member_id uuid,
  add column if not exists role_id uuid,
  add column if not exists is_role_admin boolean not null default false,
  add column if not exists assigned_at timestamptz not null default timezone('utc', now());

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'team_member_roles_member_id_fkey'
  ) then
    alter table public.team_member_roles
      add constraint team_member_roles_member_id_fkey
      foreign key (member_id) references public.team_members(id) on delete cascade;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'team_member_roles_role_id_fkey'
  ) then
    alter table public.team_member_roles
      add constraint team_member_roles_role_id_fkey
      foreign key (role_id) references public.team_roles(id) on delete cascade;
  end if;
end $$;

create unique index if not exists team_member_roles_member_role_uidx
  on public.team_member_roles (member_id, role_id);

create index if not exists team_member_roles_member_lookup_idx
  on public.team_member_roles (member_id, assigned_at desc);

create index if not exists team_member_roles_role_lookup_idx
  on public.team_member_roles (role_id, assigned_at desc);

alter table if exists public.team_roles enable row level security;
alter table if exists public.team_member_roles enable row level security;
