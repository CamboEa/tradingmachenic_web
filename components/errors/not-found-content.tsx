import Link from "next/link";

import { SiteLogo } from "@/components/shared/site-logo";
import { ButtonLink } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { getDictionary, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/ui/cn";
import { ui } from "@/lib/ui/styles";

type NotFoundVariant = "public" | "admin";

export async function NotFoundContent({
  locale,
  variant = "public",
}: {
  locale: Locale;
  variant?: NotFoundVariant;
}) {
  const dict = await getDictionary(locale);
  const copy = dict.notFoundPage;
  const isAdmin = variant === "admin";

  const quickLinks = isAdmin
    ? [{ href: "/admin", label: copy.adminDashboard }]
  : [
      { href: `/${locale}/tools`, label: copy.tools },
      { href: `/${locale}/blog`, label: copy.blog },
    ];

  return (
    <main
      className={cn(
        "relative flex flex-1 items-center justify-center overflow-hidden px-4 py-16 sm:px-6 sm:py-24",
        isAdmin && "min-h-[60vh]",
      )}
      aria-labelledby="not-found-title"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-dots opacity-40"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[32rem] -translate-x-1/2 rounded-full bg-teal/5 blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto w-full max-w-xl text-center">
        <div className="mb-6 flex justify-center">
          <SiteLogo size="lg" />
        </div>

        <p
          className="select-none font-mono text-[7rem] font-light leading-none tracking-tighter text-slate-200 sm:text-[9rem]"
          aria-hidden
        >
          404
        </p>

        <div className="relative -mt-14 sm:-mt-20">
          <Eyebrow variant={isAdmin ? "admin" : "public"}>{copy.eyebrow}</Eyebrow>
          <h1 id="not-found-title" className={cn("mt-4", ui.pageTitle)}>
            {copy.title}
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-soft sm:text-base">
            {copy.description}
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <ButtonLink href={isAdmin ? "/admin" : `/${locale}`}>
              {isAdmin ? copy.adminDashboard : copy.home}
            </ButtonLink>
            {!isAdmin && (
              <ButtonLink href={`/${locale}/education`} variant="secondary">
                {copy.education}
              </ButtonLink>
            )}
          </div>

          <nav
            className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm"
            aria-label="Helpful links"
          >
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-medium text-ink-soft transition hover:text-teal"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </main>
  );
}
