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
  $cjwhoygsa$theory$cjwhoygsa$,
  $c8ln922tf$gold$c8ln922tf$,
  $ca2zysrmq$Phase I$ca2zysrmq$,
  $c20f75i28$ដំណាក់កាល I$c20f75i28$,
  $cllhon6fo$Theory · 5 modules$cllhon6fo$,
  $c8fhbqp8z$ទ្រឹស្តី · ៥ module$c8fhbqp8z$
);

insert into public.curriculum_modules (phase_id, sort_order, title_en, title_km, focus_en, focus_km, activities_en, activities_km)
values (
  'c1000000-0000-4000-8000-000000000001'::uuid,
  0,
  $cpy8ff169$Money Psychology$cpy8ff169$,
  $c82qjiviz$ចិត្តវិទ្យានៃលុយ$c82qjiviz$,
  $chy4svbqq$Understand the emotional forces that drive trading decisions—and how to master them.$chy4svbqq$,
  $cse7ji5t1$យល់ដឹងអំពីកម្លាំងអារម្មណ៍ដែលដឹកនាំការសម្រេចចិត្តពាណិជ្ជកម្ម និងរបៀបគ្រប់គ្រងវា។$cse7ji5t1$,
  $cfje3nbcm$Fear and greed cycles in live markets
Loss aversion and how it distorts decision-making
Building emotional discipline through process rules
Why most traders self-sabotage—and how to stop$cfje3nbcm$,
  $cmg3jnwy8$វដ្ត fear និង greed ក្នុងទីផ្សារ live
Loss aversion និងរបៀបដែលវាបំបែកការសម្រេចចិត្ត
ការកសាងវិន័យអារម្មណ៍តាមរយៈច្បាប់ដំណើរការ
ហេតុអ្វីបានជា traders ភាគច្រើនបំផ្លាញខ្លួនឯង—និងរបៀបឈប់$cmg3jnwy8$
);

insert into public.curriculum_modules (phase_id, sort_order, title_en, title_km, focus_en, focus_km, activities_en, activities_km)
values (
  'c1000000-0000-4000-8000-000000000001'::uuid,
  1,
  $cn8n6t960$Trend Identification$cn8n6t960$,
  $c232ideds$ការកំណត់និន្នាការ$c232ideds$,
  $cr20jfgwd$Read price structure to determine the dominant market direction with confidence.$cr20jfgwd$,
  $clf93fh0e$អានរចនាសម្ព័ន្ធតម្លៃ ដើម្បីកំណត់ទិសដៅទីផ្សារដែលលេចធ្លោ ដោយមានទំនុកចិត្ត។$clf93fh0e$,
  $cg6xwxpx8$Higher highs/higher lows and lower highs/lower lows
Break of Structure (BOS) and Change of Character (CHoCH)
Multi-timeframe trend alignment
Differentiating a trend from a range$cg6xwxpx8$,
  $chwyyad7y$Higher highs/higher lows និង lower highs/lower lows
Break of Structure (BOS) និង Change of Character (CHoCH)
ការតម្រឹម trend ពហុ timeframe
ការបែងចែក trend ពី range$chwyyad7y$
);

insert into public.curriculum_modules (phase_id, sort_order, title_en, title_km, focus_en, focus_km, activities_en, activities_km)
values (
  'c1000000-0000-4000-8000-000000000001'::uuid,
  2,
  $cleyxgqd3$Key Level$cleyxgqd3$,
  $cnmoabey0$កំរិតសំខាន់$cnmoabey0$,
  $cndsveifx$Mark the price zones where institutional interest concentrates and price is most likely to react.$cndsveifx$,
  $cepi19lz7$សម្គាល់តំបន់តម្លៃដែលការចាប់អារម្មណ៍ស្ថាប័នកណ្ដប់ ហើយតម្លៃទំនងជា react បំផុត។$cepi19lz7$,
  $cftvacbw4$Support and resistance identification
Premium and discount zones
Liquidity pools and stop-loss clusters
Drawing levels that matter—not noise$cftvacbw4$,
  $cli0t408x$ការកំណត់ support និង resistance
តំបន់ premium និង discount
Liquidity pools និងក្រុម stop-loss
គូរ levels ដែលសំខាន់—មិនមែន noise$cli0t408x$
);

