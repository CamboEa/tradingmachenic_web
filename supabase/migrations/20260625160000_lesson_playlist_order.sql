alter table public.lessons
  add column if not exists sort_order int not null default 0,
  add column if not exists youtube_playlist_id text;

create index if not exists lessons_mentor_topic_sort_idx
  on public.lessons (mentor_slug, lesson_topic_slug, sort_order)
  where status = 'published';
