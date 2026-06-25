import Link from "next/link";
import { notFound } from "next/navigation";

import { GalleryLightbox } from "@/components/tools/gallery-lightbox";
import { isLocale, type Locale } from "@/lib/i18n";
import { getPublishedToolById, type Tool } from "@/lib/supabase/tools";
import { formatDownloadCount, getToolDownloadTotal } from "@/lib/tools/download-stats";
import { ui } from "@/lib/ui/styles";

function DownloadIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0" aria-hidden>
      <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
      <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
    </svg>
  );
}

function GuideIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-4 w-4 shrink-0" aria-hidden>
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
    { key: "req", title: L.need, body: localizedText(locale, tool.requirements_en, tool.requirements_km), preserveLines: false, caution: false, asList: false },
    { key: "how", title: L.how, body: localizedText(locale, tool.how_it_works_en, tool.how_it_works_km), preserveLines: false, caution: false, asList: false },
    { key: "feat", title: L.features, body: localizedText(locale, tool.key_features_en, tool.key_features_km), preserveLines: true, caution: false, asList: true },
    { key: "proof", title: L.proof, body: localizedText(locale, tool.proof_of_testing_en, tool.proof_of_testing_km), preserveLines: true, caution: false, asList: false },
    { key: "usage", title: L.usage, body: localizedText(locale, tool.usage_notes_en, tool.usage_notes_km), preserveLines: false, caution: true, asList: false },
  ].filter((b): b is typeof b & { body: string } => b.body !== null);
}

