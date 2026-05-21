import type { User } from "@supabase/supabase-js";
import Link from "next/link";

import { ProfileMenu } from "@/components/auth/profile-menu";
import type { Dictionary, Locale } from "@/lib/i18n";

import { LanguageToggle } from "./language-toggle";

function RegisterLoginLinks({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <>
      <Link
        href={`/${locale}/register`}
        className="rounded-xl border border-slate-200 bg-white/85 px-3.5 py-2 text-xs font-semibold text-[#1e293b] transition hover:border-[#d4af37]/60 hover:bg-white sm:text-sm"
      >
        {dict.nav.register}
      </Link>
      <Link
        href={`/${locale}/login`}
        className="rounded-xl bg-[#0ea5e9] px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-sky-600 sm:text-sm"
      >
        {dict.nav.login}
      </Link>
    </>
  );
}

/** Register, Login (or Sign Out), and language toggle aligned on the right */
export function AuthLanguageCluster({
  locale,
  pathname,
  dict,
  user,
}: {
  locale: Locale;
  pathname: string;
  dict: Dictionary;
  user?: User | null;
}) {
  return (
    <div className="flex max-w-full flex-wrap items-center justify-end gap-x-2 gap-y-2 sm:gap-x-3">
      {user ? (
        <ProfileMenu user={user} signOutLabel={dict.nav.signOut} />
      ) : (
        <RegisterLoginLinks locale={locale} dict={dict} />
      )}
      <span className="hidden h-6 w-px shrink-0 bg-slate-200 sm:block" aria-hidden />
      <LanguageToggle locale={locale} pathname={pathname} dict={dict} />
    </div>
  );
}
