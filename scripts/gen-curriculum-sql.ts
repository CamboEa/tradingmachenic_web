import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { CURRICULUM_SEED_PHASES } from "../lib/curriculum-seed-source";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function dollarQuote(s: string): string {
  const tag = `c${Math.random().toString(36).slice(2, 10)}`;
  return `$${tag}$${s}$${tag}$`;
}

const PHASE_IDS = [
  "c1000000-0000-4000-8000-000000000001",
  "c2000000-0000-4000-8000-000000000002",
];

const ddl = `-- Curriculum (phases + modules). Idempotent-ish: drop if you need to re-seed.
create table if not exists public.curriculum_phases (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  sort_order integer not null default 0,
  slug text not null unique,
  accent text not null check (accent in ('gold', 'teal')),
  label_en text not null,
  label_km text not null,
  sublabel_en text not null,
  sublabel_km text not null
);

create table if not exists public.curriculum_modules (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  phase_id uuid not null references public.curriculum_phases(id) on delete cascade,
  sort_order integer not null default 0,
  title_en text not null,
  title_km text not null,
  focus_en text not null,
  focus_km text not null,
  activities_en text not null,
  activities_km text not null
);

create index if not exists curriculum_modules_phase_sort_idx
  on public.curriculum_modules(phase_id, sort_order);

alter table public.curriculum_phases enable row level security;
alter table public.curriculum_modules enable row level security;

drop policy if exists "curriculum_phases: public read" on public.curriculum_phases;
create policy "curriculum_phases: public read"
  on public.curriculum_phases for select using (true);

drop policy if exists "curriculum_phases: admin all" on public.curriculum_phases;
create policy "curriculum_phases: admin all"
  on public.curriculum_phases for all using (public.is_admin());

drop policy if exists "curriculum_modules: public read" on public.curriculum_modules;
create policy "curriculum_modules: public read"
  on public.curriculum_modules for select using (true);

drop policy if exists "curriculum_modules: admin all" on public.curriculum_modules;
create policy "curriculum_modules: admin all"
  on public.curriculum_modules for all using (public.is_admin());

`;

let seed = "";

for (let pi = 0; pi < CURRICULUM_SEED_PHASES.length; pi++) {
  const p = CURRICULUM_SEED_PHASES[pi];
  const pid = PHASE_IDS[pi];
  seed += `insert into public.curriculum_phases (id, sort_order, slug, accent, label_en, label_km, sublabel_en, sublabel_km)
values (
  '${pid}'::uuid,
  ${p.sort_order},
  ${dollarQuote(p.slug)},
  ${dollarQuote(p.accent)},
  ${dollarQuote(p.label_en)},
  ${dollarQuote(p.label_km)},
  ${dollarQuote(p.sublabel_en)},
  ${dollarQuote(p.sublabel_km)}
);\n\n`;

  p.weeks.forEach((w, wi) => {
    const actEn = w.activities.en.join("\n");
    const actKm = w.activities.km.join("\n");
    seed += `insert into public.curriculum_modules (phase_id, sort_order, title_en, title_km, focus_en, focus_km, activities_en, activities_km)
values (
  '${pid}'::uuid,
  ${wi},
  ${dollarQuote(w.titles.en)},
  ${dollarQuote(w.titles.km)},
  ${dollarQuote(w.focus.en)},
  ${dollarQuote(w.focus.km)},
  ${dollarQuote(actEn)},
  ${dollarQuote(actKm)}
);\n\n`;
  });
}

const guard = `delete from public.curriculum_modules where phase_id in (
  select id from public.curriculum_phases where slug in ('theory', 'practice')
);
delete from public.curriculum_phases where slug in ('theory', 'practice');

`;

const out = ddl + "-- Seed default curriculum (re-runnable: clears theory/practice then inserts)\n" + guard + seed;

const outPath = path.join(__dirname, "../supabase/migrations/20260515100000_curriculum.sql");
fs.writeFileSync(outPath, out, "utf8");
console.log("Wrote", outPath);
