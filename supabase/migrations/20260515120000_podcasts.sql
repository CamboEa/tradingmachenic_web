-- Podcast episodes (YouTube links), admin-managed, public read when published.

create table if not exists public.podcasts (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now() not null,
  youtube_url text not null,
  title_en text not null,
  title_km text not null,
  description_en text,
  description_km text,
  sort_order integer not null default 0,
  status text not null default 'draft'
    check (status in ('draft', 'published'))
);

create index if not exists podcasts_status_sort_idx
  on public.podcasts (status, sort_order desc, created_at desc);

alter table public.podcasts enable row level security;

create policy "podcasts: public read published"
  on public.podcasts for select
  using (status = 'published');

create policy "podcasts: admin all"
  on public.podcasts for all
  using (public.is_admin());
