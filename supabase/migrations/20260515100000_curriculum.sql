-- Curriculum (phases + modules). Idempotent-ish: drop if you need to re-seed.
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

-- Seed default curriculum (re-runnable: clears theory/practice then inserts)
delete from public.curriculum_modules where phase_id in (
  select id from public.curriculum_phases where slug in ('theory', 'practice')
);
delete from public.curriculum_phases where slug in ('theory', 'practice');

insert into public.curriculum_phases (id, sort_order, slug, accent, label_en, label_km, sublabel_en, sublabel_km)
values (
  'c1000000-0000-4000-8000-000000000001'::uuid,
  0,
  $c8yl808rv$theory$c8yl808rv$,
  $c9ma8i3be$gold$c9ma8i3be$,
  $ch4bmp5mo$Phase I$ch4bmp5mo$,
  $csmvk1y5p$ដំណាក់កាល I$csmvk1y5p$,
  $cevwfih3n$Theory · 5 modules$cevwfih3n$,
  $c3ih7f72c$ទ្រឹស្តី · ៥ module$c3ih7f72c$
);

insert into public.curriculum_modules (phase_id, sort_order, title_en, title_km, focus_en, focus_km, activities_en, activities_km)
values (
  'c1000000-0000-4000-8000-000000000001'::uuid,
  0,
  $cvoovhr7z$Money Psychology$cvoovhr7z$,
  $cncu9cshb$ចិត្តវិទ្យានៃលុយ$cncu9cshb$,
  $crgl8jwtx$Understand the emotional forces that drive trading decisions—and how to master them.$crgl8jwtx$,
  $c6nzgg85z$យល់ដឹងអំពីកម្លាំងអារម្មណ៍ដែលដឹកនាំការសម្រេចចិត្តពាណិជ្ជកម្ម និងរបៀបគ្រប់គ្រងវា។$c6nzgg85z$,
  $c2jxpdu1m$Fear and greed cycles in live markets
Loss aversion and how it distorts decision-making
Building emotional discipline through process rules
Why most traders self-sabotage—and how to stop$c2jxpdu1m$,
  $c2cl29y5h$វដ្ត fear និង greed ក្នុងទីផ្សារ live
Loss aversion និងរបៀបដែលវាបំបែកការសម្រេចចិត្ត
ការកសាងវិន័យអារម្មណ៍តាមរយៈច្បាប់ដំណើរការ
ហេតុអ្វីបានជា traders ភាគច្រើនបំផ្លាញខ្លួនឯង—និងរបៀបឈប់$c2cl29y5h$
);

insert into public.curriculum_modules (phase_id, sort_order, title_en, title_km, focus_en, focus_km, activities_en, activities_km)
values (
  'c1000000-0000-4000-8000-000000000001'::uuid,
  1,
  $clmqvmy2r$Trend Identification$clmqvmy2r$,
  $c1cll51ry$ការកំណត់និន្នាការ$c1cll51ry$,
  $cd4fqxod4$Read price structure to determine the dominant market direction with confidence.$cd4fqxod4$,
  $c1f510y7r$អានរចនាសម្ព័ន្ធតម្លៃ ដើម្បីកំណត់ទិសដៅទីផ្សារដែលលេចធ្លោ ដោយមានទំនុកចិត្ត។$c1f510y7r$,
  $cozhnla1k$Higher highs/higher lows and lower highs/lower lows
Break of Structure (BOS) and Change of Character (CHoCH)
Multi-timeframe trend alignment
Differentiating a trend from a range$cozhnla1k$,
  $cywdc4i9h$Higher highs/higher lows និង lower highs/lower lows
Break of Structure (BOS) និង Change of Character (CHoCH)
ការតម្រឹម trend ពហុ timeframe
ការបែងចែក trend ពី range$cywdc4i9h$
);

insert into public.curriculum_modules (phase_id, sort_order, title_en, title_km, focus_en, focus_km, activities_en, activities_km)
values (
  'c1000000-0000-4000-8000-000000000001'::uuid,
  2,
  $cydfbj0w7$Key Level$cydfbj0w7$,
  $cp35ubr5t$កំរិតសំខាន់$cp35ubr5t$,
  $cczo88c3o$Mark the price zones where institutional interest concentrates and price is most likely to react.$cczo88c3o$,
  $cgdc7dh0h$សម្គាល់តំបន់តម្លៃដែលការចាប់អារម្មណ៍ស្ថាប័នកណ្ដប់ ហើយតម្លៃទំនងជា react បំផុត។$cgdc7dh0h$,
  $cilyg12b7$Support and resistance identification
Premium and discount zones
Liquidity pools and stop-loss clusters
Drawing levels that matter—not noise$cilyg12b7$,
  $cxp0wc5pc$ការកំណត់ support និង resistance
តំបន់ premium និង discount
Liquidity pools និងក្រុម stop-loss
គូរ levels ដែលសំខាន់—មិនមែន noise$cxp0wc5pc$
);

