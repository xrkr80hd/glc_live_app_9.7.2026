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
