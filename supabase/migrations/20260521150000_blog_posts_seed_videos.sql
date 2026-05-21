-- Attach sample YouTube videos to seeded blog posts (safe to re-run).

update public.blog_posts
set
  videos = $videos$
[
  {
    "source": "youtube",
    "url": "https://www.youtube-nocookie.com/embed/668nUCeBHyY?rel=0",
    "title_en": "Macro desk: oil shocks and inflation repricing",
    "title_km": "តុល្យភាពម៉ាក្រូ៖ រង្គ្រាលប្រេង និងការវាយតម្លៃអតិផរណាឡើងវិញ"
  },
  {
    "source": "youtube",
    "url": "https://www.youtube-nocookie.com/embed/scEDHsr3APg?rel=0",
    "title_en": "How yields and the dollar interact with gold",
    "title_km": "ទិន្នផល ដុល្លារ និងមាសដំណើរការរួមគ្នាយ៉ាងដូចម្តេច"
  }
]
$videos$::jsonb,
  updated_at = now()
where slug = 'market-daily-dose-oil-volatility-and-rate-expectations';

update public.blog_posts
set
  videos = $videos$
[
  {
    "source": "youtube",
    "url": "https://www.youtube-nocookie.com/embed/scEDHsr3APg?rel=0",
    "title_en": "Position sizing when ranges expand",
    "title_km": "កំណត់ទំហំលុយពេលជួរប្រចាំថ្ងៃធំជាង"
  }
]
$videos$::jsonb,
  updated_at = now()
where slug = 'discipline-under-volatility-position-sizing-checklist';

update public.blog_posts
set
  videos = $videos$
[
  {
    "source": "youtube",
    "url": "https://www.youtube-nocookie.com/embed/668nUCeBHyY?rel=0",
    "title_en": "London open: structure and liquidity on XAU/USD",
    "title_km": "ការបើកឡុងដ្ឋាន៖ រចនាសម្ព័ន្ធ និងសារធារណៈរឹមរឹលលើ XAU/USD"
  },
  {
    "source": "youtube",
    "url": "https://www.youtube-nocookie.com/embed/scEDHsr3APg?rel=0",
    "title_en": "New York handoff: data, traps, and confirmation",
    "title_km": "ការផ្ទេរញូវយ៉ក៖ ទិន្នន័យ ជំទាប់ និងការបញ្ជាក់"
  }
]
$videos$::jsonb,
  updated_at = now()
where slug = 'xauusd-session-playbook-london-new-york-handoff';