insert into public.curriculum_modules (phase_id, sort_order, title_en, title_km, focus_en, focus_km, activities_en, activities_km)
values (
  'c1000000-0000-4000-8000-000000000001'::uuid,
  3,
  $c0nybaswo$Entry Model$c0nybaswo$,
  $c3pfbtjwy$គំរូចូលទីផ្សារ$c3pfbtjwy$,
  $cx2nezziw$A repeatable, rules-based framework for timing trade entries with precision.$cx2nezziw$,
  $cz71h2tp6$ក្របខ័ណ្ឌដែលធ្វើម្ដងហើយម្ដងទៀត ផ្អែកលើច្បាប់ ដើម្បីចាប់ពេលវេលា entry ដោយភាពត្រឹមត្រូវ។$cz71h2tp6$,
  $cjo3ydv4b$Entry trigger criteria and confirmation patterns
Multi-step entry checklist before every trade
Avoiding premature and late entries
Back-testing your model over historical setups$cjo3ydv4b$,
  $cbygnujhv$លក្ខខណ្ឌ trigger entry និងគំរូបញ្ជាក់
Checklist entry ច្រើនជំហានមុនការបញ្ជាទិញ
ការជៀសវាង entry ឆាប់ ឬយឺតពេក
Back-testing model លើ setups ប្រវត្តិ$cbygnujhv$
);

insert into public.curriculum_modules (phase_id, sort_order, title_en, title_km, focus_en, focus_km, activities_en, activities_km)
values (
  'c1000000-0000-4000-8000-000000000001'::uuid,
  4,
  $c8jp0qr6u$Risk Management$c8jp0qr6u$,
  $cfe3pjv6a$ការគ្រប់គ្រងហានិភ័យ$cfe3pjv6a$,
  $cahauj772$Protect your capital systematically so that every loss is controlled and recoverable.$cahauj772$,
  $chal9xjeo$ការពារដើមទុនរបស់អ្នកជាប្រព័ន្ធ ដើម្បីឲ្យការខាតបង់ គ្រប់ครั้ง អាចគ្រប់គ្រង និងស្តារបាន។$chal9xjeo$,
  $c8db2u7wz$Risk per trade: the 1–2% rule
Position sizing formula from stop distance
Stop placement logic
Drawdown limits and daily loss caps$c8db2u7wz$,
  $c8v8ej4n3$ហានិភ័យក្នុងការបញ្ជាទិញ: វិធី 1–2%
រូបមន្ត position sizing ពីចម្ងាយ stop
តក្កវិជ្ជានៃការដាក់ stop
ដែនកំណត់ drawdown និង daily loss caps$c8v8ej4n3$
);

insert into public.curriculum_phases (id, sort_order, slug, accent, label_en, label_km, sublabel_en, sublabel_km)
values (
  'c2000000-0000-4000-8000-000000000002'::uuid,
  1,
  $c645a15jb$practice$c645a15jb$,
  $cwf0bftxb$teal$cwf0bftxb$,
  $cobifmx3w$Phase II: Put It All Together$cobifmx3w$,
  $c442ahw64$ដំណាក់កាល II: រួបបញ្ចូលគ្នា$c442ahw64$,
  $co6j03g4c$Put it all together · 4 live modules$co6j03g4c$,
  $coyi2z04q$រួបបញ្ចូលគ្នា · ៤ module live$coyi2z04q$
);

insert into public.curriculum_modules (phase_id, sort_order, title_en, title_km, focus_en, focus_km, activities_en, activities_km)
values (
  'c2000000-0000-4000-8000-000000000002'::uuid,
  0,
  $c2dr0yaf6$Live Market Analysis$c2dr0yaf6$,
  $c0v6x4iol$ការវិភាគទីផ្សារ Live$c0v6x4iol$,
  $ci81lh60n$Apply theory to live charts—identifying structure, key levels, and directional bias in real time.$ci81lh60n$,
  $cc69oe5uk$អនុវត្តទ្រឹស្តីលើ chart live—កំណត់រចនាសម្ព័ន្ធ កំរិតសំខាន់ និង bias ទិសដៅក្នុងពេលជាក់ស្ដែង។$cc69oe5uk$,
  $cy049k4j9$Daily pre-session analysis routine
Marking bias on higher timeframes before drilling down
Identifying live setups before they trigger
Journaling your analysis and comparing to outcome$cy049k4j9$,
  $c20zofb76$ទំលាប់វិភាគ pre-session ប្រចាំថ្ងៃ
សម្គាល់ bias timeframe ខ្ពស់ មុន drill down
កំណត់ setups live មុនពេលវា trigger
កត់ត្រាការវិភាគ ហើយប្រៀបធៀបលទ្ធផល$c20zofb76$
);

