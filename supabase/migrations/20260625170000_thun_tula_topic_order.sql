-- Align Thun Tula topic order with YouTube playlist grouping
update public.lesson_topics
set sort_order = case slug
  when 'csnr' then 1
  when 'crt' then 2
  when 'ict' then 3
  when 'lecture-series' then 4
  when 'execution' then 5
  when 'general' then 6
  else sort_order
end
where mentor_slug = 'thun-tula-ft';
