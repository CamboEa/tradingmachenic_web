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
    <main className="mx-auto w-full max-w-md flex-1 px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
      <h1 className="text-3xl font-semibold tracking-tight text-(--color-ink)">
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
    </main>
  );
}
