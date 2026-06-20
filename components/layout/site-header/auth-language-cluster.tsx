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
        className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition duration-150 hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/30"
      >
        {dict.nav.register}
      </Link>
      <Link
        href={`/${locale}/login`}
        className="rounded-lg bg-teal px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-teal/20 transition duration-150 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/40"
      >
        {dict.nav.login}
      </Link>
    </>
  );
}

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
    <div className="flex items-center gap-2">
      {user ? (
        <ProfileMenu user={user} signOutLabel={dict.nav.signOut} />
      ) : (
        <RegisterLoginLinks locale={locale} dict={dict} />
      )}
      <span className="h-5 w-px shrink-0 bg-slate-200" aria-hidden />
      <LanguageToggle locale={locale} pathname={pathname} dict={dict} />
    </div>
  );
}
