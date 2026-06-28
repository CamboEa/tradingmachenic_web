import { createServerClient } from "@supabase/ssr";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { defaultLocale, locales } from "@/lib/i18n";
import { getClientIpFromRequest } from "@/lib/security/client-ip";
import { checkRateLimit, RATE_LIMITS } from "@/lib/security/rate-limit";
import {
  isSiteGateEnabled,
  SITE_GATE_COOKIE,
  verifySiteGateToken,
} from "@/lib/security/site-gate";

function pathnameStartsWithLocale(pathname: string): boolean {
  return locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
}

function isToolDownloadPath(pathname: string): boolean {
  return /^\/api\/tools\/[^/]+\/download\/?$/.test(pathname);
}

function isGatePath(pathname: string): boolean {
  return locales.some(
    (locale) =>
      pathname === `/${locale}/gate` || pathname.startsWith(`/${locale}/gate/`),
  );
}

function pathnameLocale(pathname: string): (typeof locales)[number] | null {
  for (const locale of locales) {
    if (pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)) {
      return locale;
    }
  }
  return null;
}

function shouldBypassSiteGate(pathname: string): boolean {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/auth") ||
    pathname.includes(".") ||
    isGatePath(pathname)
  );
}

function rateLimitApi(request: NextRequest, namespace: keyof typeof RATE_LIMITS) {
  const ip = getClientIpFromRequest(request);
  const result = checkRateLimit(namespace, ip, RATE_LIMITS[namespace]);

  if (!result.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: result.retryAfterSec
          ? { "Retry-After": String(result.retryAfterSec) }
          : undefined,
      },
    );
  }

  return null;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/r2")) {
    const limited = rateLimitApi(request, "r2Api");
    if (limited) return limited;
  }

  if (isToolDownloadPath(pathname)) {
    const limited = rateLimitApi(request, "toolDownload");
    if (limited) return limited;
  }

  // ── Static assets & internals — pass through immediately ──────
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/auth") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // ── Site-wide Turnstile gate (first visit / expired cookie) ───
  if (isSiteGateEnabled() && !shouldBypassSiteGate(pathname)) {
    const gateCookie = request.cookies.get(SITE_GATE_COOKIE)?.value;
    const verified = await verifySiteGateToken(gateCookie);

    if (!verified) {
      const locale = pathnameLocale(pathname) ?? defaultLocale;
      const gateUrl = new URL(`/${locale}/gate`, request.url);
      const returnTo = `${pathname}${request.nextUrl.search}`;
      gateUrl.searchParams.set("returnTo", returnTo);
      return NextResponse.redirect(gateUrl);
    }
  }

  // ── Build a mutable response so Supabase can write auth cookies ─
  let response = NextResponse.next({ request });

  // ── Refresh Supabase session (required for SSR auth) ───────────
  let user: { id: string } | null = null;
  let supabase: ReturnType<typeof createServerClient> | null = null;

  const hasAuthCookie = request.cookies.getAll().some((c) => c.name.startsWith("sb-"));

  if (
    hasAuthCookie &&
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
