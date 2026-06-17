import type { NextRequest } from "next/server";

/** Client IP behind Cloudflare, Vercel, or a generic reverse proxy. */
export function getClientIpFromRequest(request: NextRequest | Request): string {
  const headers = request.headers;

  const cf = headers.get("cf-connecting-ip");
  if (cf) return cf;

  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? "unknown";

  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp;

  return "unknown";
}

/** For server actions — pass `headers()` from `next/headers`. */
export function getClientIpFromHeaders(
  headerStore: Headers | { get(name: string): string | null },
): string {
  const cf = headerStore.get("cf-connecting-ip");
  if (cf) return cf;

  const forwarded = headerStore.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? "unknown";

  const realIp = headerStore.get("x-real-ip");
  if (realIp) return realIp;

  return "unknown";
}
