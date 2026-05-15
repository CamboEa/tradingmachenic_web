import Link from "next/link";
import { notFound } from "next/navigation";

import { AuthForm } from "@/components/auth-form";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";

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
    <main className="mx-auto flex w-full max-w-md flex-1 items-center px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
      <section className="w-full rounded-[2rem] border border-white/80 bg-white/82 p-6 shadow-[0_24px_70px_-42px_rgba(15,23,42,0.5)] backdrop-blur sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-gold)]">
          Trading Machenic
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-(--color-ink)">
          {dict.registerPage.title}
        </h1>
        <AuthForm
          mode="register"
          emailLabel={dict.registerPage.emailLabel}
          passwordLabel={dict.registerPage.passwordLabel}
          submitLabel={dict.registerPage.submit}
          locale={locale}
        />
        <p className="mt-8 text-center text-sm text-(--color-ink-muted)">
          {dict.registerPage.switchPrompt}{" "}
          <Link
            href={`/${locale}/login`}
            className="font-semibold text-(--color-teal) hover:underline"
          >
            {dict.registerPage.switchLink}
          </Link>
        </p>
      </section>
    </main>
  );
}
