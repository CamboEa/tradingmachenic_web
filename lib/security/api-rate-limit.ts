import { NextResponse } from "next/server";

import { getClientIpFromRequest } from "@/lib/security/client-ip";
import { checkRateLimit, RATE_LIMITS } from "@/lib/security/rate-limit";

type RateLimitNamespace = keyof typeof RATE_LIMITS;

/** Returns a 429 response when limited, otherwise null. */
export function enforceApiRateLimit(
  request: Request,
  namespace: RateLimitNamespace,
): NextResponse | null {
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
