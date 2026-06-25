create table if not exists public.lesson_topics (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  mentor_slug text not null references public.mentors (slug) on delete cascade,
  slug text not null,
  name_en text not null,
  name_km text not null default '',
  description_en text,
  description_km text,
  sort_order int not null default 0,
  unique (mentor_slug, slug)
);

create index if not exists lesson_topics_mentor_sort_idx
  on public.lesson_topics (mentor_slug, sort_order);

alter table public.lesson_topics enable row level security;

create policy "lesson_topics: public read"
  on public.lesson_topics for select
  using (true);

create policy "lesson_topics: authenticated all"
  on public.lesson_topics for all
  to authenticated
  using (true)
  with check (true);

alter table public.lessons
  add column if not exists lesson_topic_slug text;

create index if not exists lessons_mentor_topic_idx
  on public.lessons (mentor_slug, lesson_topic_slug)
  where status = 'published';

-- Default topics for Thun Tula (safe to re-run)
insert into public.lesson_topics (mentor_slug, slug, name_en, description_en, sort_order)
values
  ('thun-tula-ft', 'ict', 'ICT', 'ICT mentorship, market structure, and ICT concepts', 1),
  ('thun-tula-ft', 'csnr', 'CSNR', 'CSNR entry model series', 2),
  ('thun-tula-ft', 'crt', 'CRT', 'CRT model lessons', 3),
  ('thun-tula-ft', 'lecture-series', 'Lecture Series', 'Lecture-style breakdowns and live study sessions', 4),
  ('thun-tula-ft', 'execution', 'Execution', 'Execution, psychology, and trading process', 5),
  ('thun-tula-ft', 'general', 'General', 'Other lessons for this mentor', 99)
on conflict (mentor_slug, slug) do update set
  name_en = excluded.name_en,
  description_en = excluded.description_en,
  sort_order = excluded.sort_order;

update public.lessons
set lesson_topic_slug = 'ict'
where mentor_slug = 'thun-tula-ft'
  and lesson_topic_slug is null
  and (
    title_en ~* 'ict|ipda|smt|nwog|liquidity|mentorship|smart money'
    or slug ~* 'ict|ipda|smt|liquidity|mentorship'
  );

update public.lessons
set lesson_topic_slug = 'csnr'
where mentor_slug = 'thun-tula-ft'
  and lesson_topic_slug is null
  and (title_en ~* 'csnr' or slug ~* 'csnr');

update public.lessons
set lesson_topic_slug = 'crt'
where mentor_slug = 'thun-tula-ft'
  and lesson_topic_slug is null
  and (title_en ~* 'crt' or slug ~* 'crt');

update public.lessons
set lesson_topic_slug = 'lecture-series'
where mentor_slug = 'thun-tula-ft'
  and lesson_topic_slug is null
  and (
    title_en ~* 'lecture\s*series|live\s+discord'
    or slug ~* '^thun-tula-ft-lecture-'
  );

update public.lessons
set lesson_topic_slug = 'execution'
where mentor_slug = 'thun-tula-ft'
  and lesson_topic_slug is null
  and title_en ~* 'execution|psychology|payout|topstep|starting from 0';

update public.lessons
set lesson_topic_slug = 'general'
where mentor_slug = 'thun-tula-ft'
  and lesson_topic_slug is null;
