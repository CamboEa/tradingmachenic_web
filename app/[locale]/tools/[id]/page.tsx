import { notFound } from "next/navigation";
import Link from "next/link";

import { isLocale, type Locale } from "@/lib/i18n";
import { getPublishedToolById, type Tool } from "@/lib/supabase/tools";

function DownloadIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 shrink-0">
      <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
      <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
    </svg>
  );
}

function GuideIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5 shrink-0">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
    </svg>
  );
}

function ToolPlaceholder({ type }: { type: Tool["type"] }) {
  return (
    <div className="flex aspect-video w-full items-center justify-center bg-slate-800 text-slate-500">
      <svg viewBox="0 0 64 64" fill="none" className="h-16 w-16" aria-hidden>
        {type === "indicator" ? (
          <>
            <path d="M12 46h40" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
            <path d="M18 40V26M32 40V16M46 40V30" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
            <path d="M14 24c7 5 12 6 18 1s10-8 18-2" stroke="#0EA5E9" strokeWidth="4" strokeLinecap="round" />
          </>
        ) : (
          <>
            <rect x="15" y="18" width="34" height="28" rx="8" stroke="currentColor" strokeWidth="4" />
            <path d="M24 30h.01M40 30h.01M27 39h10" stroke="#0EA5E9" strokeWidth="4" strokeLinecap="round" />
            <path d="M32 18v-6" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          </>
        )}
      </svg>
    </div>
  );
}

function localizedToolText(
  locale: Locale,
  en: string | null | undefined,
  km: string | null | undefined,
): string | null {
  const raw = locale === "km" ? (km ?? en) : (en ?? km);
  const text = (raw ?? "").trim();
  return text.length > 0 ? text : null;
}

function galleryCaption(locale: Locale, item: Tool["gallery"][number]): string | null {
  const text = localizedToolText(
    locale,
    item.description_en,
    item.description_km,
  );
  return text;
}

function toolExtraBlocks(locale: Locale, tool: Tool) {
  const labels =
    locale === "km"
      ? {
          need: "អ្វីដែលអ្នកត្រូវមាន",
          how: "របៀបដែលវាដំណើរការ",
          features: "លក្ខណៈពិសេស",
          proof: "ភស្តុតាងការសាកល្បង",
          usage: "ការណែនាំ និងហានិភ័យ",
        }
      : {
          need: "What you'll need",
          how: "How it works",
          features: "Key features",
          proof: "Proof of testing",
          usage: "Usage tips & risk",
        };

  const blocks = [
    {
      key: "req",
      title: labels.need,
      body: localizedToolText(locale, tool.requirements_en, tool.requirements_km),
      preserveLines: false,
      caution: false,
    },
    {
      key: "how",
      title: labels.how,
      body: localizedToolText(locale, tool.how_it_works_en, tool.how_it_works_km),
      preserveLines: false,
      caution: false,
    },
    {
      key: "feat",
      title: labels.features,
      body: localizedToolText(locale, tool.key_features_en, tool.key_features_km),
      preserveLines: true,
      caution: false,
    },
    {
      key: "proof",
      title: labels.proof,
      body: localizedToolText(
        locale,
        tool.proof_of_testing_en,
        tool.proof_of_testing_km,
      ),
      preserveLines: true,
      caution: false,
    },
    {
      key: "usage",
      title: labels.usage,
      body: localizedToolText(locale, tool.usage_notes_en, tool.usage_notes_km),
      preserveLines: false,
      caution: true,
    },
  ];

  return blocks.filter((b): b is typeof b & { body: string } => b.body !== null);
}

