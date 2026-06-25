import type { Locale } from "./i18n";
import type { EducationCategory } from "./education-categories";
import { extractYouTubeVideoId, youtubeThumbnailUrl } from "./youtube";

export type LessonVideo = {
  /** Public embed URL, e.g. YouTube embed link */
  embedUrl: string;
  /** Optional heading shown above this embed */
  titles?: Record<Locale, string>;
};

export type Lesson = {
  slug: string;
  approximateMinutes: number;
  videos: LessonVideo[];
  /** Cover image for course listing cards (falls back to first video thumbnail when empty) */
  thumbnailUrl: string;
  titles: Record<Locale, string>;
  summaries: Record<Locale, string>;
  objectives: Record<Locale, string[]>;
  type?: "free" | "paid";
  mentorSlug?: string;
  category?: EducationCategory;
  /** Set when loaded from admin (draft lessons are hidden on the public site). */
  status?: "draft" | "published";
};

export function youtubeThumbnailFromEmbed(embedUrl: string): string | null {
  const id = extractYouTubeVideoId(embedUrl);
  if (id) return youtubeThumbnailUrl(id);
  return null;
}

export function getLessonThumbnailSrc(lesson: Lesson): string {
  const first = lesson.videos[0]?.embedUrl;
  const fromEmbed = first ? youtubeThumbnailFromEmbed(first) : null;
  return lesson.thumbnailUrl || fromEmbed || "";
}

export function lessonVideoCount(lesson: Lesson): number {
  return lesson.videos.length;
}

/** Replace per lesson with your hosted file or streaming embed URLs */
const sampleEmbedA = "https://www.youtube.com/embed/668nUCeBHyY";
const sampleEmbedB = "https://www.youtube.com/embed/scEDHsr3APg";

const thumbMarket =
  "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=960&q=80";
const thumbRisk =
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=960&q=80";
const thumbJournal =
  "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=960&q=80";

export const lessons: Lesson[] = [
  {
    slug: "markets-and-participants",
    approximateMinutes: 14,
    videos: [
      {
        embedUrl: sampleEmbedA,
        titles: {
          en: "Part 1 — Flow and roles",
          km: "ផ្នែក ១ — លំហូរ និងតួនាទី",
        },
      },
      {
        embedUrl: sampleEmbedB,
        titles: {
          en: "Part 2 — Liquidity and spread",
          km: "ផ្នែក ២ — សារធារណៈរឹមរឹល និង spread",
        },
      },
    ],
    thumbnailUrl: thumbMarket,
    titles: {
      en: "Markets and participants",
      km: "ទីផ្សារ និងអ្នកពាក់ព័ន្ធ",
    },
    summaries: {
      en: "How orders flow, who provides liquidity, and what moves prices at a high level.",
      km: "របៀបនៃការបញ្ជាទិញ អ្នកផ្តល់សារធារណៈរឹមរឹល និងកត្តាដែលរវល់តម្លៃកំរិតទូទៅ។",
    },
    objectives: {
      en: [
        "Name core market roles (maker/taker, broker).",
        "Explain bid/ask and spread in one sentence.",
      ],
      km: [
        "ហៅឈ្មោះតួនាទីសំខាន់ៗនៅក្នុងទីផ្សារ។",
        "ពន្យល់ bid/ask និង spread ក្នុងមួយប្រយោគ។",
      ],
    },
  },
  {
    slug: "risk-and-position-sizing",
    approximateMinutes: 18,
    videos: [
      {
        embedUrl: sampleEmbedB,
        titles: {
          en: "Part 1 — Risk per trade",
          km: "ផ្នែក ១ — ហានិភ័យក្នុងមួយប្រតិបត្តិការ",
        },
      },
      {
        embedUrl: sampleEmbedA,
        titles: {
          en: "Part 2 — Sizing from stops",
          km: "ផ្នែក ២ — ទំហំលុយពីចម្ងាយ stop",
        },
      },
      {
        embedUrl: sampleEmbedB,
        titles: {
          en: "Part 3 — Account heat checklist",
          km: "ផ្នែក ៣ — បញ្ជីត្រួតពិនិត្យកម្តៅគណនី",
        },
      },
    ],
    thumbnailUrl: thumbRisk,
    titles: {
      en: "Risk and position sizing",
      km: "ហានិភ័យ និងកំណត់ទំហំលុយ",
    },
    summaries: {
      en: "Define risk per trade, account heat, and a simple sizing framework.",
      km: "កំណត់ហានិភ័យក្នុងមួយប្រតិបត្តិការ កម្តៅគណនី និងក្របខ័ណ្ឌកំណត់ទំហំលុយសាមញ្ញ។",
    },
    objectives: {
      en: [
        "Set a maximum risk percentage per trade.",
        "Link stop distance to position size.",
      ],
      km: [
        "កំណត់ភាគរយហានិភ័យអតិបរមាក្នុងមួយប្រតិបត្តិការ។",
        "ភ្ជាប់ចម្ងាយ stop ទៅនឹងទំហំលុយ។",
      ],
    },
  },
  {
    slug: "setup-journal-and-review",
    approximateMinutes: 16,
    videos: [
      {
        embedUrl: sampleEmbedA,
        titles: {
          en: "Part 1 — From setup to playbook",
          km: "ផ្នែក ១ — ពីលំនាំទៅសៀវភៅលេង",
        },
      },
      {
        embedUrl: sampleEmbedB,
        titles: {
          en: "Part 2 — Journal and weekly review",
          km: "ផ្នែក ២ — កំណត់ត្រា និងការពិនិត្យប្រចាំសប្តាហ៍",
        },
      },
    ],
    thumbnailUrl: thumbJournal,
    titles: {
      en: "Setups, journaling, and review",
      km: "លំនាំចូល កំណត់ត្រា និងការពិនិត្យ",
    },
    summaries: {
      en: "Turn observations into rules: screenshots, tags, and weekly retrospectives.",
      km: "បំលែងការសង្កេតទៅជាវិន័យ៖ រូបភាព ស្លាក និងការពិនិត្យឡើងវិញប្រចាំសប្តាហ៍។",
    },
    objectives: {
      en: [
        "Draft a one-page playbook for your setup.",
        "Schedule a weekly review block.",
      ],
      km: [
        "សរសេរសេចក្តីសង្ខេបលេងលំនាំរបស់អ្នកក្នុងមួយទំព័រ។",
        "កំណត់ពេលវេលាពិនិត្យប្រចាំសប្តាហ៍។",
      ],
    },
  },
];

export function getLessonBySlug(slug: string): Lesson | undefined {
  return lessons.find((l) => l.slug === slug);
}
