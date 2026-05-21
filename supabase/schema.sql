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
  requirements_en    text,
  requirements_km    text,
  how_it_works_en    text,
  how_it_works_km    text,
  key_features_en    text,
  key_features_km    text,
  usage_notes_en     text,
  usage_notes_km     text,
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


-- ── Podcasts (YouTube episodes) ─────────────────────────────────

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


-- ── Blog posts (market insights / lesson blog) ─────────────────

create table if not exists public.blog_posts (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  slug text not null unique,
  title_en text not null,
  title_km text not null,
  excerpt_en text,
  excerpt_km text,
  body_en text not null default '',
  body_km text not null default '',
  featured_image_url text,
  published_at timestamptz default now() not null,
  status text not null default 'draft'
    check (status in ('draft', 'published')),
  videos jsonb not null default '[]'::jsonb
);

create index if not exists blog_posts_status_published_idx
  on public.blog_posts (status, published_at desc, created_at desc);

alter table public.blog_posts enable row level security;

create policy "blog_posts: public read published"
  on public.blog_posts for select
  using (status = 'published');

create policy "blog_posts: admin all"
  on public.blog_posts for all
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


-- ── Curriculum (phases + modules) ─────────────────────────────
-- Seed data: run migration `20260515100000_curriculum.sql` (or `npx tsx scripts/gen-curriculum-sql.ts`).

create table if not exists public.curriculum_phases (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  sort_order integer not null default 0,
  slug text not null unique,
  accent text not null check (accent in ('gold', 'teal')),
  label_en text not null,
  label_km text not null,
  sublabel_en text not null,
  sublabel_km text not null
);

create table if not exists public.curriculum_modules (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  phase_id uuid not null references public.curriculum_phases(id) on delete cascade,
  sort_order integer not null default 0,
  title_en text not null,
  title_km text not null,
  focus_en text not null,
  focus_km text not null,
  activities_en text not null,
  activities_km text not null
);

create index if not exists curriculum_modules_phase_sort_idx
  on public.curriculum_modules(phase_id, sort_order);

alter table public.curriculum_phases enable row level security;
alter table public.curriculum_modules enable row level security;

create policy "curriculum_phases: public read"
  on public.curriculum_phases for select using (true);

create policy "curriculum_phases: admin all"
  on public.curriculum_phases for all using (public.is_admin());

create policy "curriculum_modules: public read"
  on public.curriculum_modules for select using (true);

create policy "curriculum_modules: admin all"
  on public.curriculum_modules for all using (public.is_admin());


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
