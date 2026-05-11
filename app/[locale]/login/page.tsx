import Link from "next/link";
import { notFound } from "next/navigation";

import { AuthPlaceholderForm } from "@/components/auth-placeholder-form";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dict = await getDictionary(locale);

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
      <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-ink)]">
        {dict.loginPage.title}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-[var(--color-ink-muted)]">
        {dict.loginPage.intro}
      </p>
      <AuthPlaceholderForm
        mode="login"
        emailLabel={dict.loginPage.emailLabel}
        passwordLabel={dict.loginPage.passwordLabel}
        submitLabel={dict.loginPage.submit}
      />
      <p className="mt-8 text-center text-sm text-[var(--color-ink-muted)]">
        {dict.loginPage.switchPrompt}{" "}
        <Link
          href={`/${locale}/register`}
          className="font-semibold text-[var(--color-teal)] hover:underline"
        >
          {dict.loginPage.switchLink}
        </Link>
      </p>
    </main>
  );
}
