import Link from "next/link";
import { notFound } from "next/navigation";

import { AuthForm } from "@/components/auth/auth-form";
import { SiteLogo } from "@/components/shared/site-logo";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";

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
 <main className="mx-auto flex w-full max-w-md flex-1 items-center px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
 <section className="w-full rounded-[2rem] border border-white/80 bg-white/82 p-6 backdrop-blur sm:p-8">
 <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:text-left">
 <SiteLogo size="lg" />
 <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-gold)]">
 Trading Machenic
 </p>
 </div>
 <h1 className="mt-3 text-3xl font-semibold tracking-tight text-(--color-ink)">
 {dict.loginPage.title}
 </h1>
 <AuthForm
 mode="login"
 emailLabel={dict.loginPage.emailLabel}
 passwordLabel={dict.loginPage.passwordLabel}
 submitLabel={dict.loginPage.submit}
 locale={locale}
 redirectTo={redirectTo}
 />
 <p className="mt-8 text-center text-sm text-(--color-ink-muted)">
 {dict.loginPage.switchPrompt}{" "}
 <Link
 href={`/${locale}/register`}
 className="font-semibold text-(--color-teal) hover:underline"
 >
 {dict.loginPage.switchLink}
 </Link>
 </p>
 </section>
 </main>
 );
}
