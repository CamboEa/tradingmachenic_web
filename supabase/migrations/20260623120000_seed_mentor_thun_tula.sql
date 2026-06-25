-- Thun Tula (ThunTula-FT) — Forex mentor
insert into public.mentors (
  slug,
  name_en,
  name_km,
  title_en,
  title_km,
  bio_en,
  bio_km,
  image_url,
  sort_order,
  status
) values (
  'thun-tula-ft',
  'Thun Tula',
  'ធាន ទុយឡា',
  'Forex & ICT Trading Educator',
  'គ្រូបង្រៀនពាណិជ្ជកម្ម Forex និង ICT',
  'Free structured forex education on YouTube — ICT concepts, market structure, and practical execution.',
  'ការអប់រំ Forex ឥតគិតថ្លៃលើ YouTube — គោលគំនិត ICT រចនាសម្ព័ន្ធទីផ្សារ និងការប្រតិបត្តិជាក់ស្តែង។',
  '/Images/thun-tula-ft.png',
  1,
  'published'
)
on conflict (slug) do update set
  name_en = excluded.name_en,
  name_km = excluded.name_km,
  title_en = excluded.title_en,
  title_km = excluded.title_km,
  bio_en = excluded.bio_en,
  bio_km = excluded.bio_km,
  image_url = excluded.image_url,
  sort_order = excluded.sort_order,
  status = excluded.status;

insert into public.mentor_categories (mentor_id, category)
select id, 'forex'
from public.mentors
where slug = 'thun-tula-ft'
on conflict do nothing;
