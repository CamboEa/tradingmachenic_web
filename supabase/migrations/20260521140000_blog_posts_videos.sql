-- Optional videos on blog posts (YouTube embed or R2 upload).

alter table public.blog_posts add column if not exists videos jsonb not null default '[]'::jsonb;

comment on column public.blog_posts.videos is 'Array of { source: "youtube"|"upload", url, title_en?, title_km? }';