insert into public.curriculum_modules (phase_id, sort_order, title_en, title_km, focus_en, focus_km, activities_en, activities_km)
values (
  'c2000000-0000-4000-8000-000000000002'::uuid,
  1,
  $cctjdrsyn$Live Trade Model Entry$cctjdrsyn$,
  $cl77i5mg2$ការ Entry ជាក់ស្ដែងតាម Model$cl77i5mg2$,
  $ctk8ruypx$Execute your entry model on live markets with full discipline—no deviation from the rules.$ctk8ruypx$,
  $c1a6qrvcg$ប្រតិបត្តិ entry model របស់អ្នកក្នុងទីផ្សារ live ដោយវិន័យពេញលេញ—គ្មានការ ចាកចេញពីច្បាប់។$c1a6qrvcg$,
  $cvck1ujew$Wait for all entry criteria to align before executing
Execute with correct size and stop every time
Record every entry reason immediately after the trade
Review missed and invalid setups at end of session$cvck1ujew$,
  $cqpthefns$រង់ចាំ criteria entry ទាំងអស់តម្រឹម មុន execution
ប្រតិបត្តិជាមួយ size និង stop ត្រឹមត្រូវគ្រប់ครั้ง
កត់ហេតុផល entry ភ្លាមៗ បន្ទាប់ពីការបញ្ជាទិញ
ពិនិត្យ setups ដែលខកខាន ឬ invalid នៅចុង session$cqpthefns$
);

insert into public.curriculum_modules (phase_id, sort_order, title_en, title_km, focus_en, focus_km, activities_en, activities_km)
values (
  'c2000000-0000-4000-8000-000000000002'::uuid,
  2,
  $c6447t384$Live Apply on Risk Management$c6447t384$,
  $cbgic4s7w$ការអនុវត្ត Risk Management ជាក់ស្ដែង$cbgic4s7w$,
  $c1dr4ezq5$Apply your risk framework under live conditions where emotions are real and capital is on the line.$c1dr4ezq5$,
  $czi8okizj$អនុវត្តក្របខ័ណ្ឌហានិភ័យ ក្នុងស្ថានភាព live ដែលអារម្មណ៍ពិតប្រាកដ និងដើមទុនកំពុងស្ថិតក្នុងហានិភ័យ។$czi8okizj$,
  $cak28wakj$Size every live trade by formula—never by feel
Enforce your daily loss limit without exception
Manage account heat through a drawdown
Reduce size after consecutive losses and rebuild gradually$cak28wakj$,
  $c84c0mgzf$ កំណត់ size ការបញ្ជាទិញ live ដោយរូបមន្ត—មិនមែនតាមអារម្មណ៍
អនុវត្ត daily loss limit ដោយគ្មានករណីលើកលែង
គ្រប់គ្រង account heat ពេល drawdown
 កាត់ size ក្រោយ losses ជាបន្ត ហើយ rebuild បន្តិចម្ដង$c84c0mgzf$
);

insert into public.curriculum_modules (phase_id, sort_order, title_en, title_km, focus_en, focus_km, activities_en, activities_km)
values (
  'c2000000-0000-4000-8000-000000000002'::uuid,
  3,
  $cyjocf7ej$Live Apply on Trade Management$cyjocf7ej$,
  $cj4esxgok$ការអនុវត្ត Trade Management ជាក់ស្ដែង$cj4esxgok$,
  $caz6z42gv$Manage open positions with discipline—protect profits and cut losses at the right moment.$caz6z42gv$,
  $c5180oj21$គ្រប់គ្រង positions ដែលបើក ដោយវិន័យ—ការពារប្រាក់ចំណេញ និងកាត់ការខាតបង់នៅពេលត្រឹមត្រូវ។$c5180oj21$,
  $c49jabsd8$Break-even and trailing stop rules
Avoiding premature exits on winning trades
Partial take-profit strategies
Post-trade review: what you managed well and what you did not$c49jabsd8$,
  $com4bwbj1$ច្បាប់ break-even និង trailing stop
ជៀសវាង exit ឆាប់ពេកលើការបញ្ជាទិញ winner
Strategy partial take-profit
ការពិនិត្យ post-trade: អ្វីដែលគ្រប់គ្រងបានល្អ និងអ្វីដែលមិនបាន$com4bwbj1$
);

