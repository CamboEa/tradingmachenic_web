import Link from "next/link";
import { notFound } from "next/navigation";

import { AuthForm } from "@/components/auth/auth-form";
import { Panel } from "@/components/ui/card";
import { Eyebrow } from "@/components/ui/eyebrow";
import { SiteLogo } from "@/components/shared/site-logo";
import { BRAND_NAME } from "@/lib/brand";
import { cn } from "@/lib/ui/cn";
import { ui } from "@/lib/ui/styles";
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
 <Panel className="w-full">
 <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:text-left">
 <SiteLogo size="lg" />
 <Eyebrow variant="admin">{BRAND_NAME}</Eyebrow>
 </div>
 <h1 className={cn("mt-3", ui.pageTitle)}>
 {dict.registerPage.title}
 </h1>
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
 <p className="mt-8 text-center text-sm text-(--color-ink-muted)">
 {dict.registerPage.switchPrompt}{" "}
 <Link
 href={`/${locale}/login`}
 className="font-semibold text-(--color-teal) hover:underline"
 >
 {dict.registerPage.switchLink}
 </Link>
 </p>
 </Panel>
 </main>
 );
}