insert into public.curriculum_modules (phase_id, sort_order, title_en, title_km, focus_en, focus_km, activities_en, activities_km)
values (
  'c1000000-0000-4000-8000-000000000001'::uuid,
  3,
  $ccnxhdvgf$Entry Model$ccnxhdvgf$,
  $ck63ptqws$គំរូចូលទីផ្សារ$ck63ptqws$,
  $csf2thje7$A repeatable, rules-based framework for timing trade entries with precision.$csf2thje7$,
  $co6smuk0f$ក្របខ័ណ្ឌដែលធ្វើម្ដងហើយម្ដងទៀត ផ្អែកលើច្បាប់ ដើម្បីចាប់ពេលវេលា entry ដោយភាពត្រឹមត្រូវ។$co6smuk0f$,
  $c9bjrb5cv$Entry trigger criteria and confirmation patterns
Multi-step entry checklist before every trade
Avoiding premature and late entries
Back-testing your model over historical setups$c9bjrb5cv$,
  $czbcyllbe$លក្ខខណ្ឌ trigger entry និងគំរូបញ្ជាក់
Checklist entry ច្រើនជំហានមុនការបញ្ជាទិញ
ការជៀសវាង entry ឆាប់ ឬយឺតពេក
Back-testing model លើ setups ប្រវត្តិ$czbcyllbe$
);

insert into public.curriculum_modules (phase_id, sort_order, title_en, title_km, focus_en, focus_km, activities_en, activities_km)
values (
  'c1000000-0000-4000-8000-000000000001'::uuid,
  4,
  $cvb9a0xb1$Risk Management$cvb9a0xb1$,
  $cd3k06i39$ការគ្រប់គ្រងហានិភ័យ$cd3k06i39$,
  $cin48zx96$Protect your capital systematically so that every loss is controlled and recoverable.$cin48zx96$,
  $cdhfk2p3k$ការពារដើមទុនរបស់អ្នកជាប្រព័ន្ធ ដើម្បីឲ្យការខាតបង់ គ្រប់ครั้ง អាចគ្រប់គ្រង និងស្តារបាន។$cdhfk2p3k$,
  $cwef0ms3s$Risk per trade: the 1–2% rule
Position sizing formula from stop distance
Stop placement logic
Drawdown limits and daily loss caps$cwef0ms3s$,
  $cfxjbif60$ហានិភ័យក្នុងការបញ្ជាទិញ: វិធី 1–2%
រូបមន្ត position sizing ពីចម្ងាយ stop
តក្កវិជ្ជានៃការដាក់ stop
ដែនកំណត់ drawdown និង daily loss caps$cfxjbif60$
);

insert into public.curriculum_phases (id, sort_order, slug, accent, label_en, label_km, sublabel_en, sublabel_km)
values (
  'c2000000-0000-4000-8000-000000000002'::uuid,
  1,
  $cddq1pe0e$practice$cddq1pe0e$,
  $co6px9dth$teal$co6px9dth$,
  $c0slpljsw$Phase II: Put It All Together$c0slpljsw$,
  $c1j1kl5at$ដំណាក់កាល II: រួបបញ្ចូលគ្នា$c1j1kl5at$,
  $cy00j6ccy$Put it all together · 4 live modules$cy00j6ccy$,
  $ch2eplm15$រួបបញ្ចូលគ្នា · ៤ module live$ch2eplm15$
);

insert into public.curriculum_modules (phase_id, sort_order, title_en, title_km, focus_en, focus_km, activities_en, activities_km)
values (
  'c2000000-0000-4000-8000-000000000002'::uuid,
  0,
  $c99p74wcc$Live Market Analysis$c99p74wcc$,
  $cfdb41y8b$ការវិភាគទីផ្សារ Live$cfdb41y8b$,
  $cvvxjbpqp$Apply theory to live charts—identifying structure, key levels, and directional bias in real time.$cvvxjbpqp$,
  $c7qou42l3$អនុវត្តទ្រឹស្តីលើ chart live—កំណត់រចនាសម្ព័ន្ធ កំរិតសំខាន់ និង bias ទិសដៅក្នុងពេលជាក់ស្ដែង។$c7qou42l3$,
  $cj3w0kkr3$Daily pre-session analysis routine
Marking bias on higher timeframes before drilling down
Identifying live setups before they trigger
Journaling your analysis and comparing to outcome$cj3w0kkr3$,
  $ccrqu7f3m$ទំលាប់វិភាគ pre-session ប្រចាំថ្ងៃ
សម្គាល់ bias timeframe ខ្ពស់ មុន drill down
កំណត់ setups live មុនពេលវា trigger
កត់ត្រាការវិភាគ ហើយប្រៀបធៀបលទ្ធផល$ccrqu7f3m$
);

