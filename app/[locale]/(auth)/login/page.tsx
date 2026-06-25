import Link from "next/link";
import { notFound } from "next/navigation";

import { AuthForm } from "@/components/auth/auth-form";
import { SiteLogo } from "@/components/shared/site-logo";
import { BRAND_NAME } from "@/lib/brand";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";

const trustPoints = [
  "Step-by-step video lessons on risk and execution",
  "Bilingual content in Khmer and English",
  "Built for disciplined, serious learners",
];

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dict = await getDictionary(locale);
  const { redirectTo } = await searchParams;

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
              Welcome back.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              Your structured trading education continues here.
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
              {dict.loginPage.title}
            </h1>
            <p className="mt-1.5 text-sm text-ink-soft">
              Sign in to continue your learning journey.
            </p>
          </div>

          <AuthForm
            mode="login"
            emailLabel={dict.loginPage.emailLabel}
            passwordLabel={dict.loginPage.passwordLabel}
            showPasswordLabel={dict.loginPage.showPassword}
            hidePasswordLabel={dict.loginPage.hidePassword}
            submitLabel={dict.loginPage.submit}
            locale={locale}
            redirectTo={redirectTo}
          />

          <p className="mt-6 text-center text-sm text-ink-soft">
            {dict.loginPage.switchPrompt}{" "}
            <Link
              href={`/${locale}/register`}
              className="font-semibold text-teal hover:underline"
            >
              {dict.loginPage.switchLink}
            </Link>
          </p>
        </div>

      </div>
    </main>
  );
}
