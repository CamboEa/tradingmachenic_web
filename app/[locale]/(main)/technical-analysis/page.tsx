import { notFound } from "next/navigation";
import Link from "next/link";

import { getDictionary, isLocale, type Locale } from "@/lib/i18n";

export default async function TechnicalAnalysisPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dict = await getDictionary(locale);

  const heading =
    locale === "km" ? "វិភាគបច្ចេកទេស" : "Technical Analysis";

  const sub =
    locale === "km"
      ? "ខ្លឹមសារគ្រប់គ្រាន់នឹងមកដល់ឆាប់ៗ — ជំនួញបច្ចេកទេស ការអានក្រាហ្វ និងរចនាសម្ព័ន្ធទីផ្សារ។"
      : "In-depth chart reading, market structure, and technical frameworks — content arriving soon.";

  const features =
    locale === "km"
      ? [
          "ការអានក្រាហ្វ និងរូបភាពតម្លៃ",
          "ការគាំទ្រ ការតាំង និងបំបែកចេញ",
          "សូចនាករ RSI, MACD, Moving Average",
          "ការវិភាគ XAU/USD ជាក់ស្ដែង",
        ]
      : [
          "Candlestick patterns and price action",
          "Support, resistance, and breakout setups",
          "Indicators: RSI, MACD, Moving Averages",
          "Applied XAU/USD chart analysis",
        ];

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-20 sm:py-28">
      <div className="mx-auto w-full max-w-2xl text-center">

        {/* Eyebrow */}
        <span className="inline-block rounded-full border border-gold/40 bg-gold/10 px-4 py-1 text-[11px] font-bold uppercase tracking-[0.25em] text-gold">
          {locale === "km" ? "មកដល់ឆាប់ៗ" : "Coming Soon"}
        </span>

        {/* Heading */}
        <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-brand sm:text-5xl">
          {heading}
        </h1>

        {/* Sub */}
        <p className="mt-4 text-base leading-relaxed text-slate-500 sm:text-lg">
          {sub}
        </p>

        {/* Divider */}
        <div className="mx-auto mt-10 h-px w-16 bg-gold/40" />

        {/* Feature list */}
        <ul className="mt-8 inline-flex flex-col items-start gap-3 text-left">
          {features.map((item) => (
            <li key={item} className="flex items-start gap-3 text-sm text-slate-600">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-brand">
                <svg
                  viewBox="0 0 10 8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-2.5 w-2.5 text-gold"
                >
                  <path d="M1 4l2.5 2.5L9 1" />
                </svg>
              </span>
              {item}
            </li>
          ))}
        </ul>

        {/* CTA */}
        <div className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href={`/${locale}/education`}
            className="rounded-xl bg-teal px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-teal/20 transition hover:brightness-110"
          >
            {dict.nav.education}
          </Link>
          <Link
            href={`/${locale}`}
            className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            {locale === "km" ? "ត្រឡប់ទៅដើម" : "Back to home"}
          </Link>
        </div>

      </div>
    </main>
  );
}
