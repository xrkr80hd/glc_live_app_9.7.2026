alter table if exists public.team_members
  add column if not exists auth_user_id uuid;

create unique index if not exists team_members_auth_user_id_uidx
  on public.team_members (auth_user_id)
  where auth_user_id is not null;