export default async function ToolDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale: raw, id } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;

  const tool = await getPublishedToolById(id);
  if (!tool) notFound();

  const isFree = tool.pricing === "free";
  const typeLabel = tool.type === "indicator" ? "Indicator" : "Expert Advisor";

  return (
    <div className="flex flex-col">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-[#1e293b]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_18%,rgba(212,175,55,0.16),transparent_24rem),radial-gradient(circle_at_86%_8%,rgba(14,165,233,0.18),transparent_28rem)]" aria-hidden />
        {/* Background image blur */}
        {tool.image_url && (
          <div className="absolute inset-0 opacity-10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={tool.image_url} alt="" className="h-full w-full object-cover blur-2xl scale-110" aria-hidden />
          </div>
        )}

        <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
          {/* Back link */}
          <Link
            href={`/${locale}/tools`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 transition hover:text-white"
          >
            <svg viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4">
              <path fillRule="evenodd" d="M14 8a.75.75 0 0 1-.75.75H4.56l3.22 3.22a.75.75 0 1 1-1.06 1.06l-4.5-4.5a.75.75 0 0 1 0-1.06l4.5-4.5a.75.75 0 0 1 1.06 1.06L4.56 7.25h8.69A.75.75 0 0 1 14 8Z" clipRule="evenodd" />
            </svg>
            Back to Tools
          </Link>

          <div className="mt-6 flex flex-col gap-8 lg:flex-row lg:items-start">
            {/* Image */}
            <div className="w-full overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/5 shadow-2xl shadow-slate-950/30 lg:w-105 lg:shrink-0">
              {tool.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={tool.image_url} alt={tool.name} className="aspect-video w-full object-cover" />
              ) : (
                <ToolPlaceholder type={tool.type} />
              )}
            </div>

            {/* Meta */}
            <div className="flex-1">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-md px-2.5 py-1 text-xs font-bold uppercase tracking-widest ${
                  isFree ? "bg-[#0ea5e9] text-white" : "bg-[#d4af37] text-[#1e293b]"
                }`}>
                  {isFree ? "Free" : "Paid"}
                </span>
                <span className="rounded-md border border-white/15 px-2.5 py-1 text-xs font-semibold text-slate-300">
                  {typeLabel}
                </span>
                <span className="rounded-md border border-white/15 px-2.5 py-1 text-xs font-semibold text-slate-300">
                  {tool.platform}
                </span>
                <span className="rounded-md border border-white/15 px-2.5 py-1 font-mono text-xs text-slate-400">
                  v{tool.version}
                </span>
              </div>

              {/* Name */}
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                {tool.name}
              </h1>

              {/* CTAs */}
              <div className="mt-8 flex flex-wrap gap-3">
                {tool.file_url && (
                  <a
                    href={tool.file_url}
                    download
                    className="flex items-center gap-2.5 rounded-xl bg-[#0ea5e9] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-sky-900/30 transition hover:-translate-y-0.5 hover:bg-sky-500"
                  >
                    <DownloadIcon />
                    Download Free
                  </a>
                )}
                {tool.install_guide_url && (
                  <a
                    href={tool.install_guide_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-bold text-slate-300 transition hover:bg-white/10 hover:text-white"
                  >
                    <GuideIcon />
                    Install Guide
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Details body ── */}
      <main className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_300px]">

          {/* Left — description & extended info (locale-aware) */}
          <div className="space-y-6">
            {(() => {
              const desc = locale === "km" ? (tool.description_km ?? tool.description_en) : (tool.description_en ?? tool.description_km);
              const heading = locale === "km" ? "អំពីឧបករណ៍នេះ" : "About this tool";
              const accent = locale === "km" ? "bg-[#d4af37]" : "bg-[#0ea5e9]";
              if (!desc) return null;
              return (
                <section className="rounded-[1.5rem] border border-white/80 bg-white/88 p-8 shadow-sm shadow-slate-900/5 backdrop-blur">
                  <div className="mb-4 flex items-center gap-3">
                    <div className={`h-1 w-8 rounded-full ${accent}`} />
                    <h2 className="text-lg font-bold text-[#1e293b]">{heading}</h2>
                  </div>
                  <p className="leading-relaxed text-slate-600">{desc}</p>
                </section>
              );
            })()}

            {toolExtraBlocks(locale, tool).map((block) => (
              <section
                key={block.key}
                className={`rounded-[1.5rem] border bg-white/88 p-8 shadow-sm shadow-slate-900/5 backdrop-blur ${
                  block.caution
                    ? "border-slate-200 border-l-4 border-l-[#d4af37] bg-[#fffdf8]"
                    : "border-slate-200"
                }`}
              >
                <div className="mb-4 flex items-center gap-3">
                  <div
                    className={`h-1 w-8 rounded-full ${
                      block.caution ? "bg-[#d4af37]" : locale === "km" ? "bg-[#d4af37]" : "bg-[#0ea5e9]"
                    }`}
                  />
                  <h2 className="text-lg font-bold text-[#1e293b]">{block.title}</h2>
                </div>
                <p
                  className={`leading-relaxed text-slate-600 ${block.preserveLines ? "whitespace-pre-wrap" : ""}`}
                >
                  {block.body}
                </p>
              </section>
            ))}

            {tool.gallery.length > 0 ? (
              <section className="rounded-[1.5rem] border border-slate-200 bg-white/88 p-8 shadow-sm shadow-slate-900/5 backdrop-blur">
                <div className="mb-6 flex items-center gap-3">
                  <div
                    className={`h-1 w-8 rounded-full ${
                      locale === "km" ? "bg-[#d4af37]" : "bg-[#0ea5e9]"
                    }`}
                  />
                  <h2 className="text-lg font-bold text-[#1e293b]">
                    {locale === "km" ? "រូបភាព និងភស្តុតាង" : "Screenshots & proof"}
                  </h2>
                </div>
                <ul className="grid gap-6 sm:grid-cols-2">
                  {tool.gallery.map((item, index) => {
                    const caption = galleryCaption(locale, item);
                    return (
                      <li
                        key={`${item.image_url}-${index}`}
                        className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50/80"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.image_url}
                          alt={
                            caption ??
                            (locale === "km"
                              ? `រូបភាពភស្តុតាង ${index + 1}`
                              : `Proof image ${index + 1}`)
                          }
                          className="aspect-video w-full object-cover"
                        />
                        {caption ? (
                          <p className="border-t border-slate-200 px-4 py-3 text-sm leading-relaxed text-slate-600">
                            {caption}
                          </p>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              </section>
            ) : null}
          </div>

          {/* Right — info card */}
          <aside className="space-y-4">
            <div className="rounded-[1.5rem] border border-white/80 bg-white/88 p-6 shadow-sm shadow-slate-900/5 backdrop-blur">
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-400">
                Tool Details
              </h3>
              <dl className="space-y-3">
                {[
                  { label: "Type", value: typeLabel },
                  { label: "Platform", value: tool.platform },
                  { label: "Version", value: `v${tool.version}` },
                  { label: "Pricing", value: isFree ? "Free" : "Paid" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                    <dt className="text-sm text-slate-500">{label}</dt>
                    <dd className="text-sm font-semibold text-[#1e293b]">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>

          </aside>
        </div>
      </main>
    </div>
  );
}
