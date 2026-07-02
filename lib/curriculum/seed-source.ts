import type { CurriculumAccent, CurriculumWeek } from "./curriculum";

/** Snapshot used to generate SQL seed. */
export type CurriculumSeedPhase = {
  slug: string;
  accent: CurriculumAccent;
  sort_order: number;
  label_en: string;
  label_km: string;
  sublabel_en: string;
  sublabel_km: string;
  weeks: CurriculumWeek[];
};

export const CURRICULUM_SEED_PHASES: CurriculumSeedPhase[] = [
  {
    slug: "theory",
    accent: "gold",
    sort_order: 0,
    label_en: "Phase I",
    label_km: "ដំណាក់កាល I",
    sublabel_en: "Theory · 5 modules",
    sublabel_km: "ទ្រឹស្តី · ៥ module",
    weeks: [
      {
        titles: {
          en: "Money Psychology",
          km: "ចិត្តវិទ្យានៃលុយ",
        },
        focus: {
          en: "Understand the emotional forces that drive trading decisions—and how to master them.",
          km: "យល់ដឹងអំពីកម្លាំងអារម្មណ៍ដែលដឹកនាំការសម្រេចចិត្តពាណិជ្ជកម្ម និងរបៀបគ្រប់គ្រងវា។",
        },
        activities: {
          en: [
            "Fear and greed cycles in live markets",
            "Loss aversion and how it distorts decision-making",
            "Building emotional discipline through process rules",
            "Why most traders self-sabotage—and how to stop",
          ],
          km: [
            "វដ្ត fear និង greed ក្នុងទីផ្សារ live",
            "Loss aversion និងរបៀបដែលវាបំបែកការសម្រេចចិត្ត",
            "ការកសាងវិន័យអារម្មណ៍តាមរយៈច្បាប់ដំណើរការ",
            "ហេតុអ្វីបានជា traders ភាគច្រើនបំផ្លាញខ្លួនឯង—និងរបៀបឈប់",
          ],
        },
      },
      {
        titles: {
          en: "Trend Identification",
          km: "ការកំណត់និន្នាការ",
        },
        focus: {
          en: "Read price structure to determine the dominant market direction with confidence.",
          km: "អានរចនាសម្ព័ន្ធតម្លៃ ដើម្បីកំណត់ទិសដៅទីផ្សារដែលលេចធ្លោ ដោយមានទំនុកចិត្ត។",
        },
        activities: {
          en: [
            "Higher highs/higher lows and lower highs/lower lows",
            "Break of Structure (BOS) and Change of Character (CHoCH)",
            "Multi-timeframe trend alignment",
            "Differentiating a trend from a range",
          ],
          km: [
            "Higher highs/higher lows និង lower highs/lower lows",
            "Break of Structure (BOS) និង Change of Character (CHoCH)",
            "ការតម្រឹម trend ពហុ timeframe",
            "ការបែងចែក trend ពី range",
          ],
        },
      },
      {
        titles: {
          en: "Key Level",
          km: "កំរិតសំខាន់",
        },
        focus: {
          en: "Mark the price zones where institutional interest concentrates and price is most likely to react.",
          km: "សម្គាល់តំបន់តម្លៃដែលការចាប់អារម្មណ៍ស្ថាប័នកណ្ដប់ ហើយតម្លៃទំនងជា react បំផុត។",
        },
        activities: {
          en: [
            "Support and resistance identification",
            "Premium and discount zones",
            "Liquidity pools and stop-loss clusters",
            "Drawing levels that matter—not noise",
          ],
          km: [
            "ការកំណត់ support និង resistance",
            "តំបន់ premium និង discount",
            "Liquidity pools និងក្រុម stop-loss",
            "គូរ levels ដែលសំខាន់—មិនមែន noise",
          ],
        },
      },
      {
        titles: {
          en: "Entry Model",
          km: "គំរូចូលទីផ្សារ",
        },
        focus: {
          en: "A repeatable, rules-based framework for timing trade entries with precision.",
          km: "ក្របខ័ណ្ឌដែលធ្វើម្ដងហើយម្ដងទៀត ផ្អែកលើច្បាប់ ដើម្បីចាប់ពេលវេលា entry ដោយភាពត្រឹមត្រូវ។",
        },
        activities: {
          en: [
            "Entry trigger criteria and confirmation patterns",
            "Multi-step entry checklist before every trade",
            "Avoiding premature and late entries",
            "Back-testing your model over historical setups",
          ],
          km: [
            "លក្ខខណ្ឌ trigger entry និងគំរូបញ្ជាក់",
            "Checklist entry ច្រើនជំហានមុនការបញ្ជាទិញ",
            "ការជៀសវាង entry ឆាប់ ឬយឺតពេក",
            "Back-testing model លើ setups ប្រវត្តិ",
          ],
        },
      },
      {
        titles: {
          en: "Risk Management",
          km: "ការគ្រប់គ្រងហានិភ័យ",
        },
        focus: {
          en: "Protect your capital systematically so that every loss is controlled and recoverable.",
          km: "ការពារដើមទុនរបស់អ្នកជាប្រព័ន្ធ ដើម្បីឲ្យការខាតបង់ គ្រប់ครั้ง អាចគ្រប់គ្រង និងស្តារបាន។",
        },
        activities: {
          en: [
            "Risk per trade: the 1–2% rule",
            "Position sizing formula from stop distance",
            "Stop placement logic",
            "Drawdown limits and daily loss caps",
          ],
          km: [
            "ហានិភ័យក្នុងការបញ្ជាទិញ: វិធី 1–2%",
            "រូបមន្ត position sizing ពីចម្ងាយ stop",
            "តក្កវិជ្ជានៃការដាក់ stop",
            "ដែនកំណត់ drawdown និង daily loss caps",
          ],
        },
      },
    ],
  },
  {
    slug: "practice",
    accent: "teal",
    sort_order: 1,
    label_en: "Phase II: Put It All Together",
    label_km: "ដំណាក់កាល II: រួបបញ្ចូលគ្នា",
    sublabel_en: "Put it all together · 4 live modules",
    sublabel_km: "រួបបញ្ចូលគ្នា · ៤ module live",
    weeks: [
      {
        titles: {
          en: "Live Market Analysis",
          km: "ការវិភាគទីផ្សារ Live",
        },
        focus: {
          en: "Apply theory to live charts—identifying structure, key levels, and directional bias in real time.",
          km: "អនុវត្តទ្រឹស្តីលើ chart live—កំណត់រចនាសម្ព័ន្ធ កំរិតសំខាន់ និង bias ទិសដៅក្នុងពេលជាក់ស្ដែង។",
        },
        activities: {
          en: [
            "Daily pre-session analysis routine",
            "Marking bias on higher timeframes before drilling down",
            "Identifying live setups before they trigger",
            "Journaling your analysis and comparing to outcome",
          ],
          km: [
            "ទំលាប់វិភាគ pre-session ប្រចាំថ្ងៃ",
            "សម្គាល់ bias timeframe ខ្ពស់ មុន drill down",
            "កំណត់ setups live មុនពេលវា trigger",
            "កត់ត្រាការវិភាគ ហើយប្រៀបធៀបលទ្ធផល",
          ],
        },
      },
      {
        titles: {
          en: "Live Trade Model Entry",
          km: "ការ Entry ជាក់ស្ដែងតាម Model",
        },
        focus: {
          en: "Execute your entry model on live markets with full discipline—no deviation from the rules.",
          km: "ប្រតិបត្តិ entry model របស់អ្នកក្នុងទីផ្សារ live ដោយវិន័យពេញលេញ—គ្មានការ ចាកចេញពីច្បាប់។",
        },
        activities: {
          en: [
            "Wait for all entry criteria to align before executing",
            "Execute with correct size and stop every time",
            "Record every entry reason immediately after the trade",
            "Review missed and invalid setups at end of session",
          ],
          km: [
            "រង់ចាំ criteria entry ទាំងអស់តម្រឹម មុន execution",
            "ប្រតិបត្តិជាមួយ size និង stop ត្រឹមត្រូវគ្រប់ครั้ง",
            "កត់ហេតុផល entry ភ្លាមៗ បន្ទាប់ពីការបញ្ជាទិញ",
            "ពិនិត្យ setups ដែលខកខាន ឬ invalid នៅចុង session",
          ],
        },
      },
      {
        titles: {
          en: "Live Apply on Risk Management",
          km: "ការអនុវត្ត Risk Management ជាក់ស្ដែង",
        },
        focus: {
          en: "Apply your risk framework under live conditions where emotions are real and capital is on the line.",
          km: "អនុវត្តក្របខ័ណ្ឌហានិភ័យ ក្នុងស្ថានភាព live ដែលអារម្មណ៍ពិតប្រាកដ និងដើមទុនកំពុងស្ថិតក្នុងហានិភ័យ។",
        },
        activities: {
          en: [
            "Size every live trade by formula—never by feel",
            "Enforce your daily loss limit without exception",
            "Manage account heat through a drawdown",
            "Reduce size after consecutive losses and rebuild gradually",
          ],
          km: [
            " កំណត់ size ការបញ្ជាទិញ live ដោយរូបមន្ត—មិនមែនតាមអារម្មណ៍",
            "អនុវត្ត daily loss limit ដោយគ្មានករណីលើកលែង",
            "គ្រប់គ្រង account heat ពេល drawdown",
            " កាត់ size ក្រោយ losses ជាបន្ត ហើយ rebuild បន្តិចម្ដង",
          ],
        },
      },
      {
        titles: {
          en: "Live Apply on Trade Management",
          km: "ការអនុវត្ត Trade Management ជាក់ស្ដែង",
        },
        focus: {
          en: "Manage open positions with discipline—protect profits and cut losses at the right moment.",
          km: "គ្រប់គ្រង positions ដែលបើក ដោយវិន័យ—ការពារប្រាក់ចំណេញ និងកាត់ការខាតបង់នៅពេលត្រឹមត្រូវ។",
        },
        activities: {
          en: [
            "Break-even and trailing stop rules",
            "Avoiding premature exits on winning trades",
            "Partial take-profit strategies",
            "Post-trade review: what you managed well and what you did not",
          ],
          km: [
            "ច្បាប់ break-even និង trailing stop",
            "ជៀសវាង exit ឆាប់ពេកលើការបញ្ជាទិញ winner",
            "Strategy partial take-profit",
            "ការពិនិត្យ post-trade: អ្វីដែលគ្រប់គ្រងបានល្អ និងអ្វីដែលមិនបាន",
          ],
        },
      },
    ],
  },
];
