-- Tighten permissive INSERT policies flagged by the Supabase linter.
-- These keep public/member form writes working while enforcing basic row checks.

alter table if exists public.member_feedback enable row level security;
alter table if exists public.prayer_requests enable row level security;
alter table if exists public.visit_requests enable row level security;
alter table if exists public.team_members
  add column if not exists auth_user_id uuid;
alter table if exists public.member_feedback
  add column if not exists member_id uuid;

-- member_feedback: authenticated members can only insert feedback tied to themselves.
drop policy if exists member_feedback_public_insert on public.member_feedback;
drop policy if exists member_feedback_insert_auth on public.member_feedback;
drop policy if exists member_feedback_member_insert on public.member_feedback;
create policy member_feedback_member_insert
on public.member_feedback
for insert
to authenticated
with check (
  member_id is not null
  and char_length(trim(coalesce(message, ''))) > 0
  and exists (
    select 1
    from public.team_members tm
    where tm.id = member_feedback.member_id
      and tm.auth_user_id = auth.uid()
      and tm.is_active = true
  )
);

-- prayer_requests: allow public submits, but only valid request rows with new status.
drop policy if exists prayer_requests_public_insert on public.prayer_requests;
create policy prayer_requests_public_insert
on public.prayer_requests
for insert
to anon, authenticated
with check (
  char_length(trim(coalesce(name, ''))) > 0
  and char_length(trim(coalesce(email, ''))) > 0
  and char_length(trim(coalesce(request_text, ''))) > 0
  and status = 'new'
);

-- visit_requests: allow public submits, but require minimum valid form payload.
drop policy if exists visit_requests_public_insert on public.visit_requests;
create policy visit_requests_public_insert
on public.visit_requests
for insert
to anon, authenticated
with check (
  char_length(trim(coalesce(name, ''))) > 0
  and char_length(trim(coalesce(email, ''))) > 0
  and party_size > 0
);
