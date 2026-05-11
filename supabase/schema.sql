-- ============================================================
-- Trading Machenic — Supabase schema
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor)
-- ============================================================

-- ── Profiles ──────────────────────────────────────────────────
-- Extends auth.users. Created automatically on sign-up via trigger.

create table if not exists public.profiles (
  id          uuid references auth.users on delete cascade primary key,
  created_at  timestamptz default now() not null,
  email       text,
  full_name   text,
  role        text not null default 'student'
                check (role in ('student', 'admin'))
);

alter table public.profiles enable row level security;

-- Users can read and update their own profile
create policy "profiles: own read"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles: own update"
  on public.profiles for update
  using (auth.uid() = id);

-- Admins can read all profiles
create policy "profiles: admin read all"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Trigger: create profile row when a new user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name'
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ── Tools ──────────────────────────────────────────────────────

create table if not exists public.tools (
  id                 uuid default gen_random_uuid() primary key,
  created_at         timestamptz default now() not null,
  name               text not null,
  type               text not null check (type in ('indicator', 'ea')),
  platform           text not null check (platform in ('MT4', 'MT5', 'MT4 & MT5')),
  version            text not null default '1.0.0',
  description_en     text,
  description_km     text,
  install_guide_url  text,
  file_url           text,
  status             text not null default 'draft'
                       check (status in ('draft', 'published'))
);

alter table public.tools enable row level security;

-- Anyone can read published tools
create policy "tools: public read published"
  on public.tools for select
  using (status = 'published');

-- Admins can do everything
create policy "tools: admin all"
  on public.tools for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );


-- ── Storage bucket for tool files ─────────────────────────────
-- Create via Dashboard → Storage, or uncomment if using CLI:
--
-- insert into storage.buckets (id, name, public)
-- values ('tools', 'tools', false);
--
-- create policy "tools storage: admin upload"
--   on storage.objects for insert
--   with check (
--     bucket_id = 'tools' and
--     exists (
--       select 1 from public.profiles p
--       where p.id = auth.uid() and p.role = 'admin'
--     )
--   );
--
-- create policy "tools storage: authenticated download"
--   on storage.objects for select
--   using (bucket_id = 'tools' and auth.role() = 'authenticated');
