-- Mentor login accounts: role, profile link, optional tool ownership

alter table public.profiles
  drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check
  check (role in ('student', 'admin', 'mentor'));

alter table public.profiles
  add column if not exists mentor_id uuid references public.mentors (id) on delete set null;

create unique index if not exists profiles_mentor_id_unique
  on public.profiles (mentor_id)
  where mentor_id is not null and role = 'mentor';

create index if not exists profiles_mentor_id_idx on public.profiles (mentor_id);

alter table public.tools
  add column if not exists mentor_slug text references public.mentors (slug) on delete set null;

create index if not exists tools_mentor_slug_idx on public.tools (mentor_slug);

create or replace function public.is_mentor()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'mentor'
  );
$$;

create or replace function public.current_mentor_slug()
returns text
language sql
security definer
stable
set search_path = public
as $$
  select m.slug
  from public.profiles p
  join public.mentors m on m.id = p.mentor_id
  where p.id = auth.uid() and p.role = 'mentor'
  limit 1;
$$;

create or replace function public.protect_profile_privileged_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or public.is_admin() then
    return new;
  end if;

  new.role := old.role;
  new.mentor_id := old.mentor_id;
  return new;
end;
$$;

drop trigger if exists protect_profile_privileged_fields on public.profiles;
create trigger protect_profile_privileged_fields
  before update on public.profiles
  for each row execute procedure public.protect_profile_privileged_fields();

drop policy if exists "tools: admin all" on public.tools;
create policy "tools: admin all"
  on public.tools for all
  using (public.is_admin());

drop policy if exists "tools: mentor own" on public.tools;
create policy "tools: mentor own"
  on public.tools for all
  using (
    public.is_mentor()
    and mentor_slug is not null
    and mentor_slug = public.current_mentor_slug()
  );

drop policy if exists "mentors: authenticated all" on public.mentors;
drop policy if exists "mentors: admin all" on public.mentors;
create policy "mentors: admin all"
  on public.mentors for all
  using (public.is_admin());

drop policy if exists "mentors: mentor own" on public.mentors;
create policy "mentors: mentor own"
  on public.mentors for update
  using (
    public.is_mentor()
    and slug = public.current_mentor_slug()
  );

drop policy if exists "mentors: mentor own read" on public.mentors;
create policy "mentors: mentor own read"
  on public.mentors for select
  using (
    public.is_mentor()
    and slug = public.current_mentor_slug()
  );

drop policy if exists "lesson_topics: authenticated all" on public.lesson_topics;
drop policy if exists "lesson_topics: staff all" on public.lesson_topics;
create policy "lesson_topics: staff all"
  on public.lesson_topics for all
  using (
    public.is_admin()
    or (
      public.is_mentor()
      and mentor_slug = public.current_mentor_slug()
    )
  );

drop policy if exists "lessons: authenticated all" on public.lessons;
drop policy if exists "lessons: staff all" on public.lessons;
create policy "lessons: staff all"
  on public.lessons for all
  using (
    public.is_admin()
    or (
      public.is_mentor()
      and mentor_slug = public.current_mentor_slug()
    )
  );

drop policy if exists "lesson_videos: authenticated all" on public.lesson_videos;
drop policy if exists "lesson_videos: staff all" on public.lesson_videos;
create policy "lesson_videos: staff all"
  on public.lesson_videos for all
  using (
    public.is_admin()
    or exists (
      select 1 from public.lessons l
      where l.id = lesson_id
        and l.mentor_slug = public.current_mentor_slug()
    )
  );
