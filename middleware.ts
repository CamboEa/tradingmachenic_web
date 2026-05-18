import { createServerClient } from "@supabase/ssr";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { defaultLocale, locales } from "@/lib/i18n";

function pathnameStartsWithLocale(pathname: string): boolean {
  return locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Static assets & internals — pass through immediately ──────
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/auth") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // ── Build a mutable response so Supabase can write auth cookies ─
  let response = NextResponse.next({ request });

  // ── Refresh Supabase session (required for SSR auth) ───────────
  let user: { id: string } | null = null;
  let supabase: ReturnType<typeof createServerClient> | null = null;

  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value),
            );
            response = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options),
            );
          },
        },
      },
    );

    const { data } = await supabase.auth.getUser();
    user = data.user;
  }

  // ── Protect /admin (signed-in admins only) ─────────────────────
  if (pathname.startsWith("/admin")) {
    if (!user) {
      const loginUrl = new URL(`/${defaultLocale}/login`, request.url);
      loginUrl.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (supabase) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role !== "admin") {
        const home = new URL(`/${defaultLocale}`, request.url);
        return NextResponse.redirect(home);
      }
    }

    return response;
  }

  // ── Locale redirect ────────────────────────────────────────────
  if (pathnameStartsWithLocale(pathname)) return response;

  const url = request.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
