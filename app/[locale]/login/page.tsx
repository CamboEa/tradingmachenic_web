import Link from "next/link";
import { notFound } from "next/navigation";

import { AuthForm } from "@/components/auth/auth-form";
import { Panel } from "@/components/ui/card";
import { Eyebrow } from "@/components/ui/eyebrow";
import { SiteLogo } from "@/components/shared/site-logo";
import { cn } from "@/lib/ui/cn";
import { ui } from "@/lib/ui/styles";
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
 <Panel className="w-full">
 <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:text-left">
 <SiteLogo size="lg" />
 <Eyebrow variant="admin">Trading Machenic</Eyebrow>
 </div>
 <h1 className={cn("mt-3", ui.pageTitle)}>
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
 </Panel>
 </main>
 );
}
