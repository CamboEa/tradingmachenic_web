import { notFound } from "next/navigation";
import Link from "next/link";

import { isLocale, type Locale } from "@/lib/i18n";
import { getPublishedToolById, type Tool } from "@/lib/supabase/tools";
import { ui } from "@/lib/ui/styles";
import { GalleryLightbox } from "@/components/tools/gallery-lightbox";

/* ─── Icons ─────────────────────────────────────────────────── */

function DownloadIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0">
      <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
      <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
    </svg>
  );
}

function GuideIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-4 w-4 shrink-0">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="mt-0.5 h-4 w-4 shrink-0 text-teal" aria-hidden>
      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3 shrink-0 opacity-50" aria-hidden>
      <path fillRule="evenodd" d="M6.22 4.22a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06-1.06L9.19 8 6.22 5.03a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
    </svg>
  );
}

/* ─── Helpers ───────────────────────────────────────────────── */

function localizedText(locale: Locale, en?: string | null, km?: string | null): string | null {
  const raw = locale === "km" ? (km ?? en) : (en ?? km);
  const text = (raw ?? "").trim();
  return text.length > 0 ? text : null;
}

function toolExtraBlocks(locale: Locale, tool: Tool) {
  const L = locale === "km"
    ? { need: "អ្វីដែលអ្នកត្រូវមាន", how: "របៀបដែលវាដំណើរការ", features: "លក្ខណៈពិសេស", proof: "ភស្តុតាងការសាកល្បង", usage: "ការណែនាំ និងហានិភ័យ" }
    : { need: "What you'll need", how: "How it works", features: "Key features", proof: "Proof of testing", usage: "Usage tips & risk" };

  return [
    { key: "req",   title: L.need,     body: localizedText(locale, tool.requirements_en,     tool.requirements_km),    preserveLines: false, caution: false, asList: false },
    { key: "how",   title: L.how,      body: localizedText(locale, tool.how_it_works_en,     tool.how_it_works_km),    preserveLines: false, caution: false, asList: false },
    { key: "feat",  title: L.features, body: localizedText(locale, tool.key_features_en,     tool.key_features_km),    preserveLines: true,  caution: false, asList: true  },
    { key: "proof", title: L.proof,    body: localizedText(locale, tool.proof_of_testing_en, tool.proof_of_testing_km), preserveLines: true,  caution: false, asList: false },
    { key: "usage", title: L.usage,    body: localizedText(locale, tool.usage_notes_en,      tool.usage_notes_km),     preserveLines: false, caution: true,  asList: false },
  ].filter((b): b is typeof b & { body: string } => b.body !== null);
}

