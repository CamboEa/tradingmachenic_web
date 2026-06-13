-- Separate download files for tools that support both MT4 and MT5.
-- Single-platform tools keep using file_url; dual-platform tools use
-- file_url_mt4 and file_url_mt5 so each platform gets its own download.

alter table public.tools
  add column if not exists file_url_mt4 text,
  add column if not exists file_url_mt5 text;
