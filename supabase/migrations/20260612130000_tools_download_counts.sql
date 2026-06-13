-- Track how many times each tool is downloaded.
-- download_count is the overall total (always incremented). For dual MT4/MT5
-- tools we also keep a per-platform breakdown.

alter table public.tools
  add column if not exists download_count integer not null default 0,
  add column if not exists download_count_mt4 integer not null default 0,
  add column if not exists download_count_mt5 integer not null default 0;

-- Atomic increment so concurrent downloads don't clobber each other.
-- security definer lets it run regardless of the caller's RLS (downloads are public).
create or replace function public.increment_tool_download(p_tool_id uuid, p_platform text)
returns void
language sql
security definer
set search_path = public
as $$
  update public.tools
  set
    download_count = download_count + 1,
    download_count_mt4 = download_count_mt4 + (case when p_platform = 'mt4' then 1 else 0 end),
    download_count_mt5 = download_count_mt5 + (case when p_platform = 'mt5' then 1 else 0 end)
  where id = p_tool_id;
$$;

grant execute on function public.increment_tool_download(uuid, text) to anon, authenticated, service_role;
