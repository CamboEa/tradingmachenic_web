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
        className="inline-flex h-9 items-center rounded-lg border border-bridge/40 bg-surface px-3.5 text-[13px] font-semibold text-ink-muted transition duration-150 hover:border-bridge/60 hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/30"
      >
        {dict.nav.register}
      </Link>
      <Link
        href={`/${locale}/login`}
        className="inline-flex h-9 items-center rounded-lg bg-teal px-3.5 text-[13px] font-semibold text-white shadow-sm shadow-teal/20 transition duration-150 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/40"
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
      <span className="h-5 w-px shrink-0 bg-bridge/40" aria-hidden />
      <LanguageToggle locale={locale} pathname={pathname} dict={dict} />
    </div>
  );
}
