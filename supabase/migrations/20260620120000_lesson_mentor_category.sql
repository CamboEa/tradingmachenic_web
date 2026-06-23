alter table public.lessons
  add column if not exists mentor_slug text,
  add column if not exists category text
    check (category is null or category in ('forex', 'stock', 'crypto', 'siac'));

create index if not exists lessons_mentor_category_idx
  on public.lessons (mentor_slug, category)
  where status = 'published';