/* ─── Page ──────────────────────────────────────────────────── */

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

  const isFree    = tool.pricing === "free";
  const typeLabel = tool.type === "indicator"
    ? (locale === "km" ? "សូចនាករ" : "Indicator")
    : (locale === "km" ? "ជំនួយការ" : "Expert Advisor");
  const desc   = localizedText(locale, tool.description_en, tool.description_km);
  const blocks = toolExtraBlocks(locale, tool);

  const downloadLinks = [
    tool.file_url_mt4 && { href: `/api/tools/${tool.id}/download?platform=mt4`, label: locale === "km" ? "ទាញយក MT4" : "Download MT4" },
    tool.file_url_mt5 && { href: `/api/tools/${tool.id}/download?platform=mt5`, label: locale === "km" ? "ទាញយក MT5" : "Download MT5" },
    tool.file_url     && { href: `/api/tools/${tool.id}/download`,              label: locale === "km" ? (isFree ? "ទាញយក" : "ទាញយក") : (isFree ? "Download" : "Download Now") },
  ].filter(Boolean) as { href: string; label: string }[];

  return (
    <div className="flex flex-col">

      {/* ══ FULL-WIDTH PREVIEW IMAGE ════════════════════════════════ */}
      <div>
        {/* Breadcrumb */}
        <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-1.5 text-sm">
              <li>
                <Link href={`/${locale}/tools`} className="font-medium text-slate-500 transition-colors hover:text-slate-brand">
                  {locale === "km" ? "ឧបករណ៍" : "Tools"}
                </Link>
              </li>
              <li aria-hidden><ChevronIcon /></li>
              <li className="truncate font-medium text-slate-brand">{tool.name}</li>
            </ol>
          </nav>
        </div>

        {tool.image_url ? (
          <div className="mt-4 w-full px-4 sm:px-6 lg:px-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={tool.image_url}
              alt={tool.name}
              className="w-full object-cover ring-1 ring-slate-200"
              style={{ maxHeight: "600px", objectPosition: "top" }}
            />
          </div>
        ) : (
          <div className="mt-4 flex w-full items-center justify-center bg-slate-100 px-4 sm:px-6 lg:px-8" style={{ height: "420px" }}>
            <svg viewBox="0 0 64 64" fill="none" className="h-20 w-20 text-slate-300" aria-hidden>
              {tool.type === "indicator" ? (
                <>
                  <path d="M12 46h40" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  <path d="M18 40V26M32 40V16M46 40V30" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  <path d="M14 24c7 5 12 6 18 1s10-8 18-2" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" />
                </>
              ) : (
                <>
                  <rect x="15" y="18" width="34" height="28" rx="8" stroke="currentColor" strokeWidth="3" />
                  <path d="M24 30h.01M40 30h.01M27 39h10" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" />
                  <path d="M32 18v-6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </>
              )}
            </svg>
          </div>
        )}
      </div>


      {/* ══ BODY — 75 / 25 ══════════════════════════════════════════ */}
      <main className="w-full px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_280px]">

          {/* ── LEFT 75%: all content ── */}
          <div className="min-w-0 divide-y divide-slate-200">

            {/* Description */}
            {desc && (
              <div className="pb-8">
                <div className="mb-3 flex items-center gap-2.5">
                  <div className="h-4 w-0.5 rounded-full bg-teal" aria-hidden />
                  <p className={ui.sectionLabel}>{locale === "km" ? "អំពីឧបករណ៍នេះ" : "About this tool"}</p>
                </div>
                <p className="text-sm leading-relaxed text-slate-600">{desc}</p>
              </div>
            )}

            {/* Dynamic content blocks */}
            {blocks.map((block) => (
              <section
                key={block.key}
                aria-labelledby={`section-${block.key}`}
                className={
                  block.caution
                    ? "bg-amber-50 px-5 py-8"
                    : "py-8"
                }
              >
                <div className="mb-4 flex items-center gap-2.5">
                  <div className={`h-4 w-0.5 shrink-0 rounded-full ${block.caution ? "bg-gold" : "bg-teal"}`} aria-hidden />
                  <p
                    id={`section-${block.key}`}
                    className={block.caution ? "text-xs font-bold uppercase tracking-widest text-amber-700" : ui.sectionLabel}
                  >
                    {block.title}
                  </p>
                </div>

                {block.asList ? (
                  <ul className="space-y-2">
                    {block.body.split("\n").filter(Boolean).map((line, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <CheckIcon />
                        <span className="text-sm leading-relaxed text-slate-600">{line}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className={`text-sm leading-relaxed ${block.caution ? "text-amber-800" : "text-slate-600"} ${block.preserveLines ? "whitespace-pre-wrap" : ""}`}>
                    {block.body}
                  </p>
                )}
              </section>
            ))}

            {/* Proof gallery */}
            {tool.gallery.length > 0 && (
              <section aria-labelledby="section-gallery" className="py-8">
                <div className="mb-4 flex items-center gap-2.5">
                  <div className="h-4 w-0.5 shrink-0 rounded-full bg-teal" aria-hidden />
                  <p id="section-gallery" className={ui.sectionLabel}>
                    {locale === "km" ? "ភស្តុតាង" : "Proof"}
                  </p>
                </div>
                <GalleryLightbox
                  images={tool.gallery.map((item, index) => ({
                    src: item.image_url,
                    alt: localizedText(locale, item.description_en, item.description_km) ?? (locale === "km" ? `រូបភាពភស្តុតាង ${index + 1}` : `Proof image ${index + 1}`),
                    caption: localizedText(locale, item.description_en, item.description_km),
                  }))}
                />
              </section>
            )}

          </div>

          {/* ── RIGHT 25%: sidebar ── */}
          <aside className="lg:sticky lg:top-28 lg:self-start">

            {/* Combined Download + Tool Details */}
            <div className="overflow-hidden border border-slate-200 bg-white shadow-sm">

              {/* Download header */}
              <div className="bg-slate-brand px-5 py-3.5">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                  {locale === "km" ? "ទាញយក" : "Download"}
                </p>
              </div>

              {/* Download buttons */}
              {downloadLinks.length > 0 && (
                <div className="space-y-2 border-b border-slate-200 p-4">
                  {downloadLinks.map(({ href, label }) => (
                    <a key={href} href={href} download className={`${ui.btnPrimary} w-full`}>
                      <DownloadIcon />
                      {label}
                    </a>
                  ))}
                  {tool.install_guide_url && (
                    <a href={tool.install_guide_url} target="_blank" rel="noopener noreferrer" className={`${ui.btnSecondary} w-full`}>
                      <GuideIcon />
                      {locale === "km" ? "របៀបដំឡើង" : "Install Guide"}
                    </a>
                  )}
                </div>
              )}

              {/* Tool Details */}
              <div className="bg-slate-50/60 px-5 py-3">
                <p className={ui.sectionLabel}>
                  {locale === "km" ? "ព័ត៌មានឧបករណ៍" : "Tool Details"}
                </p>
              </div>
              <dl className="divide-y divide-slate-100 px-5">
                {([
                  { label: locale === "km" ? "ប្រភេទ"  : "Type",     value: typeLabel },
                  { label: locale === "km" ? "វេទិកា"  : "Platform", value: tool.platform },
                  { label: locale === "km" ? "កំណែ"    : "Version",  value: `v${tool.version}` },
                  {
                    label: locale === "km" ? "តម្លៃ" : "Pricing",
                    value: isFree
                      ? (locale === "km" ? "ឥតគិតថ្លៃ" : "Free")
                      : (locale === "km" ? "បង់ប្រាក់"  : "Paid"),
                  },
                ] as { label: string; value: string }[]).map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between gap-4 py-3">
                    <dt className="text-xs text-slate-500">{label}</dt>
                    <dd className="text-right text-xs font-semibold text-slate-brand">{value}</dd>
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
