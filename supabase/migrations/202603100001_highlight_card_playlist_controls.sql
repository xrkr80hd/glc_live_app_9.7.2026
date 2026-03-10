alter table if exists public.seasonal_features
  add column if not exists display_seconds integer not null default 12,
  add column if not exists enable_audio boolean not null default false,
  add column if not exists volume_percent integer not null default 25;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'seasonal_features_display_seconds_range'
  ) then
    alter table public.seasonal_features
      add constraint seasonal_features_display_seconds_range
      check (display_seconds between 5 and 120);
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'seasonal_features_volume_percent_range'
  ) then
    alter table public.seasonal_features
      add constraint seasonal_features_volume_percent_range
      check (volume_percent between 0 and 100);
  end if;
end
$$;
