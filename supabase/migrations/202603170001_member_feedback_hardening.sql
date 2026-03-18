alter table if exists public.team_members
  add column if not exists auth_user_id uuid;

create table if not exists public.member_feedback (
  id uuid primary key default gen_random_uuid(),
  member_id uuid,
  name text,
  email text,
  route text,
  category text not null default 'bug',
  severity text not null default 'medium',
  message text not null,
  created_at timestamptz not null default timezone('utc', now())
);

alter table if exists public.member_feedback
  add column if not exists member_id uuid,
  add column if not exists name text,
  add column if not exists email text,
  add column if not exists route text,
  add column if not exists category text not null default 'bug',
  add column if not exists severity text not null default 'medium',
  add column if not exists message text,
  add column if not exists created_at timestamptz not null default timezone('utc', now());

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'member_feedback_member_id_fkey'
  ) then
    alter table public.member_feedback
      add constraint member_feedback_member_id_fkey
      foreign key (member_id)
      references public.team_members (id)
      on delete set null;
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'member_feedback_category_check'
  ) then
    alter table public.member_feedback
      add constraint member_feedback_category_check
      check (category in ('bug', 'ui', 'idea', 'other'));
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'member_feedback_severity_check'
  ) then
    alter table public.member_feedback
      add constraint member_feedback_severity_check
      check (severity in ('low', 'medium', 'high'));
  end if;
end
$$;

create index if not exists member_feedback_created_at_idx
  on public.member_feedback (created_at desc);

create index if not exists member_feedback_member_id_idx
  on public.member_feedback (member_id, created_at desc);

alter table if exists public.member_feedback enable row level security;

drop policy if exists member_feedback_member_insert on public.member_feedback;
create policy member_feedback_member_insert
on public.member_feedback
for insert
to authenticated
with check (
  exists (
    select 1
    from public.team_members tm
    where tm.id = member_feedback.member_id
      and tm.auth_user_id = auth.uid()
      and tm.is_active = true
  )
);
