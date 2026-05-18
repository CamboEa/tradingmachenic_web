-- Per-user lesson completion for "continue learning" and progress UI.

create table if not exists public.lesson_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  lesson_slug text not null,
  completed_at timestamptz not null default now(),
  primary key (user_id, lesson_slug)
);

create index if not exists lesson_progress_user_idx
  on public.lesson_progress (user_id, completed_at desc);

alter table public.lesson_progress enable row level security;

create policy "lesson_progress: users read own"
  on public.lesson_progress for select
  using (auth.uid() = user_id);

create policy "lesson_progress: users insert own"
  on public.lesson_progress for insert
  with check (auth.uid() = user_id);

create policy "lesson_progress: users update own"
  on public.lesson_progress for update
  using (auth.uid() = user_id);

create policy "lesson_progress: users delete own"
  on public.lesson_progress for delete
  using (auth.uid() = user_id);
