-- Optional extended tool info (EN/KM). Safe to run on existing DBs.
alter table public.tools add column if not exists requirements_en text;
alter table public.tools add column if not exists requirements_km text;
alter table public.tools add column if not exists how_it_works_en text;
alter table public.tools add column if not exists how_it_works_km text;
alter table public.tools add column if not exists key_features_en text;
alter table public.tools add column if not exists key_features_km text;
alter table public.tools add column if not exists usage_notes_en text;
alter table public.tools add column if not exists usage_notes_km text;
