-- Persistent lockout controls for member password authentication attempts.

begin;

alter table if exists public.team_members
  add column if not exists failed_sign_in_attempts integer not null default 0,
  add column if not exists sign_in_lock_until timestamptz;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'team_members_failed_sign_in_attempts_non_negative'
  ) then
    alter table public.team_members
      add constraint team_members_failed_sign_in_attempts_non_negative
      check (failed_sign_in_attempts >= 0);
  end if;
end
$$;

create index if not exists team_members_sign_in_lock_until_idx
  on public.team_members (sign_in_lock_until)
  where sign_in_lock_until is not null;

commit;
