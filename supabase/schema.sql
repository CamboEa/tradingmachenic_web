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

-- Helper: check if the current user is an admin (security definer bypasses RLS to avoid recursion)
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Admins can read all profiles
create policy "profiles: admin read all"
  on public.profiles for select
  using (public.is_admin());

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
  pricing            text not null default 'free' check (pricing in ('free', 'paid')),
  version            text not null default '1.0.0',
  description_en     text,
  description_km     text,
  install_guide_url  text,
  file_url           text,
  image_url          text,
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
  using (public.is_admin());


-- ── Lessons ────────────────────────────────────────────────────

create table if not exists public.lessons (
  id                 uuid default gen_random_uuid() primary key,
  created_at         timestamptz default now() not null,
  slug               text not null unique,
  title_en           text not null,
  title_km           text not null,
  summary_en         text,
  summary_km         text,
  thumbnail_url      text,
  approximate_minutes integer,
  type               text check (type in ('free', 'paid')),
  objectives_en      text[] default '{}',
  objectives_km      text[] default '{}',
  status             text not null default 'draft'
                       check (status in ('draft', 'published'))
);

alter table public.lessons enable row level security;

-- Anyone can read published lessons
create policy "lessons: public read published"
  on public.lessons for select
  using (status = 'published');

-- Authenticated users can do everything
create policy "lessons: authenticated all"
  on public.lessons for all
  using (auth.role() = 'authenticated');


-- ── Lesson Videos ──────────────────────────────────────────────

create table if not exists public.lesson_videos (
  id                 uuid default gen_random_uuid() primary key,
  created_at         timestamptz default now() not null,
  lesson_id          uuid not null references public.lessons on delete cascade,
  embed_url          text not null,
  title_en           text,
  title_km           text,
  sort_order         integer default 0
);

alter table public.lesson_videos enable row level security;

-- Anyone can read videos from published lessons
create policy "lesson_videos: public read published"
  on public.lesson_videos for select
  using (
    exists (
      select 1 from public.lessons l
      where l.id = lesson_videos.lesson_id and l.status = 'published'
    )
  );

-- Authenticated users can do everything
create policy "lesson_videos: authenticated all"
  on public.lesson_videos for all
  using (auth.role() = 'authenticated');


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
