create table if not exists public.member_feedback (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text,
  route text,
  category text not null default 'bug',
  severity text not null default 'medium',
  message text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists member_feedback_created_at_idx
  on public.member_feedback (created_at desc);

alter table public.member_feedback enable row level security;

drop policy if exists member_feedback_public_insert on public.member_feedback;
create policy member_feedback_public_insert
on public.member_feedback
for insert
to anon, authenticated
with check (true);
