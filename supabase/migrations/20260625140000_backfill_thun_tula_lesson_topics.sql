-- Backfill lesson_topic_slug for Thun Tula lessons (safe to re-run).
-- Lessons seeded before lesson_topics existed were missing this field.

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
set lesson_topic_slug = 'csnr'
where mentor_slug = 'thun-tula-ft'
  and (lesson_topic_slug is null or lesson_topic_slug = '')
  and slug ~* 'csnr';

update public.lessons
set lesson_topic_slug = 'crt'
where mentor_slug = 'thun-tula-ft'
  and (lesson_topic_slug is null or lesson_topic_slug = '')
  and slug ~* 'crt';

update public.lessons
set lesson_topic_slug = 'lecture-series'
where mentor_slug = 'thun-tula-ft'
  and (lesson_topic_slug is null or lesson_topic_slug = '')
  and slug ~* 'lecture-';

update public.lessons
set lesson_topic_slug = 'execution'
where mentor_slug = 'thun-tula-ft'
  and (lesson_topic_slug is null or lesson_topic_slug = '')
  and (
    title_en ~* 'execution|psychology|payout|topstep|starting from 0'
    or slug ~* 'execution|psychology|payout|topstep'
  );

update public.lessons
set lesson_topic_slug = 'ict'
where mentor_slug = 'thun-tula-ft'
  and (lesson_topic_slug is null or lesson_topic_slug = '')
  and (
    slug ~* 'ict|mentorship|ipda|smt|liquidity|discord'
    or title_en ~* 'ict|ipda|smt|nwog|liquidity|mentorship|smart money'
  );

update public.lessons
set lesson_topic_slug = 'general'
where mentor_slug = 'thun-tula-ft'
  and (lesson_topic_slug is null or lesson_topic_slug = '');
