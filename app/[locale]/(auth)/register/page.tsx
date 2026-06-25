import Link from "next/link";
import { notFound } from "next/navigation";

import { AuthForm } from "@/components/auth/auth-form";
import { SiteLogo } from "@/components/shared/site-logo";
import { BRAND_NAME } from "@/lib/brand";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";

const trustPoints = [
  "Free structured video curriculum on risk and execution",
  "Bilingual content in Khmer and English",
  "Join a community of disciplined, serious learners",
];

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dict = await getDictionary(locale);

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-10 lg:py-16">
      <div className="w-full max-w-4xl overflow-hidden shadow-2xl shadow-slate-900/15 flex">

        {/* ── Left decorative panel (lg+) ── */}
        <div className="hidden lg:flex lg:flex-col justify-between w-100 shrink-0 bg-slate-brand px-10 py-12">
          <div>
            <div className="flex items-center gap-3">
              <SiteLogo size="md" />
              <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-gold">
                {BRAND_NAME}
              </span>
            </div>

            <h2 className="mt-10 text-[2rem] font-bold leading-tight text-white">
              Start your journey.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              Join a structured programme designed for serious traders.
            </p>

            <ul className="mt-8 space-y-4">
              {trustPoints.map((point) => (
                <li key={point} className="flex items-start gap-3 text-sm text-slate-300">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold">
                    <svg
                      viewBox="0 0 10 8"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-3 w-3 text-slate-brand"
                    >
                      <path d="M1 4l2.5 2.5L9 1" />
                    </svg>
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-ink-soft mt-10">
            Education only — not financial advice.
          </p>
        </div>

        {/* ── Right form panel ── */}
        <div className="flex-1 bg-surface px-8 py-10 sm:px-10 sm:py-12">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <SiteLogo size="md" />
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-gold">
              {BRAND_NAME}
            </span>
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-brand sm:text-3xl">
              {dict.registerPage.title}
            </h1>
            <p className="mt-1.5 text-sm text-ink-soft">
              Create your free account and start learning today.
            </p>
          </div>

          <AuthForm
            mode="register"
            nameLabel={dict.registerPage.nameLabel}
            emailLabel={dict.registerPage.emailLabel}
            passwordLabel={dict.registerPage.passwordLabel}
            confirmPasswordLabel={dict.registerPage.confirmPasswordLabel}
            passwordMismatch={dict.registerPage.passwordMismatch}
            showPasswordLabel={dict.registerPage.showPassword}
            hidePasswordLabel={dict.registerPage.hidePassword}
            submitLabel={dict.registerPage.submit}
            locale={locale}
          />

          <p className="mt-6 text-center text-sm text-ink-soft">
            {dict.registerPage.switchPrompt}{" "}
            <Link
              href={`/${locale}/login`}
              className="font-semibold text-teal hover:underline"
            >
              {dict.registerPage.switchLink}
            </Link>
          </p>
        </div>

      </div>
    </main>
  );
}
