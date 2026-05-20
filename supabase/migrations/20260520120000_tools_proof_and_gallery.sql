-- Proof of testing (EN/KM) and image gallery with descriptions per image.
alter table public.tools add column if not exists proof_of_testing_en text;
alter table public.tools add column if not exists proof_of_testing_km text;
alter table public.tools add column if not exists gallery jsonb not null default '[]'::jsonb;

comment on column public.tools.proof_of_testing_en is 'Backtesting / forward-test notes shown on the public tool page (English).';
comment on column public.tools.proof_of_testing_km is 'Backtesting / forward-test notes (Khmer).';
comment on column public.tools.gallery is 'Array of { image_url, description_en?, description_km? } for screenshots and proof images.';
