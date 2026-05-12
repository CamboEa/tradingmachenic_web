export const locales = ["en", "km"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export type Dictionary = {
  meta: { title: string; description: string };
  nav: {
    home: string;
    education: string;
    curriculum: string;
    tools: string;
    about: string;
    register: string;
    login: string;
    signOut: string;
    language: string;
    english: string;
    khmer: string;
  };
  home: {
    badge: string;
    headline: string;
    subhead: string;
    ctaCourse: string;
    ctaOutline: string;
    pillars: { title: string; body: string }[];
    /** use "{count}" for lesson count */
    stats: { value: string; label: string }[];
    sectionPrinciples: string;
    sectionHow: string;
    howSteps: { title: string; body: string }[];
    sectionLearn: string;
    learnLead: string;
    learnItems: string[];
    learnLink: string;
    sectionApproach: string;
    approachLead: string;
    approachItems: string[];
    ctaBandTitle: string;
    ctaBandBody: string;
    ctaBandButton: string;
    principlesTagline: string;
    lessonsNoun: string;
  };
  course: {
    title: string;
    intro: string;
    lessonsLabel: string;
    durationLabel: string;
    openLesson: string;
    backToCourse: string;
    videoFallback: string;
    objectives: string;
    /** "{current}" and "{total}" zero-padded, e.g. 01 */
    lessonProgress: string;
    keyOutcomes: string;
    includesVideo: string;
    /** "{count}" = number of videos in one lesson */
    videosInLesson: string;
    /** "{current}" and "{total}" — segment label above each embed */
    videoInLessonHeading: string;
    /** "{count}" = number of lessons */
    lessonsSummary: string;
    programStructure: string;
  };
  curriculumPage: {
    eyebrow: string;
    title: string;
    intro: string;
    theoryPhaseLabel: string;
    practicePhaseLabel: string;
    theoryPhaseSub: string;
    practicePhaseSub: string;
    weekLabel: string;
    activitiesLabel: string;
  };
  toolsPage: {
    eyebrow: string;
    title: string;
    intro: string;
    comingSoon: string;
    comingSoonDetail: string;
    indicatorsTitle: string;
    indicatorsDescription: string;
    expertAdvisorsTitle: string;
    expertAdvisorsDescription: string;
  };
  registerPage: {
    title: string;
    intro: string;
    emailLabel: string;
    passwordLabel: string;
    submit: string;
    switchPrompt: string;
    switchLink: string;
  };
  loginPage: {
    title: string;
    intro: string;
    emailLabel: string;
    passwordLabel: string;
    submit: string;
    switchPrompt: string;
    switchLink: string;
  };
  aboutPage: {
    title: string;
    eyebrow: string;
    whyEyebrow: string;
    whyTitle: string;
    whyParagraphs: string[];
    mentorBadge: string;
    mentorName: string;
    experienceLine: string;
    bioParagraphs: string[];
    rolesLabel: string;
    roles: { org: string; title: string; detail: string }[];
    teachingStatement: string;
    imageAlt: string;
    ctaEducation: string;
  };
  footer: {
    tagline: string;
    rights: string;
  };
};

const en: Dictionary = {
  meta: {
    title: "Trading Machenic",
    description:
      "Structured trading education with video lessons on risk, execution, and mindset.",
  },
  nav: {
    home: "Home",
    education: "Education",
    curriculum: "Curriculum",
    tools: "Tools",
    about: "About",
    register: "Register",
    login: "Login",
    signOut: "Sign Out",
    language: "Language",
    english: "ENG",
    khmer: "KH",
  },
  home: {
    badge: "Trading education",
    headline: "Learn trading with clarity and discipline.",
    subhead:
      "Trading Machenic is a focused video course covering markets, risk management, and repeatable processes—built for serious beginners and intermediate traders.",
    ctaCourse: "Start the course",
    ctaOutline: "View curriculum",
    pillars: [
      {
        title: "Risk first",
        body: "Position sizing, stops, and capital preservation before chasing entries.",
      },
      {
        title: "Process over predictions",
        body: "Checklists, journaling, and review loops that compound skill.",
      },
      {
        title: "Execution literacy",
        body: "Orders, liquidity basics, and practical mechanics you can apply.",
      },
    ],
    stats: [
      { value: "{count}", label: "Video modules" },
      { value: "24/7", label: "On-demand access" },
      { value: "KM · EN", label: "Bilingual experience" },
    ],
    sectionPrinciples: "How we teach",
    sectionHow: "Your learning path",
    howSteps: [
      {
        title: "Watch",
        body: "Short HD lessons that explain mechanics without hype or noise.",
      },
      {
        title: "Apply",
        body: "Use simple frameworks for risk, sizing, and repeatable checklists.",
      },
      {
        title: "Review",
        body: "Journal what happened and refine your process week over week.",
      },
    ],
    sectionLearn: "Inside the curriculum",
    learnLead:
      "Move from market vocabulary to disciplined execution with lessons you can revisit anytime.",
    learnItems: [
      "Market structure and who moves liquidity",
      "Risk budgets, stops, and sizing that fit your account",
      "Playbooks, screenshots, and structured reviews",
    ],
    learnLink: "Explore all lessons",
    sectionApproach: "Professional standards",
    approachLead:
      "Trading Machenic is built like an institutional learning track—clear outcomes, sober language, and zero promises of easy profits.",
    approachItems: [
      "General education only—not personalized financial advice",
      "Emphasis on survival, process, and measurable habits",
      "Content designed for Khmer and English readers alike",
    ],
    ctaBandTitle: "Start with the fundamentals",
    ctaBandBody:
      "Open the education hub, pick lesson one, and progress at the pace that fits your schedule.",
    ctaBandButton: "Go to education",
    principlesTagline:
      "Grounded lessons you can apply—not noise.",
    lessonsNoun: "lessons",
  },
  course: {
    title: "Trading fundamentals",
    intro:
      "Work through the modules in order. Each lesson includes focused videos and key takeaways.",
    lessonsLabel: "Lessons",
    durationLabel: "About",
    openLesson: "Open lesson",
    backToCourse: "Back to education",
    videoFallback:
      "Replace this embed with your own hosted video or streaming link.",
    objectives: "What you will practice",
    lessonProgress: "Lesson {current} of {total}",
    keyOutcomes: "Key outcomes",
    includesVideo: "Includes video",
    videosInLesson: "{count} videos",
    videoInLessonHeading: "Video {current} of {total}",
    lessonsSummary: "{count} video lessons",
    programStructure: "Phase I: Theory · Phase II: Practice",
  },
  curriculumPage: {
    eyebrow: "Programme Structure",
    title: "Two-Phase Curriculum",
    intro:
      "A structured path from theory to live execution. Five modules to build the foundation, four live modules to put it all together.",
    theoryPhaseLabel: "Phase I",
    practicePhaseLabel: "Phase II: Put It All Together",
    theoryPhaseSub: "Theory · 5 modules",
    practicePhaseSub: "Put it all together · 4 live modules",
    weekLabel: "Module",
    activitiesLabel: "What you will do",
  },
  toolsPage: {
    eyebrow: "Tools",
    title: "Indicators & Expert Advisors",
    intro:
      "This workspace will distribute curated indicators and expert advisors built for disciplined process work—not hype signals.",
    comingSoon: "Coming soon",
    comingSoonDetail:
      "Downloads, install guides, and version notes are not live yet. We will publish releases alongside upcoming education modules.",
    indicatorsTitle: "Indicators",
    indicatorsDescription:
      "Studies and visuals that reinforce journaling, risk rules, and review—not shortcuts that promise outcomes.",
    expertAdvisorsTitle: "Expert Advisors",
    expertAdvisorsDescription:
      "Template automation for supported platforms, documented assumptions, and explicit limits—shipping after QA.",
  },
  registerPage: {
    title: "Create an account",
    intro:
      "Registration is not wired yet—this form is a layout preview only. Connect your auth provider when you are ready.",
    emailLabel: "Email",
    passwordLabel: "Password",
    submit: "Register",
    switchPrompt: "Already have an account?",
    switchLink: "Log in",
  },
  loginPage: {
    title: "Log in",
    intro:
      "Sign-in is not connected yet—submitting will not authenticate you until you plug in your backend.",
    emailLabel: "Email",
    passwordLabel: "Password",
    submit: "Log in",
    switchPrompt: "Need an account?",
    switchLink: "Register",
  },
  aboutPage: {
    title: "About",
    eyebrow: "Trading Machenic",
    whyEyebrow: "Why we built this",
    whyTitle: "Fewer unnecessary losses, capital treated with care",
    whyParagraphs: [
      "Trading Machenic was created for people who want to approach markets without gambling away what they have worked for.",
      "The lessons focus on risk, sizing, and disciplined routines so you can avoid common pitfalls and put protecting your capital first—not hype or shortcuts.",
    ],
    mentorBadge: "Your mentor",
    mentorName: "Bean Ratana",
    experienceLine: "Director of Strategic Partnership & Education · Trading since 2015",
    bioParagraphs: [
      "Bean Ratana began his trading journey in 2015, driven by a deep curiosity for market behavior and a relentless desire to master strategic execution. Over the years, this passion evolved into a commitment to building smarter, more adaptive trading systems—culminating in his transition to algorithmic development with MQL5 in 2025.",
      "He currently serves as Director of Strategic Partnership and Education at STMarket, where he specialises in educating traders, refining strategies, and bridging the gap between theory and execution. He takes pride in making complex trading concepts accessible, especially for emerging traders and Khmer-speaking learners.",
      "Whether it's through teaching, coding, or collaborating, Bean is always excited to share what he has learned—and even more excited to keep learning alongside others.",
    ],
    rolesLabel: "Roles & responsibilities",
    roles: [
      {
        org: "STMarket",
        title: "Director of Strategic Partnership & Education",
        detail:
          "Educates traders, refines strategies, and bridges the gap between theory and live execution.",
      },
      {
        org: "SIAC",
        title: "Chief of Educational Innovation",
        detail:
          "Executive Committee Member of the Securities Investor Association of Cambodia, leading curriculum design, strategic mentorship, and community-driven learning initiatives.",
      },
    ],
    teachingStatement:
      "Every lesson in this programme is taught by Bean Ratana.",
    imageAlt: "Bean Ratana, mentor at Trading Machenic",
    ctaEducation: "Browse lessons",
  },
  footer: {
    tagline: "Education only—not financial advice.",
    rights: "Trading Machenic. All rights reserved.",
  },
};

const km: Dictionary = {
  meta: {
    title: "Trading Machenic",
    description:
      "ការអប់រំពាណិជ្ជកម្មដែលមានរចនាសម្ព័ន្ធ ជាមួយវីដេអូសិក្សាអំពីហានិភ័យ ការប្រតិបត្តិ និងផ្លូវចិត្ត។",
  },
  nav: {
    home: "ទំព័រដើម",
    education: "ការអប់រំ",
    curriculum: "កម្មវិធីសិក្សា",
    tools: "ឧបករណ៍",
    about: "អំពី",
    register: "ចុះឈ្មោះ",
    login: "ចូល",
    signOut: "ចាកចេញ",
    language: "ភាសា",
    english: "ENG",
    khmer: "KH",
  },
  home: {
    badge: "ការអប់រំពាណិជ្ជកម្ម",
    headline: "សិក្សាពាណិជ្ជកម្មដោយភាពច្បាស់លាស់ និងមានវិន័យ។",
    subhead:
      "Trading Machenic គឺជាវគ្គសិក្សាវីដេអូផ្តោតលើទីផ្សារ ការគ្រប់គ្រងហានិភ័យ និងដំណើរការដែលធ្វើម្តងហើយម្តងទៀត—សម្រាប់អ្នកចាប់ផ្តើម និងអ្នកជំនាញកំរិតមធ្យម។",
    ctaCourse: "ចាប់ផ្តើមវគ្គសិក្សា",
    ctaOutline: "មើលកម្មវិធីសិក្សា",
    pillars: [
      {
        title: "ហានិភ័យមុនគេ",
        body: "កំណត់ទំហំលុយ ការឈប់ខាត និងការរក្សាដើមទុន មុនពេលតាមរកការចូលទីផ្សារ។",
      },
      {
        title: "ដំណើរការលើសពីការទស្សន៍ទាយ",
        body: "បញ្ជីត្រួតពិនិត្យ កំណត់ត្រា និងការពិនិត្យឡើងវិញដែលពង្រឹងជំនាញ។",
      },
      {
        title: "ការយល់ដឹងអំពីការប្រតិបត្តិ",
        body: "ការបញ្ជាទិញ សារធារណៈរឹមរឹល និងលក្ខណៈបច្ចេកទេសដែលអាចអនុវត្តបាន។",
      },
    ],
    stats: [
      { value: "{count}", label: "ម៉ូឌុលវីដេអូ" },
      { value: "24/7", label: "ចូលមើលបានគ្រប់ពេល" },
      { value: "KM · EN", label: "គាំទ្រពីរភាសា" },
    ],
    sectionPrinciples: "របៀបបង្រៀនរបស់យើង",
    sectionHow: "ផ្លូវសិក្សារបស់អ្នក",
    howSteps: [
      {
        title: "មើល",
        body: "វីដេអូខ្លីច្បាស់លាស់ពន្យល់លក្ខណៈបច្ចេកទេស ដោយគ្មានសំឡេងរន្ទះ។",
      },
      {
        title: "អនុវត្ត",
        body: "ប្រើក្របខ័ណ្ឌសាមញ្ញសម្រាប់ហានិភ័យ ទំហំលុយ និងបញ្ជីត្រួតពិនិត្យ។",
      },
      {
        title: "ពិនិត្យឡើងវិញ",
        body: "កត់ត្រាអ្វីដែលកើតឡើង ហើយកែលម្អដំណើរការរបស់អ្នករៀងរាល់សប្តាហ៍។",
      },
    ],
    sectionLearn: "ក្នុងកម្មវិធីសិក្សា",
    learnLead:
      "ពីពាក្យបច្ចេកទេសទីផ្សារ ទៅការប្រតិបត្តិដែលមានវិន័យ—មេរៀនដែលអាចត្រលប់មើលបានគ្រប់ពេល។",
    learnItems: [
      "រចនាសម្ព័ន្ធទីផ្សារ និងអ្នកផ្លាស់ប្តូរលំហូរសារធារណៈរឹមរឹល",
      "ថវិកាហានិភ័យ ការឈប់ខាត និងកំណត់ទំហំលុយសមស្របគណនី",
      "សៀវភៅលេង រូបភាពអេក្រង់ និងការពិនិត្យដែលមានរចនាសម្ព័ន្ធ",
    ],
    learnLink: "មើលមេរៀនទាំងអស់",
    sectionApproach: "ស្តង់ដាវិជ្ជាជីវៈ",
    approachLead:
      "Trading Machenic ត្រូវបានសាងសង់ដូចជាផ្លូវសិក្សាកន្លែងធ្វើការ—លទ្ធផលច្បាស់ ភាសារឹងមាំ និងគ្មានការសន្យារកលុយងាយស្រួល។",
    approachItems: [
      "ការអប់រំទូទៅតែប៉ុណ្ណោះ—មិនមែនជាដំបូន្មានហិរញ្ញវត្ថុផ្ទាល់ខ្លួន",
      "ផ្តោតលើការរក្សាដើមទុន ដំណើរការ និងទមលាប់ដែលវាស់វែងបាន",
      "មាតិកាសម្រាប់អ្នកអានទាំងខ្មែរ និងអង់គ្លេស",
    ],
    ctaBandTitle: "ចាប់ផ្តើមពីមូលដ្ឋាន",
    ctaBandBody:
      "បើកផ្ទាំងការអប់រំ ជ្រើសមេរៀនទីមួយ ហើយដំណើរតាមល្បឿនដែលសមស្របអ្នក។",
    ctaBandButton: "ទៅកាន់ផ្នែកអប់រំ",
    principlesTagline:
      "មេរៀនរឹងមាំដែលយកទៅអនុវត្តបាន—មិនមែនសំឡេងរំខាន។",
    lessonsNoun: "មេរៀន",
  },
  course: {
    title: "មូលដ្ឋានពាណិជ្ជកម្ម",
    intro:
      "សិក្សាមេរៀនតាមលំដាប់លំដោះ។ មេរៀននីមួយៗមានវីដេអូផ្តោតលើប្រធានបទ និងចំណុចសំខាន់ៗ។",
    lessonsLabel: "មេរៀន",
    durationLabel: "ប្រហែល",
    openLesson: "បើកមេរៀន",
    backToCourse: "ត្រលប់ទៅការអប់រំ",
    videoFallback:
      "សូមជំនួសការបង្កប់នេះដោយវីដេអូរបស់អ្នក ឬតំណស្ទ្រីម។",
    objectives: "អ្វីដែលអ្នកនឹងអនុវត្ត",
    lessonProgress: "មេរៀន {current} នៃ {total}",
    keyOutcomes: "លទ្ធផលសំខាន់",
    includesVideo: "មានវីដេអូ",
    videosInLesson: "វីដេអូ {count}",
    videoInLessonHeading: "វីដេអូ {current} នៃ {total}",
    lessonsSummary: "មេរៀនវីដេអូចំនួន {count}",
    programStructure: "ដំណាក់កាល I: ទ្រឹស្តី · ដំណាក់កាល II: អនុវត្ត",
  },
  curriculumPage: {
    eyebrow: "រចនាសម្ព័ន្ធកម្មវិធី",
    title: "កម្មវិធីសិក្សាពីរដំណាក់កាល",
    intro:
      "ផ្លូវដែលមានរចនាសម្ព័ន្ធពីទ្រឹស្តីទៅ execution ជាក់ស្ដែង។ ប្រាំ module ដើម្បីកសាងមូលដ្ឋាន ហើយបួន module live ដើម្បីបូកបញ្ចូលគ្នាទាំងអស់។",
    theoryPhaseLabel: "ដំណាក់កាល I",
    practicePhaseLabel: "ដំណាក់កាល II: រួបបញ្ចូលគ្នា",
    theoryPhaseSub: "ទ្រឹស្តី · ៥ module",
    practicePhaseSub: "រួបបញ្ចូលគ្នា · ៤ module live",
    weekLabel: "Module",
    activitiesLabel: "អ្វីដែលអ្នកនឹងធ្វើ",
  },
  toolsPage: {
    eyebrow: "ឧបករណ៍",
    title: "សូចនាកម្ម និងទីប្រឹក្សារបស់អ្នកជំនាញ",
    intro:
      "តំបន់នេះនឹងចែកចាយសូចនាកម្ម និង EA ដែលសាងសម្រាប់ការងារតាមដំណើរមានវិន័យ—មិនមែនសញ្ញាសង្ខេបរត់តាមរលក។",
    comingSoon: "មកដល់ឆាប់ៗនេះ",
    comingSoonDetail:
      "ការទាញយក មគ្គុទេសក៍ដំឡើង និងកំណត់ត្រាកំណែមិនទាន់បើកមែនទេ។ យើងនឹងផ្សាយការចេញផ្សាយជាមួយម៉ូឌុលសិក្សាបន្ទាប់។",
    indicatorsTitle: "សូចនាកម្ម",
    indicatorsDescription:
      "ការសិក្សា និងការមើលឃើញដែលពង្រឹងកំណត់ត្រា វិន័យហានិភ័យ និងការពិនិត្យ—មិនមែនផ្លូវកាត់ទស្សន៍ទាយលទ្ធផល។",
    expertAdvisorsTitle: "ទីប្រឹក្សារបស់អ្នកជំនាញ (EA)",
    expertAdvisorsDescription:
      "គំរូស្វ័យប្រវត្តិសម្រាប់វេទិកាដែលគាំទ្រ ឯកសារសន្និដ្ឋានច្បាស់លាស់ និងដែនកំណត់ច្បាស់លាស់—នឹងដាក់បន្ទាប់ពីតេស្តគុណភាព។",
  },
  registerPage: {
    title: "បង្កើតគណនី",
    intro:
      "ការចុះឈ្មោះមិនទាន់តភ្ជាប់មែនទេ—ទម្រង់នេះគ្រាន់តែបង្ហាញមុខងារ។ ភ្ជាប់ប្រព័ន្ធផ្ទៀងផ្ទាត់នៅពេលអ្នករួចរាល់។",
    emailLabel: "អ៊ីមែល",
    passwordLabel: "ពាក្យសម្ងាត់",
    submit: "ចុះឈ្មោះ",
    switchPrompt: "មានគណនីរួចហើយ?",
    switchLink: "ចូល",
  },
  loginPage: {
    title: "ចូលគណនី",
    intro:
      "ការចូលមិនទាន់តភ្ជាប់មែនទេ—ការដាក់ស្នើនឹងមិនបញ្ជាក់អត្តសញ្ញាណរហូតដល់អ្នកភ្ជាប់ម៉ាស៊ីនមេ។",
    emailLabel: "អ៊ីមែល",
    passwordLabel: "ពាក្យសម្ងាត់",
    submit: "ចូល",
    switchPrompt: "ត្រូវការគណនី?",
    switchLink: "ចុះឈ្មោះ",
  },
  aboutPage: {
    title: "អំពីយើង",
    eyebrow: "Trading Machenic",
    whyEyebrow: "ហេតុអ្វីបានជាយើងបង្កើត",
    whyTitle: "កាត់បន្ថយការខាតដែលគេច្រើនជួប និងរក្សាដើមទុនឲ្យមានសុវត្ថិភាព",
    whyParagraphs: [
      "Trading Machenic ត្រូវបានបង្កើតឡើងសម្រាប់អ្នកដែលចង់ចូលទីផ្សារដោយមានការរៀបចំ មិនមែនលេងសំណាងដាក់លុយដែលខំរកមក។",
      "មេរៀនផ្តោតលើហានិភ័យ ទំហំលុយ និងទមលាប់វិន័យ ដើម្បីជួយអ្នកជៀសវាងកំហុសទូទៅ និងដាក់ការរក្សាដើមទុនជាមូលដ្ឋាន—មិនមែនតាមសំឡេងរន្ទះ ឬផ្លូវកាត់។",
    ],
    mentorBadge: "អ្នកណែនាំរបស់អ្នក",
    mentorName: "Bean Ratana",
    experienceLine: "នាយកភាពជាដៃគូ និងការអប់រំ · ចាប់ផ្តើមពាណិជ្ជកម្មពីឆ្នាំ ២០១៥",
    bioParagraphs: [
      "Bean Ratana ចាប់ផ្តើមដំណើរពាណិជ្ជកម្មក្នុងឆ្នាំ ២០១៥ ដោយបំណង ចង់ស្វែងយល់ពីអាកប្បកិរិយាទីផ្សារ និងការប្រើប្រាស់ strategy ដោយការប្តេជ្ញាចិត្ត។ ជំនាញ និងចំណង់ចំណូលចិត្តនេះ បានវិវត្ត ក្លាយជាការប្តេជ្ញាចិត្តក្នុងការបង្កើតប្រព័ន្ធ trading ដែលឆ្លាតវៃ— ជាពិសេស ការអភិវឌ្ឍ algorithmic ជាមួយ MQL5 ក្នុងឆ្នាំ ២០២៥។",
      "លោកបច្ចុប្បន្នកាន់តំណែងជា នាយកភាពជាដៃគូ និងការអប់រំ នៅ STMarket ដែលជំនាញ ក្នុងការបង្រៀន traders ការកែលម្អ strategy និងការភ្ជាប់គំនិត ទ្រឹស្តី ទៅ execution ពិត ប្រាកដ។ លោក ធ្វើឲ្យគំនិតពាណិជ្ជកម្មមានតម្លៃ ងាយ ចូលដំណើររួម ជាពិសេសសម្រាប់ traders ដែលកំពុងរៀន និងអ្នកប្រើ ភាសាខ្មែរ។",
      "មិនថាតាមរយៈការបង្រៀន ការសរសេរ code ឬការ សហការ Bean តែងតែចង់ចែករំលែក អ្វីដែលលោកបានរៀន—ហើយនៅ ក្ដោបក្ដាប់ ការរៀនបន្ថែម ជាមួយអ្នកដទៃ។",
    ],
    rolesLabel: "តួនាទី និងទំនួលខុសត្រូវ",
    roles: [
      {
        org: "STMarket",
        title: "នាយកភាពជាដៃគូ និងការអប់រំ",
        detail:
          "អប់រំ traders កែលម្អ strategy និងភ្ជាប់ចន្លោះរវាងទ្រឹស្តី និង execution ជាក់ស្តែង។",
      },
      {
        org: "SIAC",
        title: "ប្រធានការបង្កើតថ្មីផ្នែកអប់រំ",
        detail:
          "សមាជិក​គណៈ​កម្មាធិការ​ប្រតិបត្តិ​នៃ​សមាគម​វិនិយោគិន​មូលបត្រ​កម្ពុជា (SIAC) ដឹកនាំ​ការ​រចនា​កម្មវិធីសិក្សា ការ​ណែ​នាំ​ strategy និង​ការ​រៀន​ ក្នុង​សហគម​ន៍។",
      },
    ],
    teachingStatement:
      "មេរៀនទាំងអស់ក្នុងកម្មវិធីសិក្សានេះបង្រៀនដោយ Bean Ratana។",
    imageAlt: "Bean Ratana គ្រូនៅ Trading Machenic",
    ctaEducation: "មើលមេរៀន",
  },
  footer: {
    tagline: "សម្រាប់តែការអប់រំ—មិនមែនជាដំបូន្មានហិរញ្ញវត្ថុ។",
    rights: "Trading Machenic។ រក្សាសិទ្ធិគ្រប់យ៉ាង។",
  },
};

const dictionaries: Record<Locale, Dictionary> = { en, km };

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale];
}
