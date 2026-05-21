-- Market insights / lesson blog posts (bilingual articles).

create table if not exists public.blog_posts (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  slug text not null unique,
  title_en text not null,
  title_km text not null,
  excerpt_en text,
  excerpt_km text,
  body_en text not null default '',
  body_km text not null default '',
  featured_image_url text,
  published_at timestamptz default now() not null,
  status text not null default 'draft'
    check (status in ('draft', 'published'))
);

create index if not exists blog_posts_status_published_idx
  on public.blog_posts (status, published_at desc, created_at desc);

alter table public.blog_posts enable row level security;

create policy "blog_posts: public read published"
  on public.blog_posts for select
  using (status = 'published');

create policy "blog_posts: admin all"
  on public.blog_posts for all
  using (public.is_admin());