insert into public.curriculum_modules (phase_id, sort_order, title_en, title_km, focus_en, focus_km, activities_en, activities_km)
values (
  'c2000000-0000-4000-8000-000000000002'::uuid,
  1,
  $c9qha849j$Live Trade Model Entry$c9qha849j$,
  $cfwkyg2bo$ការ Entry ជាក់ស្ដែងតាម Model$cfwkyg2bo$,
  $c0ila7vg7$Execute your entry model on live markets with full discipline—no deviation from the rules.$c0ila7vg7$,
  $cfc0rj2rx$ប្រតិបត្តិ entry model របស់អ្នកក្នុងទីផ្សារ live ដោយវិន័យពេញលេញ—គ្មានការ ចាកចេញពីច្បាប់។$cfc0rj2rx$,
  $c4xdr580v$Wait for all entry criteria to align before executing
Execute with correct size and stop every time
Record every entry reason immediately after the trade
Review missed and invalid setups at end of session$c4xdr580v$,
  $cfvt4oft4$រង់ចាំ criteria entry ទាំងអស់តម្រឹម មុន execution
ប្រតិបត្តិជាមួយ size និង stop ត្រឹមត្រូវគ្រប់ครั้ง
កត់ហេតុផល entry ភ្លាមៗ បន្ទាប់ពីការបញ្ជាទិញ
ពិនិត្យ setups ដែលខកខាន ឬ invalid នៅចុង session$cfvt4oft4$
);

insert into public.curriculum_modules (phase_id, sort_order, title_en, title_km, focus_en, focus_km, activities_en, activities_km)
values (
  'c2000000-0000-4000-8000-000000000002'::uuid,
  2,
  $c0dtva18j$Live Apply on Risk Management$c0dtva18j$,
  $cmy4nc8mm$ការអនុវត្ត Risk Management ជាក់ស្ដែង$cmy4nc8mm$,
  $c6f833hvk$Apply your risk framework under live conditions where emotions are real and capital is on the line.$c6f833hvk$,
  $cll299uae$អនុវត្តក្របខ័ណ្ឌហានិភ័យ ក្នុងស្ថានភាព live ដែលអារម្មណ៍ពិតប្រាកដ និងដើមទុនកំពុងស្ថិតក្នុងហានិភ័យ។$cll299uae$,
  $cev854m9h$Size every live trade by formula—never by feel
Enforce your daily loss limit without exception
Manage account heat through a drawdown
Reduce size after consecutive losses and rebuild gradually$cev854m9h$,
  $c6l4r72a4$ កំណត់ size ការបញ្ជាទិញ live ដោយរូបមន្ត—មិនមែនតាមអារម្មណ៍
អនុវត្ត daily loss limit ដោយគ្មានករណីលើកលែង
គ្រប់គ្រង account heat ពេល drawdown
 កាត់ size ក្រោយ losses ជាបន្ត ហើយ rebuild បន្តិចម្ដង$c6l4r72a4$
);

insert into public.curriculum_modules (phase_id, sort_order, title_en, title_km, focus_en, focus_km, activities_en, activities_km)
values (
  'c2000000-0000-4000-8000-000000000002'::uuid,
  3,
  $crebtncs7$Live Apply on Trade Management$crebtncs7$,
  $cwpncelww$ការអនុវត្ត Trade Management ជាក់ស្ដែង$cwpncelww$,
  $cxa2jt57k$Manage open positions with discipline—protect profits and cut losses at the right moment.$cxa2jt57k$,
  $cylpzanjc$គ្រប់គ្រង positions ដែលបើក ដោយវិន័យ—ការពារប្រាក់ចំណេញ និងកាត់ការខាតបង់នៅពេលត្រឹមត្រូវ។$cylpzanjc$,
  $cxe8ntwv0$Break-even and trailing stop rules
Avoiding premature exits on winning trades
Partial take-profit strategies
Post-trade review: what you managed well and what you did not$cxe8ntwv0$,
  $c6582g8gj$ច្បាប់ break-even និង trailing stop
ជៀសវាង exit ឆាប់ពេកលើការបញ្ជាទិញ winner
Strategy partial take-profit
ការពិនិត្យ post-trade: អ្វីដែលគ្រប់គ្រងបានល្អ និងអ្វីដែលមិនបាន$c6582g8gj$
);

