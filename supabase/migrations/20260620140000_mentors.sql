-- Mentors + category assignments
create table if not exists public.mentors (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  slug        text not null unique,
  name_en     text not null,
  name_km     text not null,
  title_en    text,
  title_km    text,
  bio_en      text,
  bio_km      text,
  image_url   text,
  sort_order  integer not null default 0,
  status      text not null default 'draft'
                check (status in ('draft', 'published'))
);

create table if not exists public.mentor_categories (
  mentor_id uuid not null references public.mentors(id) on delete cascade,
  category  text not null check (category in ('forex', 'stock', 'crypto', 'siac')),
  primary key (mentor_id, category)
);

create index if not exists mentor_categories_category_idx
  on public.mentor_categories (category);

alter table public.mentors enable row level security;
alter table public.mentor_categories enable row level security;

create policy "mentors: public read published"
  on public.mentors for select
  using (status = 'published');

create policy "mentors: authenticated all"
  on public.mentors for all
  using (auth.role() = 'authenticated');

create policy "mentor_categories: public read published mentors"
  on public.mentor_categories for select
  using (
    exists (
      select 1 from public.mentors m
      where m.id = mentor_categories.mentor_id
        and m.status = 'published'
    )
  );

create policy "mentor_categories: authenticated all"
  on public.mentor_categories for all
  using (auth.role() = 'authenticated');

-- Bean Ratana — Forex only
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
  'bean-ratana',
  'Bean Ratana',
  'Bean Ratana',
  'Director of Strategic Partnership & Education',
  'នាយកផ្នែកភាពជាដៃគូយុទ្ធសាស្ត្រ និងការអប់រំ',
  'Structured trading education focused on risk, process, and repeatable execution.',
  'ការអប់រំពាណិជ្ជកម្មដែលមានរចនាសម្ព័ន្ធ ផ្តោតលើហានិភ័យ ដំណើរការ និងការប្រតិបត្តិដែលធ្វើម្តងហើយម្តងទៀត។',
  '/Images/mentor2.png',
  0,
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

delete from public.mentor_categories
where mentor_id = (select id from public.mentors where slug = 'bean-ratana')
  and category <> 'forex';

insert into public.mentor_categories (mentor_id, category)
select id, 'forex'
from public.mentors
where slug = 'bean-ratana'
on conflict do nothing;
