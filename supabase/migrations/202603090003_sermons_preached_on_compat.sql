alter table if exists public.sermons
  add column if not exists preached_on date;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'sermons'
      and column_name = 'sermon_date'
  ) then
    update public.sermons
    set preached_on = coalesce(preached_on, sermon_date)
    where preached_on is null;
  end if;
end
$$;

drop index if exists public.sermons_lookup_idx;
create index if not exists sermons_lookup_idx
  on public.sermons (is_published, preached_on desc);