function SectionHeading({ id, children, caution = false }: { id?: string; children: string; caution?: boolean }) {
  return (
    <div className="mb-4 flex items-center gap-2.5">
      <div className={`h-4 w-0.5 shrink-0 rounded-full ${caution ? "bg-gold" : "bg-teal"}`} aria-hidden />
      <p id={id} className={caution ? "text-xs font-bold uppercase tracking-[0.2em] text-highlight" : ui.sectionLabel}>
        {children}
      </p>
    </div>
  );
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
  const typeLabel = tool.type === "indicator"
    ? (locale === "km" ? "សូចនាករ" : "Indicator")
    : (locale === "km" ? "ជំនួយការ" : "Expert Advisor");
  const desc = localizedText(locale, tool.description_en, tool.description_km);
  const blocks = toolExtraBlocks(locale, tool);
  const downloadTotal = formatDownloadCount(getToolDownloadTotal(tool));
  const toolsLabel = locale === "km" ? "ឧបករណ៍" : "Tools";

  const downloadLinks = [
    tool.file_url_mt4 && { href: `/api/tools/${tool.id}/download?platform=mt4`, label: locale === "km" ? "ទាញយក MT4" : "Download MT4" },
    tool.file_url_mt5 && { href: `/api/tools/${tool.id}/download?platform=mt5`, label: locale === "km" ? "ទាញយក MT5" : "Download MT5" },
    tool.file_url && { href: `/api/tools/${tool.id}/download`, label: locale === "km" ? "ទាញយក" : isFree ? "Download" : "Download Now" },
  ].filter(Boolean) as { href: string; label: string }[];

  const detailRows = [
    { label: locale === "km" ? "ប្រភេទ" : "Type", value: typeLabel },
    { label: locale === "km" ? "វេទិកា" : "Platform", value: tool.platform },
    { label: locale === "km" ? "កំណែ" : "Version", value: `v${tool.version}` },
    {
      label: locale === "km" ? "តម្លៃ" : "Pricing",
      value: isFree ? (locale === "km" ? "ឥតគិតថ្លៃ" : "Free") : (locale === "km" ? "បង់ប្រាក់" : "Paid"),
    },
    { label: locale === "km" ? "ទាញយក" : "Downloads", value: downloadTotal },
  ];

  return (
    <div className="flex flex-col bg-background pb-16">
      <div className="w-full px-4 pt-8 sm:px-6 lg:px-8">
        <p className="text-sm">
          <Link href={`/${locale}/tools`} className="font-semibold text-teal transition hover:text-highlight">
            ← {toolsLabel}
          </Link>
        </p>

        <header className="mt-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${isFree ? "bg-teal/80 text-white" : "bg-highlight/80 text-background"}`}>
              {isFree ? (locale === "km" ? "ឥតគិតថ្លៃ" : "Free") : (locale === "km" ? "បង់ប្រាក់" : "Paid")}
            </span>
            <span className="rounded-md bg-surface-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink-muted ring-1 ring-bridge/40">
              {typeLabel}
            </span>
            <span className="rounded-md bg-surface-soft px-2 py-0.5 text-[10px] font-semibold text-ink-muted ring-1 ring-bridge/40">
              {tool.platform}
            </span>
            <span className="rounded-md bg-surface-soft px-2 py-0.5 font-mono text-[10px] text-ink-soft ring-1 ring-bridge/40">
              v{tool.version}
            </span>
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{tool.name}</h1>
        </header>
      </div>

      <div className="mt-6 w-full px-6 sm:px-10 lg:px-16 xl:px-24">
        {tool.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={tool.image_url}
            alt={tool.name}
            className="mx-auto block h-auto w-full max-w-6xl"
          />
        ) : (
          <div className="mx-auto flex h-[26.25rem] w-full max-w-6xl items-center justify-center rounded-2xl bg-surface-soft">
            <svg viewBox="0 0 64 64" fill="none" className="h-20 w-20 text-ink-soft/40" aria-hidden>
              {tool.type === "indicator" ? (
                <>
                  <path d="M12 46h40" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  <path d="M18 40V26M32 40V16M46 40V30" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  <path d="M14 24c7 5 12 6 18 1s10-8 18-2" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
                </>
              ) : (
                <>
                  <rect x="15" y="18" width="34" height="28" rx="8" stroke="currentColor" strokeWidth="3" />
                  <path d="M24 30h.01M40 30h.01M27 39h10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
                  <path d="M32 18v-6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </>
              )}
            </svg>
          </div>
        )}
      </div>

      <main className="mt-10 w-full px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-10">
          <div className="min-w-0 space-y-6">
            {desc && desc.includes("<") ? (
              <article className="rounded-2xl border border-bridge/40 bg-surface p-6 sm:p-8">
                <div className="tool-doc-html" dangerouslySetInnerHTML={{ __html: desc }} />
              </article>
            ) : desc ? (
              <article className="overflow-hidden rounded-2xl border border-bridge/40 bg-surface">
                <div className="border-b border-bridge/30 px-6 py-5 sm:px-8">
                  <SectionHeading>{locale === "km" ? "អំពីឧបករណ៍នេះ" : "About this tool"}</SectionHeading>
                  <p className="text-sm leading-relaxed text-ink-muted">{desc}</p>
                </div>

                {blocks.map((block) => (
                  <section
                    key={block.key}
                    aria-labelledby={`section-${block.key}`}
                    className={`border-t border-bridge/30 px-6 py-6 sm:px-8 ${block.caution ? "bg-gold/5" : ""}`}
                  >
                    <SectionHeading id={`section-${block.key}`} caution={block.caution}>
                      {block.title}
                    </SectionHeading>
                    {block.asList ? (
                      <ul className="space-y-2.5">
                        {block.body.split("\n").filter(Boolean).map((line, i) => (
                          <li key={i} className="flex items-start gap-2.5">
                            <CheckIcon />
                            <span className="text-sm leading-relaxed text-ink-muted">{line}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p
                        className={`text-sm leading-relaxed text-ink-muted ${block.preserveLines ? "whitespace-pre-wrap" : ""} ${block.caution ? "rounded-xl border border-gold/25 bg-background/40 p-4" : ""}`}
                      >
                        {block.body}
                      </p>
                    )}
                  </section>
                ))}

                {tool.gallery.length > 0 && (
                  <section aria-labelledby="section-gallery" className="border-t border-bridge/30 px-6 py-6 sm:px-8">
                    <SectionHeading id="section-gallery">
                      {locale === "km" ? "ភស្តុតាង" : "Proof"}
                    </SectionHeading>
                    <GalleryLightbox
                      images={tool.gallery.map((item, index) => ({
                        src: item.image_url,
                        alt: localizedText(locale, item.description_en, item.description_km) ?? (locale === "km" ? `រូបភាពភស្តុតាង ${index + 1}` : `Proof image ${index + 1}`),
                        caption: localizedText(locale, item.description_en, item.description_km),
                      }))}
                    />
                  </section>
                )}
              </article>
            ) : blocks.length > 0 || tool.gallery.length > 0 ? (
              <article className="overflow-hidden rounded-2xl border border-bridge/40 bg-surface">
                {blocks.map((block, index) => (
                  <section
                    key={block.key}
                    aria-labelledby={`section-${block.key}`}
                    className={`px-6 py-6 sm:px-8 ${index > 0 ? "border-t border-bridge/30" : ""} ${block.caution ? "bg-gold/5" : ""}`}
                  >
                    <SectionHeading id={`section-${block.key}`} caution={block.caution}>
                      {block.title}
                    </SectionHeading>
                    {block.asList ? (
                      <ul className="space-y-2.5">
                        {block.body.split("\n").filter(Boolean).map((line, i) => (
                          <li key={i} className="flex items-start gap-2.5">
                            <CheckIcon />
                            <span className="text-sm leading-relaxed text-ink-muted">{line}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className={`text-sm leading-relaxed text-ink-muted ${block.preserveLines ? "whitespace-pre-wrap" : ""}`}>
                        {block.body}
                      </p>
                    )}
                  </section>
                ))}
              </article>
            ) : null}
          </div>

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="overflow-hidden rounded-2xl border border-bridge/40 bg-surface shadow-sm">
              <div className="flex items-center gap-3 border-b border-bridge/40 bg-linear-to-r from-surface-soft to-background px-4 py-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal/20">
                  <DownloadIcon />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-foreground">
                    {locale === "km" ? "ទាញយក" : "Download"}
                  </p>
                  <p className="text-[10px] text-ink-soft">
                    {downloadTotal} {locale === "km" ? "ដងទាញយក" : "total downloads"}
                  </p>
                </div>
              </div>

              {downloadLinks.length > 0 ? (
                <div className="space-y-2 border-b border-bridge/40 p-4">
                  {downloadLinks.map(({ href, label }) => (
                    <a key={href} href={href} download className={`${ui.btnPrimary} w-full`}>
                      <DownloadIcon />
                      {label}
                    </a>
                  ))}
                  {tool.install_guide_url && (
                    <a
                      href={tool.install_guide_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${ui.btnSecondary} w-full`}
                    >
                      <GuideIcon />
                      {locale === "km" ? "របៀបដំឡើង" : "Install Guide"}
                    </a>
                  )}
                </div>
              ) : (
                <p className="border-b border-bridge/40 px-4 py-4 text-sm text-ink-soft">
                  {locale === "km" ? "មិនទាន់មានឯកសារទាញយកទេ។" : "No download files available yet."}
                </p>
              )}

              <div className="border-b border-bridge/40 bg-surface-soft/50 px-4 py-3">
                <p className={ui.sectionLabel}>
                  {locale === "km" ? "ព័ត៌មានឧបករណ៍" : "Tool details"}
                </p>
              </div>
              <dl className="divide-y divide-bridge/30 px-4">
                {detailRows.map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between gap-4 py-3">
                    <dt className="text-xs text-ink-soft">{label}</dt>
                    <dd className="text-right text-xs font-semibold text-foreground">{value}</dd>
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
