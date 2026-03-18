-- Follow-up security hardening for Supabase linter warnings:
--  - rls_policy_always_true on member_feedback/prayer_requests/visit_requests INSERT policies
-- This migration removes any permissive INSERT policy variants and recreates strict checks.

begin;

alter table if exists public.member_feedback enable row level security;
alter table if exists public.prayer_requests enable row level security;
alter table if exists public.visit_requests enable row level security;

-- member_feedback: authenticated members can only insert rows tied to themselves.
drop policy if exists member_feedback_public_insert on public.member_feedback;
drop policy if exists member_feedback_insert_auth on public.member_feedback;
drop policy if exists member_feedback_authenticated_insert on public.member_feedback;
drop policy if exists member_feedback_member_insert on public.member_feedback;

create policy member_feedback_member_insert
on public.member_feedback
for insert
to authenticated
with check (
  auth.uid() is not null
  and member_id is not null
  and category in ('bug', 'ui', 'idea', 'other')
  and severity in ('low', 'medium', 'high')
  and char_length(trim(coalesce(message, ''))) between 1 and 4000
  and (
    route is null
    or char_length(trim(route)) <= 160
  )
  and (
    name is null
    or char_length(trim(name)) <= 120
  )
  and (
    email is null
    or (
      char_length(trim(email)) between 3 and 160
      and position('@' in email) > 1
    )
  )
  and exists (
    select 1
    from public.team_members tm
    where tm.id = member_feedback.member_id
      and tm.auth_user_id = auth.uid()
      and tm.is_active = true
  )
);

-- prayer_requests: keep public submit behavior, but require valid form-like payload.
drop policy if exists prayer_requests_public_insert on public.prayer_requests;

create policy prayer_requests_public_insert
on public.prayer_requests
for insert
to anon, authenticated
with check (
  char_length(trim(coalesce(name, ''))) between 1 and 120
  and char_length(trim(coalesce(email, ''))) between 3 and 160
  and position('@' in email) > 1
  and char_length(trim(coalesce(request_text, ''))) between 1 and 4000
  and (phone is null or char_length(trim(phone)) <= 32)
  and status = 'new'
);

-- visit_requests: keep public submit behavior, but enforce sane values.
drop policy if exists visit_requests_public_insert on public.visit_requests;

create policy visit_requests_public_insert
on public.visit_requests
for insert
to anon, authenticated
with check (
  char_length(trim(coalesce(name, ''))) between 1 and 120
  and char_length(trim(coalesce(email, ''))) between 3 and 160
  and position('@' in email) > 1
  and party_size between 1 and 25
  and (phone is null or char_length(trim(phone)) <= 32)
  and (preferred_service is null or char_length(trim(preferred_service)) <= 120)
  and (message is null or char_length(trim(message)) <= 2000)
);

commit;
