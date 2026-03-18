insert into public.team_roles (role_key, name, description, sort_order, is_system, is_active)
values
  ('foh_sound', 'FOH Sound', 'Front of house sound operations.', 10, false, true),
  ('worship_leader', 'Worship Leader', 'Leads worship sets and team flow.', 20, false, true),
  ('worship_team', 'Worship Team', 'Worship team members and support.', 30, false, true),
  ('pastor', 'Pastor', 'Pastoral leadership and oversight.', 40, false, true),
  ('media_team', 'Media Team', 'Slides, livestream, and media operations.', 50, false, true),
  ('youth_minister', 'Youth Minister', 'Youth ministry leadership.', 60, false, true),
  ('youth_minister_assistant', 'Youth Minister Assistant', 'Supports youth ministry operations.', 70, false, true),
  ('kids_church', 'Kids Church', 'Kids ministry and classes.', 80, false, true),
  ('bookkeeper', 'Bookkeeper', 'Bookkeeping and offering reporting.', 90, false, true),
  ('superuser', 'Superuser', 'Highest-level platform control role.', 100, true, true)
on conflict (role_key) do nothing;
