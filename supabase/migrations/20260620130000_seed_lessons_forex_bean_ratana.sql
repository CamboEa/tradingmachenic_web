-- Assign all existing lessons to Forex / Bean Ratana
update public.lessons
set
  mentor_slug = 'bean-ratana',
  category = 'forex'
where mentor_slug is distinct from 'bean-ratana'
   or category is distinct from 'forex'
   or mentor_slug is null
   or category is null;
