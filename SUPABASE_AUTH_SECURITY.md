# Supabase Auth Security Actions

## Leaked Password Protection

Supabase leaked-password protection is a project Auth setting, not a Postgres migration.

Enable it in the Supabase dashboard:

1. Open project `ywfvbgblyuqwofejmasv`.
2. Go to `Auth` -> `Providers` -> `Email`.
3. In password security settings, enable leaked password protection.
4. Save changes.

Notes:

- This feature is available on Supabase Pro plan and above.
- After enabling, weak/leaked passwords are rejected for new signups and password updates.

## No-Subscription Internal Guardrails (Implemented)

The app now also enforces internal password and login protections without relying on this paid Auth feature:

- Strong password policy in member signup and password-change APIs:
  - Minimum length: 12
  - Requires uppercase, lowercase, number, symbol
  - Blocks common/leaked-style passwords from local denylist
  - Blocks passwords containing user context (name/email tokens)
- Login abuse controls:
  - IP-based attempt throttling window
  - Persistent account lockout fields on `public.team_members` after repeated failures

Schema migration for lockout fields:

- `supabase/migrations/202603180004_member_auth_lock_controls.sql`
